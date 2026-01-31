import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();

        if (!userData || !userData.role) {
          throw new Error('Invalid user payload');
        }

        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      if (response?.success && response?.user?.role) {
        setUser(response.user);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register: authService.register,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
