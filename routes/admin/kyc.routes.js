const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../../middleware/auth.middleware');
const { query } = require('../../config/database');
const { createLogger } = require('../../config/monitoring');

const logger = createLogger('admin-kyc-routes');

// Admin authentication required
router.use(authenticateAdmin);

/**
 * Approve KYC session
 */
router.post('/kyc/:sessionId/approve', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;

    // Update session status
    await query(
      `UPDATE kyc_sessions 
       SET status = 'approved', 
           verified_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [sessionId]
    );

    // Audit log
    await query(
      `INSERT INTO kyc_audit_logs (kyc_session_id, action, details, timestamp)
       VALUES ($1, 'admin_approved', $2, NOW())`,
      [sessionId, JSON.stringify({ notes, admin: req.adminEmail })]
    );

    logger.info('KYC approved by admin', { sessionId, admin: req.adminEmail });

    res.json({ success: true, message: 'KYC approved' });
  } catch (error) {
    logger.error('Admin KYC approval failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Reject KYC session
 */
router.post('/kyc/:sessionId/reject', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, error: 'Reason required' });
    }

    // Update session status
    await query(
      `UPDATE kyc_sessions 
       SET status = 'rejected', 
           rejection_reason = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [sessionId, reason]
    );

    // Audit log
    await query(
      `INSERT INTO kyc_audit_logs (kyc_session_id, action, details, timestamp)
       VALUES ($1, 'admin_rejected', $2, NOW())`,
      [sessionId, JSON.stringify({ reason, admin: req.adminEmail })]
    );

    logger.info('KYC rejected by admin', { sessionId, admin: req.adminEmail });

    res.json({ success: true, message: 'KYC rejected' });
  } catch (error) {
    logger.error('Admin KYC rejection failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
