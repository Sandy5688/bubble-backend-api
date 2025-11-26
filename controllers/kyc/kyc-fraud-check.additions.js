// ADD TO approveKYC method in controllers/kyc/kyc.controller.js

const fraudDetection = require('../../services/kyc/fraud-detection.service');

// BEFORE approving, run fraud checks:
const documents = await query(
  `SELECT ocr_extracted FROM kyc_documents 
   WHERE kyc_session_id = $1 AND ocr_status = 'done'`,
  [sessionId]
);

if (documents.rows.length > 0) {
  const ocrData = JSON.parse(documents.rows[0].ocr_extracted);
  
  // Check for duplicate documents
  const duplicateCheck = await fraudDetection.checkDuplicateID(
    ocrData.documentNumber,
    ocrData.documentType,
    userId
  );

  if (duplicateCheck.isDuplicate) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate document detected',
      reason: duplicateCheck.reason
    });
  }
}
