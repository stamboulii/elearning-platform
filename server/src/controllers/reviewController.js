import {
  getDueReviews,
  getDueReviewsForSession,
  submitReview,
  getReviewStats
} from '../services/spacedRepetitionService.js';

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

    const updated = await submitReview(req.user.id, lessonId, quality);
    res.json({ success: true, data: { schedule: updated } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};