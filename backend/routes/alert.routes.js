const express = require('express');
const router = express.Router();
const { createAlert, getMyAlerts, getAllAlerts, markAsRead, markAllAsRead, dismissAlert, deleteAlert } = require('../controllers/alert.controller');
const { protect, authorize } = require('../middlewares/auth');

router.get('/my-alerts', protect, getMyAlerts);
router.post('/', protect, createAlert);
router.patch('/mark-all-read', protect, markAllAsRead);

router.get('/', protect, authorize('admin', 'moderator'), getAllAlerts);
router.patch('/:id/read', protect, markAsRead);
router.patch('/:id/dismiss', protect, dismissAlert);
router.delete('/:id', protect, deleteAlert);

module.exports = router;
