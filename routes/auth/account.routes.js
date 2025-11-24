const express = require('express');
const router = express.Router();
const accountController = require('../../controllers/auth/account.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// All account deletion routes require authentication

/**
 * @route   POST /api/v1/account/delete/request
 * @desc    Request account deletion (30-day grace period)
 * @access  Private
 */
router.post('/delete/request', authenticate, accountController.requestAccountDeletion);

/**
 * @route   POST /api/v1/account/delete/cancel
 * @desc    Cancel pending account deletion
 * @access  Private
 */
router.post('/delete/cancel', authenticate, accountController.cancelAccountDeletion);

/**
 * @route   DELETE /api/v1/account/delete/immediate
 * @desc    Immediately and permanently delete account
 * @access  Private
 */
router.delete('/delete/immediate', authenticate, accountController.deleteAccountImmediately);

/**
 * @route   GET /api/v1/account/delete/status
 * @desc    Get account deletion status
 * @access  Private
 */
router.get('/delete/status', authenticate, accountController.getDeletionStatus);

module.exports = router;
