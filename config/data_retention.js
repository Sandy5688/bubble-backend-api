/**
 * Data Retention Policy Configuration
 * 
 * Defines how long different types of data should be retained
 * and when they should be purged or archived.
 */

module.exports = {
  /**
   * User Data Retention (in days)
   */
  USER_DATA: {
    // Keep user contact info for 7 years (tax/audit requirements)
    CONTACT_INFO: 365 * 7,
    
    // Keep login history for 1 year
    LOGIN_EVENTS: 365,
    
    // Keep inactive accounts for 3 years before archival
    INACTIVE_ACCOUNTS: 365 * 3,
  },

  /**
   * KYC Data Retention (in days)
   */
  KYC_DATA: {
    // Keep KYC documents for 90 days after verification
    DOCUMENTS: 90,
    
    // Keep KYC audit logs for 7 years (compliance)
    AUDIT_LOGS: 365 * 7,
    
    // Keep OTP codes for 30 days
    OTP_CODES: 30,
  },

  /**
   * Payment Data Retention (in days)
   */
  PAYMENT_DATA: {
    // Keep payment records for 7 years (tax requirements)
    TRANSACTIONS: 365 * 7,
    
    // Keep subscription history for 7 years
    SUBSCRIPTIONS: 365 * 7,
    
    // Keep billing consent records permanently
    BILLING_CONSENT: null, // null = permanent
  },

  /**
   * Session Data Retention (in days)
   */
  SESSION_DATA: {
    // Keep refresh tokens for 30 days after expiry
    REFRESH_TOKENS: 30,
    
    // Keep magic links for 1 day after expiry
    MAGIC_LINKS: 1,
  },

  /**
   * Deletion Request Grace Period (in days)
   */
  DELETION_GRACE_PERIOD: 30,

  /**
   * Archive Settings
   */
  ARCHIVE: {
    // Archive old data instead of deleting
    ENABLED: true,
    
    // Archive location (e.g., S3 cold storage)
    LOCATION: 'archive-bucket',
  },

  /**
   * GDPR Compliance
   */
  GDPR: {
    // Right to be forgotten - delete all user data
    RIGHT_TO_ERASURE: true,
    
    // Exceptions (data that cannot be deleted due to legal requirements)
    LEGAL_HOLD_TYPES: [
      'payment_transactions', // Tax requirements
      'kyc_audit_logs',       // Compliance requirements
      'billing_consent',      // Legal proof
    ],
  },
};
