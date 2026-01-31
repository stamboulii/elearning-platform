import prisma from '../config/database.js';

// Check if course requires payment
export const checkCoursePayment = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        price: true,
        discountPrice: true,
        currency: true
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const effectivePrice = course.discountPrice || course.price;
    const isFree = effectivePrice === 0;

    res.json({
      success: true,
      data: {
        isFree,
        price: course.price,
        discountPrice: course.discountPrice,
        effectivePrice,
        currency: course.currency
      }
    });
  } catch (error) {
    console.error('Check payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking payment',
      error: error.message
    });
  }
};