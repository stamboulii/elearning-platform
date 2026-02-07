import api from './api';

const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data.data.categories;
  },

  getCategory: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data.data.category;
  },

  createCategory: async (categoryData) => {
    const formData = new FormData();

    Object.keys(categoryData).forEach(key => {
      if (key !== 'picture' && categoryData[key] !== undefined && categoryData[key] !== null && categoryData[key] !== '') {
        formData.append(key, categoryData[key]);
      }
    });

    // Only append picture if it's a File object
    if (categoryData.picture instanceof File) {
      formData.append('picture', categoryData.picture);
    }

    const response = await api.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data.category;
  },

  updateCategory: async (categoryId, categoryData) => {
    const formData = new FormData();

    Object.keys(categoryData).forEach(key => {
      if (key !== 'picture' && categoryData[key] !== undefined && categoryData[key] !== null && categoryData[key] !== '') {
        formData.append(key, categoryData[key]);
      }
    });

    if (categoryData.picture instanceof File) {
      formData.append('picture', categoryData.picture);
    }

    const response = await api.put(`/categories/${categoryId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data.category;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  }
};

export default categoryService;