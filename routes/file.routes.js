const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const { upload, validateFile } = require('../middleware/fileValidation');

router.post('/upload', upload.single('file'), validateFile, fileController.uploadFile);
router.post('/upload-url', fileController.getUploadUrl);
router.post('/confirm', fileController.confirmUpload);
router.get('/:fileId', fileController.getFile);
router.get('/:fileId/download', fileController.getDownloadUrl);
router.get('/', fileController.listFiles);
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;
