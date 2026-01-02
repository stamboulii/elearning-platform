import lessonService from '../services/lessonService.js';

// @desc    Create lesson
// @route   POST /api/sections/:sectionId/lessons
// @access  Private (Instructor)
export const createLesson = async (req, res) => {
  try {
    const lesson = await lessonService.createLesson(
      req.params.sectionId,
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: { lesson }
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    const statusCode = error.message === 'Section not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get section lessons
// @route   GET /api/sections/:sectionId/lessons
// @access  Public
export const getSectionLessons = async (req, res) => {
  try {
    const lessons = await lessonService.getSectionLessons(req.params.sectionId);

    res.json({
      success: true,
      count: lessons.length,
      data: { lessons }
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Public/Private (depends on enrollment)
export const getLesson = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const lesson = await lessonService.getLessonById(req.params.id, userId);

    res.json({
      success: true,
      data: { lesson }
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    const statusCode = error.message === 'Lesson not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Instructor)
export const updateLesson = async (req, res) => {
  try {
    const lesson = await lessonService.updateLesson(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: { lesson }
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    const statusCode = error.message === 'Lesson not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Instructor)
export const deleteLesson = async (req, res) => {
  try {
    await lessonService.deleteLesson(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    const statusCode = error.message === 'Lesson not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reorder lessons
// @route   PUT /api/sections/:sectionId/lessons/reorder
// @access  Private (Instructor)
export const reorderLessons = async (req, res) => {
  try {
    const lessons = await lessonService.reorderLessons(
      req.params.sectionId,
      req.user.id,
      req.body.lessons
    );

    res.json({
      success: true,
      message: 'Lessons reordered successfully',
      data: { lessons }
    });
  } catch (error) {
    console.error('Reorder lessons error:', error);
    const statusCode = error.message === 'Section not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get lesson with progress
// @route   GET /api/lessons/:id/progress
// @access  Private (Student)
export const getLessonWithProgress = async (req, res) => {
  try {
    const lesson = await lessonService.getLessonWithProgress(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      data: { lesson }
    });
  } catch (error) {
    console.error('Get lesson with progress error:', error);
    const statusCode = error.message === 'Lesson not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};