const { body } = require('express-validator');

const createFeedbackValidation = [
  body('type')
    .notEmpty()
    .withMessage('Feedback type is required')
    .isIn(['bug', 'feature', 'general', 'complaint'])
    .withMessage('Invalid feedback type'),
  
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
];

module.exports = { createFeedbackValidation };
