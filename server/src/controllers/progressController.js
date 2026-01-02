import progressService from '../services/progressService.js';

// @desc    Mark lesson as complete
// @route   POST /api/progress/lessons/:lessonId/complete
// @access  Private (Student)
export const markLessonComplete = async (req, res) => {
  try {
    const progress = await progressService.markLessonComplete(
      req.user.id,
      req.params.lessonId
    );

    res.json({
      success: true,
      message: 'Lesson marked as complete',
      data: { progress }
    });
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    const statusCode = error.message === 'Lesson not found' ? 404
      : error.message.includes('Not enrolled') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update video progress
// @route   PUT /api/progress/lessons/:lessonId/video
// @access  Private (Student)
export const updateVideoProgress = async (req, res) => {
  try {
    const progress = await progressService.updateVideoProgress(
      req.user.id,
      req.params.lessonId,
      req.body
    );

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Update video progress error:', error);
    const statusCode = error.message === 'Lesson not found' ? 404
      : error.message.includes('Not enrolled') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get lesson progress
// @route   GET /api/progress/lessons/:lessonId
// @access  Private
export const getLessonProgress = async (req, res) => {
  try {
    const progress = await progressService.getLessonProgress(
      req.user.id,
      req.params.lessonId
    );

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Get lesson progress error:', error);
    res.status(error.message === 'Lesson not found' ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get enrollment progress
// @route   GET /api/progress/enrollments/:enrollmentId
// @access  Private
export const getEnrollmentProgress = async (req, res) => {
  try {
    const progress = await progressService.getEnrollmentProgress(
      req.params.enrollmentId,
      req.user.id
    );

    res.json({
      success: true,
      count: progress.length,
      data: { progress }
    });
  } catch (error) {
    console.error('Get enrollment progress error:', error);
    const statusCode = error.message === 'Enrollment not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset lesson progress
// @route   POST /api/progress/lessons/:lessonId/reset
// @access  Private (Student)
export const resetLessonProgress = async (req, res) => {
  try {
    const progress = await progressService.resetLessonProgress(
      req.user.id,
      req.params.lessonId
    );

    res.json({
      success: true,
      message: 'Lesson progress reset',
      data: { progress }
    });
  } catch (error) {
    console.error('Reset lesson progress error:', error);
    const statusCode = error.message === 'Lesson not found' ? 404
      : error.message.includes('Not enrolled') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};