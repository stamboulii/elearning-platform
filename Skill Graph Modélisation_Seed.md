# Sprint 4 — Skill Graph : Modélisation & Seed

**Objectif du sprint :** poser les fondations du Skill Graph dans le schéma Prisma, peupler une base de skills initiale, et exposer un CRUD admin minimal — sans toucher à aucune logique métier existante (progressService, gamificationService, etc. restent inchangés à ce stade).

**Pré-requis avant de commencer :**
- Aucune migration en attente sur la branche actuelle (`npx prisma migrate status` doit être propre)
- Base de données de développement sauvegardée (`pg_dump` avant toute migration — voir Étape 0)
- Aucun autre développeur n'applique de migration en parallèle pendant ce sprint

**Convention de ce document :** chaque étape a un bloc `ROLLBACK` qui explique comment annuler *uniquement cette étape*, dans l'ordre inverse d'application. Les rollbacks sont conçus pour être appliqués dans l'ordre inverse des étapes (8 → 7 → ... → 1) si besoin de tout annuler.

---

## Étape 0 — Sauvegarde de sécurité

**Action :**
```bash
pg_dump $DATABASE_URL -F c -f backup_pre_sprint4_$(date +%Y%m%d_%H%M).dump
```

Conserver ce fichier en dehors du repo (pas dans git). C'est le filet de sécurité ultime si toutes les autres stratégies de rollback échouent.

**ROLLBACK de cette étape :** n/a (c'est elle-même le mécanisme de rollback global).

---

## Étape 1 — Ajouter le modèle `Skill`

**Fichier :** `server/prisma/schema.prisma`

**Action :** ajouter ce bloc à la fin du fichier, dans une nouvelle section commentée `SKILL GRAPH`.

```prisma
// ============================================
// SKILL GRAPH
// ============================================

model Skill {
  id              String   @id @default(uuid())
  name            String   @unique
  slug            String   @unique
  description     String?
  category        String?  @map("category") // ex: "Frontend", "Backend", "DevOps", "Data"
  difficultyLevel CourseLevel @default(BEGINNER) @map("difficulty_level") // réutilise l'enum existant
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("skills")
}
```

**Pourquoi réutiliser `CourseLevel` plutôt qu'un nouvel enum ?** Cet enum (`BEGINNER | INTERMEDIATE | ADVANCED | ALL_LEVELS`) existe déjà et exprime exactement la même sémantique pour un skill que pour un cours. Éviter un nouvel enum réduit la charge de maintenance. `ALL_LEVELS` n'aura simplement pas de sens pour un skill — c'est acceptable, on ne l'utilisera pas dans le seed.

**Commande :**
```bash
npx prisma migrate dev --name add_skill_model
```

**Vérification post-étape :**
```bash
npx prisma studio  # vérifier visuellement que la table "skills" apparaît, vide
```

**ROLLBACK de cette étape :**
1. Supprimer le bloc `model Skill { ... }` du schema.prisma
2. `npx prisma migrate dev --name remove_skill_model` (Prisma génère automatiquement le `DROP TABLE skills`)
3. Si la migration a déjà été appliquée en production et qu'on ne peut pas la défaire par une nouvelle migration : `DROP TABLE IF EXISTS skills CASCADE;` directement en SQL, puis supprimer manuellement l'entrée correspondante dans `_prisma_migrations`

---

## Étape 2 — Ajouter `LessonSkill` (jointure Lesson ↔ Skill)

**Action :** ajouter ce bloc après `Skill`, et modifier le modèle `Lesson` existant pour ajouter la relation inverse.

```prisma
model LessonSkill {
  id       String @id @default(uuid())
  lessonId String @map("lesson_id")
  skillId  String @map("skill_id")
  weight   Int    @default(1) // importance du skill dans cette leçon, 1-5

  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  skill  Skill  @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@unique([lessonId, skillId])
  @@map("lesson_skills")
}
```

**Modification du modèle `Lesson` existant** — ajouter une seule ligne dans le bloc `// Relations` :
```prisma
  // Relations
  section         CourseSection    @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  lessonProgress  LessonProgress[]
  quiz            Quiz?
  flashcardDeck   FlashcardDeck?
  lessonSkills    LessonSkill[]    // AJOUT — ne touche à rien d'existant
```

**Modification du modèle `Skill`** — ajouter la relation inverse :
```prisma
  lessonSkills LessonSkill[]
```

**Risque identifié :** aucun champ existant de `Lesson` n'est modifié, seule une nouvelle relation est ajoutée. Compatible à 100% avec le code existant (`lessonService.js` n'a pas besoin d'être touché pour que l'app continue de fonctionner).

**Commande :**
```bash
npx prisma migrate dev --name add_lesson_skill_join
```

**ROLLBACK de cette étape :**
1. Retirer le bloc `model LessonSkill`
2. Retirer la ligne `lessonSkills LessonSkill[]` de `Lesson` et de `Skill`
3. `npx prisma migrate dev --name remove_lesson_skill_join`
4. Si déjà en prod : `DROP TABLE IF EXISTS lesson_skills CASCADE;`

---

## Étape 3 — Ajouter `SkillPrerequisite` (le graphe de dépendances)

**Action :** ajouter ce bloc, avec les deux relations nommées pour lever l'ambiguïté de l'auto-référence.

```prisma
model SkillPrerequisite {
  id String @id @default(uuid())

  skillId String
  skill   Skill  @relation("RequiresSkill", fields: [skillId], references: [id], onDelete: Cascade)

  prerequisiteId String @map("prerequisite_id")
  prerequisite   Skill  @relation("PrerequisiteOf", fields: [prerequisiteId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")

  @@unique([skillId, prerequisiteId])
  @@map("skill_prerequisites")
}
```

**Modification du modèle `Skill`** — ajouter ces deux lignes :
```prisma
  requiredFor   SkillPrerequisite[] @relation("PrerequisiteOf")
  prerequisites SkillPrerequisite[] @relation("RequiresSkill")
```

**Point d'attention rappelé du sprint précédent :** ne pas oublier les noms de relation `"RequiresSkill"` / `"PrerequisiteOf"` — sans eux, Prisma refusera de générer le client car il ne peut pas distinguer les deux FK vers `Skill`.

**Commande :**
```bash
npx prisma migrate dev --name add_skill_prerequisite
```

**Vérification anti-cycle (manuelle, pas automatisée à ce stade) :** Prisma ne empêche pas nativement les cycles (A requiert B, B requiert A). On accepte ce risque pour ce sprint — la détection de cycle sera ajoutée comme validation applicative dans `skillGraphService.js` au Sprint 5, pas au niveau du schéma.

**ROLLBACK de cette étape :**
1. Retirer le bloc `model SkillPrerequisite`
2. Retirer les deux lignes `requiredFor` / `prerequisites` de `Skill`
3. `npx prisma migrate dev --name remove_skill_prerequisite`
4. Si déjà en prod : `DROP TABLE IF EXISTS skill_prerequisites CASCADE;`

---

## Étape 4 — Ajouter `CareerPath` et `CareerPathSkill`

```prisma
model CareerPath {
  id              String   @id @default(uuid())
  title           String
  slug            String   @unique
  description     String?  @db.Text
  targetRole      String?  @map("target_role")
  estimatedHours  Int?     @map("estimated_hours")
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  skills CareerPathSkill[]

  @@map("career_paths")
}

model CareerPathSkill {
  id           String  @id @default(uuid())
  careerPathId String  @map("career_path_id")
  skillId      String  @map("skill_id")
  orderNumber  Int     @map("order_number")
  isMandatory  Boolean @default(true) @map("is_mandatory")

  careerPath CareerPath @relation(fields: [careerPathId], references: [id], onDelete: Cascade)
  skill      Skill      @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@unique([careerPathId, skillId])
  @@map("career_path_skills")
}
```

**Modification du modèle `Skill`** — ajouter :
```prisma
  careerPathSkills CareerPathSkill[]
```

**Commande :**
```bash
npx prisma migrate dev --name add_career_path
```

**ROLLBACK de cette étape :**
1. Retirer les deux blocs `model CareerPath` et `model CareerPathSkill`
2. Retirer la ligne `careerPathSkills` de `Skill`
3. `npx prisma migrate dev --name remove_career_path`
4. Si déjà en prod : `DROP TABLE IF EXISTS career_path_skills CASCADE; DROP TABLE IF EXISTS career_paths CASCADE;` (ordre important : la table de jointure d'abord)

---

## Étape 5 — Ajouter `UserSkill` (progression par compétence)

**Décision actée lors de notre discussion précédente :** `xpEarned` sur `UserSkill` est une **valeur dérivée**, jamais incrémentée directement. Elle sera recalculée à partir de `XpEvent` (Étape 7). On la déclare ici mais on ne lui donnera de logique d'écriture qu'au Sprint 5.

```prisma
model UserSkill {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  skillId         String    @map("skill_id")
  proficiencyLevel Int      @default(1) @map("proficiency_level") // 1-5
  xpEarned        Int       @default(0) @map("xp_earned") // DÉRIVÉ — voir XpEvent, ne jamais écrire directement hors recalcul
  acquiredAt      DateTime? @map("acquired_at") // null tant que proficiency < seuil de maîtrise
  lastPracticedAt DateTime? @map("last_practiced_at")

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  skill Skill @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@unique([userId, skillId])
  @@map("user_skills")
}
```

**Modification du modèle `User`** — ajouter dans le bloc Relations :
```prisma
  userSkills UserSkill[]
```

**Modification du modèle `Skill`** — ajouter :
```prisma
  userSkills UserSkill[]
```

**Commande :**
```bash
npx prisma migrate dev --name add_user_skill
```

**ROLLBACK de cette étape :**
1. Retirer `model UserSkill`
2. Retirer `userSkills UserSkill[]` de `User` et `Skill`
3. `npx prisma migrate dev --name remove_user_skill`
4. Si déjà en prod : `DROP TABLE IF EXISTS user_skills CASCADE;`

---

## Étape 6 — Ajouter `SkillAssessment` (évaluation formelle)

```prisma
model SkillAssessment {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  skillId     String   @map("skill_id")
  quizId      String?  @map("quiz_id") // optionnel : lien vers le Quiz existant si l'évaluation passe par un quiz
  assessedAt  DateTime @default(now()) @map("assessed_at")
  score       Int
  passed      Boolean

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  skill Skill @relation(fields: [skillId], references: [id], onDelete: Cascade)
  quiz  Quiz? @relation(fields: [quizId], references: [id], onDelete: SetNull)

  @@map("skill_assessments")
}
```

**Modification du modèle `Quiz` existant** — ajouter une relation inverse (ne touche à aucun champ existant) :
```prisma
  skillAssessments SkillAssessment[]
```

**Modification de `User`** et **`Skill`** — ajouter respectivement :
```prisma
  skillAssessments SkillAssessment[]
```

**Note de cohérence avec la correction validée plus tôt :** ce modèle ne crée jamais de nouvelle ligne `Quiz` — il référence optionnellement un `Quiz` existant (1-to-1 avec sa `Lesson`, inchangé). Si l'évaluation ne passe pas par le quiz pédagogique original de la leçon (cas des révisions générées à la volée), `quizId` reste `null` et le score est stocké directement sur `SkillAssessment`.

**Commande :**
```bash
npx prisma migrate dev --name add_skill_assessment
```

**ROLLBACK de cette étape :**
1. Retirer `model SkillAssessment`
2. Retirer les 3 lignes de relation inverse ajoutées (`User`, `Skill`, `Quiz`)
3. `npx prisma migrate dev --name remove_skill_assessment`
4. Si déjà en prod : `DROP TABLE IF EXISTS skill_assessments CASCADE;`

---

## Étape 7 — Ajouter `XpEvent` (log d'événements, source de vérité dérivée)

**Rappel de la décision actée :** `User.xp` reste l'unique valeur incrémentée directement. `XpEvent` est le journal qui permet de recalculer `Enrollment.xpEarned` et `UserSkill.xpEarned` sans jamais les incrémenter indépendamment.

```prisma
model XpEvent {
  id        String      @id @default(uuid())
  userId    String      @map("user_id")
  amount    Int
  source    XpSource    @map("source")
  sourceId  String?     @map("source_id") // ex: lessonId, skillId, badgeId selon le source
  createdAt DateTime    @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("xp_events")
  @@index([userId, createdAt])
  @@index([userId, source, sourceId])
}

enum XpSource {
  LESSON_COMPLETED
  COURSE_COMPLETED
  QUIZ_PASSED
  SKILL_LEVELED_UP
  BADGE_AWARDED
  REVIEW_COMPLETED
}
```

**Modification de `User`** — ajouter :
```prisma
  xpEvents XpEvent[]
```

**Important — différence avec les étapes précédentes :** ce modèle introduit un nouvel **enum** (`XpSource`). Comme noté dans la validation initiale, l'ajout d'un enum est une opération différente de l'ajout d'une table en PostgreSQL. Ici ce n'est pas un problème puisque c'est un enum *neuf*, pas un ajout de valeur à un enum existant (`NotificationType`) — cette migration est donc sûre à exécuter normalement, contrairement à une future migration qui ajouterait `REVIEW_DUE` à `NotificationType` (à faire en migration isolée, hors scope de ce sprint).

**Commande :**
```bash
npx prisma migrate dev --name add_xp_event_log
```

**Ce que cette étape ne fait PAS (volontairement) :** elle ne modifie ni `gamificationService.js` ni `progressService.js`. Le flux d'écriture réel dans `awardXp()` sera implémenté au Sprint 5, en même temps que `skillGraphService.js`. Pour l'instant la table existe mais reste vide — c'est voulu, pour garder ce sprint strictement focalisé sur le schéma.

**ROLLBACK de cette étape :**
1. Retirer `model XpEvent` et `enum XpSource`
2. Retirer `xpEvents XpEvent[]` de `User`
3. `npx prisma migrate dev --name remove_xp_event_log`
4. Si déjà en prod : `DROP TABLE IF EXISTS xp_events CASCADE; DROP TYPE IF EXISTS "XpSource";`

---

## Étape 8 — Script de seed initial (50-100 skills)

**Fichier :** `server/prisma/seed.js` (existant) — ajouter une nouvelle fonction, ne pas modifier les fonctions de seed existantes (catégories, badges, users demo).

**Stratégie :** créer un fichier de données séparé pour ne pas alourdir `seed.js`.

**Nouveau fichier :** `server/prisma/seed-data/skills.json`
```json
[
  { "name": "HTML5", "slug": "html5", "category": "Frontend", "difficultyLevel": "BEGINNER" },
  { "name": "CSS3", "slug": "css3", "category": "Frontend", "difficultyLevel": "BEGINNER" },
  { "name": "JavaScript ES6", "slug": "javascript-es6", "category": "Frontend", "difficultyLevel": "BEGINNER" },
  { "name": "React Hooks", "slug": "react-hooks", "category": "Frontend", "difficultyLevel": "INTERMEDIATE" },
  { "name": "Node.js", "slug": "nodejs", "category": "Backend", "difficultyLevel": "INTERMEDIATE" }
]
```
*(à compléter jusqu'à 50-100 entrées — ce squelette montre le format attendu, le remplissage complet est un travail éditorial séparé, pas une tâche technique)*

**Nouveau fichier :** `server/prisma/seed-data/skill-prerequisites.json`
```json
[
  { "skill": "css3", "prerequisite": "html5" },
  { "skill": "javascript-es6", "prerequisite": "html5" },
  { "skill": "react-hooks", "prerequisite": "javascript-es6" }
]
```

**Ajout dans `seed.js`** (fonction nouvelle, appelée depuis le `main()` existant sans modifier l'ordre des appels précédents) :
```javascript
const skillsData = require('./seed-data/skills.json');
const prereqData = require('./seed-data/skill-prerequisites.json');

async function seedSkills() {
  for (const s of skillsData) {
    await prisma.skill.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }
  for (const p of prereqData) {
    const skill = await prisma.skill.findUnique({ where: { slug: p.skill } });
    const prerequisite = await prisma.skill.findUnique({ where: { slug: p.prerequisite } });
    if (!skill || !prerequisite) continue;
    await prisma.skillPrerequisite.upsert({
      where: { skillId_prerequisiteId: { skillId: skill.id, prerequisiteId: prerequisite.id } },
      update: {},
      create: { skillId: skill.id, prerequisiteId: prerequisite.id },
    });
  }
}

// Appeler seedSkills() dans main(), après les appels existants, jamais avant
```

**Commande :**
```bash
npx prisma db seed
```

**ROLLBACK de cette étape :**
1. `DELETE FROM skill_prerequisites; DELETE FROM skills;` (en SQL direct, ou via un petit script `prisma.skill.deleteMany()`)
2. Retirer l'appel à `seedSkills()` dans `main()` de `seed.js`
3. Les fichiers `seed-data/*.json` peuvent rester (aucun impact tant qu'ils ne sont pas importés)

---

## Récapitulatif — checklist de fin de sprint

| Étape | Modèle/Action | Migration | Rollback testé |
|-------|----------------|-----------|-----------------|
| 0 | Backup pg_dump | n/a | n/a |
| 1 | `Skill` | `add_skill_model` | ☐ |
| 2 | `LessonSkill` | `add_lesson_skill_join` | ☐ |
| 3 | `SkillPrerequisite` | `add_skill_prerequisite` | ☐ |
| 4 | `CareerPath` + `CareerPathSkill` | `add_career_path` | ☐ |
| 5 | `UserSkill` | `add_user_skill` | ☐ |
| 6 | `SkillAssessment` | `add_skill_assessment` | ☐ |
| 7 | `XpEvent` + enum `XpSource` | `add_xp_event_log` | ☐ |
| 8 | Seed skills + prerequisites | `db seed` | ☐ |

**Rollback complet du sprint (si besoin de tout annuler d'un coup) :**
```bash
# Option A — restaurer le backup (le plus sûr, perd tout travail fait depuis l'Étape 0)
pg_dump_restore: pg_restore -d $DATABASE_URL --clean backup_pre_sprint4_*.dump

# Option B — annuler migration par migration, dans l'ordre inverse 8→1
# (suivre les blocs ROLLBACK ci-dessus dans l'ordre 8, 7, 6, 5, 4, 3, 2, 1)
```

**Ce qui n'est PAS encore fait à la fin de ce sprint (volontairement reporté au Sprint 5) :**
- `skillGraphService.js` (calcul de chemin, détection de gaps)
- Logique d'écriture réelle dans `XpEvent` / `awardXp()`
- Hook dans `progressService.js` pour mettre à jour `UserSkill` automatiquement
- Détection de cycles dans `SkillPrerequisite`
- Routes API et controllers admin pour CRUD skills

Ce sprint est uniquement le socle de données. Aucune route existante, aucun service existant, aucun comportement utilisateur visible n'est modifié à l'issue de ce sprint — l'application doit fonctionner exactement comme avant, avec simplement de nouvelles tables vides (sauf skills/prerequisites peuplés par le seed).