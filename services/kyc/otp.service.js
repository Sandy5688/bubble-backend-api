const crypto = require('crypto');
const { query } = require('../../config/database');
const { createLogger } = require('../../config/monitoring');

const logger = createLogger('otp-service');

// Twilio setup (if credentials exist)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// SendGrid setup (if credentials exist)
let sgMail = null;
if (process.env.SENDGRID_API_KEY) {
  sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP for storage
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Send OTP via SMS
 */
const sendSMS = async (phoneNumber, otp, kycSessionId) => {
  try {
    if (!twilioClient) {
      logger.warn('Twilio not configured, OTP not sent');
      return { success: false, message: 'SMS service not configured' };
    }

    const message = `Your Bubble verification code is ${otp}. This code is valid for 10 minutes. If you did not request this, contact support immediately.`;

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    logger.info('OTP SMS sent', { kycSessionId, phoneNumber: phoneNumber.slice(-4) });
    return { success: true };
  } catch (error) {
    logger.error('SMS send failed', { error: error.message });
    throw error;
  }
};

/**
 * Send OTP via Email
 */
const sendEmail = async (email, otp, kycSessionId) => {
  try {
    if (!sgMail) {
      logger.warn('SendGrid not configured, OTP not sent');
      return { success: false, message: 'Email service not configured' };
    }

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@bubble.com',
      subject: 'Your Bubble Verification Code',
      text: `Your verification code is ${otp}. This code is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verification Code</h2>
          <p>Your Bubble verification code is:</p>
          <h1 style="background: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p>This code is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not request this code, please contact support immediately.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };

    await sgMail.send(msg);

    logger.info('OTP email sent', { kycSessionId, email });
    return { success: true };
  } catch (error) {
    logger.error('Email send failed', { error: error.message });
    throw error;
  }
};

/**
 * Create and send OTP
 */
const createAndSendOTP = async (kycSessionId, userId, method, destination) => {
  try {
    // Rate limiting check
    const recentAttempts = await query(
      `SELECT COUNT(*) as count FROM otp_codes 
       WHERE kyc_session_id = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [kycSessionId]
    );

    if (parseInt(recentAttempts.rows[0].count) >= 5) {
      throw new Error('Too many OTP requests. Please try again later.');
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    // Store OTP
    await query(
      `INSERT INTO otp_codes (kyc_session_id, user_id, otp_hash, method, destination, expires_at, attempts, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '10 minutes', 0, NOW())`,
      [kycSessionId, userId, otpHash, method, destination]
    );

    // Send OTP
    if (method === 'sms') {
      await sendSMS(destination, otp, kycSessionId);
    } else if (method === 'email') {
      await sendEmail(destination, otp, kycSessionId);
    }

    // Log audit
    await query(
      `INSERT INTO kyc_audit_logs (kyc_session_id, user_id, action, details, timestamp)
       VALUES ($1, $2, 'otp_sent', $3, NOW())`,
      [kycSessionId, userId, JSON.stringify({ method, destination: destination.slice(-4) })]
    );

    logger.info('OTP created and sent', { kycSessionId, method });

    return { success: true, message: `OTP sent via ${method}` };
  } catch (error) {
    logger.error('OTP creation failed', { error: error.message });
    throw error;
  }
};

/**
 * Verify OTP
 */
const verifyOTP = async (kycSessionId, userId, otp) => {
  try {
    const otpHash = hashOTP(otp);

    // Get latest OTP for this session
    const result = await query(
      `SELECT * FROM otp_codes 
       WHERE kyc_session_id = $1 AND user_id = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [kycSessionId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('No OTP found for this session');
    }

    const otpRecord = result.rows[0];

    // Check if expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      throw new Error('OTP expired');
    }

    // Check attempt limit
    if (otpRecord.attempts >= 5) {
      throw new Error('Too many failed attempts');
    }

    // Increment attempts
    await query(
      `UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1`,
      [otpRecord.id]
    );

    // Verify OTP
    if (otpRecord.otp_hash !== otpHash) {
      throw new Error('Invalid OTP');
    }

    // Mark OTP as verified
    await query(
      `UPDATE otp_codes SET verified_at = NOW() WHERE id = $1`,
      [otpRecord.id]
    );

    // Update KYC session
    await query(
      `UPDATE kyc_sessions SET otp_verified = TRUE, updated_at = NOW() WHERE id = $1`,
      [kycSessionId]
    );

    // Log audit
    await query(
      `INSERT INTO kyc_audit_logs (kyc_session_id, user_id, action, details, timestamp)
       VALUES ($1, $2, 'otp_verified', '{}', NOW())`,
      [kycSessionId, userId]
    );

    logger.info('OTP verified successfully', { kycSessionId });

    return { success: true, message: 'OTP verified' };
  } catch (error) {
    logger.error('OTP verification failed', { error: error.message, kycSessionId });
    throw error;
  }
};

module.exports = {
  createAndSendOTP,
  verifyOTP,
};
