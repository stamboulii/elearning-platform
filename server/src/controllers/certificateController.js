import certificateService from '../services/certificateService.js';
import prisma from '../config/database.js';

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

export const getCertificateByEnrollment = async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateByEnrollment(req.params.enrollmentId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found for this enrollment'
      });
    }

    // Security: make sure the certificate belongs to the requesting user
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: req.params.enrollmentId },
      select: { userId: true }
    });

    if (!enrollment || enrollment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this certificate'
      });
    }

    res.json({
      success: true,
      data: { certificate }
    });
  } catch (error) {
    console.error('Get certificate by enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching certificate'
    });
  }
};

export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await certificateService.getMyCertificates(req.user.id);
    res.json({
      success: true,
      data: { certificates }
    });
  } catch (error) {
    console.error('Get my certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching certificates'
    });
  }
};