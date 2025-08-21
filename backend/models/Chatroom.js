const mongoose = require('mongoose');

const chatroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chatroom name is required'],
    trim: true,
    minlength: [3, 'Chatroom name must be at least 3 characters'],
    maxlength: [30, 'Chatroom name cannot exceed 30 characters']
  },

  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: ''
  },

  // Chatroom category/topic
  topic: {
    type: String,
    enum: ['music', 'gaming', 'movies', 'art', 'travel', 'sports', 'food', 'books', 'technology', 'fashion', 'general', 'vibes'],
    default: 'general'
  },

  // Visual theme for neon effects
  neonTheme: {
    primaryColor: {
      type: String,
      default: '#FF00FF' // Hot pink
    },
    secondaryColor: {
      type: String,
      default: '#00FFFF' // Cyan
    },
    backgroundGradient: {
      type: String,
      default: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)'
    }
  },

  // Room creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Current active users in the room
  activeUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],

  // Room settings
  isPrivate: {
    type: Boolean,
    default: false
  },

  maxUsers: {
    type: Number,
    default: 100,
    min: 2,
    max: 500
  },

  // Moderation
  allowWhispers: {
    type: Boolean,
    default: true
  },

  allowEmojis: {
    type: Boolean,
    default: true
  },

  // Premium features
  isPremiumRoom: {
    type: Boolean,
    default: false
  },

  // Room activity tracking
  totalMessages: {
    type: Number,
    default: 0
  },

  lastActivity: {
    type: Date,
    default: Date.now
  },

  // Room status
  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// Index for efficient queries
chatroomSchema.index({ topic: 1, isActive: 1 });
chatroomSchema.index({ createdBy: 1 });
chatroomSchema.index({ 'activeUsers.user': 1 });

// Virtual for current user count
chatroomSchema.virtual('currentUserCount').get(function() {
  return this.activeUsers.length;
});

// Method to add user to room
chatroomSchema.methods.addUser = async function(userId) {
  // Check if user is already in room
  const existingUser = this.activeUsers.find(
    activeUser => activeUser.user.toString() === userId.toString()
  );

  if (!existingUser) {
    this.activeUsers.push({
      user: userId,
      joinedAt: new Date(),
      lastSeen: new Date()
    });
    
    this.lastActivity = new Date();
    return await this.save();
  }

  return this;
};

// Method to remove user from room
chatroomSchema.methods.removeUser = async function(userId) {
  this.activeUsers = this.activeUsers.filter(
    activeUser => activeUser.user.toString() !== userId.toString()
  );

  this.lastActivity = new Date();
  return await this.save();
};

// Method to update user's last seen
chatroomSchema.methods.updateUserLastSeen = async function(userId) {
  const userIndex = this.activeUsers.findIndex(
    activeUser => activeUser.user.toString() === userId.toString()
  );

  if (userIndex !== -1) {
    this.activeUsers[userIndex].lastSeen = new Date();
    this.lastActivity = new Date();
    return await this.save();
  }

  return this;
};

// Method to get room info for client
chatroomSchema.methods.getPublicInfo = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    topic: this.topic,
    neonTheme: this.neonTheme,
    currentUserCount: this.currentUserCount,
    maxUsers: this.maxUsers,
    allowWhispers: this.allowWhispers,
    allowEmojis: this.allowEmojis,
    isPremiumRoom: this.isPremiumRoom,
    lastActivity: this.lastActivity,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Chatroom', chatroomSchema);