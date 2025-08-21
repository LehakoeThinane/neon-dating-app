const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, password, age, gender, interestedIn, bio, interests } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken! Try another one 🎭'
      });
    }

    // Validate required fields
    if (!username || !password || !age || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields ✨'
      });
    }

    // Create new user
    const newUser = new User({
      username: username.toLowerCase(),
      password, // Will be hashed automatically by pre-save middleware
      age,
      gender,
      interestedIn: interestedIn || ['everyone'],
      bio: bio || '',
      interests: interests || []
    });

    // Save user to database
    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    // Return success response (don't send password!)
    res.status(201).json({
      success: true,
      message: `Welcome to the Neon Dating revolution, ${newUser.username}! 🌈`,
      token,
      user: newUser.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again! 🔧'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password ✨'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials! Check your username 🔍'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Contact support 📞'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials! Check your password 🔒'
      });
    }

    // Update last seen and status
    user.lastSeen = new Date();
    user.status = 'online';
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Welcome back, ${user.username}! Ready to make connections? 💫`,
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again! 🔧'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private (requires token)
const getMe = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found 👻'
      });
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile 🔧'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/auth/status
// @access  Private
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['online', 'busy', 'away', 'offline'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use: online, busy, away, or offline 📱'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found 👻'
      });
    }

    user.status = status;
    user.lastSeen = new Date();
    await user.save();

    res.json({
      success: true,
      message: `Status updated to ${status} ✨`,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status 🔧'
    });
  }
};

// @desc    Logout user (update status to offline)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.status = 'offline';
      user.lastSeen = new Date();
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully! See you soon! 👋'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout 🔧'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateStatus,
  logout
};