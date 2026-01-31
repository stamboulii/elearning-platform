import prisma from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class CertificateService {
  /**
   * Issue a certificate for a completed enrollment
   */
  async issueCertificate(enrollmentId) {
    try {
      // Check if certificate already exists
      const existing = await prisma.certificate.findUnique({
        where: { enrollmentId }
      });

      if (existing) return existing;

      // Get enrollment data for the certificate
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          user: true,
          course: true
        }
      });

      if (!enrollment || enrollment.completionStatus !== 'COMPLETED') {
        throw new Error('Enrollment not found or course not completed');
      }

      // Generate a unique certificate number
      const certificateNumber = `CERT-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

      // Create certificate record
      const certificate = await prisma.certificate.create({
        data: {
          enrollmentId,
          certificateNumber,
          issuedAt: new Date()
        }
      });

      // Update enrollment to reflect certificate issued
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { certificateIssued: true }
      });

      return certificate;
    } catch (error) {
      console.error('Issue certificate error:', error);
      return null;
    }
  }

  /**
   * Get certificate details by ID
   */
  async getCertificateDetails(certificateId) {
    return await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            course: {
              select: {
                title: true,
                instructor: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  /**
   * Get certificate by Enrollment ID
   */
  async getCertificateByEnrollment(enrollmentId) {
    return await prisma.certificate.findUnique({
      where: { enrollmentId }
    });
  }
}

export default new CertificateService();
