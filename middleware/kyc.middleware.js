const { query } = require('../config/database');
const { createLogger } = require('../config/monitoring');

const logger = createLogger('kyc-middleware');

/**
 * Require valid KYC for protected routes
 */
const requireValidKYC = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check KYC status
    const result = await query(
      `SELECT status, verified_at 
       FROM kyc_sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'KYC required',
        message: 'Please complete KYC verification to access this feature'
      });
    }

    const kycStatus = result.rows[0].status;

    if (kycStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        error: 'KYC not approved',
        message: `KYC status: ${kycStatus}. Approval required.`,
        kycStatus
      });
    }

    // KYC is valid - attach to request
    req.kycVerified = true;
    req.kycVerifiedAt = result.rows[0].verified_at;

    next();
  } catch (error) {
    logger.error('KYC check failed', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: 'KYC verification check failed'
    });
  }
};

module.exports = { requireValidKYC };
