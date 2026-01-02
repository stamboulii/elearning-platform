import prisma from '../config/database.js';

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

    return await prisma.course.create({
      data: {
        instructorId,
        categoryId,
        title,
        slug,
        shortDescription,
        fullDescription,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
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
  }

  // Get all courses with filters and pagination
  async getAllCourses(filters) {
    const {
      category,
      level,
      search,
      status = 'PUBLISHED',
      page = 1,
      limit = 10
    } = filters;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { status };

    if (category) where.categoryId = category;
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get courses and total count
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.course.count({ where })
    ]);

    // Calculate ratings
    const coursesWithRatings = await Promise.all(
      courses.map(async (course) => {
        const avgRating = await prisma.review.aggregate({
          where: { courseId: course.id },
          _avg: { rating: true }
        });

        return {
          ...course,
          averageRating: avgRating._avg.rating || 0,
          totalEnrollments: course._count.enrollments,
          totalReviews: course._count.reviews
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

  // Get course by ID
  async getCourseById(id) {
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
              orderBy: { orderNumber: 'asc' }
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

    return {
      ...course,
      averageRating: avgRating._avg.rating || 0,
      totalEnrollments: course._count.enrollments,
      totalReviews: course._count.reviews
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
      level,
      language,
      status,
      estimatedDuration
    } = data;

    return await prisma.course.update({
      where: { id },
      data: {
        categoryId,
        title,
        slug,
        shortDescription,
        fullDescription,
        thumbnailImage,
        previewVideo,
        price: price ? parseFloat(price) : undefined,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
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
  }

  // Delete course
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

  // Add course requirement
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

  // Add course outcome
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
}

export default new CourseService();