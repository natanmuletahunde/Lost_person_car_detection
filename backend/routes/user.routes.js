const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, getDashboardStats } = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth');

router.get('/stats', protect, authorize('admin'), getDashboardStats);

router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.patch('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
