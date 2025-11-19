const csrf = require('csurf');
const cookieParser = require('cookie-parser');

/**
 * CSRF Protection Middleware
 * Disabled in test/development for easier testing
 * Enabled in production for security
 */

// Only enable CSRF in production
const shouldEnableCSRF = process.env.NODE_ENV === 'production' && process.env.ENABLE_CSRF === 'true';

// Cookie parser for CSRF tokens
const cookieParserMiddleware = cookieParser();

// CSRF protection (disabled in test/dev)
const csrfProtection = shouldEnableCSRF 
  ? csrf({ cookie: true })
  : (req, res, next) => {
      // Mock CSRF for non-production
      req.csrfToken = () => 'mock-csrf-token';
      next();
    };

// CSRF token getter
const getCsrfToken = (req, res) => {
  res.json({
    csrfToken: req.csrfToken()
  });
};

module.exports = {
  cookieParserMiddleware,
  csrfProtection,
  getCsrfToken
};
