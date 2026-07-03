# Sprint SR-1 — Spaced Repetition intégré au Study Plan

**Objectif :** quand un étudiant complète une leçon avec skills associés, le système SR calcule `nextReviewAt` en lisant la prochaine session du Study Plan de l'étudiant — pas un intervalle fixe J+1. Si l'étudiant n'a pas de Study Plan, fallback sur J+1.

**Décisions actées :**
- Leçons éligibles : uniquement celles avec au moins un `LessonSkill`
- Source du `nextReviewAt` : prochaine session dans `StudySchedule.scheduleData` après la date courante
- Fallback si pas de Study Plan : `nextReviewAt = J+1`
- Interface de révision : flashcards si `FlashcardDeck` existe, sinon redirection vers la leçon (Option A+C)
- Groq génère déjà des `type: "REVIEW"` dans le planning — on les réutilise comme créneaux de révision

**Pré-requis :** Sprints 4-8 clos, backup fait.

---

## Étape 0 — Backup

```bash
pg_dump $DATABASE_URL -F c -f backup_pre_sr1_$(date +%Y%m%d_%H%M).dump
```

---

## Étape 1 — Modèle `ReviewSchedule` dans schema.prisma

```prisma
// ============================================
// SPACED REPETITION
// ============================================

model ReviewSchedule {
  id           String    @id @default(uuid())
  userId       String    @map("user_id")
  lessonId     String    @map("lesson_id")
  enrollmentId String?   @map("enrollment_id") // lien vers le Study Plan
  easeFactor   Float     @default(2.5) @map("ease_factor")
  interval     Int       @default(1)            // en nombre de sessions, pas en jours
  repetitions  Int       @default(0)
  nextReviewAt DateTime  @map("next_review_at")
  lastReviewAt DateTime? @map("last_review_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson     Lesson      @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  enrollment Enrollment? @relation(fields: [enrollmentId], references: [id], onDelete: SetNull)

  @@unique([userId, lessonId])
  @@map("review_schedules")
}
```

**Relations inverses à ajouter :**

Dans `User` :
```prisma
reviewSchedules ReviewSchedule[]
```

Dans `Lesson` :
```prisma
reviewSchedules ReviewSchedule[]
```

Dans `Enrollment` :
```prisma
reviewSchedules ReviewSchedule[]
```

**Enum NotificationType** — ajouter en migration séparée :
```prisma
enum NotificationType {
  // ... existants ...
  REVIEW_DUE
  SKILL_UNLOCKED
}
```

**Deux migrations séparées :**
```bash
# Migration 1 — table
npx prisma migrate dev --name add_review_schedule

# Migration 2 — enum (séparée obligatoirement)
npx prisma migrate dev --name add_notification_types_sr
```

**Vérification :**
```bash
docker exec -it elearning-postgres psql -U postgres -d elearning -c "\dt review_schedules"
```

**ROLLBACK :** retirer le modèle + relations inverses + nouveaux enums, puis `npx prisma migrate dev --name remove_review_schedule`

---

## Étape 2 — `spacedRepetitionService.js`

**Fichier nouveau :** `server/src/services/spacedRepetitionService.js`

```javascript
import prisma from '../config/database.js';

// ─── Algorithme SM-2 ──────────────────────────────────────────────
// quality : 0=Oublié, 3=Difficile, 4=Bien, 5=Facile
function calculateNextReview(schedule, quality) {
  let { easeFactor, interval, repetitions } = schedule;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    repetitions += 1;
    if (repetitions === 1)      interval = 1;
    else if (repetitions === 2) interval = 6;
    else                        interval = Math.round(interval * easeFactor);

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);
  }

  return { easeFactor, interval, repetitions };
}

// ─── Lecture du Study Plan ────────────────────────────────────────
/**
 * Cherche la prochaine date de session dans scheduleData de Groq.
 * Format attendu : { schedule: [{ date: "YYYY-MM-DD", tasks: [...] }] }
 * Retourne null si pas de Study Plan ou pas de session future.
 */
async function getNextStudySessionDate(enrollmentId, afterDate = new Date()) {
  if (!enrollmentId) return null;

  const studySchedule = await prisma.studySchedule.findUnique({
    where: { enrollmentId },
    select: { scheduleData: true },
  });

  if (!studySchedule?.scheduleData) return null;

  // scheduleData est l'array retourné par Groq (parsed.schedule)
  const sessions = Array.isArray(studySchedule.scheduleData)
    ? studySchedule.scheduleData
    : [];

  // Trouver la prochaine session après afterDate
  const nextSession = sessions
    .filter(s => s.date && new Date(s.date) > afterDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return nextSession ? new Date(nextSession.date) : null;
}

/**
 * Trouve la Nième prochaine session après afterDate.
 * Utilisé pour calculer nextReviewAt basé sur l'interval SM-2
 * exprimé en nombre de sessions plutôt qu'en jours.
 */
async function getNthNextSessionDate(enrollmentId, afterDate, n) {
  if (!enrollmentId) return null;

  const studySchedule = await prisma.studySchedule.findUnique({
    where: { enrollmentId },
    select: { scheduleData: true },
  });

  if (!studySchedule?.scheduleData) return null;

  const sessions = Array.isArray(studySchedule.scheduleData)
    ? studySchedule.scheduleData
    : [];

  const futureSessions = sessions
    .filter(s => s.date && new Date(s.date) > afterDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const target = futureSessions[n - 1]; // n=1 → prochaine, n=6 → 6ème session
  return target ? new Date(target.date) : null;
}

// ─── API publique du service ──────────────────────────────────────

/**
 * Crée ou initialise un ReviewSchedule après complétion d'une leçon.
 * nextReviewAt = prochaine session du Study Plan, ou J+1 si pas de plan.
 */
export async function scheduleReview(userId, lessonId, enrollmentId = null) {
  // Vérifier que la leçon a des skills associés
  const lessonSkillCount = await prisma.lessonSkill.count({
    where: { lessonId },
  });
  if (lessonSkillCount === 0) return null;

  // Calculer nextReviewAt
  let nextReviewAt = await getNextStudySessionDate(enrollmentId);
  if (!nextReviewAt) {
    // Fallback J+1 si pas de Study Plan
    nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + 1);
  }

  return prisma.reviewSchedule.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: {
      userId,
      lessonId,
      enrollmentId,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewAt,
    },
    update: {
      lastReviewAt: new Date(),
      // Ne pas réinitialiser les paramètres SM-2 si déjà existant
    },
  });
}

/**
 * Enregistre une session de révision et recalcule le prochain intervalle.
 * quality : 0 (Oublié), 3 (Difficile), 4 (Bien), 5 (Facile)
 */
export async function submitReview(userId, lessonId, quality) {
  const schedule = await prisma.reviewSchedule.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  if (!schedule) throw new Error('ReviewSchedule not found');

  const updated = calculateNextReview(schedule, quality);

  // Calculer nextReviewAt selon le Study Plan et l'interval SM-2
  let nextReviewAt = await getNthNextSessionDate(
    schedule.enrollmentId,
    new Date(),
    updated.interval
  );
  if (!nextReviewAt) {
    // Fallback jours calendaires
    nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + updated.interval);
  }

  return prisma.reviewSchedule.update({
    where: { userId_lessonId: { userId, lessonId } },
    data: {
      easeFactor: updated.easeFactor,
      interval: updated.interval,
      repetitions: updated.repetitions,
      nextReviewAt,
      lastReviewAt: new Date(),
    },
  });
}

/**
 * Révisions dues maintenant (nextReviewAt <= now).
 */
export async function getDueReviews(userId) {
  return prisma.reviewSchedule.findMany({
    where: {
      userId,
      nextReviewAt: { lte: new Date() },
    },
    include: {
      lesson: {
        include: {
          lessonSkills: { include: { skill: true } },
          section: { include: { course: true } },
          flashcardDeck: { include: { flashcards: true } },
        },
      },
    },
    orderBy: { easeFactor: 'asc' }, // Les plus fragiles (easeFactor bas) en premier
  });
}

/**
 * Stats SR de l'utilisateur.
 */
export async function getReviewStats(userId) {
  const [dueCount, totalCount] = await Promise.all([
    prisma.reviewSchedule.count({
      where: { userId, nextReviewAt: { lte: new Date() } },
    }),
    prisma.reviewSchedule.count({ where: { userId } }),
  ]);
  return { dueCount, totalCount };
}

/**
 * Révisions dues pour la prochaine session d'un enrollment.
 * Utilisé pour la bannière dans CoursePlayer.
 */
export async function getDueReviewsForSession(userId, enrollmentId) {
  return prisma.reviewSchedule.findMany({
    where: {
      userId,
      enrollmentId,
      nextReviewAt: { lte: new Date() },
    },
    include: {
      lesson: {
        include: {
          flashcardDeck: { include: { flashcards: true } },
          lessonSkills: { include: { skill: true } },
        },
      },
    },
    orderBy: { easeFactor: 'asc' },
  });
}
```

**ROLLBACK :** supprimer `spacedRepetitionService.js`.

---

## Étape 3 — Hook dans `progressService.js`

Localiser `markLessonComplete` et ajouter après les appels XP/UserSkill :

```javascript
import { scheduleReview } from './spacedRepetitionService.js';

// Récupérer l'enrollmentId depuis l'enrollment de l'étudiant
// (il est déjà chargé dans markLessonComplete pour calculer la progression)
try {
  await scheduleReview(userId, lessonId, enrollmentId);
} catch (srError) {
  console.error('SpacedRepetition scheduleReview error:', srError);
  // Ne jamais bloquer la complétion de leçon
}
```

**Important :** passer `enrollmentId` à `scheduleReview` — c'est ce qui permet de lire le Study Plan.

**ROLLBACK :** retirer l'import et le bloc try/catch.

---

## Étape 4 — Routes SR

**Fichier nouveau :** `server/src/controllers/reviewController.js`

```javascript
import {
  getDueReviews,
  getDueReviewsForSession,
  submitReview,
  getReviewStats
} from '../services/spacedRepetitionService.js';

export const getMyDueReviews = async (req, res) => {
  try {
    const reviews = await getDueReviews(req.user.id);
    res.json({ success: true, data: { reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyReviewStats = async (req, res) => {
  try {
    const stats = await getReviewStats(req.user.id);
    res.json({ success: true, data: { stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSessionReviews = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const reviews = await getDueReviewsForSession(req.user.id, enrollmentId);
    res.json({ success: true, data: { reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitLessonReview = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { quality } = req.body;

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({
        success: false,
        message: 'quality must be 0 (Oublié), 3 (Difficile), 4 (Bien) or 5 (Facile)'
      });
    }

    const updated = await submitReview(req.user.id, lessonId, quality);
    res.json({ success: true, data: { schedule: updated } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

**Fichier nouveau :** `server/src/routes/reviewRoutes.js`

```javascript
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMyDueReviews,
  getMyReviewStats,
  getSessionReviews,
  submitLessonReview
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/due', protect, getMyDueReviews);
router.get('/stats', protect, getMyReviewStats);
router.get('/session/:enrollmentId', protect, getSessionReviews);
router.post('/lessons/:lessonId/submit', protect, submitLessonReview);

export default router;
```

**Montage dans `server/server.js` :**
```javascript
import reviewRoutes from './src/routes/reviewRoutes.js';
app.use('/api/reviews', reviewRoutes);
```

```bash
docker-compose restart backend
```

**ROLLBACK :** supprimer les deux fichiers + retirer le montage + restart.

---

## Récapitulatif

| Étape | Fichier | Type | Rollback |
|-------|---------|------|---------|
| 0 | Backup | n/a | n/a |
| 1 | `schema.prisma` + 2 migrations | Migration | ☐ |
| 2 | `spacedRepetitionService.js` | Addition | ☐ |
| 3 | `progressService.js` (hook) | Modification | ☐ |
| 4 | `reviewController.js` + `reviewRoutes.js` | Addition | ☐ |

---

## Tests de clôture

**Bloc 1 — Table créée :**
```bash
docker exec -it elearning-postgres psql -U postgres -d elearning -c "\dt review_schedules"
```

**Bloc 2 — Hook SR déclenché après complétion :**
Compléter une leçon avec skill → vérifier :
```bash
docker exec -it elearning-postgres psql -U postgres -d elearning -c "
SELECT rs.interval, rs.repetitions, rs.ease_factor,
       rs.next_review_at, rs.enrollment_id, l.title
FROM review_schedules rs
JOIN course_lessons l ON rs.lesson_id = l.id
WHERE rs.user_id = '00687b61-1df6-410b-b8a3-d22a7ab46553';
"
```
- Si l'étudiant a un Study Plan → `next_review_at` = date de la prochaine session
- Si pas de Study Plan → `next_review_at` = demain (J+1)

**Bloc 3 — Routes répondent :**
```bash
curl http://localhost:5000/api/reviews/stats \
  -H "Authorization: Bearer TOKEN_ETUDIANT"
# → { dueCount: 0, totalCount: 1 }
```

**Bloc 4 — SM-2 avec Study Plan :**
1. Créer un Study Plan pour Jamie via `POST /api/study-schedules/generate`
2. Compléter une nouvelle leçon avec skill
3. Vérifier que `next_review_at` correspond à la date de la prochaine session du plan

**Bloc 5 — Non-régression :**
Leçon sans skill → aucune ligne `review_schedules` créée.