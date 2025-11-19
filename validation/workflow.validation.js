const { z } = require('zod');

const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  steps: z.array(z.object({
    action: z.string(),
    config: z.record(z.any())
  })).min(1, 'At least one step required')
});

const executeWorkflowSchema = z.object({
  input: z.record(z.any()).optional()
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
  validateCreateWorkflow: validate(createWorkflowSchema),
  validateExecuteWorkflow: validate(executeWorkflowSchema)
};
