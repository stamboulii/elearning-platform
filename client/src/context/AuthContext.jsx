// /* eslint-disable react-refresh/only-export-components */
// import { createContext, useContext, useState, useEffect } from 'react';
// import axios from '../utils/axios';

// const AuthContext = createContext(null);

// // Export the useAuth hook - THIS WAS MISSING!
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Check if user is logged in on mount
//   useEffect(() => {
//     checkAuth();
   
//   }, []);

//   const checkAuth = async () => {
//     const token = localStorage.getItem('accessToken');
    
//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     try {
//       const { data } = await axios.get('/auth/me');
//       setUser(data.data.user);
//     } catch (error) {
//       console.error('Auth check failed:', error);
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const register = async (userData) => {
//     try {
//       const { data } = await axios.post('/auth/register', userData);
      
//       // Save tokens
//       localStorage.setItem('accessToken', data.data.accessToken);
//       localStorage.setItem('refreshToken', data.data.refreshToken);
      
//       // Set user
//       setUser(data.data.user);
      
//       return { success: true };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.message || 'Registration failed'
//       };
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const { data } = await axios.post('/auth/login', { email, password });
      
//       // Save tokens
//       localStorage.setItem('accessToken', data.data.accessToken);
//       localStorage.setItem('refreshToken', data.data.refreshToken);
      
//       // Set user
//       setUser(data.data.user);
      
//       return { success: true };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.message || 'Login failed'
//       };
//     }
//   };

//   const logout = async () => {
//     try {
//       await axios.post('/auth/logout');
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       // Clear tokens and user regardless of API response
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       setUser(null);
//     }
//   };

//   const value = {
//     user,
//     loading,
//     register,
//     login,
//     logout,
//     isAuthenticated: !!user
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser({ ...user, ...userData });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};