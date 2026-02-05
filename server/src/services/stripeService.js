// services/stripeService.js
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  /**
   * Create a Stripe Checkout Session for payment
   * @param {string} transactionId - The transaction ID
   * @param {object} user - User object
   * @param {array} items - Cart items with course details
   * @param {number} totalAmount - Total amount to charge
   * @returns {object} Stripe session
   */
  async createCheckoutSession(transactionId, user, items, totalAmount, couponInfo = null) {
    try {
      // If coupon is applied, create a single line item with the discounted total
      // Otherwise, create individual line items for each course

      let lineItems;

      if (couponInfo) {
        // Single line item with coupon-adjusted total
        const courseNames = items.map(item => item.course.title).join(', ');
        const coursesText = items.length > 1 ? `${items.length} Courses` : items[0].course.title;

        lineItems = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: coursesText,
              description: `${courseNames.substring(0, 200)}${courseNames.length > 200 ? '...' : ''} (Coupon ${couponInfo.code} applied: -$${couponInfo.discount.toFixed(2)})`,
            },
            unit_amount: Math.round(parseFloat(totalAmount) * 100), // Use final total
          },
          quantity: 1,
        }];
      } else {
        // Individual line items for each course
        lineItems = items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.course.title,
              description: item.course.shortDescription || '',
              images: item.course.thumbnailImage ? [item.course.thumbnailImage] : [],
            },
            unit_amount: Math.round(parseFloat(item.currentPrice) * 100), // Convert to cents
          },
          quantity: 1,
        }));
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&transaction_id=${transactionId}`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
        client_reference_id: transactionId,
        customer_email: user.email,
        metadata: {
          transactionId: transactionId,
          userId: user.id,
          couponCode: couponInfo?.code || null,
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      throw new Error('Failed to create payment session');
    }
  }

  /**
   * Verify Stripe payment session
   * @param {string} sessionId - Stripe session ID
   * @returns {object} Session details
   */
  async verifySession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('Error verifying Stripe session:', error);
      throw new Error('Failed to verify payment session');
    }
  }

  /**
   * Create a refund for a transaction
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @param {number} amount - Amount to refund (optional, defaults to full refund)
   * @returns {object} Refund details
   */
  async createRefund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error('Failed to create refund');
    }
  }
}

export default new StripeService();