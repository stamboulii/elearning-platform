import prisma from '../config/database.js';
import { createNotification } from './notificationService.js';

class ReviewService {
  async submitReview(userId, courseId, { rating, reviewText }) {
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!enrollment) {
      throw new Error('You must be enrolled in this course to leave a review');
    }

    if (enrollment.completionStatus !== 'COMPLETED') {
      throw new Error('You can only review a course after completing it');
    }

    const isNewReview = !(await prisma.review.findUnique({
      where: { courseId_userId: { courseId, userId } }
    }));

    // Always approved on submit/edit — admins moderate after the fact
    const review = await prisma.review.upsert({
      where: { courseId_userId: { courseId, userId } },
      update: { rating, reviewText, isApproved: true },
      create: { courseId, userId, rating, reviewText, isApproved: true },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
        course: { select: { id: true, title: true } }
      }
    });

    // Notify admins so they can review it
    (async () => {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
      admins.forEach(({ id: adminId }) => {
        createNotification({
          userId: adminId,
          type: 'REVIEW',
          title: isNewReview ? 'New course review' : 'Review updated',
          message: `${review.user.firstName} ${review.user.lastName} ${isNewReview ? 'left a' : 'updated their'} review on "${review.course.title}"`,
          data: { reviewId: review.id, courseId, rating }
        }).catch(() => {});
      });
    })();

    return review;
  }

  async getMyReview(userId, courseId) {
    return prisma.review.findUnique({ where: { courseId_userId: { courseId, userId } } });
  }

  async deleteReview(userId, courseId) {
    const review = await prisma.review.findUnique({ where: { courseId_userId: { courseId, userId } } });
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId) throw new Error('Not authorized');
    return prisma.review.delete({ where: { id: review.id } });
  }

  async canReview(userId, courseId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (!enrollment || enrollment.completionStatus !== 'COMPLETED') {
      return { eligible: false, reason: 'not_completed' };
    }
    const existingReview = await prisma.review.findUnique({
      where: { courseId_userId: { courseId, userId } }
    });
    return { eligible: true, alreadyReviewed: !!existingReview, existingReview };
  }
}

export default new ReviewService();