# Sprint 5 — Skill Graph : Services & Logique métier

**Objectif du sprint :** donner vie au socle posé au Sprint 4. À la fin de ce sprint, compléter une leçon liée à des skills doit réellement faire progresser `UserSkill`, attribuer de l'XP via la source de vérité unique `XpEvent`, et le tri topologique du graphe doit être utilisable pour générer un ordre d'apprentissage.

**Pré-requis avant de commencer :**
- Sprint 4 clos avec les 5 blocs de test verts (confirmé)
- Aucune migration en attente (`npx prisma migrate status` propre)
- Nouveau backup avant de commencer (les Étapes 3 et 4 touchent à de la logique d'écriture sur des tables sensibles : `User.xp`, `Enrollment.xpEarned`)

**Ce que ce sprint NE touche PAS :** aucune route, aucun controller, aucun composant frontend. Ce sprint est uniquement la couche service — testable en isolation via script Node ou tests unitaires, avant toute exposition HTTP (Sprint 6).

**Convention inchangée du Sprint 4 :** chaque étape a un bloc `ROLLBACK` pour annuler uniquement cette étape, dans l'ordre inverse d'application.

---

## Étape 0 — Sauvegarde de sécurité

```bash
pg_dump $DATABASE_URL -F c -f backup_pre_sprint5_$(date +%Y%m%d_%H%M).dump
```

**ROLLBACK de cette étape :** n/a.

---

## Étape 1 — `xpService.js` : le point d'entrée unique pour l'XP

**Fichier nouveau :** `server/src/services/xpService.js`

**Rappel de la décision actée (Sprint 4, validée avec l'utilisateur) :** `User.xp` est l'unique valeur incrémentée directement. Tout le reste (`Enrollment.xpEarned`, futur `UserSkill.xpEarned`) est dérivé de `XpEvent` par agrégation, jamais incrémenté indépendamment.

```javascript
const prisma = require('../config/database');

/**
 * Point d'entrée UNIQUE pour toute attribution d'XP dans l'application.
 * Aucun autre endroit du code ne doit faire un `prisma.user.update({ xp: { increment: ... } })`
 * directement — toujours passer par cette fonction.
 *
 * @param {string} userId
 * @param {number} amount - positif uniquement, les retraits d'XP ne sont pas supportés
 * @param {'LESSON_COMPLETED'|'COURSE_COMPLETED'|'QUIZ_PASSED'|'SKILL_LEVELED_UP'|'BADGE_AWARDED'|'REVIEW_COMPLETED'} source
 * @param {string|null} sourceId - ex: lessonId, courseId, skillId selon le source
 */
async function awardXp(userId, amount, source, sourceId = null) {
  if (amount <= 0) {
    throw new Error('awardXp: amount must be positive');
  }

  return prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { xp: { increment: amount } },
    });

    const event = await tx.xpEvent.create({
      data: { userId, amount, source, sourceId },
    });

    // Recalcul du niveau — logique préservée de gamificationService.js existant.
    // Si gamificationService a déjà une fonction calculateLevel(xp), l'appeler ici
    // plutôt que de dupliquer la formule. Placeholder si elle n'existe pas encore :
    const newLevel = calculateLevelFromXp(updatedUser.xp);
    if (newLevel !== updatedUser.level) {
      await tx.user.update({ where: { id: userId }, data: { level: newLevel } });
    }

    return { user: updatedUser, event };
  });
}

/**
 * Recalcule Enrollment.xpEarned à partir de XpEvent, filtré par les leçons
 * appartenant au cours de cet enrollment. Lecture seule depuis XpEvent —
 * jamais d'incrémentation indépendante de ce champ.
 */
async function recalculateEnrollmentXp(enrollmentId) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: { include: { sections: { include: { lessons: true } } } } },
  });
  if (!enrollment) return null;

  const lessonIds = enrollment.course.sections.flatMap(s => s.lessons.map(l => l.id));

  const result = await prisma.xpEvent.aggregate({
    where: {
      userId: enrollment.userId,
      sourceId: { in: lessonIds },
      source: { in: ['LESSON_COMPLETED', 'QUIZ_PASSED'] },
    },
    _sum: { amount: true },
  });

  const total = result._sum.amount || 0;

  return prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { xpEarned: total },
  });
}

function calculateLevelFromXp(xp) {
  // Placeholder — remplacer par la formule réelle de gamificationService.js si elle existe déjà.
  // Ne pas modifier gamificationService.js dans cette étape : si la logique y est déjà présente,
  // l'importer ici plutôt que la dupliquer.
  return Math.floor(xp / 1000) + 1;
}

module.exports = { awardXp, recalculateEnrollmentXp };
```

**Point d'attention critique :** avant d'écrire ce fichier, ouvrir `server/src/services/gamificationService.js` et vérifier s'il existe déjà une fonction de calcul de niveau ou d'attribution d'XP. Si oui, **ne pas la dupliquer ici** — soit l'importer, soit migrer sa logique dans `xpService.js` et faire de `gamificationService.js` un consommateur de `xpService.awardXp()`. Cette vérification n'est pas automatisable depuis ce document — c'est une lecture manuelle à faire avant de copier le code ci-dessus tel quel.

**Commande de test isolé (pas de migration ici, juste du code) :**
```bash
node -e "
const { awardXp } = require('./src/services/xpService');
awardXp('UN_USER_ID_DE_TEST', 50, 'LESSON_COMPLETED', 'UNE_LESSON_ID_DE_TEST')
  .then(r => { console.log('OK', r.event); process.exit(0); })
  .catch(e => { console.error('FAIL', e.message); process.exit(1); });
"
```

**ROLLBACK de cette étape :**
1. Supprimer le fichier `server/src/services/xpService.js`
2. Aucune migration associée à annuler — pure logique applicative
3. Si des `XpEvent` de test ont été créés : `DELETE FROM xp_events WHERE source_id = 'UNE_LESSON_ID_DE_TEST';`

---

## Étape 2 — Brancher `awardXp()` dans `progressService.js` (remplacement, pas ajout)

**Fichier modifié :** `server/src/services/progressService.js`

**Action :** localiser le code existant qui incrémente l'XP lors de la complétion d'une leçon (probablement un `prisma.user.update({ xp: { increment: 50 } })` ou similaire, et la mise à jour de `Enrollment.xpEarned`). Le remplacer par un appel à `xpService.awardXp()`.

**Avant (pattern probable à rechercher) :**
```javascript
// Quelque chose comme ceci existe déjà dans progressService.js — À LOCALISER, PAS À DEVINER
await prisma.user.update({ where: { id: userId }, data: { xp: { increment: 50 } } });
await prisma.enrollment.update({ where: { id: enrollmentId }, data: { xpEarned: { increment: 50 } } });
```

**Après :**
```javascript
const { awardXp, recalculateEnrollmentXp } = require('./xpService');

// ... dans la fonction markLessonComplete existante, à l'endroit où l'XP était attribué :
await awardXp(userId, 50, 'LESSON_COMPLETED', lessonId);
await recalculateEnrollmentXp(enrollmentId);
```

**Risque identifié et important :** cette étape MODIFIE un fichier existant et une fonctionnalité déjà utilisée par tous les étudiants (la complétion de leçon). C'est la première étape du sprint qui touche du code de production actif, pas seulement des additions. Tester immédiatement après cette modification, avant de passer à l'étape suivante.

**Procédure de test immédiat après modification :**
1. Compléter manuellement une leçon de test via l'API existante (`POST /api/progress/lessons/:lessonId/complete`)
2. Vérifier que `User.xp` a bien augmenté de 50
3. Vérifier qu'une ligne `XpEvent` a été créée avec `source = 'LESSON_COMPLETED'`
4. Vérifier que `Enrollment.xpEarned` correspond toujours à la somme attendue
5. Vérifier qu'aucun double comptage n'a eu lieu (XP total cohérent, pas doublé)

**ROLLBACK de cette étape :**
1. Restaurer le code original de `progressService.js` (le `prisma.user.update` direct) — garder une copie du fichier original avant modification, par exemple via `git diff` ou une copie manuelle `progressService.js.bak`
2. Si des `XpEvent` ont déjà été créés par du trafic réel pendant que cette étape était active : ne PAS les supprimer en masse, car ça désynchroniserait `User.xp` (déjà incrémenté) de l'historique. Le rollback propre ici est `git revert` du commit, pas une suppression de données.
3. **Recommandation forte :** committer cette étape séparément des autres dans git, précisément pour pouvoir la `revert` indépendamment si besoin.

---

## Étape 3 — `skillGraphService.js` : tri topologique et détection de cycle

**Fichier nouveau :** `server/src/services/skillGraphService.js`

```javascript
const prisma = require('../config/database');

/**
 * Détecte si l'ajout d'un prérequis (skillId requiert prerequisiteId)
 * créerait un cycle dans le graphe existant. À appeler AVANT toute
 * création de SkillPrerequisite, dans le futur controller admin (Sprint 6).
 */
async function wouldCreateCycle(skillId, prerequisiteId) {
  if (skillId === prerequisiteId) return true;

  const visited = new Set();
  const queue = [prerequisiteId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === skillId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const prereqs = await prisma.skillPrerequisite.findMany({
      where: { skillId: current },
      select: { prerequisiteId: true },
    });
    queue.push(...prereqs.map(p => p.prerequisiteId));
  }

  return false;
}

/**
 * Tri topologique (Kahn's algorithm) d'un sous-ensemble de skills.
 * Retourne un ordre d'apprentissage valide respectant tous les prérequis.
 * Lance une erreur si un cycle est détecté dans les données existantes
 * (ne devrait jamais arriver si wouldCreateCycle est systématiquement
 * appelé avant insertion, mais reste une garde de sécurité).
 */
async function topologicalSort(skillIds) {
  const prereqEdges = await prisma.skillPrerequisite.findMany({
    where: { skillId: { in: skillIds } },
    select: { skillId: true, prerequisiteId: true },
  });

  const inDegree = new Map(skillIds.map(id => [id, 0]));
  const adjacency = new Map(skillIds.map(id => [id, []]));

  for (const edge of prereqEdges) {
    if (!skillIds.includes(edge.prerequisiteId)) continue; // prérequis hors du sous-ensemble demandé, ignoré
    adjacency.get(edge.prerequisiteId).push(edge.skillId);
    inDegree.set(edge.skillId, (inDegree.get(edge.skillId) || 0) + 1);
  }

  const queue = skillIds.filter(id => inDegree.get(id) === 0);
  const result = [];

  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);
    for (const neighbor of adjacency.get(current) || []) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) queue.push(neighbor);
    }
  }

  if (result.length !== skillIds.length) {
    throw new Error('skillGraphService.topologicalSort: cycle detected in existing data — this should not happen if wouldCreateCycle was enforced at write time');
  }

  return result;
}

/**
 * Retourne les skills manquants (prérequis non acquis) pour qu'un utilisateur
 * puisse aborder un skill cible. Utilisé par le futur AI Study Planner (Sprint 7+).
 */
async function getMissingPrerequisites(userId, skillId) {
  const acquired = await prisma.userSkill.findMany({
    where: { userId, acquiredAt: { not: null } },
    select: { skillId: true },
  });
  const acquiredIds = new Set(acquired.map(s => s.skillId));

  const direct = await prisma.skillPrerequisite.findMany({
    where: { skillId },
    select: { prerequisiteId: true },
  });

  return direct
    .map(p => p.prerequisiteId)
    .filter(id => !acquiredIds.has(id));
}

module.exports = { wouldCreateCycle, topologicalSort, getMissingPrerequisites };
```

**Note de cohérence :** `wouldCreateCycle` est volontairement écrit ici, prêt à l'emploi, mais ne sera **branché** dans un controller qu'au Sprint 6 (création admin de `SkillPrerequisite` côté API). Pour l'instant, c'est une fonction testable en isolation.

**Commande de test isolé :**
```bash
node -e "
const { topologicalSort } = require('./src/services/skillGraphService');
// Remplacer par 3-4 vrais IDs de skills seedés ayant des prérequis entre eux
topologicalSort(['ID_HTML5', 'ID_CSS3', 'ID_JS_ES6', 'ID_REACT_HOOKS'])
  .then(order => console.log('Ordre:', order))
  .catch(e => console.error('FAIL', e.message));
"
```

**ROLLBACK de cette étape :**
1. Supprimer `server/src/services/skillGraphService.js`
2. Aucune migration associée — pure logique applicative, rollback trivial

---

## Étape 4 — Hook `UserSkill` dans `progressService.js`

**Fichier modifié (à nouveau) :** `server/src/services/progressService.js`

**Action :** après la complétion d'une leçon et l'attribution d'XP (Étape 2), ajouter la mise à jour de `UserSkill` pour chaque skill enseigné par cette leçon.

```javascript
const { getMissingPrerequisites } = require('./skillGraphService');

// ... toujours dans markLessonComplete, après l'appel à awardXp et recalculateEnrollmentXp :

const lessonSkills = await prisma.lessonSkill.findMany({
  where: { lessonId },
  include: { skill: true },
});

for (const ls of lessonSkills) {
  const existing = await prisma.userSkill.findUnique({
    where: { userId_skillId: { userId, skillId: ls.skillId } },
  });

  const newProficiency = Math.min((existing?.proficiencyLevel || 0) + 1, 5);
  const ACQUISITION_THRESHOLD = 3; // seuil arbitraire — à ajuster, documenté ici pour visibilité

  await prisma.userSkill.upsert({
    where: { userId_skillId: { userId, skillId: ls.skillId } },
    create: {
      userId,
      skillId: ls.skillId,
      proficiencyLevel: 1,
      lastPracticedAt: new Date(),
      acquiredAt: ACQUISITION_THRESHOLD <= 1 ? new Date() : null,
    },
    update: {
      proficiencyLevel: newProficiency,
      lastPracticedAt: new Date(),
      acquiredAt: existing?.acquiredAt || (newProficiency >= ACQUISITION_THRESHOLD ? new Date() : null),
    },
  });
}
```

**Important — ce que cette étape ne fait PAS :** elle n'incrémente jamais `UserSkill.xpEarned` directement (conformément à la décision actée). Si un futur affichage a besoin de ce total par skill, il doit appeler une fonction `recalculateUserSkillXp(userId, skillId)` symétrique à `recalculateEnrollmentXp`, à ajouter dans `xpService.js` au moment où ce besoin se présente concrètement (pas anticipé ici pour éviter du code mort).

**Procédure de test immédiat après modification :**
1. Identifier une leçon de test ayant au moins un `LessonSkill` associé (créé manuellement si besoin via Prisma Studio)
2. Compléter cette leçon pour un utilisateur de test
3. Vérifier qu'une ligne `UserSkill` a été créée ou mise à jour, avec `proficiencyLevel` incrémenté
4. Re-compléter la même leçon une deuxième fois (si le système le permet) et vérifier que `proficiencyLevel` plafonne bien à 5, ne dépasse jamais

**ROLLBACK de cette étape :**
1. Retirer le bloc de code ajouté dans `progressService.js` (garder uniquement les Étapes 1-2 actives)
2. Pas de migration à annuler
3. Si des `UserSkill` de test ont été créées par erreur : `DELETE FROM user_skills WHERE user_id = 'USER_DE_TEST';`

---

## Étape 5 — `careerPathService.js` : progression dans un parcours métier

**Fichier nouveau :** `server/src/services/careerPathService.js`

```javascript
const prisma = require('../config/database');
const { topologicalSort } = require('./skillGraphService');

/**
 * Retourne la roadmap ordonnée d'un career path, avec le statut de chaque
 * skill pour cet utilisateur (acquis / en cours / verrouillé).
 */
async function getCareerPathProgress(userId, careerPathId) {
  const pathSkills = await prisma.careerPathSkill.findMany({
    where: { careerPathId },
    include: { skill: true },
    orderBy: { orderNumber: 'asc' },
  });

  const skillIds = pathSkills.map(ps => ps.skillId);
  const orderedIds = await topologicalSort(skillIds);

  const userSkills = await prisma.userSkill.findMany({
    where: { userId, skillId: { in: skillIds } },
  });
  const userSkillMap = new Map(userSkills.map(us => [us.skillId, us]));

  return orderedIds.map(skillId => {
    const pathSkill = pathSkills.find(ps => ps.skillId === skillId);
    const userSkill = userSkillMap.get(skillId);
    return {
      skill: pathSkill.skill,
      isMandatory: pathSkill.isMandatory,
      proficiencyLevel: userSkill?.proficiencyLevel || 0,
      acquired: !!userSkill?.acquiredAt,
    };
  });
}

module.exports = { getCareerPathProgress };
```

**Note :** ce service utilise `topologicalSort` (Étape 3) plutôt que `pathSkills.orderNumber` directement — c'est volontaire. `orderNumber` reflète l'intention éditoriale de l'admin au moment de la création du career path, mais `topologicalSort` garantit que l'ordre respecte mathématiquement les prérequis même si l'admin a fait une erreur de séquençage manuel. En cas de divergence entre les deux, c'est un signal qu'il faut exposer à l'admin au Sprint 6 (pas géré dans ce sprint).

**ROLLBACK de cette étape :**
1. Supprimer `server/src/services/careerPathService.js`
2. Aucune migration associée

---

## Récapitulatif — checklist de fin de sprint

| Étape | Fichier | Type | Rollback testé |
|-------|---------|------|-----------------|
| 0 | Backup pg_dump | n/a | n/a |
| 1 | `xpService.js` (nouveau) | Addition pure | ☐ |
| 2 | `progressService.js` (modifié — awardXp) | **Modification de code actif** | ☐ |
| 3 | `skillGraphService.js` (nouveau) | Addition pure | ☐ |
| 4 | `progressService.js` (modifié — UserSkill) | **Modification de code actif** | ☐ |
| 5 | `careerPathService.js` (nouveau) | Addition pure | ☐ |

**Étapes à risque élevé, à committer séparément en git pour rollback indépendant :** 2 et 4. Toutes les autres (1, 3, 5) sont des fichiers neufs sans impact sur l'existant tant qu'ils ne sont pas importés ailleurs.

**Ce qui n'est PAS encore fait à la fin de ce sprint (reporté au Sprint 6) :**
- Aucune route API exposée — tout ce code est appelable uniquement depuis d'autres services ou des scripts Node manuels
- Aucun controller admin pour créer des `Skill`/`SkillPrerequisite` via HTTP (donc `wouldCreateCycle` reste non branché à une route)
- Aucun appel à `recalculateUserSkillXp` — `UserSkill.xpEarned` reste à 0 tant que ce besoin n'est pas concrètement exposé
- Migration de la logique XP existante dans `gamificationService.js` — à vérifier manuellement en tout début de l'Étape 1, pas automatisée ici

**Test global de non-régression avant de clore ce sprint :** rejouer le Bloc 4 du fichier `SPRINT_4_tests_cloture.md` (les 6 routes existantes) — l'Étape 2 et l'Étape 4 ont modifié un chemin de code critique (complétion de leçon), donc cette vérification n'est pas optionnelle ici.
