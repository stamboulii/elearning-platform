import categoryService from '../services/categoryService.js';

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin only)
export const createCategory = async (req, res) => {
  try {
    // Combine body data with uploaded file
    const categoryData = {
      ...req.body,
      ...(req.file && { picture: req.file })
    };
    const category = await categoryService.createCategory(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(error.message.includes('already exists') ? 400 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();

    res.json({
      success: true,
      count: categories.length,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(error.message === 'Category not found' ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
export const updateCategory = async (req, res) => {
  try {
    // Combine body data with uploaded file
    const categoryData = {
      ...req.body,
      ...(req.file && { picture: req.file })
    };
    const category = await categoryService.updateCategory(req.params.id, categoryData);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(error.message.includes('Cannot delete') ? 400 : 500).json({
      success: false,
      message: error.message
    });
  }
};