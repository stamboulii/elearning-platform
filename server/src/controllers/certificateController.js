import certificateService from '../services/certificateService.js';

/**
 * @desc    Get certificate by ID
 * @route   GET /api/certificates/:id
 * @access  Public (Anyone with the link can verify)
 */
export const getCertificate = async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateDetails(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      data: { certificate }
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching certificate'
    });
  }
};

/**
 * @desc    Get my certificate for a course
 * @route   GET /api/certificates/enrollment/:enrollmentId
 * @access  Private
 */
export const getMyCertificate = async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateByEnrollment(req.params.enrollmentId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      success: true,
      data: { certificate }
    });
  } catch (error) {
    console.error('Get my certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching certificate'
    });
  }
};
