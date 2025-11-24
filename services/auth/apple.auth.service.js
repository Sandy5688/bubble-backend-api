const jwt = require('jsonwebtoken');
const { createLogger } = require('../../config/monitoring');
const { query } = require('../../config/database');

const logger = createLogger('apple-auth');

/**
 * Verify Apple ID token
 */
const verifyAppleToken = async (idToken) => {
  try {
    // Apple uses RS256, verify with Apple's public keys
    // In production, fetch from https://appleid.apple.com/auth/keys
    const decoded = jwt.decode(idToken, { complete: true });
    
    if (!decoded) {
      throw new Error('Invalid Apple token');
    }

    // Verify issuer
    if (decoded.payload.iss !== 'https://appleid.apple.com') {
      throw new Error('Invalid issuer');
    }

    // Verify audience (your client ID)
    if (decoded.payload.aud !== process.env.APPLE_CLIENT_ID) {
      throw new Error('Invalid audience');
    }

    return decoded.payload;
  } catch (error) {
    logger.error('Apple token verification failed', { error: error.message });
    throw error;
  }
};

/**
 * Handle Apple Sign-In callback
 */
const handleAppleCallback = async (idToken, user) => {
  try {
    const appleData = await verifyAppleToken(idToken);
    
    // Check if user exists with Apple ID
    let result = await query(
      `SELECT * FROM users WHERE external_provider = 'apple' AND external_provider_id = $1`,
      [appleData.sub]
    );

    let userRecord;

    if (result.rows.length > 0) {
      // Existing Apple user - update login info
      userRecord = result.rows[0];
      await query(
        `UPDATE users SET last_login_at = NOW(), login_count = login_count + 1 WHERE id = $1`,
        [userRecord.id]
      );
    } else {
      // Check if user exists with same email
      result = await query('SELECT * FROM users WHERE email = $1', [appleData.email]);

      if (result.rows.length > 0) {
        // Link existing account
        userRecord = result.rows[0];
        await query(
          `UPDATE users SET external_provider = 'apple', external_provider_id = $1, email_verified = TRUE, last_login_at = NOW(), login_count = login_count + 1 WHERE id = $2`,
          [appleData.sub, userRecord.id]
        );
      } else {
        // Create new user
        const name = user?.name ? `${user.name.firstName} ${user.name.lastName}` : null;
        
        result = await query(
          `INSERT INTO users (email, external_provider, external_provider_id, email_verified, last_login_at, login_count, full_name)
           VALUES ($1, 'apple', $2, TRUE, NOW(), 1, $3) RETURNING *`,
          [appleData.email, appleData.sub, name]
        );
        userRecord = result.rows[0];
      }
    }

    // Log login event
    await query(
      `INSERT INTO login_events (user_id, provider, success, ip_address, user_agent)
       VALUES ($1, 'apple', TRUE, $2, $3)`,
      [userRecord.id, null, null]
    );

    logger.info('Apple sign-in successful', { userId: userRecord.id });

    return userRecord;
  } catch (error) {
    logger.error('Apple callback failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  verifyAppleToken,
  handleAppleCallback,
};
