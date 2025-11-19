const { z } = require('zod');

const extractTextSchema = z.object({
  input: z.string().min(1, 'Input is required').max(50000, 'Input too large'),
  format: z.enum(['text', 'json', 'markdown']).optional()
});

const analyzeImageSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  prompt: z.string().optional()
});

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
  validateExtractText: validate(extractTextSchema),
  validateAnalyzeImage: validate(analyzeImageSchema)
};
