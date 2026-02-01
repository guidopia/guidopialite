const express = require('express');
const OpenAI = require('openai');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// API Key Health Monitoring
let apiKeyHealthStatus = {
  lastChecked: null,
  isValid: null,
  error: null,
  consecutiveFailures: 0
};

// Function to validate API key health
async function validateApiKeyHealth() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Test with a minimal request (very low cost)
    const testCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 1
    });

    apiKeyHealthStatus = {
      lastChecked: new Date(),
      isValid: true,
      error: null,
      consecutiveFailures: 0
    };

    return true;
  } catch (error) {
    apiKeyHealthStatus = {
      lastChecked: new Date(),
      isValid: false,
      error: error.message,
      consecutiveFailures: apiKeyHealthStatus.consecutiveFailures + 1
    };

    console.error('❌ API Key Health Check Failed:', {
      error: error.message,
      consecutiveFailures: apiKeyHealthStatus.consecutiveFailures,
      timestamp: new Date().toISOString()
    });

    return false;
  }
}

// Middleware to check API key health before processing requests
const apiKeyHealthCheck = async (req, res, next) => {
  // Check health every 5 minutes or if we have consecutive failures
  const shouldCheckHealth = !apiKeyHealthStatus.lastChecked ||
    (Date.now() - apiKeyHealthStatus.lastChecked.getTime()) > (5 * 60 * 1000) ||
    apiKeyHealthStatus.consecutiveFailures > 0;

  if (shouldCheckHealth) {
    await validateApiKeyHealth();
  }

  // If API key is invalid and we have too many failures, return error
  if (!apiKeyHealthStatus.isValid && apiKeyHealthStatus.consecutiveFailures >= 3) {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'AI service is currently experiencing issues. Please try again later.'
    });
  }

  next();
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Rate limiting for OpenAI endpoints
const openaiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting and API key health check to all OpenAI routes
router.use(openaiRateLimit);
router.use(apiKeyHealthCheck);

// Validation middleware for OpenAI requests
const validateOpenAIRequest = [
  body('messages').isArray().withMessage('Messages must be an array'),
  body('messages.*.role').isIn(['system', 'user', 'assistant']).withMessage('Invalid message role'),
  body('messages.*.content').isString().withMessage('Message content must be a string'),
  body('model').optional().isString().withMessage('Model must be a string'),
  body('temperature').optional().isFloat({ min: 0, max: 2 }).withMessage('Temperature must be between 0 and 2'),
  body('max_tokens').optional().isInt({ min: 1, max: 4000 }).withMessage('Max tokens must be between 1 and 4000'),
];

// Generic OpenAI chat completion endpoint
router.post('/chat', validateOpenAIRequest, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid request parameters',
        details: errors.array()
      });
    }

    const { 
      messages, 
      model = 'gpt-4o-mini', 
      temperature = 0.7, 
      max_tokens = 4000 
    } = req.body;

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'OpenAI API key not configured on server'
      });
    }

    console.log('📝 OpenAI API call:', {
      model,
      messageCount: messages.length,
      temperature,
      max_tokens
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    console.log('✅ OpenAI response received:', {
      tokensUsed: completion.usage?.total_tokens,
      model: completion.model
    });

    // Return response
    res.status(200).json({
      success: true,
      message: completion.choices[0].message.content,
      choices: completion.choices,
      usage: completion.usage,
      model: completion.model
    });

  } catch (error) {
    // Sanitize error logging to prevent API key exposure
    const sanitizedError = {
      status: error.status,
      code: error.code,
      type: error.type,
      message: error.message ? error.message.replace(/sk-[a-zA-Z0-9]{48}/g, '[REDACTED]') : 'Unknown error'
    };

    console.error('❌ OpenAI API Error:', sanitizedError);

    // Handle specific OpenAI errors
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'OpenAI API rate limit exceeded. Please try again later.'
      });
    }

    if (error.status === 401) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'OpenAI API authentication failed. Please contact support.'
      });
    }

    if (error.status === 400) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid request parameters. Please check your input.'
      });
    }

    if (error.status === 403) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access to OpenAI API is forbidden. Please contact support.'
      });
    }

    if (error.status === 503) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'OpenAI API is currently unavailable. Please try again later.'
      });
    }

    // Generic error - never expose internal details
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate AI response. Please try again.'
    });
  }
});

// School report generation endpoint
router.post('/school-report', validateOpenAIRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid request parameters',
        details: errors.array()
      });
    }

    const { 
      messages, 
      model = 'gpt-4o-mini', 
      temperature = 0.7, 
      max_tokens = 4000 
    } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'OpenAI API key not configured on server'
      });
    }

    console.log('📊 Generating school report:', {
      model,
      messageCount: messages.length
    });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    console.log('✅ School report generated:', {
      tokensUsed: completion.usage?.total_tokens
    });

    res.status(200).json({
      success: true,
      reportContent: completion.choices[0].message.content,
      usage: completion.usage,
      model: completion.model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Sanitize error logging to prevent API key exposure
    const sanitizedError = {
      status: error.status,
      code: error.code,
      type: error.type,
      message: error.message ? error.message.replace(/sk-[a-zA-Z0-9]{48}/g, '[REDACTED]') : 'Unknown error'
    };

    console.error('❌ School report generation error:', sanitizedError);

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many report generation requests. Please try again later.'
      });
    }

    if (error.status === 401) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'OpenAI API authentication failed. Please contact support.'
      });
    }

    if (error.status === 403) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access to OpenAI API is forbidden. Please contact support.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate school report. Please try again.'
    });
  }
});

// Market insights generation endpoint
router.post('/market-insights', validateOpenAIRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid request parameters',
        details: errors.array()
      });
    }

    const { 
      messages, 
      model = 'gpt-3.5-turbo-16k', 
      temperature = 0.7, 
      max_tokens = 3000 
    } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'OpenAI API key not configured on server'
      });
    }

    console.log('📈 Generating market insights:', {
      model,
      messageCount: messages.length
    });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    console.log('✅ Market insights generated:', {
      tokensUsed: completion.usage?.total_tokens
    });

    res.status(200).json({
      success: true,
      insights: completion.choices[0].message.content,
      usage: completion.usage,
      model: completion.model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Sanitize error logging to prevent API key exposure
    const sanitizedError = {
      status: error.status,
      code: error.code,
      type: error.type,
      message: error.message ? error.message.replace(/sk-[a-zA-Z0-9]{48}/g, '[REDACTED]') : 'Unknown error'
    };

    console.error('❌ Market insights generation error:', sanitizedError);

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many insights requests. Please try again later.'
      });
    }

    if (error.status === 401) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'OpenAI API authentication failed. Please contact support.'
      });
    }

    if (error.status === 403) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access to OpenAI API is forbidden. Please contact support.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate market insights. Please try again.'
    });
  }
});

// Learning paths generation endpoint
router.post('/learning-paths', validateOpenAIRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid request parameters',
        details: errors.array()
      });
    }

    const { 
      messages, 
      model = 'gpt-3.5-turbo-16k', 
      temperature = 0.7, 
      max_tokens = 3000 
    } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'OpenAI API key not configured on server'
      });
    }

    console.log('🎓 Generating learning paths:', {
      model,
      messageCount: messages.length
    });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    console.log('✅ Learning paths generated:', {
      tokensUsed: completion.usage?.total_tokens
    });

    res.status(200).json({
      success: true,
      learningPaths: completion.choices[0].message.content,
      usage: completion.usage,
      model: completion.model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Sanitize error logging to prevent API key exposure
    const sanitizedError = {
      status: error.status,
      code: error.code,
      type: error.type,
      message: error.message ? error.message.replace(/sk-[a-zA-Z0-9]{48}/g, '[REDACTED]') : 'Unknown error'
    };

    console.error('❌ Learning paths generation error:', sanitizedError);

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many learning path requests. Please try again later.'
      });
    }

    if (error.status === 401) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'OpenAI API authentication failed. Please contact support.'
      });
    }

    if (error.status === 403) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access to OpenAI API is forbidden. Please contact support.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate learning paths. Please try again.'
    });
  }
});

// Health check for OpenAI service
router.get('/health', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key not configured',
        service: 'OpenAI',
        status: 'unavailable',
        timestamp: new Date().toISOString()
      });
    }

    // Force a fresh health check
    const isHealthy = await validateApiKeyHealth();

    if (!isHealthy) {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key validation failed',
        service: 'OpenAI',
        status: 'unavailable',
        lastChecked: apiKeyHealthStatus.lastChecked,
        consecutiveFailures: apiKeyHealthStatus.consecutiveFailures,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'OpenAI service is operational',
      service: 'OpenAI',
      status: 'available',
      lastChecked: apiKeyHealthStatus.lastChecked,
      consecutiveFailures: apiKeyHealthStatus.consecutiveFailures,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Sanitize error logging to prevent API key exposure
    const sanitizedError = {
      status: error.status,
      code: error.code,
      type: error.type,
      message: error.message ? error.message.replace(/sk-[a-zA-Z0-9]{48}/g, '[REDACTED]') : 'Unknown error'
    };

    console.error('❌ OpenAI health check failed:', sanitizedError);
    
    res.status(500).json({
      success: false,
      message: 'OpenAI service health check failed',
      service: 'OpenAI',
      status: 'unavailable',
      lastChecked: apiKeyHealthStatus.lastChecked,
      consecutiveFailures: apiKeyHealthStatus.consecutiveFailures,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
