import apiService from './api';

const BACKEND_API_URL = 'https://nps-project-backend.vercel.app/api';

class OpenAIService {
  constructor() {
    this.baseURL = BACKEND_API_URL;
  }

  // Helper method to make HTTP requests to backend OpenAI endpoints
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
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        error.response = { data };
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('OpenAI API request failed:', error);
      if (error.response) {
        throw error;
      }
      const networkError = new Error(error.message || 'Network error occurred');
      networkError.response = { data: { message: error.message || 'Network error occurred' } };
      throw networkError;
    }
  }

  // Generic chat completion
  async chatCompletion(messages, options = {}) {
    const {
      model = 'gpt-4o-mini',
      temperature = 0.7,
      max_tokens = 4000
    } = options;

    return this.request('/openai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        model,
        temperature,
        max_tokens
      }),
    });
  }

  // Generate school report
  async generateSchoolReport(messages, options = {}) {
    const {
      model = 'gpt-4o-mini',
      temperature = 0.7,
      max_tokens = 4000
    } = options;

    return this.request('/openai/school-report', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        model,
        temperature,
        max_tokens
      }),
    });
  }

  // Generate market insights
  async generateMarketInsights(messages, options = {}) {
    const {
      model = 'gpt-3.5-turbo-16k',
      temperature = 0.7,
      max_tokens = 3000
    } = options;

    return this.request('/openai/market-insights', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        model,
        temperature,
        max_tokens
      }),
    });
  }

  // Generate learning paths
  async generateLearningPaths(messages, options = {}) {
    const {
      model = 'gpt-3.5-turbo-16k',
      temperature = 0.7,
      max_tokens = 3000
    } = options;

    return this.request('/openai/learning-paths', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        model,
        temperature,
        max_tokens
      }),
    });
  }

  // Health check for OpenAI service
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/openai/health`);
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('OpenAI health check failed:', error);
      return false;
    }
  }

  // Validate API key (now checks backend configuration)
  async validateAPIKey() {
    try {
      const healthData = await this.healthCheck();
      if (!healthData) {
        throw new Error("OpenAI service is not available. Please check backend configuration.");
      }
      return true;
    } catch (error) {
      throw new Error("Unable to validate OpenAI service. Please check backend configuration.");
    }
  }

  // Estimate token usage (rough estimation)
  estimateTokenUsage(text) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}

// Create and export a single instance
const openaiService = new OpenAIService();
export default openaiService;
