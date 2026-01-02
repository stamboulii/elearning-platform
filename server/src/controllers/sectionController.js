import sectionService from '../services/sectionService.js';

// @desc    Create section
// @route   POST /api/courses/:courseId/sections
// @access  Private (Instructor)
export const createSection = async (req, res) => {
  try {
    const section = await sectionService.createSection(
      req.params.courseId,
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: { section }
    });
  } catch (error) {
    console.error('Create section error:', error);
    const statusCode = error.message === 'Course not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get course sections
// @route   GET /api/courses/:courseId/sections
// @access  Public
export const getCourseSections = async (req, res) => {
  try {
    const sections = await sectionService.getCourseSections(req.params.courseId);

    res.json({
      success: true,
      count: sections.length,
      data: { sections }
    });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single section
// @route   GET /api/sections/:id
// @access  Public
export const getSection = async (req, res) => {
  try {
    const section = await sectionService.getSectionById(req.params.id);

    res.json({
      success: true,
      data: { section }
    });
  } catch (error) {
    console.error('Get section error:', error);
    res.status(error.message === 'Section not found' ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private (Instructor)
export const updateSection = async (req, res) => {
  try {
    const section = await sectionService.updateSection(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      success: true,
      message: 'Section updated successfully',
      data: { section }
    });
  } catch (error) {
    console.error('Update section error:', error);
    const statusCode = error.message === 'Section not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private (Instructor)
export const deleteSection = async (req, res) => {
  try {
    await sectionService.deleteSection(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('Delete section error:', error);
    const statusCode = error.message === 'Section not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : error.message.includes('Cannot delete') ? 400
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reorder sections
// @route   PUT /api/courses/:courseId/sections/reorder
// @access  Private (Instructor)
export const reorderSections = async (req, res) => {
  try {
    const sections = await sectionService.reorderSections(
      req.params.courseId,
      req.user.id,
      req.body.sections
    );

    res.json({
      success: true,
      message: 'Sections reordered successfully',
      data: { sections }
    });
  } catch (error) {
    console.error('Reorder sections error:', error);
    const statusCode = error.message === 'Course not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};