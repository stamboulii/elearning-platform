import prisma from '../config/database.js';

class EnrollmentService {
  // Enroll in a course
  async enrollInCourse(userId, courseId) {
    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.status !== 'PUBLISHED') {
      throw new Error('Course is not available for enrollment');
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    // Check if user is the instructor
    if (course.instructorId === userId) {
      throw new Error('Instructors cannot enroll in their own courses');
    }

    // Create enrollment
    return await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        enrolledAt: new Date()
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true
              }
            },
            category: true
          }
        }
      }
    });
  }

  // Get user's enrolled courses
  async getUserEnrollments(userId, filters = {}) {
    const { status, page = 1, limit = 10 } = filters;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId };

    if (status) {
      where.completionStatus = status;
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true
                }
              },
              category: true,
              _count: {
                select: {
                  sections: true
                }
              }
            }
          }
        },
        orderBy: { enrolledAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.enrollment.count({ where })
    ]);

    return {
      enrollments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  // Get single enrollment with detailed progress
  async getEnrollmentDetails(enrollmentId, userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            sections: {
              include: {
                lessons: {
                  orderBy: { orderNumber: 'asc' }
                }
              },
              orderBy: { orderNumber: 'asc' }
            },
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                bio: true
              }
            }
          }
        },
        lessonProgress: {
          include: {
            lesson: true
          }
        }
      }
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (enrollment.userId !== userId) {
      throw new Error('Not authorized to view this enrollment');
    }

    return enrollment;
  }

  // Check if user is enrolled in a course
  async checkEnrollment(userId, courseId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    return {
      isEnrolled: !!enrollment,
      enrollment: enrollment || null
    };
  }

  // Get course statistics for instructor
  async getCourseEnrollmentStats(courseId, instructorId) {
    // Verify instructor owns the course
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new Error('Not authorized to view enrollment stats');
    }

    const [totalEnrollments, completedEnrollments, inProgressEnrollments] = await Promise.all([
      prisma.enrollment.count({ where: { courseId } }),
      prisma.enrollment.count({ where: { courseId, completionStatus: 'COMPLETED' } }),
      prisma.enrollment.count({ where: { courseId, completionStatus: 'IN_PROGRESS' } })
    ]);

    // Get recent enrollments
    const recentEnrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
      take: 10
    });

    // Calculate average progress
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { progressPercentage: true }
    });

    const averageProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollments.length
      : 0;

    return {
      totalEnrollments,
      completedEnrollments,
      inProgressEnrollments,
      averageProgress: Math.round(averageProgress),
      recentEnrollments
    };
  }
}

export default new EnrollmentService();