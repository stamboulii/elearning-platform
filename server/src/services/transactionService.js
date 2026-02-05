// services/adminTransactionService.js
import { PrismaClient } from '@prisma/client';
import stripeService from './stripeService.js';

const prisma = new PrismaClient();

class AdminTransactionService {
  /**
   * Get all transactions with filters and pagination
   */
  async getAllTransactions(filters, pagination) {
    const { status, paymentMethod, search, startDate, endDate } = filters;
    const { page = 1, limit = 10 } = pagination;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (search) {
      where.OR = [
        { transactionReference: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { course: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get transactions
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              thumbnailImage: true,
              instructor: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          enrollment: {
            select: {
              id: true,
              isPaid: true,
              progressPercentage: true,
              completionStatus: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    };
  }

  /**
   * Get transaction statistics
   */
  async getStatistics() {
    const [
      totalRevenue,
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      refundedTransactions,
    ] = await Promise.all([
      // Total revenue from completed transactions
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      // Total transactions count
      prisma.transaction.count(),
      // Completed transactions count
      prisma.transaction.count({
        where: { status: 'COMPLETED' },
      }),
      // Pending transactions count
      prisma.transaction.count({
        where: { status: 'PENDING' },
      }),
      // Failed transactions count
      prisma.transaction.count({
        where: { status: 'FAILED' },
      }),
      // Refunded transactions count
      prisma.transaction.count({
        where: { status: 'REFUNDED' },
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      refundedTransactions,
    };
  }

  /**
   * Get single transaction details
   */
  async getTransactionById(transactionId) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            thumbnailImage: true,
            price: true,
            discountPrice: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        enrollment: {
          select: {
            id: true,
            isPaid: true,
            progressPercentage: true,
            completionStatus: true,
            enrolledAt: true,
            completedAt: true,
          },
        },
        couponUsage: {
          include: {
            coupon: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }

  /**
   * Approve offline payment
   */
  async approveOfflinePayment(transactionId) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        enrollment: true,
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'PENDING') {
      throw new Error('Only pending transactions can be approved');
    }

    if (transaction.paymentMethod !== 'offline') {
      throw new Error('Only offline payments can be manually approved');
    }

    // Update transaction and enrollment
    await prisma.$transaction(async (tx) => {
      // Update transaction status
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Update enrollment if exists
      if (transaction.enrollment) {
        await tx.enrollment.update({
          where: { id: transaction.enrollment.id },
          data: {
            isPaid: true,
          },
        });
      }

      // Award XP to user
      const xpPerCourse = 50;
      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          xp: { increment: xpPerCourse },
        },
      });
    });

    return await this.getTransactionById(transactionId);
  }

  /**
   * Process refund
   */
  async refundTransaction(transactionId) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        enrollment: true,
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'COMPLETED') {
      throw new Error('Only completed transactions can be refunded');
    }

    // If it's a Stripe payment, process refund through Stripe
    if (transaction.paymentGateway === 'stripe') {
      // Note: You'll need to store the Stripe payment intent ID
      // For now, we'll just update the database
      // In production, you should:
      // const paymentIntent = await stripeService.getPaymentIntent(transaction.stripePaymentIntentId);
      // await stripeService.createRefund(paymentIntent.id, transaction.amount);
    }

    // Update transaction and enrollment
    await prisma.$transaction(async (tx) => {
      // Update transaction status
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'REFUNDED',
        },
      });

      // Update enrollment if exists
      if (transaction.enrollment) {
        await tx.enrollment.delete({
          where: { id: transaction.enrollment.id },
        });
      }

      // Deduct XP from user
      const xpPerCourse = 50;
      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          xp: { decrement: xpPerCourse },
        },
      });
    });

    return await this.getTransactionById(transactionId);
  }

  /**
   * Export transactions to CSV
   */
  async exportTransactions(filters) {
    const { status, paymentMethod, startDate, endDate } = filters;

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    // Convert to CSV format
    const headers = [
      'Transaction Reference',
      'User Email',
      'User Name',
      'Course Title',
      'Amount',
      'Currency',
      'Payment Method',
      'Payment Gateway',
      'Status',
      'Created At',
      'Completed At',
    ];

    const rows = transactions.map((t) => [
      t.transactionReference,
      t.user?.email || '',
      `${t.user?.firstName || ''} ${t.user?.lastName || ''}`,
      t.course?.title || '',
      t.amount,
      t.currency,
      t.paymentMethod,
      t.paymentGateway,
      t.status,
      t.createdAt.toISOString(),
      t.completedAt ? t.completedAt.toISOString() : '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(period = '30days') {
    const now = new Date();
    let startDate;

    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const revenueByDate = {};
    transactions.forEach((t) => {
      const date = t.createdAt.toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      revenueByDate[date] += parseFloat(t.amount);
    });

    return Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }
}

export default new AdminTransactionService();