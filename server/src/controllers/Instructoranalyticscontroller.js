import prisma from '../config/database.js';


export const getInstructorCoursesWithAnalytics = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await prisma.course.findMany({
      where: {
        instructorId: instructorId,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            sections: true,
            reviews: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            enrolledAt: true,
            isPaid: true,
            paidAmount: true,
            transactionId: true,
            completionStatus: true,
            progressPercentage: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching instructor analytics:', error);
    res.status(500).json({ error: 'Failed to fetch instructor analytics' });
  }
};

// Get detailed revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const instructorId = req.user.id;

    // Get all courses with enrollments
    const courses = await prisma.course.findMany({
      where: {
        instructorId: instructorId,
      },
      include: {
        enrollments: {
          select: {
            isPaid: true,
            paidAmount: true,
            enrolledAt: true,
          },
        },
      },
    });

    // Calculate revenue metrics
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let paidEnrollments = 0;
    let pendingEnrollments = 0;

    courses.forEach((course) => {
      const coursePrice = parseFloat(course.price);
      
      course.enrollments.forEach((enrollment) => {
        if (enrollment.isPaid) {
          totalRevenue += parseFloat(enrollment.paidAmount || coursePrice);
          paidEnrollments++;
        } else {
          pendingRevenue += coursePrice;
          pendingEnrollments++;
        }
      });
    });

    // Get monthly revenue breakdown
    const monthlyRevenue = await getMonthlyRevenue(instructorId);

    res.json({
      totalRevenue,
      pendingRevenue,
      paidEnrollments,
      pendingEnrollments,
      totalEnrollments: paidEnrollments + pendingEnrollments,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
};

// Helper function to get monthly revenue
export const getMonthlyRevenue = async (instructorId) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: {
        instructorId: instructorId,
      },
      isPaid: true,
      enrolledAt: {
        gte: sixMonthsAgo,
      },
    },
    include: {
      course: {
        select: {
          price: true,
        },
      },
    },
    orderBy: {
      enrolledAt: 'asc',
    },
  });

  // Group by month
  const monthlyData = {};
  
  enrollments.forEach((enrollment) => {
    const date = new Date(enrollment.enrolledAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        revenue: 0,
        enrollments: 0,
      };
    }
    
    monthlyData[monthKey].revenue += parseFloat(
      enrollment.paidAmount || enrollment.course.price
    );
    monthlyData[monthKey].enrollments++;
  });

  return Object.values(monthlyData);
};

// Get enrollment statis²tics by course
export const getEnrollmentStatistics = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await prisma.course.findMany({
      where: {
        instructorId: instructorId,
      },
      select: {
        id: true,
        title: true,
        price: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
        enrollments: {
          select: {
            isPaid: true,
            paidAmount: true,
            enrolledAt: true,
          },
        },
      },
    });

    const statistics = courses.map((course) => {
      const paidEnrollments = course.enrollments.filter((e) => e.isPaid);
      const pendingEnrollments = course.enrollments.filter((e) => !e.isPaid);
      
      const revenue = paidEnrollments.reduce(
        (sum, e) => sum + parseFloat(e.paidAmount || course.price),
        0
      );
      
      const pendingRevenue = pendingEnrollments.length * parseFloat(course.price);

      return {
        courseId: course.id,
        courseTitle: course.title,
        price: course.price,
        totalEnrollments: course._count.enrollments,
        paidEnrollments: paidEnrollments.length,
        pendingEnrollments: pendingEnrollments.length,
        revenue: revenue,
        pendingRevenue: pendingRevenue,
      };
    });

    res.json(statistics);
  } catch (error) {
    console.error('Error fetching enrollment statistics:', error);
    res.status(500).json({ error: 'Failed to fetch enrollment statistics' });
  }
};

// Get pending payment details
export const getPendingPayments = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const pendingEnrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          instructorId: instructorId,
        },
        isPaid: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    const pendingPaymentsData = pendingEnrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      studentName: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
      studentEmail: enrollment.user.email,
      courseTitle: enrollment.course.title,
      expectedAmount: enrollment.course.price,
      enrolledAt: enrollment.enrolledAt,
      daysPending: Math.floor(
        (new Date() - new Date(enrollment.enrolledAt)) / (1000 * 60 * 60 * 24)
      ),
    }));

    res.json({
      totalPending: pendingPaymentsData.length,
      totalPendingRevenue: pendingPaymentsData.reduce(
        (sum, p) => sum + parseFloat(p.expectedAmount),
        0
      ),
      pendingPayments: pendingPaymentsData,
    });
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
};

// Get top performing courses
export const getTopPerformingCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    const courses = await prisma.course.findMany({
      where: {
        instructorId: instructorId,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
        enrollments: {
          where: {
            isPaid: true,
          },
          select: {
            paidAmount: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    const performanceData = courses.map((course) => {
      const revenue = course.enrollments.reduce(
        (sum, e) => sum + parseFloat(e.paidAmount || course.price),
        0
      );
      
      const avgRating =
        course.reviews.length > 0
          ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
          : 0;

      return {
        courseId: course.id,
        title: course.title,
        enrollments: course._count.enrollments,
        paidEnrollments: course.enrollments.length,
        revenue: revenue,
        averageRating: avgRating,
        reviewCount: course._count.reviews,
      };
    });

    // Sort by revenue and limit
    performanceData.sort((a, b) => b.revenue - a.revenue);
    const topCourses = performanceData.slice(0, limit);

    res.json(topCourses);
  } catch (error) {
    console.error('Error fetching top performing courses:', error);
    res.status(500).json({ error: 'Failed to fetch top performing courses' });
  }
};


