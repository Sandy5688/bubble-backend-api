// ADD TO controllers/kyc/kyc.controller.js

const { encrypt, decrypt } = require('../../utils/encryption');

// In uploadDocument method, AFTER storing document:
// Encrypt sensitive OCR data before storing
if (ocrData && ocrData.documentNumber) {
  ocrData.documentNumber = encrypt(ocrData.documentNumber);
}
if (ocrData && ocrData.dateOfBirth) {
  ocrData.dateOfBirth = encrypt(ocrData.dateOfBirth);
}

// When retrieving OCR data in getKYCSession:
if (doc.ocr_extracted) {
  const ocrData = JSON.parse(doc.ocr_extracted);
  if (ocrData.documentNumber) {
    ocrData.documentNumber = decrypt(ocrData.documentNumber);
  }
  if (ocrData.dateOfBirth) {
    ocrData.dateOfBirth = decrypt(ocrData.dateOfBirth);
  }
  doc.ocr_extracted = ocrData;
}
