const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register, login, getMe, forgotPassword, resetPassword, changePassword,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/change-password', protect, changePassword);

module.exports = router;
