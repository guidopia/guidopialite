// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for existing session on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
        
        // Optionally verify token with backend
        // const response = await apiService.verifyToken();
        // if (!response.success) {
        //   localStorage.removeItem('authToken');
        //   localStorage.removeItem('userData');
        //   setUser(null);
        // }
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      // Clear invalid data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await apiService.login(credentials);
      
      if (response.success) {
        const userData = response.data.user;
        const token = response.data.token;
        
        console.log('Login successful, user data:');
        console.log('User role:');
        console.log('Redirect URL will be:', userData.role === 'admin' ? '/admin' : '/landing');
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Set user in context
        setUser(userData);
        
        return {
          success: true,
          message: response.message,
          data: {
            user: userData,
            redirectUrl: userData.role === 'admin' ? '/admin' : '/landing'
          }
        };
      } else {
        setError(response.message || 'Login failed');
        return {
          success: false,
          error: response.message || 'Login failed'
        };
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await apiService.signup(userData);
      
      if (response.success) {
        const newUser = response.data.user;
        const token = response.data.token;
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(newUser));
        
        // Set user in context
        setUser(newUser);
        
        return {
          success: true,
          message: response.message,
          user: newUser,
          redirectTo: '/dashboard' // Students always go to dashboard
        };
      } else {
        setError(response.message || 'Signup failed');
        return {
          success: false,
          error: response.message || 'Signup failed'
        };
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setError('');
  };

  const clearError = () => {
    setError('');
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isStudent = () => {
    return user && user.role === 'student';
  };

  const value = {
    user,
    login,
    signup,
    logout,
    error,
    clearError,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isStudent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
