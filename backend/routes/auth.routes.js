const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, logout, refreshToken } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { registerValidation, loginValidation, updateProfileValidation, changePasswordValidation } = require('../validations/auth.validation');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshToken);

router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfileValidation, validate, updateProfile);
router.patch('/change-password', protect, changePasswordValidation, validate, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
