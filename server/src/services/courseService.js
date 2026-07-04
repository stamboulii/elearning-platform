

import prisma from '../config/database.js';
import { createNotification } from './notificationService.js';

class CourseService {
  // Create course
  async createCourse(instructorId, data) {
    const {
      categoryId,
      title,
      slug,
      shortDescription,
      fullDescription,
      price,
      discountPrice,
      isFree, // NEW
      level,
      language,
      estimatedDuration
    } = data;

    // Check if slug exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    });

    if (existingCourse) {
      throw new Error('Course with this slug already exists');
    }

    // Validate pricing logic
    const coursePrice = parseFloat(price) || 0;
    const isFreeCourse = isFree === true || coursePrice === 0;

    const course = await prisma.course.create({
      data: {
        instructorId,
        categoryId,
        title,
        slug,
        shortDescription,
        fullDescription,
        thumbnailImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
        price: coursePrice,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        isFree: isFreeCourse,
        level: level || 'BEGINNER',
        language: language || 'en',
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        status: 'DRAFT'
      },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true
          }
        }
      }
    });

    return course;
  }

  // Get all courses with filters and pagination
  async getAllCourses(filters) {
    const {
      category,
      level,
      search,
      status = 'PUBLISHED',
      isFree, // NEW: Filter by free/paid
      sortBy,
      page = 1,
      limit = 10
    } = filters;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    const statusToUse = (status && status.trim() !== '') ? status : 'PUBLISHED';
    where.status = statusToUse;

    if (category && category.trim() !== '') where.categoryId = category;
    if (level && level.trim() !== '') where.level = level;

    // NEW: Filter by free/paid courses
    if (isFree !== undefined) {
      where.isFree = isFree === 'true' || isFree === true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy
    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
    else if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sortBy === 'price-low') orderBy = { price: 'asc' };
    else if (sortBy === 'price-high') orderBy = { price: 'desc' };

    // Get courses and total count
    const queryOptions = {
      where,
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      }
    };

    if (sortBy === 'popular') {
      queryOptions.orderBy = undefined;
      queryOptions.skip = 0;
      queryOptions.take = undefined;
    } else {
      queryOptions.orderBy = orderBy;
      queryOptions.skip = skip;
      queryOptions.take = parseInt(limit);
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany(queryOptions),
      prisma.course.count({ where })
    ]);

    // Sort by popularity client-side when sortBy is popular
    const sortedCourses = sortBy === 'popular'
      ? courses.sort((a, b) => (b._count.enrollments || 0) - (a._count.enrollments || 0))
      : courses;

    // Apply pagination after sorting for popularity
    const paginatedCourses = sortBy === 'popular'
      ? sortedCourses.slice(skip, skip + parseInt(limit))
      : sortedCourses;

    // Calculate ratings and add pricing info
    const coursesWithRatings = await Promise.all(
      paginatedCourses.map(async (course) => {
        const avgRating = await prisma.review.aggregate({
          where: { courseId: course.id },
          _avg: { rating: true }
        });

        // NEW: Calculate effective price
        const effectivePrice = course.discountPrice || course.price;

        return {
          ...course,
          averageRating: avgRating._avg.rating || 0,
          totalEnrollments: course._count.enrollments,
          totalReviews: course._count.reviews,
          effectivePrice, // NEW
          hasDiscount: !!course.discountPrice // NEW
        };
      })
    );

    return {
      courses: coursesWithRatings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  // Get course by ID with access info
  async getCourseById(id, userId = null) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
            bio: true
          }
        },
        sections: {
          include: {
            lessons: {
              orderBy: { orderNumber: 'asc' },
              select: {
                id: true,
                title: true,
                contentType: true,
                duration: true,
                orderNumber: true,
                isPreview: true,
                createdAt: true
              }
            }
          },
          orderBy: { orderNumber: 'asc' }
        },
        requirements: true,
        outcomes: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true
              }
            }
          },
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { courseId: course.id },
      _avg: { rating: true }
    });

    // NEW: Check user enrollment and payment status
    let userEnrollment = null;
    let hasAccess = false;

    if (userId) {
      userEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: id
          }
        },
        include: {
          transaction: true
        }
      });

      // User has access if:
      // 1. User is the instructor
      // 2. Course is free (anyone can access)
      // 3. User is enrolled in a free course
      // 4. User is enrolled and paid in a paid course
      hasAccess =
        course.instructorId === userId ||
        course.isFree ||
        (userEnrollment && (course.isFree || userEnrollment.isPaid));
    }

    // NEW: Calculate effective price
    const effectivePrice = course.discountPrice || course.price;
    const discountPercentage = course.discountPrice
      ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
      : 0;

    // NEW: Mark lessons as locked/unlocked
    const sectionsWithAccess = course.sections.map(section => ({
      ...section,
      lessons: section.lessons.map(lesson => ({
        ...lesson,
        isLocked: !lesson.isPreview && !hasAccess,
        canAccess: lesson.isPreview || hasAccess
      }))
    }));

    const instructorStats = await prisma.enrollment.aggregate({
      where: {
        course: { instructorId: course.instructorId }
      },
      _count: { id: true }
    });

    const instructorReviewCount = await prisma.review.aggregate({
      where: {
        course: { instructorId: course.instructorId }
      },
      _count: { id: true }
    });

    return {
      ...course,
      sections: sectionsWithAccess,
      averageRating: avgRating._avg.rating || 0,
      totalEnrollments: course._count.enrollments,
      totalReviews: course._count.reviews,
      // NEW: Pricing and access info
      effectivePrice,
      hasDiscount: !!course.discountPrice,
      discountPercentage,
      userEnrollment,
      hasAccess,
      requiresPayment: !course.isFree && parseFloat(course.price) > 0,
      totalStudents: instructorStats._count.id,
      totalReviews: instructorReviewCount._count.id
    };
  }

  // Update course
  async updateCourse(id, userId, userRole, data) {
    // Check ownership
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      throw new Error('Course not found');
    }

    if (existingCourse.instructorId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to update this course');
    }

    const {
      categoryId,
      title,
      slug,
      shortDescription,
      fullDescription,
      thumbnailImage,
      previewVideo,
      price,
      discountPrice,
      isFree, // NEW
      level,
      language,
      status,
      estimatedDuration
    } = data;

    // NEW: Validate pricing logic
    const coursePrice = price !== undefined ? parseFloat(price) : undefined;
    const isFreeCourse = isFree !== undefined
      ? isFree === true || (coursePrice !== undefined && coursePrice === 0)
      : undefined;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        categoryId,
        title,
        slug,
        shortDescription,
        fullDescription,
        thumbnailImage,
        previewVideo,
        price: coursePrice,
        discountPrice: discountPrice !== undefined
          ? (discountPrice ? parseFloat(discountPrice) : null)
          : undefined,
        isFree: isFreeCourse,
        level,
        language,
        status,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        publishedAt: status === 'PUBLISHED' && !existingCourse.publishedAt ? new Date() : undefined
      },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Notify all students when a course is published for the first time
    const isBeingPublished = status === 'PUBLISHED' && existingCourse.status !== 'PUBLISHED';
    if (isBeingPublished) {
      (async () => {
        const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } });
        students.forEach(({ id: studentId }) => {
          createNotification({
            userId: studentId,
            type: 'COURSE_PUBLISHED',
            title: 'New Course Available',
            message: `A new course "${updatedCourse.title}" is now available!`,
            data: { courseId: updatedCourse.id, title: updatedCourse.title }
          }).catch(() => { });
        });
      })();
    }

    return updatedCourse;
  }

  // Delete course (unchanged)
  async deleteCourse(id, userId, userRole) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: true
      }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized to delete this course');
    }

    if (course.enrollments.length > 0) {
      throw new Error('Cannot delete course with active enrollments');
    }

    return await prisma.course.delete({
      where: { id }
    });
  }

  // Get instructor courses
  async getInstructorCourses(instructorId) {
    return await prisma.course.findMany({
      where: { instructorId },
      include: {
        category: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
            sections: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Add course requirement (unchanged)
  async addRequirement(courseId, userId, requirement) {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course || course.instructorId !== userId) {
      throw new Error('Not authorized');
    }

    return await prisma.courseRequirement.create({
      data: {
        courseId,
        requirement
      }
    });
  }

  // Add course outcome (unchanged)
  async addOutcome(courseId, userId, outcome) {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course || course.instructorId !== userId) {
      throw new Error('Not authorized');
    }

    return await prisma.courseOutcome.create({
      data: {
        courseId,
        outcome
      }
    });
  }

  // Archive course
  async archiveCourse(id, userId, userRole) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: true
      }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized');
    }

    // Can archive any course (published or draft)
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        status: 'ARCHIVED'
      },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return updatedCourse;
  }
}

export default new CourseService();