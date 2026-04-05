const express = require('express');
const router = express.Router();
const { createFeedback, getMyFeedback, getAllFeedback, getFeedbackById, respondToFeedback, updateFeedbackStatus, deleteFeedback } = require('../controllers/feedback.controller');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createFeedbackValidation } = require('../validations/feedback.validation');

router.get('/my-feedback', protect, getMyFeedback);
router.post('/', protect, createFeedbackValidation, validate, createFeedback);

router.get('/', protect, authorize('admin', 'moderator'), getAllFeedback);
router.get('/:id', protect, getFeedbackById);
router.patch('/:id/respond', protect, authorize('admin', 'moderator'), respondToFeedback);
router.patch('/:id/status', protect, authorize('admin', 'moderator'), updateFeedbackStatus);
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

module.exports = router;
