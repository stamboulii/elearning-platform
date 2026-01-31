// import prisma from '../config/database.js';

// class LessonService {
//   // Create lesson
//   async createLesson(sectionId, userId, data) {
//     const {
//       title,
//       contentType,
//       contentUrl,
//       content,
//       duration,
//       orderNumber,
//       isPreview,
//       resources
//     } = data;

//     // Verify ownership
//     const section = await prisma.courseSection.findUnique({
//       where: { id: sectionId },
//       include: {
//         course: true
//       }
//     });

//     if (!section) {
//       throw new Error('Section not found');
//     }

//     if (section.course.instructorId !== userId) {
//       throw new Error('Not authorized to add lessons to this section');
//     }

//     // Get the highest order number if not provided
//     let order = orderNumber;
//     if (!order) {
//       const lastLesson = await prisma.lesson.findFirst({
//         where: { sectionId },
//         orderBy: { orderNumber: 'desc' }
//       });
//       order = lastLesson ? lastLesson.orderNumber + 1 : 1;
//     }

//     return await prisma.lesson.create({
//       data: {
//         sectionId,
//         title,
//         contentType: contentType || 'VIDEO',
//         contentUrl,
//         content,
//         duration: duration ? parseInt(duration) : null,
//         orderNumber: order,
//         isPreview: isPreview || false,
//         resources: resources || null
//       }
//     });
//   }

//   // Get all lessons for a section
//   async getSectionLessons(sectionId) {
//     return await prisma.lesson.findMany({
//       where: { sectionId },
//       orderBy: { orderNumber: 'asc' }
//     });
//   }

//   // Get single lesson
//   async getLessonById(lessonId, userId = null) {
//     const lesson = await prisma.lesson.findUnique({
//       where: { id: lessonId },
//       include: {
//         section: {
//           include: {
//             course: {
//               select: {
//                 id: true,
//                 title: true,
//                 instructorId: true
//               }
//             }
//           }
//         },
//         quiz: {
//           include: {
//             questions: true
//           }
//         }
//       }
//     });

//     if (!lesson) {
//       throw new Error('Lesson not found');
//     }

//     // If user is provided, check if they have access
//     if (userId) {
//       const enrollment = await prisma.enrollment.findFirst({
//         where: {
//           userId,
//           courseId: lesson.section.course.id
//         }
//       });

//       // If not enrolled and not a preview lesson, deny access
//       if (!enrollment && !lesson.isPreview && lesson.section.course.instructorId !== userId) {
//         throw new Error('Not authorized to view this lesson');
//       }
//     }

//     return lesson;
//   }

//   // Update lesson
//   async updateLesson(lessonId, userId, data) {
//     const {
//       title,
//       contentType,
//       contentUrl,
//       content,
//       duration,
//       orderNumber,
//       isPreview,
//       resources
//     } = data;

//     // Verify ownership
//     const lesson = await prisma.lesson.findUnique({
//       where: { id: lessonId },
//       include: {
//         section: {
//           include: {
//             course: true
//           }
//         }
//       }
//     });

//     if (!lesson) {
//       throw new Error('Lesson not found');
//     }

//     if (lesson.section.course.instructorId !== userId) {
//       throw new Error('Not authorized to update this lesson');
//     }

//     return await prisma.lesson.update({
//       where: { id: lessonId },
//       data: {
//         title,
//         contentType,
//         contentUrl,
//         content,
//         duration: duration ? parseInt(duration) : undefined,
//         orderNumber,
//         isPreview,
//         resources
//       }
//     });
//   }

//   // Delete lesson
//   async deleteLesson(lessonId, userId) {
//     // Verify ownership
//     const lesson = await prisma.lesson.findUnique({
//       where: { id: lessonId },
//       include: {
//         section: {
//           include: {
//             course: true
//           }
//         }
//       }
//     });

//     if (!lesson) {
//       throw new Error('Lesson not found');
//     }

//     if (lesson.section.course.instructorId !== userId) {
//       throw new Error('Not authorized to delete this lesson');
//     }

//     return await prisma.lesson.delete({
//       where: { id: lessonId }
//     });
//   }

//   // Reorder lessons
//   async reorderLessons(sectionId, userId, lessonsOrder) {
//     // Verify ownership
//     const section = await prisma.courseSection.findUnique({
//       where: { id: sectionId },
//       include: {
//         course: true
//       }
//     });

//     if (!section) {
//       throw new Error('Section not found');
//     }

//     if (section.course.instructorId !== userId) {
//       throw new Error('Not authorized to reorder lessons');
//     }

//     // Update order for each lesson
//     const updatePromises = lessonsOrder.map((item) =>
//       prisma.lesson.update({
//         where: { id: item.lessonId },
//         data: { orderNumber: item.orderNumber }
//       })
//     );

//     await Promise.all(updatePromises);

//     return await this.getSectionLessons(sectionId);
//   }

//   // Get lesson with progress (for students)
//   async getLessonWithProgress(lessonId, userId) {
//     const lesson = await this.getLessonById(lessonId, userId);

//     // Get user's progress for this lesson
//     const enrollment = await prisma.enrollment.findFirst({
//       where: {
//         userId,
//         courseId: lesson.section.course.id
//       }
//     });

//     if (enrollment) {
//       const progress = await prisma.lessonProgress.findUnique({
//         where: {
//           enrollmentId_lessonId: {
//             enrollmentId: enrollment.id,
//             lessonId: lessonId
//           }
//         }
//       });

//       return {
//         ...lesson,
//         progress: progress || null
//       };
//     }

//     return {
//       ...lesson,
//       progress: null
//     };
//   }
// }

// export default new LessonService();

import prisma from '../config/database.js';

class LessonService {
  // Create lesson (unchanged)
  async createLesson(sectionId, userId, data) {
    const {
      title,
      contentType,
      contentUrl,
      content,
      duration,
      orderNumber,
      isPreview,
      resources
    } = data;

    // Verify ownership
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: {
        course: true
      }
    });

    if (!section) {
      throw new Error('Section not found');
    }

    if (section.course.instructorId !== userId) {
      throw new Error('Not authorized to add lessons to this section');
    }

    // Get the highest order number if not provided
    let order = orderNumber;
    if (!order) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { sectionId },
        orderBy: { orderNumber: 'desc' }
      });
      order = lastLesson ? lastLesson.orderNumber + 1 : 1;
    }

    return await prisma.lesson.create({
      data: {
        sectionId,
        title,
        contentType: contentType || 'VIDEO',
        contentUrl,
        content,
        duration: duration ? parseInt(duration) : null,
        orderNumber: order,
        isPreview: isPreview || false,
        resources: resources || null
      }
    });
  }

  // Get all lessons for a section
  async getSectionLessons(sectionId) {
    return await prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { orderNumber: 'asc' }
    });
  }

  // Get single lesson with access control - UPDATED
  async getLessonById(lessonId, userId = null) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                instructorId: true,
                isFree: true, // NEW
                price: true   // NEW
              }
            }
          }
        },
        quiz: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const course = lesson.section.course;
    let hasAccess = false;
    let accessReason = null;
    let enrollment = null;

    // Check access permissions
    if (userId) {
      // Check if user is the instructor
      if (course.instructorId === userId) {
        hasAccess = true;
        accessReason = 'instructor';
      } else {
        // Check enrollment
        enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: course.id
            }
          },
          include: {
            transaction: true
          }
        });

        if (enrollment) {
          // User is enrolled - check if course is free or paid
          if (course.isFree) {
            hasAccess = true;
            accessReason = 'enrolled_free';
          } else if (enrollment.isPaid) {
            hasAccess = true;
            accessReason = 'enrolled_paid';
          }
        }
      }
    }

    // Determine if lesson can be accessed
    const canAccess = lesson.isPreview || hasAccess;

    // NEW: If user doesn't have access and it's not a preview, hide sensitive content
    if (!canAccess) {
      return {
        id: lesson.id,
        title: lesson.title,
        contentType: lesson.contentType,
        duration: lesson.duration,
        orderNumber: lesson.orderNumber,
        isPreview: lesson.isPreview,
        section: {
          id: lesson.section.id,
          title: lesson.section.title,
          course: {
            id: course.id,
            title: course.title,
            isFree: course.isFree,
            price: course.price
          }
        },
        // NEW: Access control info
        isLocked: true,
        canAccess: false,
        accessReason: 'requires_enrollment',
        requiresPayment: !course.isFree
      };
    }

    // User has access - return full lesson
    return {
      ...lesson,
      isLocked: false,
      canAccess: true,
      accessReason,
      enrollment
    };
  }

  // Update lesson (unchanged)
  async updateLesson(lessonId, userId, data) {
    const {
      title,
      contentType,
      contentUrl,
      content,
      duration,
      orderNumber,
      isPreview,
      resources
    } = data;

    // Verify ownership
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

    if (lesson.section.course.instructorId !== userId) {
      throw new Error('Not authorized to update this lesson');
    }

    return await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        contentType,
        contentUrl,
        content,
        duration: duration ? parseInt(duration) : undefined,
        orderNumber,
        isPreview,
        resources
      }
    });
  }

  // Delete lesson (unchanged)
  async deleteLesson(lessonId, userId) {
    // Verify ownership
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

    if (lesson.section.course.instructorId !== userId) {
      throw new Error('Not authorized to delete this lesson');
    }

    return await prisma.lesson.delete({
      where: { id: lessonId }
    });
  }

  // Reorder lessons (unchanged)
  async reorderLessons(sectionId, userId, lessonsOrder) {
    // Verify ownership
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: {
        course: true
      }
    });

    if (!section) {
      throw new Error('Section not found');
    }

    if (section.course.instructorId !== userId) {
      throw new Error('Not authorized to reorder lessons');
    }

    // Update order for each lesson
    const updatePromises = lessonsOrder.map((item) =>
      prisma.lesson.update({
        where: { id: item.lessonId },
        data: { orderNumber: item.orderNumber }
      })
    );

    await Promise.all(updatePromises);

    return await this.getSectionLessons(sectionId);
  }

  // Get lesson with progress - UPDATED
  async getLessonWithProgress(lessonId, userId) {
    const lesson = await this.getLessonById(lessonId, userId);

    // If lesson is locked, don't return progress
    if (lesson.isLocked) {
      return lesson;
    }

    // Get user's progress for this lesson
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: lesson.section.course.id
      }
    });

    if (enrollment) {
      const progress = await prisma.lessonProgress.findUnique({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId: lessonId
          }
        }
      });

      return {
        ...lesson,
        progress: progress || null
      };
    }

    return {
      ...lesson,
      progress: null
    };
  }
}

export default new LessonService();