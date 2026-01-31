import courseService from '../services/courseService.js';

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
export const createCourse = async (req, res) => {
  try {
    const course = await courseService.createCourse(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(error.message.includes('already exists') ? 400 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const result = await courseService.getAllCourses(req.query);

    res.json({
      success: true,
      count: result.courses.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: { courses: result.courses }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null
    const course = await courseService.getCourseById(req.params.id,userId);

    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(error.message === 'Course not found' ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor - own courses only)
export const updateCourse = async (req, res) => {
  try {
    const course = await courseService.updateCourse(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Update course error:', error);
    const statusCode = error.message === 'Course not found' ? 404 
      : error.message.includes('Not authorized') ? 403 
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor - own courses only)
export const deleteCourse = async (req, res) => {
  try {
    await courseService.deleteCourse(req.params.id, req.user.id, req.user.role);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    const statusCode = error.message === 'Course not found' ? 404 
      : error.message.includes('Not authorized') ? 403 
      : error.message.includes('Cannot delete') ? 400 
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get instructor's courses
// @route   GET /api/courses/instructor/me
// @access  Private (Instructor)
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await courseService.getInstructorCourses(req.user.id);

    res.json({
      success: true,
      count: courses.length,
      data: { courses }
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add course requirement
// @route   POST /api/courses/:id/requirements
// @access  Private (Instructor)
export const addCourseRequirement = async (req, res) => {
  try {
    const requirement = await courseService.addRequirement(
      req.params.id,
      req.user.id,
      req.body.requirement
    );

    res.status(201).json({
      success: true,
      data: { requirement }
    });
  } catch (error) {
    console.error('Add requirement error:', error);
    res.status(error.message === 'Not authorized' ? 403 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add course outcome
// @route   POST /api/courses/:id/outcomes
// @access  Private (Instructor)
export const addCourseOutcome = async (req, res) => {
  try {
    const outcome = await courseService.addOutcome(
      req.params.id,
      req.user.id,
      req.body.outcome
    );

    res.status(201).json({
      success: true,
      data: { outcome }
    });
  } catch (error) {
    console.error('Add outcome error:', error);
    res.status(error.message === 'Not authorized' ? 403 : 500).json({
      success: false,
      message: error.message
    });
  }
};
