const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Authentication
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // Profile Information (Mxit Style)
  profilePicture: {
    type: String,
    default: null // URL to profile image
  },

  status: {
    type: String,
    enum: ['online', 'busy', 'away', 'offline'],
    default: 'offline'
  },

  bio: {
    type: String,
    maxlength: [140, 'Bio cannot exceed 140 characters'],
    default: ''
  },

  interests: [{
    type: String,
    enum: ['music', 'gaming', 'art', 'travel', 'movies', 'sports', 'food', 'books', 'technology', 'fashion']
  }],

  // Dating App Specific Fields
  age: {
    type: Number,
    min: [18, 'Must be at least 18 years old'],
    max: [100, 'Invalid age']
  },

  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer-not-to-say']
  },

  interestedIn: [{
    type: String,
    enum: ['male', 'female', 'non-binary', 'everyone']
  }],

  // App Features
  molaBalance: {
    type: Number,
    default: 50 // Starting Mola balance
  },

  connectionQuiz: [{
    question: {
      type: String,
      maxlength: 200
    },
    options: [{
      type: String,
      maxlength: 100
    }],
    correctAnswer: {
      type: Number, // Index of correct answer (0-3)
      min: 0,
      max: 3
    }
  }],

  // System Fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lastSeen: {
    type: Date,
    default: Date.now
  },

  joinedAt: {
    type: Date,
    default: Date.now
  },

  // Premium Features
  subscription: {
    type: {
      type: String,
      enum: ['free', 'mola_pass', 'mola_gold', 'mola_black'],
      default: 'free'
    },
    expiresAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's new or modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

// Get public profile (hide sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    profilePicture: this.profilePicture,
    status: this.status,
    bio: this.bio,
    interests: this.interests,
    age: this.age,
    joinedAt: this.joinedAt,
    lastSeen: this.lastSeen
  };
};

// Check if user has premium subscription
userSchema.methods.isPremium = function() {
  if (this.subscription.type === 'free') return false;
  if (!this.subscription.expiresAt) return false;
  return new Date() < this.subscription.expiresAt;
};

module.exports = mongoose.model('User', userSchema);