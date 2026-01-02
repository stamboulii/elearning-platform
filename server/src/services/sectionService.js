import prisma from '../config/database.js';

class SectionService {
  // Create section
  async createSection(courseId, userId, data) {
    const { title, description, orderNumber } = data;

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.instructorId !== userId) {
      throw new Error('Not authorized to add sections to this course');
    }

    // Get the highest order number if not provided
    let order = orderNumber;
    if (!order) {
      const lastSection = await prisma.courseSection.findFirst({
        where: { courseId },
        orderBy: { orderNumber: 'desc' }
      });
      order = lastSection ? lastSection.orderNumber + 1 : 1;
    }

    return await prisma.courseSection.create({
      data: {
        courseId,
        title,
        description,
        orderNumber: order
      },
      include: {
        lessons: true
      }
    });
  }

  // Get all sections for a course
  async getCourseSections(courseId) {
    return await prisma.courseSection.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { orderNumber: 'asc' }
        }
      },
      orderBy: { orderNumber: 'asc' }
    });
  }

  // Get single section
  async getSectionById(sectionId) {
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true
          }
        },
        lessons: {
          orderBy: { orderNumber: 'asc' }
        }
      }
    });

    if (!section) {
      throw new Error('Section not found');
    }

    return section;
  }

  // Update section
  async updateSection(sectionId, userId, data) {
    const { title, description, orderNumber } = data;

    // Verify ownership
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: {
        course: true
      }
    });

    if (!section) {
      throw new Error('Section not found');
    }

    if (section.course.instructorId !== userId) {
      throw new Error('Not authorized to update this section');
    }

    return await prisma.courseSection.update({
      where: { id: sectionId },
      data: {
        title,
        description,
        orderNumber
      },
      include: {
        lessons: true
      }
    });
  }

  // Delete section
  async deleteSection(sectionId, userId) {
    // Verify ownership
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: {
        course: true,
        lessons: true
      }
    });

    if (!section) {
      throw new Error('Section not found');
    }

    if (section.course.instructorId !== userId) {
      throw new Error('Not authorized to delete this section');
    }

    // Check if section has lessons
    if (section.lessons.length > 0) {
      throw new Error('Cannot delete section with lessons. Delete lessons first.');
    }

    return await prisma.courseSection.delete({
      where: { id: sectionId }
    });
  }

  // Reorder sections
  async reorderSections(courseId, userId, sectionsOrder) {
    // Verify ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.instructorId !== userId) {
      throw new Error('Not authorized to reorder sections');
    }

    // Update order for each section
    const updatePromises = sectionsOrder.map((item) =>
      prisma.courseSection.update({
        where: { id: item.sectionId },
        data: { orderNumber: item.orderNumber }
      })
    );

    await Promise.all(updatePromises);

    return await this.getCourseSections(courseId);
  }
}

export default new SectionService();