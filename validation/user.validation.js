const { z } = require('zod');

/**
 * Update profile validation schema
 */
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name required').max(50, 'Last name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  bio: z.string().max(500, 'Bio too long (max 500 chars)').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  timezone: z.string().optional(),
  language: z.string().length(2, 'Language code must be 2 characters').optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional()
  }).optional()
}).strict(); // Reject unknown fields

/**
 * Deactivate account validation
 */
const deactivateSchema = z.object({
  reason: z.string().min(1, 'Reason required').max(500, 'Reason too long').optional(),
  feedback: z.string().max(1000, 'Feedback too long').optional(),
  confirmPassword: z.string().min(1, 'Password confirmation required')
}).strict();

/**
 * Middleware to validate request body
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Sanitize input (remove null bytes, trim strings)
      const sanitized = sanitizeObject(req.body);
      schema.parse(sanitized);
      req.body = sanitized; // Use sanitized version
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

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}

/**
 * Sanitize individual value
 */
function sanitizeValue(value) {
  if (typeof value === 'string') {
    // Remove null bytes and trim
    return value.replace(/\0/g, '').trim();
  }
  return value;
}

module.exports = {
  validateUpdateProfile: validate(updateProfileSchema),
  validateDeactivate: validate(deactivateSchema)
};
