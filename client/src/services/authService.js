import api from './api';

const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      // Backend returns accessToken, but we store it as 'token' for consistency
      const token = response.data.data.accessToken || response.data.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      return {
        success: true,
        user: response.data.data.user,
        token,
        refreshToken: response.data.data.refreshToken
      };
    }
    return {
      success: false,
      message: response.data.message || 'Login failed'
    };
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      const token = response.data.data.accessToken || response.data.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      return {
        success: true,
        user: response.data.data.user,
        token,
        refreshToken: response.data.data.refreshToken
      };
    }
    return {
      success: false,
      message: response.data.message || 'Registration failed'
    };
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.data.success) {
      const token = response.data.data.accessToken || response.data.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data.data;
  }
};

export default authService;