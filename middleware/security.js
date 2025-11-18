const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: { 
    status: 'error',
    code: 429,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      code: 429,
      message: 'Too many requests, please try again later'
    });
  }
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 'error',
    code: 429,
    message: 'Too many authentication attempts, please try again later'
  },
  skipSuccessfulRequests: true
});

// Payment endpoint limiter
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: 'error',
    code: 429,
    message: 'Too many payment requests, please try again later'
  }
});

// AI endpoint limiter
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: 'error',
    code: 429,
    message: 'Too many AI requests, please try again later'
  }
});

// API key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const env = require('../config/env');
  
  if (!apiKey) {
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: 'API key is required'
    });
  }
  
  if (apiKey !== env.INTERNAL_API_KEY) {
    logger.warn(`Invalid API key attempt from IP: ${req.ip}`);
    return res.status(403).json({
      status: 'error',
      code: 403,
      message: 'Invalid API key'
    });
  }
  
  next();
};

// Setup security middleware on app
const setupSecurity = (app) => {
  // Apply general rate limiter to all routes
  app.use('/api/', generalLimiter);
  
  // Apply specific rate limiters (will be used in routes)
  app.set('authLimiter', authLimiter);
  app.set('paymentLimiter', paymentLimiter);
  app.set('aiLimiter', aiLimiter);
};

module.exports = {
  setupSecurity,
  generalLimiter,
  authLimiter,
  paymentLimiter,
  aiLimiter,
  validateApiKey
};
