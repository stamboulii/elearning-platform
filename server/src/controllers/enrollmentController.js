import enrollmentService from '../services/enrollmentService.js';

// @desc    Enroll in course
// @route   POST /api/enrollments
// @access  Private (Student)
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const enrollment = await enrollmentService.enrollInCourse(req.user.id, courseId);

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: { enrollment }
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    const statusCode = error.message === 'Course not found' ? 404
      : error.message.includes('not available') ? 400
      : error.message.includes('Already enrolled') ? 400
      : error.message.includes('cannot enroll') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's enrollments
// @route   GET /api/enrollments/me
// @access  Private
export const getMyEnrollments = async (req, res) => {
  try {
    const result = await enrollmentService.getUserEnrollments(req.user.id, req.query);

    res.json({
      success: true,
      count: result.enrollments.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: { enrollments: result.enrollments }
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get enrollment details
// @route   GET /api/enrollments/:id
// @access  Private
export const getEnrollmentDetails = async (req, res) => {
  try {
    const enrollment = await enrollmentService.getEnrollmentDetails(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      data: { enrollment }
    });
  } catch (error) {
    console.error('Get enrollment details error:', error);
    const statusCode = error.message === 'Enrollment not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check if enrolled in course
// @route   GET /api/enrollments/check/:courseId
// @access  Private
export const checkEnrollment = async (req, res) => {
  try {
    const result = await enrollmentService.checkEnrollment(
      req.user.id,
      req.params.courseId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get course enrollment stats (Instructor only)
// @route   GET /api/enrollments/course/:courseId/stats
// @access  Private (Instructor)
export const getCourseEnrollmentStats = async (req, res) => {
  try {
    const stats = await enrollmentService.getCourseEnrollmentStats(
      req.params.courseId,
      req.user.id
    );

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get enrollment stats error:', error);
    const statusCode = error.message === 'Course not found' ? 404
      : error.message.includes('Not authorized') ? 403
      : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};