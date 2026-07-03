import prisma from '../config/database.js';

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

async function getNextStudySessionDate(enrollmentId, afterDate = new Date()) {
  if (!enrollmentId) return null;

  const studySchedule = await prisma.studySchedule.findUnique({
    where: { enrollmentId },
    select: { scheduleData: true },
  });

  if (!studySchedule?.scheduleData) return null;

  const sessions = Array.isArray(studySchedule.scheduleData)
    ? studySchedule.scheduleData
    : [];

  const nextSession = sessions
    .filter(s => s.date && new Date(s.date) > afterDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return nextSession ? new Date(nextSession.date) : null;
}

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

  const target = futureSessions[n - 1];
  return target ? new Date(target.date) : null;
}

export async function scheduleReview(userId, lessonId, enrollmentId = null) {
  const lessonSkillCount = await prisma.lessonSkill.count({
    where: { lessonId },
  });
  if (lessonSkillCount === 0) return null;

  let nextReviewAt = await getNextStudySessionDate(enrollmentId);
  if (!nextReviewAt) {
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
    },
  });
}

export async function submitReview(userId, lessonId, quality) {
  const schedule = await prisma.reviewSchedule.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  if (!schedule) throw new Error('ReviewSchedule not found');

  const updated = calculateNextReview(schedule, quality);

  let nextReviewAt = await getNthNextSessionDate(
    schedule.enrollmentId,
    new Date(),
    updated.interval
  );
  if (!nextReviewAt) {
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
    orderBy: { easeFactor: 'asc' },
  });
}

export async function getReviewStats(userId) {
  const [dueCount, totalCount] = await Promise.all([
    prisma.reviewSchedule.count({
      where: { userId, nextReviewAt: { lte: new Date() } },
    }),
    prisma.reviewSchedule.count({ where: { userId } }),
  ]);
  return { dueCount, totalCount };
}

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