const { body } = require('express-validator');

const reportSightingValidation = [
  body('type')
    .notEmpty()
    .withMessage('Sighting type is required')
    .isIn(['person', 'vehicle'])
    .withMessage('Type must be either person or vehicle'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must contain longitude and latitude'),
  
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Address cannot exceed 300 characters'),
];

const updateSightingValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'reviewed', 'confirmed', 'resolved'])
    .withMessage('Invalid status'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
];

module.exports = {
  reportSightingValidation,
  updateSightingValidation,
};
