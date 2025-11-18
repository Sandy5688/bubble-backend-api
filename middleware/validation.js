const { z } = require('zod');

/**
 * Validation middleware using Zod
 */
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Check if any required field is missing
        const hasRequiredError = error.errors.some(err => 
          err.message.includes('Required') || err.code === 'invalid_type'
        );
        
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: hasRequiredError ? 'Required fields are missing' : 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      next(error);
    }
  };
};

/**
 * Validation schemas
 */
const schemas = {
  signup: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      name: z.string().min(2).max(100).optional(),
      full_name: z.string().optional()
    })
  }),
  
  signin: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required')
    })
  }),
  
  fileUpload: z.object({
    body: z.object({
      filename: z.string().min(1, 'Filename is required'),
      mime_type: z.string().min(1, 'MIME type is required')
    })
  }),
  
  paymentCreate: z.object({
    body: z.object({
      amount: z.number().positive('Amount is required and must be positive'),
      currency: z.string().min(3).max(3),
      description: z.string().optional()
    })
  }),
  
  aiExtract: z.object({
    body: z.object({
      input: z.string().min(1, 'Input is required'),
      model: z.string().optional()
    })
  })
};

module.exports = { validate, schemas };
