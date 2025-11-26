const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { validateUpload } = require('./upload-validator');
const { createLogger } = require('../../config/monitoring');

const logger = createLogger('s3-presigned');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Generate presigned upload URL with enforced limits
 */
const generatePresignedUploadUrl = async (userId, filename, mimeType, fileSize) => {
  try {
    // Validate file
    const validation = validateUpload(filename, mimeType, fileSize);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const key = `uploads/${userId}/${Date.now()}-${filename}`;
    const bucket = process.env.AWS_S3_BUCKET;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType,
      // Enforce max size at S3 level
      ContentLength: fileSize,
      Metadata: {
        'uploaded-by': userId,
        'max-size': '10485760' // 10MB
      }
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300 // 5 minutes
    });

    logger.info('Presigned URL generated', { userId, filename, size: fileSize });

    return {
      url: presignedUrl,
      key,
      expiresIn: 300
    };
  } catch (error) {
    logger.error('Presigned URL generation failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  generatePresignedUploadUrl
};
