// controllers/checkoutController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import stripeService from '../services/stripeService.js';

import { v4 as uuidv4 } from 'uuid';

  /**
   * Process checkout and create Stripe session
   */
  export const processCheckout = async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        cartItems, 
        appliedCoupon,
        paymentMethod = 'stripe'
      } = req.body;

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      const courseIds = cartItems.map(item => item.courseId);
      const courses = await prisma.course.findMany({
        where: {
          id: { in: courseIds },
          status: 'PUBLISHED'
        },
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (courses.length !== cartItems.length) {
        return res.status(400).json({
          success: false,
          message: 'Some courses are no longer available'
        });
      }

      // Check if user already enrolled in any course
      const existingEnrollments = await prisma.enrollment.findMany({
        where: {
          userId: userId,
          courseId: { in: courseIds }
        }
      });

      if (existingEnrollments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You are already enrolled in some of these courses'
        });
      }

      // Calculate totals
      let subtotal = 0;
      const enrichedCartItems = cartItems.map(item => {
        const course = courses.find(c => c.id === item.courseId);
        const currentPrice = course.discountPrice || course.price;
        subtotal += parseFloat(currentPrice);
        
        return {
          ...item,
          course,
          currentPrice
        };
      });

      let couponDiscount = 0;
      let validCoupon = null;

      // Apply coupon if provided
      if (appliedCoupon && appliedCoupon.code) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: appliedCoupon.code }
        });

        if (coupon && coupon.isActive) {
          const now = new Date();
          
          // Validate coupon
          if (now >= new Date(coupon.validFrom) && now <= new Date(coupon.validUntil)) {
            // Check usage limit
            if (!coupon.usageLimit || coupon.timesUsed < coupon.usageLimit) {
              // Calculate discount
              if (coupon.discountType === 'PERCENTAGE') {
                couponDiscount = (subtotal * parseFloat(coupon.discountValue)) / 100;
              } else {
                couponDiscount = parseFloat(coupon.discountValue);
              }

              // Ensure discount doesn't exceed subtotal
              if (couponDiscount > subtotal) {
                couponDiscount = subtotal;
              }

              validCoupon = coupon;
            }
          }
        }
      }

      const total = subtotal - couponDiscount;

      // Handle offline payment (cash on delivery equivalent)
      if (paymentMethod === 'offline') {
        // Create transactions and enrollments directly
        const result = await this.createOfflineOrder(
          userId,
          enrichedCartItems,
          total,
          validCoupon
        );

        return res.status(200).json({
          success: true,
          message: 'Order placed successfully',
          data: result
        });
      }

      // Handle online payment (Stripe)
      if (paymentMethod === 'stripe') {
        // Create pending transactions
        const transactions = [];
        
        for (const item of enrichedCartItems) {
          const transactionRef = `TXN-${Date.now()}-${uuidv4().slice(0, 8)}`;
          
          const transaction = await prisma.transaction.create({
            data: {
              userId: userId,
              courseId: item.courseId,
              amount: parseFloat(item.currentPrice),
              currency: 'USD',
              paymentMethod: 'card',
              paymentGateway: 'stripe',
              transactionReference: transactionRef,
              status: 'PENDING'
            }
          });

          transactions.push(transaction);
        }

        // Store transaction IDs for later use
        const mainTransactionId = transactions[0].id;

        // If coupon was used, create coupon usage record (will be completed after payment)
        let couponUsageId = null;
        if (validCoupon) {
          // Temporarily store coupon info in session or cache
          // We'll link it to transaction after successful payment
        }

        // Get user details
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        // Create Stripe checkout session
        const stripeSession = await stripeService.createCheckoutSession(
          mainTransactionId,
          user,
          enrichedCartItems,
          total
        );

        return res.status(200).json({
          success: true,
          message: 'Checkout session created',
          data: {
            sessionId: stripeSession.id,
            sessionUrl: stripeSession.url,
            transactionId: mainTransactionId,
            amount: total
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });

    } catch (error) {
      console.error('Checkout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process checkout',
        error: error.message
      });
    }
  }

  /**
   * Create offline order (no payment gateway)
   */
   export const  createOfflineOrder = async (userId, cartItems, total, coupon) => {
    const transactions = [];
    const enrollments = [];

    try {
      // Use transaction for atomicity
      await prisma.$transaction(async (tx) => {
        for (const item of cartItems) {
          const transactionRef = `TXN-OFFLINE-${Date.now()}-${uuidv4().slice(0, 8)}`;
          
          // Create transaction
          const transaction = await tx.transaction.create({
            data: {
              userId: userId,
              courseId: item.courseId,
              amount: parseFloat(item.currentPrice),
              currency: 'USD',
              paymentMethod: 'offline',
              paymentGateway: 'manual',
              transactionReference: transactionRef,
              status: 'PENDING', // Admin will confirm later
              completedAt: new Date()
            }
          });

          transactions.push(transaction);

          // Create enrollment (unpaid, will be activated after admin confirms)
          const enrollment = await tx.enrollment.create({
            data: {
              userId: userId,
              courseId: item.courseId,
              isPaid: false,
              transactionId: transaction.id,
              paidAmount: parseFloat(item.currentPrice)
            }
          });

          enrollments.push(enrollment);
        }

        // If coupon was used, record it
        if (coupon && transactions.length > 0) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: {
              timesUsed: { increment: 1 }
            }
          });

          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId: userId,
              transactionId: transactions[0].id
            }
          });
        }

        // Clear cart
        await tx.cartItem.deleteMany({
          where: {
            userId: userId,
            courseId: { in: cartItems.map(item => item.courseId) }
          }
        });
      });

      return {
        transactions,
        enrollments,
        message: 'Order placed successfully. Pending admin confirmation.'
      };

    } catch (error) {
      console.error('Error creating offline order:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment callback from Stripe
   */
    export const handlePaymentSuccess = async (req, res) => {
    try {
      const { session_id, transaction_id } = req.query;

      if (!session_id || !transaction_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing session or transaction ID'
        });
      }

      // Verify Stripe session
      const session = await stripeService.verifySession(session_id);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Payment not completed'
        });
      }

      // Get the main transaction
      const mainTransaction = await prisma.transaction.findUnique({
        where: { id: transaction_id },
        include: {
          user: true,
          course: true
        }
      });

      if (!mainTransaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Check if already processed
      if (mainTransaction.status === 'COMPLETED') {
        return res.status(200).json({
          success: true,
          message: 'Payment already processed',
          data: { alreadyProcessed: true }
        });
      }

      // Get all pending transactions for this user (from same checkout)
      const userPendingTransactions = await prisma.transaction.findMany({
        where: {
          userId: mainTransaction.userId,
          status: 'PENDING',
          createdAt: {
            // Get transactions created within 5 minutes of main transaction
            gte: new Date(mainTransaction.createdAt.getTime() - 5 * 60 * 1000),
            lte: new Date(mainTransaction.createdAt.getTime() + 5 * 60 * 1000)
          }
        }
      });

      // Process all transactions and create enrollments
      const enrollments = [];

      await prisma.$transaction(async (tx) => {
        for (const transaction of userPendingTransactions) {
          // Update transaction status
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'COMPLETED',
              completedAt: new Date()
            }
          });

          // Create or update enrollment
          const existingEnrollment = await tx.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: transaction.userId,
                courseId: transaction.courseId
              }
            }
          });

          if (existingEnrollment) {
            // Update existing enrollment
            const enrollment = await tx.enrollment.update({
              where: { id: existingEnrollment.id },
              data: {
                isPaid: true,
                transactionId: transaction.id,
                paidAmount: transaction.amount
              }
            });
            enrollments.push(enrollment);
          } else {
            // Create new enrollment
            const enrollment = await tx.enrollment.create({
              data: {
                userId: transaction.userId,
                courseId: transaction.courseId,
                isPaid: true,
                transactionId: transaction.id,
                paidAmount: transaction.amount
              }
            });
            enrollments.push(enrollment);
          }
        }

        // Clear user's cart
        await tx.cartItem.deleteMany({
          where: {
            userId: mainTransaction.userId,
            courseId: {
              in: userPendingTransactions.map(t => t.courseId)
            }
          }
        });

        // Award XP for enrollment (gamification)
        const xpPerCourse = 50;
        await tx.user.update({
          where: { id: mainTransaction.userId },
          data: {
            xp: { increment: xpPerCourse * userPendingTransactions.length }
          }
        });
      });

      // TODO: Send confirmation email
      // TODO: Trigger any post-purchase webhooks

      return res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          enrollments: enrollments.length,
          transactions: userPendingTransactions.length
        }
      });

    } catch (error) {
      console.error('Payment success handler error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process payment success',
        error: error.message
      });
    }
  }

  /**
   * Handle payment cancellation
   */
   export const handlePaymentCancel = async (req, res) => {
    return res.status(200).json({
      success: false,
      message: 'Payment was cancelled'
    });
  }


