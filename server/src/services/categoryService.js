import prisma from '../config/database.js';

class CategoryService {
  // Create category
  async createCategory(data) {
    const { name, slug, description, icon, parentCategoryId, displayOrder } = data;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      throw new Error('Category with this slug already exists');
    }

    return await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        parentCategoryId,
        displayOrder: displayOrder || 0
      }
    });
  }

  // Get all categories
  async getAllCategories() {
    return await prisma.category.findMany({
      include: {
        subCategories: true,
        _count: {
          select: { courses: true }
        }
      },
      orderBy: { displayOrder: 'asc' }
    });
  }

  // Get category by ID
  async getCategoryById(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: true,
        courses: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailImage: true,
            price: true,
            level: true
          }
        }
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  // Update category
  async updateCategory(id, data) {
    const { name, slug, description, icon, parentCategoryId, displayOrder } = data;

    return await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        icon,
        parentCategoryId,
        displayOrder
      }
    });
  }

  // Delete category
  async deleteCategory(id) {
    // Check if category has courses
    const coursesCount = await prisma.course.count({
      where: { categoryId: id }
    });

    if (coursesCount > 0) {
      throw new Error(`Cannot delete category with ${coursesCount} courses`);
    }

    return await prisma.category.delete({
      where: { id }
    });
  }
}

export default new CategoryService();