import prisma from '../config/database.js';

class GamificationService {
  /**
   * Award XP to a user
   */
  async awardXP(userId, amount, reason, enrollmentId = null) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, firstName: true }
      });

      if (!user) throw new Error('User not found');

      const newXP = user.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const leveledUp = newLevel > user.level;

      // Update user XP and level
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          xp: newXP,
          level: newLevel
        }
      });

      // Update enrollment XP tracking if provided
      if (enrollmentId) {
        await prisma.enrollment.update({
          where: { id: enrollmentId },
          data: {
            xpEarned: { increment: amount }
          }
        });
      }

      // Check for badges
      await this.checkBadges(userId);

      return {
        amount,
        totalXP: newXP,
        currentLevel: newLevel,
        leveledUp,
        reason
      };
    } catch (error) {
      console.error('Award XP error:', error);
      return null;
    }
  }

  /**
   * Check and award badges based on milestones
   */
  async checkBadges(userId) {
    try {
      // 1. Get user enrollment and completion stats
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: { course: true }
      });

      const completedCourses = enrollments.filter(e => e.completionStatus === 'COMPLETED').length;
      
      // 2. Define milestone badges if they don't exist
      await this.ensureInitialBadges();

      // 3. Logic for awarding specific badges
      // First course completed
      if (completedCourses >= 1) {
        await this.giveBadge(userId, 'EARLY_ADOPTER');
      }

      // Course Master (5 courses)
      if (completedCourses >= 5) {
        await this.giveBadge(userId, 'COURSE_MASTER');
      }

      // Knowledge Seeker (Enrolled in 3 courses)
      if (enrollments.length >= 3) {
        await this.giveBadge(userId, 'KNOWLEDGE_SEEKER');
      }

    } catch (error) {
      console.error('Check badges error:', error);
    }
  }

  async giveBadge(userId, badgeCriteria) {
    const badge = await prisma.badge.findFirst({
      where: { criteria: badgeCriteria }
    });

    if (!badge) return;

    // Check if user already has it
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id
        }
      }
    });

    if (!existing) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id
        }
      });
      console.log(`User ${userId} earned badge: ${badge.name}`);
    }
  }

  async ensureInitialBadges() {
    const defaultBadges = [
      {
        name: 'Early Adopter',
        description: 'Complete your first course on the platform.',
        icon: '🚀',
        criteria: 'EARLY_ADOPTER',
        requirement: 1
      },
      {
        name: 'Knowledge Seeker',
        description: 'Enroll in at least 3 different courses.',
        icon: '📚',
        criteria: 'KNOWLEDGE_SEEKER',
        requirement: 3
      },
      {
        name: 'Course Master',
        description: 'Successfully complete 5 courses.',
        icon: '🏆',
        criteria: 'COURSE_MASTER',
        requirement: 5
      }
    ];

    for (const b of defaultBadges) {
      await prisma.badge.upsert({
        where: { name: b.name },
        update: {},
        create: b
      });
    }
  }
}

export default new GamificationService();
