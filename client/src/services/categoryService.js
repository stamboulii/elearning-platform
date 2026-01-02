import api from './api';

const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data.data.categories;
  },

  // Get single category
  getCategory: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data.data.category;
  }
};

export default categoryService;