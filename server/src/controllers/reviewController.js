import {
  getDueReviews,
  getDueReviewsForSession,
  submitReview  as submitSpacedReview,
  getReviewStats
} from '../services/spacedRepetitionService.js';
import reviewService from '../services/reviewService.js';

export const getMyDueReviews = async (req, res) => {
  try {
    const reviews = await getDueReviews(req.user.id);
    res.json({ success: true, data: { reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyReviewStats = async (req, res) => {
  try {
    const stats = await getReviewStats(req.user.id);
    res.json({ success: true, data: { stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSessionReviews = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const reviews = await getDueReviewsForSession(req.user.id, enrollmentId);
    res.json({ success: true, data: { reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitLessonReview = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { quality } = req.body;

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({
        success: false,
        message: 'quality must be 0 (Forgot), 3 (Hard), 4 (Good) or 5 (Easy)'
      });
    }

    const updated = await submitSpacedReview(req.user.id, lessonId, quality);
    res.json({ success: true, data: { schedule: updated } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit or update a review (only if course is completed)
// @route   POST /api/reviews/:courseId
// @access  Private
export const submitReview = async (req, res) => {
  try {
    const review = await reviewService.submitReview(
      req.user.id,
      req.params.courseId,
      req.body
    );

    res.json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    const statusCode = error.message.includes('completing') || error.message.includes('enrolled')
      ? 403
      : error.message.includes('Rating must')
        ? 400
        : 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

// @desc    Check if current user can review a course
// @route   GET /api/reviews/:courseId/eligibility
// @access  Private
export const checkEligibility = async (req, res) => {
  try {
    const result = await reviewService.canReview(req.user.id, req.params.courseId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete own review
// @route   DELETE /api/reviews/:courseId
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    await reviewService.deleteReview(req.user.id, req.params.courseId);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(error.message === 'Not authorized' ? 403 : 500).json({
      success: false,
      message: error.message
    });
  }
};