const API_BASE_URL = 'https://nps-project-backend.vercel.app/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for JWT
      ...options,
    };

    // Inject Authorization header from localStorage token, if present
    try {
      const token = localStorage.getItem('authToken');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {
      // ignore storage access issues
    }

    try {
      const response = await fetch(url, config);
      
      // Parse response
      let data;
      try {
        data = await response.json();
      } catch (error) {
        data = { message: 'Invalid response format' };
      }

      // Handle non-2xx responses
      if (!response.ok) {
        // Create a custom error object that preserves the backend error structure
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        // Attach the response data to the error for better error handling
        error.response = { data };
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      // If it's our custom error with response data, throw it as-is
      if (error.response) {
        throw error;
      }
      // For network errors or other issues, create a structured error
      const networkError = new Error(error.message || 'Network error occurred');
      networkError.response = { data: { message: error.message || 'Network error occurred' } };
      throw networkError;
    }
  }

  // Authentication methods
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Admin Dashboard methods
  async getStudents(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.class) queryParams.append('class', params.class);
    
    const queryString = queryParams.toString();
    const endpoint = `/users/students${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async getStudentStats() {
    return this.request('/users/stats', {
      method: 'GET',
    });
  }

  async getAvailableClasses() {
    return this.request('/users/classes', {
      method: 'GET',
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;