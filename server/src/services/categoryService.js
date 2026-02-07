import prisma from '../config/database.js';
import cloudinary from '../config/cloudinary.js';

class CategoryService {
  // Upload picture to Cloudinary (using memory buffer from multer)
  async uploadPicture(file) {
    if (!file) return null;

    try {
      // Convert buffer to base64 data URI for Cloudinary
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'categories',
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });
      return result.secure_url;
    } catch (error) {
      console.warn('Cloudinary upload failed, continuing without picture:', error.message);
      return null;
    }
  }

  // Create category
  async createCategory(data) {
    const { name, slug, description, icon, parentCategoryId, displayOrder, picture } = data;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      throw new Error('Category with this slug already exists');
    }

    // Upload picture if provided
    let pictureUrl = null;
    if (picture && typeof picture !== 'string') {
      pictureUrl = await this.uploadPicture(picture);
    } else if (typeof picture === 'string') {
      pictureUrl = picture;
    }

    return await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null,
        ...(pictureUrl && { picture: pictureUrl }),
        ...(parentCategoryId && { parentCategoryId }),
        displayOrder: parseInt(displayOrder) || 0
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
    const { name, slug, description, icon, parentCategoryId, displayOrder, picture } = data;

    // Upload new picture if provided (as File)
    let pictureUrl = undefined;
    if (picture && typeof picture !== 'string') {
      const uploadedUrl = await this.uploadPicture(picture);
      if (uploadedUrl) {
        pictureUrl = uploadedUrl;
      }
    } else if (typeof picture === 'string') {
      pictureUrl = picture;
    }

    return await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        icon,
        ...(parentCategoryId !== undefined && { parentCategoryId: parentCategoryId || null }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) || 0 }),
        ...(pictureUrl !== undefined && { picture: pictureUrl })
      }
    });
  }

  // Delete category
  async deleteCategory(id) {
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