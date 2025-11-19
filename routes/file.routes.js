const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const { upload, validateFile } = require('../middleware/fileValidation');
const { uploadLimiter } = require('../middleware/security');
const { scanUploadedFile } = require('../utils/antivirusScanner');

/**
 * @route   POST /api/v1/files/upload
 * @desc    Upload file (with validation & antivirus scanning)
 * @access  Private
 */
router.post('/upload', 
  uploadLimiter,
  upload.single('file'), 
  validateFile,
  scanUploadedFile, // Antivirus scan
  fileController.uploadFile
);

/**
 * @route   POST /api/v1/files/upload-url
 * @desc    Get pre-signed URL for direct S3 upload
 * @access  Private
 */
router.post('/upload-url', uploadLimiter, fileController.getUploadUrl);

/**
 * @route   POST /api/v1/files/confirm
 * @desc    Confirm file upload completion
 * @access  Private
 */
router.post('/confirm', fileController.confirmUpload);

/**
 * @route   GET /api/v1/files/:fileId
 * @desc    Get file metadata
 * @access  Private
 */
router.get('/:fileId', fileController.getFile);

/**
 * @route   GET /api/v1/files/:fileId/download
 * @desc    Get file download URL
 * @access  Private
 */
router.get('/:fileId/download', fileController.getDownloadUrl);

/**
 * @route   GET /api/v1/files
 * @desc    List user's files
 * @access  Private
 */
router.get('/', fileController.listFiles);

/**
 * @route   DELETE /api/v1/files/:fileId
 * @desc    Delete file
 * @access  Private
 */
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;
