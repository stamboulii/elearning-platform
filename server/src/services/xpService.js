import prisma from '../config/database.js';

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
    include: {
      course: {
        include: {
          sections: {
            include: {
              lessons: {
                select: { id: true }
              }
            }
          }
        }
      }
    },
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
  return Math.floor(xp / 1000) + 1;
}

export { awardXp, recalculateEnrollmentXp };
