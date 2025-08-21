const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateStatus,
  logout
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, getMe);

// @route   PUT /api/auth/status
// @desc    Update user status (online, busy, away, offline)
// @access  Private
router.put('/status', authenticate, updateStatus);

// @route   POST /api/auth/logout
// @desc    Logout user (set status to offline)
// @access  Private
router.post('/logout', authenticate, logout);

module.exports = router;