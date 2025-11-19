const csrf = require('csurf');

/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

// CSRF protection for forms (cookie-based)
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

/**
 * Middleware to attach CSRF token to response
 */
const attachCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

/**
 * API endpoint to get CSRF token
 */
const getCsrfToken = (req, res) => {
  res.json({ 
    csrfToken: req.csrfToken() 
  });
};

module.exports = {
  csrfProtection,
  attachCsrfToken,
  getCsrfToken
};
