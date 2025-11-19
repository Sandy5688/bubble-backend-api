const NodeClam = require('clamscan');
const env = require('../config/env');
const fs = require('fs').promises;

let clamScanner = null;
let isClamAvailable = false;

/**
 * Initialize ClamAV scanner
 */
async function initClamAV() {
  if (!env.ENABLE_ANTIVIRUS_SCAN || env.ENABLE_ANTIVIRUS_SCAN === 'false') {
    console.log('ℹ️  Antivirus scanning disabled');
    return null;
  }

  try {
    clamScanner = await new NodeClam().init({
      removeInfected: true, // Automatically remove infected files
      quarantineInfected: false,
      scanLog: null,
      debugMode: env.NODE_ENV === 'development',
      clamdscan: {
        host: env.CLAMAV_HOST || 'localhost',
        port: env.CLAMAV_PORT || 3310,
        timeout: 60000,
        localFallback: false
      }
    });

    // Test if ClamAV is running
    const version = await clamScanner.getVersion();
    console.log(`✅ ClamAV initialized: ${version}`);
    isClamAvailable = true;
    
    return clamScanner;
  } catch (error) {
    console.warn('⚠️  ClamAV not available:', error.message);
    console.warn('⚠️  File uploads will proceed WITHOUT virus scanning!');
    isClamAvailable = false;
    return null;
  }
}

/**
 * Scan file for viruses
 * @param {string} filePath - Path to file to scan
 * @returns {Promise<{isInfected: boolean, viruses: string[]}>}
 */
async function scanFile(filePath) {
  // If ClamAV not initialized, try to initialize
  if (!clamScanner && !isClamAvailable) {
    await initClamAV();
  }

  // If still not available, skip scanning (with warning)
  if (!clamScanner) {
    console.warn(`⚠️  Skipping virus scan for ${filePath} - ClamAV unavailable`);
    return {
      isInfected: false,
      viruses: [],
      skipped: true
    };
  }

  try {
    const { isInfected, viruses } = await clamScanner.isInfected(filePath);

    if (isInfected) {
      console.error(`🦠 VIRUS DETECTED in ${filePath}:`, viruses);
      
      // Delete infected file
      try {
        await fs.unlink(filePath);
        console.log(`✅ Infected file deleted: ${filePath}`);
      } catch (err) {
        console.error(`Failed to delete infected file: ${err.message}`);
      }
    }

    return {
      isInfected,
      viruses: viruses || [],
      skipped: false
    };
  } catch (error) {
    console.error('Virus scan error:', error);
    // On scan error, be cautious - treat as potentially infected
    return {
      isInfected: false,
      viruses: [],
      error: error.message,
      skipped: false
    };
  }
}

/**
 * Middleware to scan uploaded files
 */
const scanUploadedFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const scanResult = await scanFile(req.file.path);

    if (scanResult.isInfected) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'File upload rejected: Virus detected',
        viruses: scanResult.viruses
      });
    }

    if (scanResult.error && !scanResult.skipped) {
      console.error('Scan error - rejecting upload as precaution');
      return res.status(500).json({
        status: 'error',
        code: 500,
        message: 'File could not be scanned for viruses. Upload rejected as precaution.'
      });
    }

    // File is clean, continue
    next();
  } catch (error) {
    console.error('Antivirus middleware error:', error);
    // On critical error, reject upload as precaution
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'File upload security check failed'
    });
  }
};

module.exports = {
  initClamAV,
  scanFile,
  scanUploadedFile,
  isClamAvailable: () => isClamAvailable
};
