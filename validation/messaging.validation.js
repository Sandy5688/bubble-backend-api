const { z } = require('zod');

/**
 * Email validation schema
 */
const emailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  body: z.string().min(1, 'Body is required').max(10000, 'Body too long'),
  from: z.string().email('Invalid from email').optional(),
  replyTo: z.string().email('Invalid reply-to email').optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string()
  })).optional()
});

/**
 * SMS validation schema
 */
const smsSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)'),
  message: z.string().min(1, 'Message is required').max(1600, 'Message too long (max 1600 chars)'),
  from: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid from phone number').optional()
});

/**
 * Middleware to validate request body against schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Validation failed',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = {
  validateEmail: validate(emailSchema),
  validateSMS: validate(smsSchema)
};
