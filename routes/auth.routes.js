const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/security');
const { loginBruteForce, passwordResetBruteForce, signupBruteForce } = require('../middleware/bruteForce.middleware');
const { auditLog, SENSITIVE_ACTIONS } = require('../middleware/auditLog.middleware');

/**
 * @route   POST /api/v1/auth/signup
 * @desc    User signup (with brute force protection & audit logging)
 * @access  Public
 */
router.post('/signup', 
  signupBruteForce, 
  auditLog(SENSITIVE_ACTIONS.ACCOUNT_CREATED, 'user'),
  authController.signUp  // Note: signUp not signup
);

/**
 * @route   POST /api/v1/auth/signin
 * @desc    User signin (with brute force protection)
 * @access  Public
 */
router.post('/signin', 
  loginBruteForce,
  authController.signIn  // Note: signIn not signin
);

/**
 * @route   POST /api/v1/auth/signout
 * @desc    User signout
 * @access  Public
 */
router.post('/signout', authLimiter, authController.signOut);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Request password reset (with brute force protection & audit logging)
 * @access  Public
 */
router.post('/reset-password', 
  passwordResetBruteForce,
  auditLog(SENSITIVE_ACTIONS.PASSWORD_CHANGED, 'user'),
  authController.resetPassword
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authLimiter, authController.refreshToken);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authController.getMe);

module.exports = router;
