const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Message content
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },

  // Message sender
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Which chatroom this message belongs to
  chatroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatroom',
    required: true
  },

  // Message type
  messageType: {
    type: String,
    enum: ['public', 'whisper', 'system', 'emoji-reaction'],
    default: 'public'
  },

  // For whisper messages - who it's directed to
  whisperTarget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Message status
  isDeleted: {
    type: Boolean,
    default: false
  },

  isEdited: {
    type: Boolean,
    default: false
  },

  editedAt: {
    type: Date,
    default: null
  },

  // Reactions system
  reactions: [{
    emoji: {
      type: String,
      required: true
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],

  // Premium features
  hasNeonEffect: {
    type: Boolean,
    default: false
  },

  neonColor: {
    type: String,
    default: null // Hex color for neon glow
  },

  // System tracking
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]

}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ chatroom: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ messageType: 1, chatroom: 1 });

// Virtual for reaction count
messageSchema.virtual('totalReactions').get(function() {
  return this.reactions.reduce((total, reaction) => total + reaction.users.length, 0);
});

// Method to add reaction
messageSchema.methods.addReaction = async function(userId, emoji) {
  // Find existing reaction with this emoji
  let reactionIndex = this.reactions.findIndex(r => r.emoji === emoji);

  if (reactionIndex === -1) {
    // Create new reaction
    this.reactions.push({
      emoji: emoji,
      users: [userId]
    });
  } else {
    // Check if user already reacted with this emoji
    const userIndex = this.reactions[reactionIndex].users.indexOf(userId);
    
    if (userIndex === -1) {
      // Add user to reaction
      this.reactions[reactionIndex].users.push(userId);
    } else {
      // Remove user reaction (toggle)
      this.reactions[reactionIndex].users.splice(userIndex, 1);
      
      // Remove reaction if no users left
      if (this.reactions[reactionIndex].users.length === 0) {
        this.reactions.splice(reactionIndex, 1);
      }
    }
  }

  return await this.save();
};

// Method to get public message data
messageSchema.methods.getPublicData = function() {
  return {
    id: this._id,
    content: this.content,
    sender: {
      id: this.sender._id || this.sender,
      username: this.sender.username,
      profilePicture: this.sender.profilePicture,
      status: this.sender.status
    },
    chatroom: this.chatroom,
    messageType: this.messageType,
    whisperTarget: this.whisperTarget,
    reactions: this.reactions,
    totalReactions: this.totalReactions,
    hasNeonEffect: this.hasNeonEffect,
    neonColor: this.neonColor,
    isEdited: this.isEdited,
    editedAt: this.editedAt,
    createdAt: this.createdAt
  };
};

// Static method to get recent messages for a chatroom
messageSchema.statics.getRecentMessages = async function(chatroomId, limit = 50) {
  return await this.find({
    chatroom: chatroomId,
    isDeleted: false
  })
  .populate('sender', 'username profilePicture status')
  .populate('whisperTarget', 'username')
  .sort({ createdAt: -1 })
  .limit(limit)
  .exec();
};

// Pre-save middleware to update chatroom's message count and last activity
messageSchema.post('save', async function(doc) {
  try {
    const Chatroom = mongoose.model('Chatroom');
    await Chatroom.findByIdAndUpdate(doc.chatroom, {
      $inc: { totalMessages: 1 },
      $set: { lastActivity: new Date() }
    });
  } catch (error) {
    console.error('Error updating chatroom stats:', error);
  }
});

module.exports = mongoose.model('Message', messageSchema);