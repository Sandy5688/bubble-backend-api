const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedisClient, isRedisHealthy } = require('../config/redis');

/**
 * Brute Force Protection for Authentication
 * Blocks IP addresses after too many failed login attempts
 */

// Strict rate limit for login attempts
const loginBruteForce = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    status: 'error',
    code: 429,
    message: 'Too many failed login attempts. Account temporarily locked. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis if available
  ...(isRedisHealthy() && {
    store: new RedisStore({
      client: getRedisClient(),
      prefix: 'rl:brute:login:'
    })
  })
});

// Password reset brute force protection
const passwordResetBruteForce = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: {
    status: 'error',
    code: 429,
    message: 'Too many password reset requests. Please try again in 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(isRedisHealthy() && {
    store: new RedisStore({
      client: getRedisClient(),
      prefix: 'rl:brute:reset:'
    })
  })
});

// Account creation brute force (prevent spam)
const signupBruteForce = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 account creations per IP per hour
  message: {
    status: 'error',
    code: 429,
    message: 'Too many account creation attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(isRedisHealthy() && {
    store: new RedisStore({
      client: getRedisClient(),
      prefix: 'rl:brute:signup:'
    })
  })
});

// 2FA verification brute force
const twoFactorBruteForce = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
  message: {
    status: 'error',
    code: 429,
    message: 'Too many 2FA verification attempts. Please try again in 15 minutes.'
  },
  ...(isRedisHealthy() && {
    store: new RedisStore({
      client: getRedisClient(),
      prefix: 'rl:brute:2fa:'
    })
  })
});

module.exports = {
  loginBruteForce,
  passwordResetBruteForce,
  signupBruteForce,
  twoFactorBruteForce
};
