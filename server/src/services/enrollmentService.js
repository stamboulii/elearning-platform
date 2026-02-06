// import prisma from '../config/database.js';

// class EnrollmentService {
//   // Enroll in a course
//   async enrollInCourse(userId, courseId) {
//     // Check if course exists and is published
//     const course = await prisma.course.findUnique({
//       where: { id: courseId }
//     });

//     if (!course) {
//       throw new Error('Course not found');
//     }

//     if (course.status !== 'PUBLISHED') {
//       throw new Error('Course is not available for enrollment');
//     }

//     // Check if already enrolled
//     const existingEnrollment = await prisma.enrollment.findUnique({
//       where: {
//         userId_courseId: {
//           userId,
//           courseId
//         }
//       }
//     });

//     if (existingEnrollment) {
//       throw new Error('Already enrolled in this course');
//     }

//     // Check if user is the instructor
//     if (course.instructorId === userId) {
//       throw new Error('Instructors cannot enroll in their own courses');
//     }

//     // Create enrollment
//     return await prisma.enrollment.create({
//       data: {
//         userId,
//         courseId,
//         enrolledAt: new Date()
//       },
//       include: {
//         course: {
//           include: {
//             instructor: {
//               select: {
//                 id: true,
//                 firstName: true,
//                 lastName: true,
//                 profilePicture: true
//               }
//             },
//             category: true
//           }
//         }
//       }
//     });
//   }

//   // Get user's enrolled courses
//   async getUserEnrollments(userId, filters = {}) {
//     const { status, page = 1, limit = 10 } = filters;
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const where = { userId };

//     if (status) {
//       where.completionStatus = status;
//     }

//     const [enrollments, total] = await Promise.all([
//       prisma.enrollment.findMany({
//         where,
//         include: {
//           course: {
//             include: {
//               instructor: {
//                 select: {
//                   id: true,
//                   firstName: true,
//                   lastName: true,
//                   profilePicture: true
//                 }
//               },
//               category: true,
//               _count: {
//                 select: {
//                   sections: true
//                 }
//               }
//             }
//           }
//         },
//         orderBy: { enrolledAt: 'desc' },
//         skip,
//         take: parseInt(limit)
//       }),
//       prisma.enrollment.count({ where })
//     ]);

//     return {
//       enrollments,
//       total,
//       page: parseInt(page),
//       totalPages: Math.ceil(total / parseInt(limit))
//     };
//   }

//   // Get single enrollment with detailed progress
//   async getEnrollmentDetails(enrollmentId, userId) {
//     const enrollment = await prisma.enrollment.findUnique({
//       where: { id: enrollmentId },
//       include: {
//         course: {
//           include: {
//             sections: {
//               include: {
//                 lessons: {
//                   orderBy: { orderNumber: 'asc' }
//                 }
//               },
//               orderBy: { orderNumber: 'asc' }
//             },
//             instructor: {
//               select: {
//                 id: true,
//                 firstName: true,
//                 lastName: true,
//                 profilePicture: true,
//                 bio: true
//               }
//             }
//           }
//         },
//         lessonProgress: {
//           include: {
//             lesson: true
//           }
//         }
//       }
//     });

//     if (!enrollment) {
//       throw new Error('Enrollment not found');
//     }

//     if (enrollment.userId !== userId) {
//       throw new Error('Not authorized to view this enrollment');
//     }

//     return enrollment;
//   }

//   // Check if user is enrolled in a course
//   async checkEnrollment(userId, courseId) {
//     const enrollment = await prisma.enrollment.findUnique({
//       where: {
//         userId_courseId: {
//           userId,
//           courseId
//         }
//       }
//     });

//     return {
//       isEnrolled: !!enrollment,
//       enrollment: enrollment || null
//     };
//   }

//   // Get course statistics for instructor
//   async getCourseEnrollmentStats(courseId, instructorId) {
//     // Verify instructor owns the course
//     const course = await prisma.course.findUnique({
//       where: { id: courseId }
//     });

//     if (!course) {
//       throw new Error('Course not found');
//     }

//     if (course.instructorId !== instructorId) {
//       throw new Error('Not authorized to view enrollment stats');
//     }

//     const [totalEnrollments, completedEnrollments, inProgressEnrollments] = await Promise.all([
//       prisma.enrollment.count({ where: { courseId } }),
//       prisma.enrollment.count({ where: { courseId, completionStatus: 'COMPLETED' } }),
//       prisma.enrollment.count({ where: { courseId, completionStatus: 'IN_PROGRESS' } })
//     ]);

//     // Get recent enrollments
//     const recentEnrollments = await prisma.enrollment.findMany({
//       where: { courseId },
//       include: {
//         user: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             email: true,
//             profilePicture: true
//           }
//         }
//       },
//       orderBy: { enrolledAt: 'desc' },
//       take: 10
//     });

//     // Calculate average progress
//     const enrollments = await prisma.enrollment.findMany({
//       where: { courseId },
//       select: { progressPercentage: true }
//     });

//     const averageProgress = enrollments.length > 0
//       ? enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollments.length
//       : 0;

//     return {
//       totalEnrollments,
//       completedEnrollments,
//       inProgressEnrollments,
//       averageProgress: Math.round(averageProgress),
//       recentEnrollments
//     };
//   }
// }

// export default new EnrollmentService();



import prisma from '../config/database.js';

class EnrollmentService {
  // Enroll in a course - UPDATED
  async enrollInCourse(userId, courseId, transactionId = null) {
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

    // NEW: Handle free vs paid enrollment
    const isPaidCourse = !course.isFree && parseFloat(course.price) > 0;
    
    // If it's a paid course and no transaction is provided, throw error
    if (isPaidCourse && !transactionId) {
      throw new Error('Payment required for this course');
    }

    // NEW: Verify transaction if provided
    let transaction = null;
    if (transactionId) {
      transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.userId !== userId || transaction.courseId !== courseId) {
        throw new Error('Transaction does not match user or course');
      }

      if (transaction.status !== 'COMPLETED') {
        throw new Error('Payment not completed');
      }
    }

    // Create enrollment
    const enrollmentData = {
      userId,
      courseId,
      enrolledAt: new Date(),
      isPaid: !isPaidCourse || !!transaction, // Free courses are automatically "paid"
      paidAmount: transaction ? transaction.amount : (course.isFree ? 0 : null),
      transactionId: transactionId || null
    };

    return await prisma.enrollment.create({
      data: enrollmentData,
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
        },
        transaction: true
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
          },
          transaction: true, // NEW: Include transaction info
          certificate: true  // NEW: Include certificate info
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
        },
        transaction: true, // NEW: Include transaction
        certificate: true  // NEW: Include certificate info
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

  // Check if user is enrolled in a course - UPDATED
  async checkEnrollment(userId, courseId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      include: {
        course: {
          select: {
            isFree: true,
            price: true
          }
        },
        transaction: true
      }
    });

    // NEW: Calculate access status
    const hasAccess = enrollment 
      ? (enrollment.course.isFree || enrollment.isPaid)
      : false;

    return {
      isEnrolled: !!enrollment,
      hasAccess, // NEW
      isPaid: enrollment?.isPaid || false, // NEW
      enrollment: enrollment || null
    };
  }

  // Get course statistics for instructor (unchanged)
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

    const [
      totalEnrollments, 
      completedEnrollments, 
      inProgressEnrollments,
      paidEnrollments // NEW
    ] = await Promise.all([
      prisma.enrollment.count({ where: { courseId } }),
      prisma.enrollment.count({ where: { courseId, completionStatus: 'COMPLETED' } }),
      prisma.enrollment.count({ where: { courseId, completionStatus: 'IN_PROGRESS' } }),
      prisma.enrollment.count({ where: { courseId, isPaid: true } }) // NEW
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
        },
        transaction: true // NEW
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

    // NEW: Calculate revenue
    const revenue = await prisma.enrollment.aggregate({
      where: { courseId, isPaid: true },
      _sum: { paidAmount: true }
    });

    return {
      totalEnrollments,
      completedEnrollments,
      inProgressEnrollments,
      paidEnrollments, // NEW
      averageProgress: Math.round(averageProgress),
      totalRevenue: revenue._sum.paidAmount || 0, // NEW
      recentEnrollments
    };
  }

  // Get all enrollments for a course (Instructor/Admin only) - NEW
  async getCourseEnrollments(courseId, userId) {
    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Verify instructor owns the course OR user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (course.instructorId !== userId && currentUser.role !== 'ADMIN') {
      throw new Error('Not authorized to view enrollments for this course');
    }

    // Get all enrollments with student details
    const enrollments = await prisma.enrollment.findMany({
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
        },
        transaction: true
      },
      orderBy: { enrolledAt: 'desc' }
    });

    return enrollments;
  }
}

export default new EnrollmentService();