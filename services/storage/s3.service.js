const AWS = require('aws-sdk');
const { createLogger } = require('../../config/monitoring');

const logger = createLogger('s3-service');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'bubble-kyc-documents';

/**
 * Generate presigned URL for upload
 */
const getPresignedUploadUrl = async (fileName, fileType, kycSessionId) => {
  try {
    const fileKey = `kyc/${kycSessionId}/${Date.now()}-${fileName}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      Expires: 300, // 5 minutes
      ServerSideEncryption: 'AES256'
    };

    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);

    logger.info('Presigned URL generated', { kycSessionId, fileKey });

    return {
      presignedUrl,
      fileKey,
      expiresIn: 300
    };
  } catch (error) {
    logger.error('Presigned URL generation failed', { error: error.message });
    throw error;
  }
};

/**
 * Generate presigned URL for download
 */
const getPresignedDownloadUrl = async (fileKey) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Expires: 3600 // 1 hour
    };

    const presignedUrl = await s3.getSignedUrlPromise('getObject', params);

    return presignedUrl;
  } catch (error) {
    logger.error('Download URL generation failed', { error: error.message });
    throw error;
  }
};

/**
 * Check if file exists
 */
const fileExists = async (fileKey) => {
  try {
    await s3.headObject({
      Bucket: BUCKET_NAME,
      Key: fileKey
    }).promise();
    
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

module.exports = {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  fileExists,
};
