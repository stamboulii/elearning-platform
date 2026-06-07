import prisma from '../config/database.js';
import { generateStudySchedule } from '../services/groqService.js';

// @desc    Generate study schedule for an enrollment
// @route   POST /api/study-schedules/generate
// @access  Private (Student)
export const createSchedule = async (req, res) => {
    try {
        const { enrollmentId, targetDate, hoursPerDay } = req.body;

        if (!enrollmentId || !targetDate || !hoursPerDay) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters'
            });
        }

        // Verify enrollment and get course details
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                course: {
                    include: {
                        sections: {
                            include: {
                                lessons: {
                                    orderBy: { orderNumber: 'asc' }
                                }
                            },
                            orderBy: { orderNumber: 'asc' }
                        }
                    }
                }
            }
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        if (enrollment.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to manage this enrollment'
            });
        }

        // Call AI to generate schedule
        const scheduleData = await generateStudySchedule(
            enrollment.course.title,
            enrollment.course.sections,
            targetDate,
            hoursPerDay
        );

        // Save or update schedule
        const studySchedule = await prisma.studySchedule.upsert({
            where: { enrollmentId },
            update: {
                targetDate: new Date(targetDate),
                hoursPerDay: parseFloat(hoursPerDay),
                scheduleData
            },
            create: {
                enrollmentId,
                targetDate: new Date(targetDate),
                hoursPerDay: parseFloat(hoursPerDay),
                scheduleData
            }
        });

        res.status(201).json({
            success: true,
            message: 'Study schedule generated successfully',
            data: studySchedule
        });
    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get study schedule for an enrollment
// @route   GET /api/study-schedules/:enrollmentId
// @access  Private (Student)
export const getSchedule = async (req, res) => {
    try {
        const { enrollmentId } = req.params;

        const studySchedule = await prisma.studySchedule.findUnique({
            where: { enrollmentId }
        });

        if (!studySchedule) {
            return res.status(404).json({
                success: false,
                message: 'Study schedule not found'
            });
        }

        // Verify ownership
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            select: { userId: true }
        });

        if (enrollment?.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this schedule'
            });
        }

        res.json({
            success: true,
            data: studySchedule
        });
    } catch (error) {
        console.error('Get schedule error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
