import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class AdminService {
  async getAllUsers({ search, role, status, page = 1, limit = 20 }) {
    const where = {
      ...(role && { role }),
      ...(status && { isActive: status === 'active' }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          profilePicture: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getUserById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id, data) {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  async deleteUser(id) {
    return prisma.user.delete({ where: { id } });
  }

  async toggleUserStatus(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    return prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    });
  }
  async getDashboardStats(period = '30d') {
    const periodDays = parseInt(period) || 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - periodDays);

    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      newUsers,
      newEnrollments,
      newRevenue,
      pendingReviews,
      pendingCourses
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.user.count({
        where: { createdAt: { gte: sinceDate } }
      }),
      prisma.enrollment.count({
        where: { enrolledAt: { gte: sinceDate } }
      }),
      prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: sinceDate }
        },
        _sum: { amount: true }
      }),
      prisma.review.count({
        where: { isApproved: false }
      }),
      prisma.course.count({
        where: { status: 'DRAFT' } // Assuming DRAFT or a PENDING status
      })
    ]);

    // Get simple growth trends (last 6 months)
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0),
        name: d.toLocaleString('default', { month: 'short' })
      };
    }).reverse();

    const revenueTrends = await Promise.all(months.map(async (m) => {
      const sum = await prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: m.start, lte: m.end }
        },
        _sum: { amount: true }
      });
      return {
        name: m.name,
        revenue: Number(sum._sum.amount || 0)
      };
    }));

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      newUsers,
      newEnrollments,
      newRevenue: Number(newRevenue._sum.amount || 0),
      pendingReviews,
      pendingCourses,
      trends: revenueTrends
    };
  }

  // async getAllCourses({ search, status, category, page = 1, limit = 20 }) {
  //   const where = {};
    
  //   if (status && status.trim() !== '') {
  //     where.status = status;
  //   }
    
  //   if (category && category.trim() !== '') {
  //     where.categoryId = category;
  //   }

  //   if (search && search.trim() !== '') {
  //     where.OR = [
  //       { title: { contains: search, mode: 'insensitive' } },
  //       { shortDescription: { contains: search, mode: 'insensitive' } }
  //     ];
  //   }

  //   const skip = (page - 1) * limit;

  //   const [courses, total] = await Promise.all([
  //     prisma.course.findMany({
  //       where,
  //       skip,
  //       take: Number(limit),
  //       orderBy: { createdAt: 'desc' },
  //       include: {
  //         instructor: {
  //           select: {
  //             id: true,
  //             firstName: true,
  //             lastName: true,
  //             profilePicture: true
  //           }
  //         },
  //         category: {
  //           select: {
  //             id: true,
  //             name: true
  //           }
  //         },
  //         _count: {
  //           select: {
  //             enrollments: true,
  //             sections: true,
  //             reviews: true
  //           }
  //         }
  //       }
  //     }),
  //     prisma.course.count({ where })
  //   ]);

  //   return {
  //     courses,
  //     totalPages: Math.ceil(total / limit)
  //   };
  // }

  async getAllCourses({ search, status, category, page = 1, limit = 20 }) {
  const where = {};
  
  // Only add status to where clause if it's a non-empty string
  if (status && status.trim() !== '') {
    where.status = status;
  }
  
  // Only add category to where clause if it's a non-empty string
  if (category && category.trim() !== '') {
    where.categoryId = category;
  }

  // Only add search conditions if search is a non-empty string
  if (search && search.trim() !== '') {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            sections: true,
            reviews: true
          }
        }
      }
    }),
    prisma.course.count({ where })
  ]);

  return {
    courses,
    totalPages: Math.ceil(total / limit)
  };
}

  async approveCourse(id) {
    return prisma.course.update({
      where: { id },
      data: { 
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });
  }

  async rejectCourse(id, reason) {
    // For now, rejection just sets it back to DRAFT or we could add an ARCHIVED status
    // Or even a REJECTED status if we update the schema.
    // Based on the current schema, let's use ARCHIVED or keep as DRAFT but maybe add a note?
    // Let's use ARCHIVED for now as a way to "reject" from current queue.
    return prisma.course.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });
  }
}

export default new AdminService();
