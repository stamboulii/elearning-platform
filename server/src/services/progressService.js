import prisma from '../config/database.js';
import gamificationService from './gamificationService.js';
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
        }
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
      await gamificationService.awardXP(userId, 50, 'LESSON_COMPLETED', enrollment.id);
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
      await gamificationService.awardXP(userId, 500, 'COURSE_COMPLETED', enrollment.id);
      await certificateService.issueCertificate(enrollment.id);
    }

    // Update enrollment
    return await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progressPercentage,
        completionStatus,
        completedAt
      }
    });
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