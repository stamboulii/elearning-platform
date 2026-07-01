# Deux Features d'Extension — Analyse Détaillée

**Date :** 2026-06-30  
**Contexte :** E-Learning Platform existante (React/Express/Prisma/PostgreSQL/Socket.io/Groq/Stripe/Cloudinary)  
**Objectif :** évaluer 2 idées et leur impact sur les features existantes, sans toucher au code.

---

## Table des matières

1. [Feature A — Skill Graph & Career Paths](#a--skill-graph--career-paths)
2. [Feature B — Micro-Learning & Spaced Repetition](#b--micro-learning--spaced-repetition)
3. [Impact transverse sur les features existantes](#impact-transverse-sur-les-features-existantes)
4. [Comparaison & priorisation](#comparaison--priorisation)
5. [Plan de réalisation suggéré](#plan-de-réalisation-suggéré)

---

## A — Skill Graph & Career Paths

### 1.1 Concept

Au lieu de voir les cours comme des contenus isolés, la plateforme modélise un **graphe de compétences** (Skill Graph) :
- Chaque `Lesson` enseigne un ensemble de `Skill` (ex: "React Hooks", "CSS Flexbox", "REST API").
- Chaque `Skill` a des prérequis (edges du graphe).
- Un `CareerPath` est un chemin dans ce graphe : "Frontend Developer" = [HTML → CSS → JS → React → Testing → Deployment].
- L'étudiant suit le career path, et la plateforme lui recommande la prochaine compétence à apprendre en fonction de ses acquis et ses lacunes.

Cela transforme la plateforme : **orientée compétences**, pas seulement **orientée contenus**.

### 1.2 Modèles Prisma à ajouter

| Nouveau modèle | Champs principaux | Rôle |
|----------------|-------------------|------|
| `Skill` | `id`, `name`, `slug`, `description`, `category`, `difficultyLevel` | Nœud du graphe de compétences |
| `LessonSkill` | `lessonId`, `skillId`, `weight` | Relation N-N entre leçons et skills (une leçon peut enseigner plusieurs skills, avec poids d'importance) |
| `SkillPrerequisite` | `skillId`, `prerequisiteSkillId` | Edge du graphe : "skill A nécessite skill B" |
| `CareerPath` | `id`, `title`, `slug`, `description`, `targetRole`, `estimatedHours`, `isActive` | Parcours métier (ex: "Fullstack JS") |
| `CareerPathSkill` | `careerPathId`, `skillId`, `orderNumber`, `isMandatory` | Séquences de skills dans un parcours |
| `UserSkill` | `userId`, `skillId`, `proficiencyLevel`, `lastPracticedAt`, `xpEarned` | Progression de l'utilisateur par compétence |
| `SkillAssessment` | `id`, `userId`, `skillId`, `quizId` (optionnel), `assessedAt`, `score`, `passed` | Évaluation formelle d'un skill (via quiz ou projet) |

**Enrichissement des modèles existants :**
- `Lesson` → ajout champs `difficultyLevel` (BEGINNER/INTERMEDIATE/ADVANCED), `estimatedXp`
- `Quiz` → ajout champ `associatedSkillId` (un quiz peut valider un skill spécifique)
- `User` → ajout champs `currentCareerPathId`, `skillXp`, `skillLevel` (déjà partiellement présent avec `xp`/`level`)

### 1.3 Nouveaux services backend

| Service | Responsabilité |
|---------|---------------|
| `skillGraphService.js` | CRUD skills, prérequis, graphe; calcul chemin optimal; recommandation prochaine skill |
| `careerPathService.js` | CRUD career paths, séquencement skills, progression utilisateur dans le path |
| `assessmentService.js` | Évaluation skills via quiz, scoring adaptatif, mise à jour `UserSkill` |
| `recommendationService.js` | Moteur de recommandation : "tu as skill X, tu as lacune Y → cours Z" |

**Services existants modifiés :**
- `progressService.js` → enrichi pour calculer `UserSkill` automatiquement quand une leçon est complétée
- `enrollmentService.js` → propose le career path au moment de l'inscription
- `gamificationService.js` → décompose l'XP par skill au lieu d'un seul compteur global

### 1.4 Impact sur les features existantes

| Feature existante | Impact |
|-------------------|--------|
| **CourseBuilder** | Ajout d'un step " Skills enseignées " dans la création de leçon : l'instructeur sélectionne 1-5 skills associés à sa leçon. Impact UX moyen. |
| **CoursePlayer (étudiant)** | Affichage d'une barre de progression par skill dans le sidebar. Leçon verrouillée si prérequis skill non acquis. Impact UX moyen. |
| **Dashboard étudiant** | Nouveau widget "Skill Radar" (radar chart via Recharts) montrant les compétences maîtrisées vs à acquérir dans le career path. |
| **Dashboard instructeur** | Nouvelle vue "Skills Coverage" : quels skills sont couverts par mes cours, quels sont les gaps. |
| **AI Study Planner** | **Impact fort** : le planner ne planifie plus seulement des leçons, il planifie des **skills**. Si l'étudiant a une lacune en "CSS Flexbox", le planner ajoute des exercices ciblés. |
| **Quiz system** | Les quiz peuvent être tagués par skill. Un étudiant qui échoue un quiz "React Hooks" voit son `UserSkill.reactHooks.proficiencyLevel` baisser et se voit recommander des leçons de remédiation. |
| **Certificates** | Évolution possible : certificat par skill ("Certifié React") en plus du certificat global de cours. Nouveau modèle `SkillCertificate`. |
| **Gamification / Badges** | Nouveaux badges par skill : "React Master" (niveau 5 React), "Fullstack Novice" (3 skills d'un path). Les badges existants sont complétés, pas cassés. |
| **Notifications** | Nouveaux types : `SKILL_LEVELED_UP`, `CAREER_PATH_MILESTONE`, `SKILL_GAP_DETECTED`. |
| **Catalogue / Recherche** | Les étudiants peuvent filtrer les cours par skill à acquérir ("Je veux apprendre Docker"). Les instructeurs voient la demande par skill. |
| **Enrollment** | Au moment de l'inscription, l'étudiant peut choisir un career path → le système Enrollment crée un `StudyPlan` basé sur le graphe de compétences. |

### 1.5 Flux utilisateur principal

**Instructeur :**
```
1. Crée un cours (CourseBuilder)
2. Dans chaque leçon, sélectionne les skills enseignés (ex: "useState", "useEffect")
3. La plateforme valide que ces skills existent dans le Skill Graph
4. Si un skill n'existe pas → option de le créer ou signaler à l'admin
```

**Étudiant :**
```
1. S'inscrit et choisit un Career Path (ex: "Frontend Developer")
2. Le système affiche la roadmap : 12 skills à acquérir séquentiellement
3. Premier skill : "HTML5" → recommande cours "HTML Fundamentals"
4. L'étudiant suit le cours, complète les leçons
5. À la fin : quiz de assessment sur le skill "HTML5"
6. Si score ≥ passing → UserSkill.proficiencyLevel augmente
7. Skill suivant débloqué : "CSS3"
8. Si échec → recommandation de leçons de remédiation + spaced repetition (feature B)
9. Visualisation en temps réel de la progression dans le graphe
10. Tous les skills du path complétés → badge "Frontend Developer" + certificat career path
```

### 1.6 Complexité & risques

| Aspect | Évaluation |
|--------|-----------|
| **Complexité** | Élevée — nouveaux modèles, services, modification logging progression |
| **Charge DB** | Modérée — `LessonSkill`, `UserSkill`, `SkillAssessment` sont des tables légères |
| **UX** | Risque de surcharge cognitive — il faut présenter le graphe simplement (une roadmap linéaire, pas un réseau complexe) |
| **Backward compatibilité** | Bonne — les relations sont additives, pas de breaking change sur `Course`/`Lesson` existants |
| **Maintenance** | Le Skill Graph doit être maintenu : nouveaux skills, mise à jour prérequis, obsolescence |

**Conclusion A :** Feature très puissante, différenciateur fort vs Udemy. À construire sur 3-4 sprints. Requiert un travail de modélisation initiale des skills (quelqu'un doit peupler le graphe). L'intégration avec l'AI Study Planner en fait un pilier central de l'expérience éducative.

---

## B — Micro-Learning & Spaced Repetition

### 2.1 Concept

Deux sous-features combinées :

**Micro-Learning :**
- Découpage des cours en modules ultra-courts (3-7 minutes chacun).
- Chaque micro-module = un objectif d'apprentissage unique, pas un chapitre de 45min.
- L'étudiant consomme 1-2 micro-modules par session courte (ex: dans le métro).
- Cela change la structure de `Lesson` → potentiellement `MicroLesson` ou simplement une convention de nommage (`duration <= 7`).

**Spaced Repetition :**
- Algorithme SM-2 (ou variant léger) qui planifie les révisions optimales avant l'oubli.
- Quand une leçon est complétée, elle est ajoutée à la file de révision.
- L'algorithme calcule le prochain intervalle de révision en fonction de la difficulté de rappel (Easy / Good / Hard / Again).
- Notifications automatiques : "Il est temps de réviser 'CSS Flexbox'".
- L'étudiant peut réviser n'importe quand, mais le système priorise ce qui est le plus urgent.

### 2.2 Modèles Prisma à ajouter

| Nouveau modèle | Champs principaux | Rôle |
|----------------|-------------------|------|
| `ReviewSession` | `userId`, `lessonId`, `reviewedAt`, `difficultyRating` (1-4), `nextReviewAt`, `intervalDays`, `repetitionNumber` | Session de révision espacée (algorithme SM-2) |
| `MicroLessonConfig` | `lessonId`, `isMicro`, `expectedDurationMinutes`, `focusSkillIds` | Marqueur pour les micro-leçons (ou on peut utiliser un flag sur `Lesson` directement) |

**Enrichissement des modèles existants :**
- `Lesson` → ajout champs `isMicro` (boolean), `expectedDurationMinutes`, `reviewCount`, `averageDifficulty`
- `LessonProgress` → ajout champ `repetitions` (nombre de révisions réussies)
- `Notification` → nouveau type `REVIEW_DUE`
- `User` / `Enrollment` → ajout `nextReviewAt` pour affichage dashboard

### 2.3 Nouveaux services backend

| Service | Responsabilité |
|---------|---------------|
| `spacedRepetitionService.js` | Implémentation algorithme SM-2 : calcul des intervalles, gestion file de révision, scoring |
| `microLearningService.js` | Découpage suggestions, validation durée, analytics micro-modules |
| `reviewSessionService.js` | CRUD sessions de révision, enregistrement difficulty rating |

**Services existants modifiés :**
- `progressService.js` → quand une leçon est marquée complétée, appel à `spacedRepetitionService.scheduleReview(userId, lessonId)`
- `notificationService.js` → job quotidien qui cherche les `ReviewSession` dont `nextReviewAt <= now()` et crée des notifications
- `courseService.js` → flag `supportsMicroLearning` sur les cours (instructeur active/désactive)
- `enrollmentService.js` → ajout d'un endpoint `GET /enrollments/:id/reviews-due` pour afficher les révisions à faire aujourd'hui

### 2.4 Impact sur les features existantes

| Feature existante | Impact |
|-------------------|--------|
| **CourseBuilder** | Ajout d'un toggle "Enable Micro-Learning" par cours + affichage de la durée de chaque leçon. Si activé, l'instructeur est guidé pour créer des leçons ≤ 7min. Impact UX faible-moyen. |
| **CoursePlayer (étudiant)** | Affichage du prochain temps de révision en haut de la leçon. Bouton "Réviser maintenant" si une révision est due. Nouvelle vue "Révisions" dans le player. Impact UX moyen. |
| **Dashboard étudiant** | Nouveau widget "Révisions du jour" : X leçons à réviser, temps estimé total. Impact UX positif (engagement quotidien). |
| **AI Study Planner** | **Impact fort** : le planner intègre les sessions de révision espacée comme des blocs obligatoires dans l'emploi du temps. Ex: "Demain 10h : réviser React Hooks (12min)". Le planner respecte l'algorithme SM-2 au lieu de planifier des révisions aléatoires. |
| **Notifications** | Notifications `REVIEW_DUE` quotidiennes. L'étudiant reçoit : "3 leçons à réviser aujourd'hui — temps total estimé : 15min". Impact notifications : +1 type, volume quotidien potentiellement élevé (à throttler). |
| **Gamification** | Nouveaux badges : "Spaced Master" (30 révisions complétées), "Memory Champion" (streak de 30 jours de révisions). L'XP des révisions est différent des leçons (ex: +20 XP par révision réussie). Les badges existants ne sont pas cassés. |
| **Certificates** | Potentiel certificat "Memory Master" si l'étudiant maintient une review streak. Aussi, la rétention à 30/60/90 jours peut être un critère de qualité pour les instructeurs. |
| **Quiz system** | Un quiz peut être utilisé comme outil de révision (self-testing). L'intégration avec spaced repetition = les quiz de révision sont générés automatiquement par le système, pas seulement par l'instructeur. |
| **Course Catalog** | Filtre "Micro-learning" pour les étudiants qui veulent des formats courts. Badge visuel "⚡ Micro-learning" sur les cours compatibles. |
| **Instructor Analytics** | Corrélation "taille des leçons" vs "taux de complétion". Les instructeurs voient si leurs leçons de 45min ont un drop rate plus élevé que les micro-modules de 5min. Données actionnables pour restructurer leurs cours. |

### 2.5 Flux utilisateur principal

**Création (Instructeur) :**
```
1. Instructeur crée un cours
2. Active l'option "Micro-Learning"
3. CourseBuilder suggère de découper les leçons > 7min
4. Chaque leçon créée est automatiquement taguée avec une durée attendue
5. À la publication, le système valide que toutes les leçons respectent la contrainte (ou warning si non)
```

**Apprentissage (Étudiant) :**
```
1. Étudiant s'inscrit à un cours en micro-learning
2. Il consomme 1-2 leçons par jour (3-7min chacune)
3. Après chaque leçon marquée complétée :
   - spacedRepetitionService.calculateNextReview(lessonId, difficulty)
   - Par défaut : review dans 1 jour, puis 3 jours, puis 7 jours, puis 14 jours...
4. L'étudiant reçoit une notification : "Réviser 'CSS Flexbox' — 4min estimées"
5. Il clique → lance une session de révision :
   - Soit un quiz ciblé (généré par l'IA)
   - Soit un flashcard review
   - Soit un rewatch des points clés
6. Il rate sa difficulté : Easy / Good / Hard / Again
   - Easy → intervalle ×1.5
   - Good → intervalle ×1.2
   - Hard → intervalle ×0.8
   - Again → retour à 1 jour
7. La progression globale recalcule automatiquement
8. Le dashboard affiche : "Streak actuelle : 12 jours de révisions"
```

### 2.6 Algorithme SM-2 (simplifié)

```
Après une révision :
  if difficulty == AGA:
    repetitions = 0
    interval = 1 day
    easiness = easiness - 0.2
  else:
    repetitions += 1
    if repetitions == 1:
      interval = 1 day
    elif repetitions == 2:
      interval = 6 days
    else:
      interval = previousInterval * easiness
    if difficulty == EASY:
      easiness += 0.15
    elif difficulty == GOOD:
      easiness += 0.0
    elif difficulty == HARD:
      easiness -= 0.15

  nextReviewAt = now + interval
  Stocker : interval, repetitions, easiness, nextReviewAt
```

**Variante suggérée** : commencer par une version simplifiée (intervalles fixes : 1j, 3j, 7j, 14j, 30j) avant de tuner l'easiness factor. Ça simplifie le debugging et l'ajustement.

### 2.7 Complexité & risques

| Aspect | Évaluation |
|--------|-----------|
| **Complexité** | Moyenne — algorithme SM-2 est simple, l'intégration UI/UX demande surtout du design (éviter la fatigue de notifications) |
| **Charge DB** | Légère — `ReviewSession` = 1 ligne par leçon révisée par étudiant |
| **UX** | Risque principal = **notification fatigue**. Il faut absolument permettre à l'étudiant de configurer la fréquence ("Recevoir les rappels matin seulement") et de snoozer. |
| **Backward compatibilité** | Excellente — flag optionnel par cours, étudiants non concernés si le cours n'active pas le micro-learning |
| **Adoption instructeur** | Risque moyen — les instructeurs doivent restructurer leurs leçons existantes (travail éditorial). Il faut un assistant de découpage automatique. |

**Conclusion B :** Feature très concrète, faible risque, forte valeur pédagogique. L'algorithme SM-2 est éprouvé (Anki, Duolingo). L'intégration avec AI Study Planner est naturelle.

---

## Impact transverse sur les features existantes

### 3.1 AI Study Planner

**Avant :**
- Planning basé sur `StudySchedule.targetDate` + `hoursPerDay`
- Répartition linéaire : "tu as 20 leçons, 5 jours → 4 leçons/jour"
- Pas de mémoire à long terme

**Après (Feature A — Skill Graph) :**
- Planning séquence les **skills**, pas les leçons
- Si prérequis manquant → insertion auto de leçons de remédiation avant le skill cible
- Ex: "Tu veux apprendre React, mais ton skill 'JavaScript ES6' est faible → 2 leçons ES6 d'abord"

**Après (Feature B — Spaced Repetition) :**
- Planning intègre des **blocs de révision** obligatoires
- Ex: "Demain : 10h-10h15 = Réviser React Hooks (SM-2 due), 10h15-11h = Nouvelle leçon Redux"
- Respecte la courbe d'oubli : les révisions sont placées aux dates optimales
- Le temps total estimé du planning augmente car il inclut les révisions

**Synergie A+B :**
```
Study Planner output = [
  { type: 'NEW', lessonId: 'L101', skill: 'React Hooks', duration: 5min },
  { type: 'REVIEW', lessonId: 'L045', skill: 'CSS Flexbox', duration: 4min, algorithm: 'SM-2' },
  { type: 'REMEDIATION', lessonId: 'L022', skill: 'JS Closures', duration: 7min },
  { type: 'NEW', lessonId: 'L102', skill: 'Redux Toolkit', duration: 6min }
]
```

### 3.2 CoursePlayer (lecteur étudiant)

**Impact Feature A :**
- Sidebar enrichie : affichage d'une mini-map de skill progression par cours
- Badge sur chaque leçon : "Ceci teaches: React Hooks ⭐ + useEffect ⭐"
- Verrouillage intelligent : si `SkillPrerequisite` non validé → leçon grisée avec message "Termine d'abord 'React Basics'"

**Impact Feature B :**
- En haut de chaque leçon : indicateur "Cette leçon est due en révision le 02/07"
- Bouton "Réviser maintenant" atteint directement la review session
- Après review : affichage immédiat de la prochaine date de révision

### 3.3 QuizPlayer & Quiz System

**Impact Feature A :**
- Quiz tagués par skill
- Résultat de quiz → mise à jour directe du `UserSkill` concerné
- Si échec sur skill X → déclenchement automatique d'un `CareerPath` remediation

**Impact Feature B :**
- Les quiz de révision sont générés à la volée par l'IA (Groq) en fonction du contenu de la leçon
- Feedback immédiat : "Tu as oublié ce point — revois la section 2.3"
- Historique des tentatives de révision stocké dans `ReviewSession.scoreHistory`

### 3.4 Notifications

**Nouveaux types ajoutés :**

| Type | Déclencheur | Fréquence |
|------|-------------|-----------|
| `SKILL_UNLOCKED` | Niveau proficiency atteint | Ponctuel |
| `CAREER_PATH_MILESTONE` | 25%/50%/75%/100% du path complété | Ponctuel |
| `REVIEW_DUE` | SM-2 nextReviewAt <= maintenant | Quotidien (1-3 par jour max recommandé) |
| `SKILL_GAP_DETECTED` | Lacune détectée après quiz échoué | Ponctuel |
| `MICRO_SESSION_SUGGESTION` | Rappel micro-learning (si étudiant inactif 2j) | Quotidien |

**Recommandation UX :** regrouper les `REVIEW_DUE` en une seule notification quotidienne avec résumé : "3 leçons à réviser aujourd'hui — 12min estimées".

### 3.5 Gamification & Badges

**Nouveaux badges suggérés (Feature A) :**

| Badge | Critère | Icône |
|-------|---------|-------|
| Skill Explorer | 5 skills différents découverts | 🧭 |
| Skill Master | Niveau proficiency ≥ 4 sur un skill | 🎯 |
| Career Path Completer | 100% d'un career path | 🏆 |
| Rapid Learner | 3 skills acquis en < 24h | ⚡ |
| Jack of All Trades | 10 skills différents niveau ≥ 2 | 🎨 |

**Nouveaux badges suggérés (Feature B) :**

| Badge | Critère | Icône |
|-------|---------|-------|
| Memory Beginner | 7 jours de révisions consécutives | 📅 |
| Memory Master | 30 jours de révisions consécutives | 🧠 |
| Spaced Pro | 100 reviews complétées | 🔄 |
| Micro-Learner | 50 micro-leçons complétées | ⚡ |

**Aucun badge existant n'est cassé.** Les XP sont juste réaffectés : +20 XP par review session, +10 XP par skill leveled up.

### 3.6 Certificates

**Impact Feature A :**
- Nouveau type de certificat : **Skill Certificate** ("Certifié : React Hooks — Niveau 4")
- Cumulative : tous les skill certificates d'un Career Path → certificat métier complet
- Modèle Prisma `SkillCertificate` si on veut séparer, ou extension de `Certificate` avec champ `type` (COURSE / SKILL / CAREER_PATH)

**Impact Feature B :**
- Potentiel badge "Memory Master" sur le certificat si l'étudiant a maintenu une review streak de 30j sur le cours
- Statistiques de rétention incluses dans le certificat (ex: "Rétention 87% à 30 jours")

### 3.7 Instructor Analytics

**Impact Feature A :**
- Vue "Skills Gap Analysis" : l'instructeur voit quels skills sont mal couverts ou mal assimilés dans ses cours
- Recommandations : "Tes étudiants ont du mal avec 'CSS Grid' → ajoute 2 exercices"
- Heatmap par skill : taux de complétion, score moyen, temps moyen

**Impact Feature B :**
- Courbes de rétention : combien d'étudiants reviennent aux révisions après 7j, 30j, 90j
- Corrélation "taille des leçons" vs "taux de review compliance"
- Identification des leçons "oubliées" (review score en baisse)

### 3.8 Course Catalog (frontend public)

**Impact Feature A :**
- Filtre par skill : "Je veux apprendre Docker"
- Recherche améliorée : indexation skills dans Elasticsearch/PostgreSQL full-text (si ajouté)
- Course card affiche les skills enseignés

**Impact Feature B :**
- Badge "⚡ Micro-Learning" sur les cours éligibles
- Filtre "Format court (< 10min par leçon)"
- Affichage du temps total de révision estimé pour le cours

---

## 4. Comparaison & priorisation

| Critère | A — Skill Graph | B — Micro-Learning + SR |
|---------|-----------------|-------------------------|
| **Faisabilité technique** | ⭐⭐⭐ (élevée mais nouveaux modèles) | ⭐⭐⭐⭐⭐ (très élevée) |
| **Dépendances externes** | Aucune | Aucune |
| **Impact UX étudiant** |⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Impact UX instructeur** | ⭐⭐⭐ (élevé, demande modélisation skills) | ⭐⭐⭐ (élevé, demande restructuration leçons) |
| **Intégration AI Study Planner** | Forte (remplace planning linéaire par graphe) | Forte (ajoute blocs révision obligatoires) |
| **Différenciation marché** | Très forte (Udemy n'a pas de Skill Graph public) | Moyenne (Anki/Duolingo l'ont déjà, mais pas sur vidéos) |
| **Charge maintenance** | Moyenne (graphe de skills à maintenir) | Faible (algorithme SM-2 autonome) |
| **Temps de dev estimé** | 3-4 sprints | 2-3 sprints |

**Verdict :**

- **Si vous voulez innover vite avec un minimum de risques** → choisissez **B (Micro-Learning + SR)**. C'est du "proven design", l'algorithme SM-2 est éprouvé, l'intégration est propre. C'est la feature la plus "plug-and-play" avec le plus fort impact rétention.
- **Si vous voulez construire un avantage compétitif durable à long terme** → choisissez **A (Skill Graph)**. C'est plus ambitieux, mais ça transforme la plateforme en "mappeur de compétences" plutôt qu'en simple marketplace de vidéos. C'est aussi ce qui facilityra le tuteur IA RAG (#3 idée précédente) et le parcours adaptatif (#1).

**Meilleur ordre de construction :**
1. **B d'abord** — démontre valeur pédagogique rapidement, construit l'habitude de révision
2. **A ensuite** — enrichit B avec une structure de skills, et devient la fondation pour le tuteur RAG

---

## 5. Plan de réalisation suggéré

### Phase 1 — Micro-Learning + Spaced Repetition (Sprints 1-3)

**Sprint 1 — Fondations :**
- Modèles Prisma : `ReviewSession`, flags `isMicro` sur `Lesson`
- Service `spacedRepetitionService.js` (algorithme SM-2 simplifié)
- Endpoint `POST /progress/lessons/:id/complete` → appelle SR automatiquement
- Endpoint `GET /reviews/due` pour l'étudiant

**Sprint 2 — UI & Notifications :**
- Widget "Révisions du jour" sur Dashboard étudiant
- Notifications quotidiennes `REVIEW_DUE` (avec throttle 1/jour max)
- Intégration dans `CoursePlayer` : bouton "Réviser maintenant"
- Gamification : badges "Memory Master"

**Sprint 3 — AI Study Planner intégration :**
- Le planner insère les blocs `REVIEW` dans l'emploi du temps
- Respect des intervalles SM-2 dans les suggestions
- Analytics : taux de compliance aux révisions

### Phase 2 — Skill Graph & Career Paths (Sprints 4-7)

**Sprint 4 — Modélisation & Seed :**
- Modèles Prisma : `Skill`, `LessonSkill`, `SkillPrerequisite`, `CareerPath`, `UserSkill`
- Script de seed initial : 50-100 skills Web/Mobile/Data courants
- Admin UI : CRUD skills + prérequis

**Sprint 5 — Core logique :**
- `skillGraphService.js` : calcul chemin, détection gaps
- `recommendationService.js` : moteur de recommandation basé sur UserSkill
- Intégration dans `progressService` : quand leçon complétée → update UserSkill

**Sprint 6 — Career Paths :**
- `careerPathService.js` : création paths, séquencement, tracking progression
- UI étudiant : vue "My Career Path" avec roadmap visuelle
- Intégration Enrollment : choix path au moment inscription

**Sprint 7 — Analytics & Polish :**
- Vue instructeur : Skills Coverage Analysis
- Claims de certificats par skill
- Notifications `SKILL_UNLOCKED`, `CAREER_PATH_MILESTONE`

---

## 6. Résumé pour la décision

| | Feature A | Feature B |
|--|-----------|-----------|
| **Quick win** | Non | Oui |
| **Innovation forte** | Oui | Non (éprouvé ailleurs) |
| **Intégration Planner** | Forte | Forte |
| **Risque** | Moyen | Faible |
| **Maintenance** | Moyenne | Faible |
| **Différenciation** | Élevée | Modérée |

**Recommandation finale :** commencer par **B**, puis enchainer sur **A**.  
B alone ajoute déjà une valeur pédagogique massive. A vient ensuite pour structurer et différencier durablement la plateforme.
