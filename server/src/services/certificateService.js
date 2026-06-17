import prisma from '../config/database.js';
import cloudinary from '../config/cloudinary.js';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas } from 'canvas';

class CertificateService {

  async generateCertificateImage(certificate) {
    if (certificate.certificateUrl) return certificate.certificateUrl;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: certificate.enrollmentId },
      include: {
        user: true,
        course: {
          include: {
            instructor: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    const width = 1200;
    const height = 850;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // ── Background ──────────────────────────────────────────────
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 16;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Inner border
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Top decorative band
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(20, 20, width - 40, 90);

    // ── Header ───────────────────────────────────────────────────
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF COMPLETION', width / 2, 78);

    // ── Subtitle ─────────────────────────────────────────────────
    ctx.fillStyle = '#6b7280';
    ctx.font = '22px serif';
    ctx.fillText('This is to certify that', width / 2, 175);

    // ── Student Name ─────────────────────────────────────────────
    const studentName = `${enrollment.user.firstName} ${enrollment.user.lastName}`;
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 58px serif';
    ctx.fillText(studentName, width / 2, 260);

    // Underline below name
    const nameWidth = ctx.measureText(studentName).width;
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - nameWidth / 2, 275);
    ctx.lineTo(width / 2 + nameWidth / 2, 275);
    ctx.stroke();

    // ── Body text ────────────────────────────────────────────────
    ctx.fillStyle = '#6b7280';
    ctx.font = '22px serif';
    ctx.fillText('has successfully completed the course', width / 2, 330);

    // ── Course Title ─────────────────────────────────────────────
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 38px serif';
    const courseTitle = enrollment.course.title;
    const maxWidth = 900;
    if (ctx.measureText(courseTitle).width > maxWidth) {
      const words = courseTitle.split(' ');
      let line1 = '', line2 = '';
      for (const word of words) {
        if (ctx.measureText(line1 + word).width < maxWidth / 2) {
          line1 += word + ' ';
        } else {
          line2 += word + ' ';
        }
      }
      ctx.fillText(line1.trim(), width / 2, 400);
      ctx.fillText(line2.trim(), width / 2, 450);
    } else {
      ctx.fillText(courseTitle, width / 2, 415);
    }

    // ── Decorative stars ─────────────────────────────────────────
    ctx.fillStyle = '#fbbf24';
    ctx.font = '28px serif';
    ctx.fillText('★  ★  ★', width / 2, 490);

    // ── Date ─────────────────────────────────────────────────────
    const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    ctx.fillStyle = '#6b7280';
    ctx.font = '20px serif';
    ctx.fillText(`Issued on ${issuedDate}`, width / 2, 540);

    // ── Certificate Number ────────────────────────────────────────
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px monospace';
    ctx.fillText(`Certificate No: ${certificate.certificateNumber}`, width / 2, 575);

    // ── Signature lines ───────────────────────────────────────────
    const sigY = 670;

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(220, sigY);
    ctx.lineTo(480, sigY);
    ctx.stroke();

    const instructorName = `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`;
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'center';
    ctx.fillText(instructorName, 350, sigY + 28);
    ctx.fillStyle = '#6b7280';
    ctx.font = '15px serif';
    ctx.fillText('Course Instructor', 350, sigY + 50);

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(720, sigY);
    ctx.lineTo(980, sigY);
    ctx.stroke();

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 18px serif';
    ctx.fillText('First Formation', 850, sigY + 28);
    ctx.fillStyle = '#6b7280';
    ctx.font = '15px serif';
    ctx.fillText('Platform Director', 850, sigY + 50);

    // ── Seal ─────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(width / 2, sigY + 20, 45, 0, Math.PI * 2);
    ctx.fillStyle = '#eef2ff';
    ctx.fill();
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('VERIFIED', width / 2, sigY + 15);
    ctx.font = '11px sans-serif';
    ctx.fillText('CERTIFICATE', width / 2, sigY + 32);

    // ── Upload buffer to Cloudinary ───────────────────────────────
    const buffer = canvas.toBuffer('image/png');
    const b64 = buffer.toString('base64');
    const dataURI = `data:image/png;base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'elearning/certificates',
      public_id: `cert-${certificate.id}`,
      resource_type: 'image',
      overwrite: false,          // never overwrite an existing certificate
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return result.secure_url;
  }

  async issueCertificate(enrollmentId) {
    const existing = await prisma.certificate.findUnique({
      where: { enrollmentId }
    });
    if (existing) return existing;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { user: true, course: true }
    });

    if (!enrollment || enrollment.completionStatus !== 'COMPLETED') {
      throw new Error('Enrollment not found or course not completed');
    }

    const certificateNumber = `CERT-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create DB record first (need the id for the Cloudinary public_id)
    const certificate = await prisma.certificate.create({
      data: { enrollmentId, certificateNumber, issuedAt: new Date() }
    });

    // Generate image and upload to Cloudinary
    const certificateUrl = await this.generateCertificateImage(certificate);

    // Save Cloudinary URL back to DB
    const updatedCert = await prisma.certificate.update({
      where: { id: certificate.id },
      data: { certificateUrl }
    });

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { certificateIssued: true }
    });

    return updatedCert;
  }

  async getCertificateDetails(certificateId) {
    return await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        enrollment: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            course: {
              select: {
                title: true,
                instructor: { select: { firstName: true, lastName: true } }
              }
            }
          }
        }
      }
    });
  }

  async getCertificateByEnrollment(enrollmentId) {
    return await prisma.certificate.findUnique({ where: { enrollmentId } });
  }
}

export default new CertificateService();