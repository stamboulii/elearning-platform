import prisma from '../config/database.js';
import { awardXp, recalculateEnrollmentXp } from './xpService.js';
import certificateService from './certificateService.js';

class ProgressService {
  // Mark lesson as complete
  async markLessonComplete(userId, lessonId) {
    // Get the lesson and verify enrollment
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true
          }
        },
        quiz: true
      }
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.section.course.id
        }
      }
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    // Check if lesson was already completed to avoid double XP
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId
        }
      }
    });

    // Validate content consumption based on lesson type
    const timeSpent = existingProgress?.timeSpent || 0;

    if (lesson.contentType === 'VIDEO') {
      const durationInSeconds = (lesson.duration || 0) * 60;
      const minRequiredTime = Math.floor(durationInSeconds * 0.9);

      if (timeSpent < minRequiredTime) {
        const watchedPercent = durationInSeconds > 0 ? Math.round((timeSpent / durationInSeconds) * 100) : 0;
        throw new Error(`You must watch at least 90% of this video before marking it as complete. Currently watched: ${watchedPercent}%`);
      }
    }

    if (lesson.contentType === 'QUIZ') {
      if (lesson.quiz) {
        const passingScore = lesson.quiz.passingScore;
        const hasPassed = await prisma.quizAttempt.findFirst({
          where: {
            quizId: lesson.quiz.id,
            userId: userId,
            passed: true,
            score: { gte: passingScore }
          }
        });

        if (!hasPassed) {
          throw new Error(`You must pass the quiz with a score of at least ${passingScore}% before marking it as complete.`);
        }
      }
    }

    if (lesson.contentType === 'TEXT' || lesson.contentType === 'DOCUMENT') {
      const minReadTime = Math.max(60, (lesson.duration || 1) * 60 * 0.5);
      if (timeSpent < minReadTime) {
        throw new Error(`You must spend at least ${Math.ceil(minReadTime / 60)} minutes reading this content before marking it as complete.`);
      }
    }

    // Create or update lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId
        }
      },
      update: {
        isCompleted: true,
        completedAt: new Date()
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date()
      }
    });

    // Award XP only if it's the first time completing this lesson
    if (!existingProgress || !existingProgress.isCompleted) {
      await awardXp(userId, 50, 'LESSON_COMPLETED', lessonId);
      await recalculateEnrollmentXp(enrollment.id);
    }

    // Update UserSkill for each skill taught by this lesson
    const lessonSkills = await prisma.lessonSkill.findMany({
      where: { lessonId },
      include: { skill: true },
    });

    const ACQUISITION_THRESHOLD = 3;

    for (const ls of lessonSkills) {
      const existing = await prisma.userSkill.findUnique({
        where: { userId_skillId: { userId, skillId: ls.skillId } },
      });

      const newProficiency = Math.min((existing?.proficiencyLevel || 0) + 1, 5);

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

    // Update overall course progress
    await this.updateCourseProgress(enrollment.id, userId);

    return progress;
  }

  // Update video progress (for resume functionality)
  async updateVideoProgress(userId, lessonId, data) {
    const { lastPosition, timeSpent } = data;

    // Get lesson and verify enrollment
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.section.course.id
        }
      }
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    // Update or create progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId
        }
      },
      update: {
        lastPosition: lastPosition !== undefined ? lastPosition : undefined,
        timeSpent: timeSpent !== undefined ? timeSpent : undefined
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        lastPosition: lastPosition || 0,
        timeSpent: timeSpent || 0,
        isCompleted: false
      }
    });

    // Update last accessed time for enrollment
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { lastAccessed: new Date() }
    });

    return progress;
  }

  // Calculate and update course progress percentage
  async updateCourseProgress(enrollmentId, userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            sections: {
              include: {
                lessons: true
              }
            }
          }
        },
        lessonProgress: true
      }
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Get total lessons count
    const totalLessons = enrollment.course.sections.reduce(
      (sum, section) => sum + section.lessons.length,
      0
    );

    if (totalLessons === 0) {
      return enrollment;
    }

    // Get completed lessons count
    const completedLessons = enrollment.lessonProgress.filter(
      (progress) => progress.isCompleted
    ).length;

    // Calculate percentage
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    // Check if course is completed
    const becameCompleted = progressPercentage === 100 && enrollment.completionStatus !== 'COMPLETED';
    const completionStatus = progressPercentage === 100 ? 'COMPLETED' : 'IN_PROGRESS';
    const completedAt = progressPercentage === 100 && !enrollment.completedAt
      ? new Date()
      : enrollment.completedAt;

    // Award bonus XP for course completion
    if (becameCompleted && userId) {
      await awardXp(userId, 500, 'COURSE_COMPLETED', enrollmentId);
      await recalculateEnrollmentXp(enrollmentId);
    }

    // Update enrollment FIRST so completionStatus is 'COMPLETED' in the DB
    // before issueCertificate reads it
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progressPercentage,
        completionStatus,
        completedAt
      }
    });

    // Issue certificate AFTER enrollment is marked COMPLETED
    if (becameCompleted) {
      await certificateService.issueCertificate(enrollmentId);
    }

    return updatedEnrollment;
  }

  // Get lesson progress for a user
  async getLessonProgress(userId, lessonId) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.section.course.id
        }
      }
    });

    if (!enrollment) {
      return null;
    }

    const progress = await prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId
        }
      }
    });

    return progress;
  }

  // Get all progress for an enrollment
  async getEnrollmentProgress(enrollmentId, userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        lessonProgress: {
          include: {
            lesson: {
              include: {
                section: true
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (enrollment.userId !== userId) {
      throw new Error('Not authorized');
    }

    return enrollment.lessonProgress;
  }

  // Reset lesson progress (for retaking)
  async resetLessonProgress(userId, lessonId) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.section.course.id
        }
      }
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    // Reset progress
    const progress = await prisma.lessonProgress.update({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId
        }
      },
      data: {
        isCompleted: false,
        completedAt: null,
        lastPosition: 0,
        timeSpent: 0
      }
    });

    // Recalculate course progress
    await this.updateCourseProgress(enrollment.id, userId);

    return progress;
  }
}

export default new ProgressService();