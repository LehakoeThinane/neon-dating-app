const Chatroom = require('../models/Chatroom');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all active chatrooms
// @route   GET /api/chat/rooms
// @access  Private
const getChatrooms = async (req, res) => {
  try {
    const rooms = await Chatroom.find({ isActive: true })
      .populate('createdBy', 'username')
      .populate('activeUsers.user', 'username status')
      .sort({ lastActivity: -1 })
      .limit(50);

    const roomsData = rooms.map(room => room.getPublicInfo());

    res.json({
      success: true,
      chatrooms: roomsData
    });
  } catch (error) {
    console.error('Get chatrooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chatrooms 🔧'
    });
  }
};

// @desc    Create new chatroom
// @route   POST /api/chat/rooms
// @access  Private
const createChatroom = async (req, res) => {
  try {
    const { name, description, topic, neonTheme, isPrivate, maxUsers } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!name || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Room name and topic are required ✨'
      });
    }

    // Check if room name already exists
    const existingRoom = await Chatroom.findOne({ 
      name: { $regex: new RegExp(name, 'i') },
      isActive: true 
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room name already exists! Try another one 🎭'
      });
    }

    // Create new chatroom
    const newRoom = new Chatroom({
      name: name.trim(),
      description: description || '',
      topic,
      neonTheme: neonTheme || {},
      createdBy: userId,
      isPrivate: isPrivate || false,
      maxUsers: maxUsers || 100,
      activeUsers: [{
        user: userId,
        joinedAt: new Date(),
        lastSeen: new Date()
      }]
    });

    await newRoom.save();
    
    // Populate creator info
    await newRoom.populate('createdBy', 'username');
    await newRoom.populate('activeUsers.user', 'username status');

    res.status(201).json({
      success: true,
      message: `Chatroom "${name}" created successfully! 🌈`,
      chatroom: newRoom.getPublicInfo()
    });

  } catch (error) {
    console.error('Create chatroom error:', error);
    
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
      message: 'Error creating chatroom 🔧'
    });
  }
};

// @desc    Join a chatroom
// @route   POST /api/chat/rooms/:roomId/join
// @access  Private
const joinChatroom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    const room = await Chatroom.findById(roomId);
    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Chatroom not found 👻'
      });
    }

    // Check if room is full
    if (room.activeUsers.length >= room.maxUsers) {
      return res.status(400).json({
        success: false,
        message: 'Chatroom is full! Try another one 🏠'
      });
    }

    // Add user to room
    await room.addUser(userId);
    await room.populate('activeUsers.user', 'username status profilePicture');

    res.json({
      success: true,
      message: `Welcome to ${room.name}! 🎉`,
      chatroom: room.getPublicInfo()
    });

  } catch (error) {
    console.error('Join chatroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining chatroom 🔧'
    });
  }
};

// @desc    Leave a chatroom
// @route   POST /api/chat/rooms/:roomId/leave
// @access  Private
const leaveChatroom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    const room = await Chatroom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chatroom not found 👻'
      });
    }

    await room.removeUser(userId);

    res.json({
      success: true,
      message: `Left ${room.name} successfully! 👋`
    });

  } catch (error) {
    console.error('Leave chatroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving chatroom 🔧'
    });
  }
};

// @desc    Get messages from a chatroom
// @route   GET /api/chat/rooms/:roomId/messages
// @access  Private
const getChatroomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    // Check if user is in the chatroom
    const room = await Chatroom.findById(roomId);
    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Chatroom not found 👻'
      });
    }

    const isUserInRoom = room.activeUsers.some(
      activeUser => activeUser.user.toString() === req.user.userId.toString()
    );

    if (!isUserInRoom) {
      return res.status(403).json({
        success: false,
        message: 'You must join the chatroom first 🚪'
      });
    }

    // Build query
    let query = {
      chatroom: roomId,
      isDeleted: false
    };

    // Add pagination
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username profilePicture status')
      .populate('whisperTarget', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Reverse to show oldest first
    messages.reverse();

    res.json({
      success: true,
      messages: messages.map(msg => msg.getPublicData())
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages 🔧'
    });
  }
};

// @desc    Send a message (handled primarily through Socket.io)
// @route   POST /api/chat/rooms/:roomId/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, messageType = 'public', whisperTarget, hasNeonEffect, neonColor } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required ✨'
      });
    }

    // Verify user is in chatroom
    const room = await Chatroom.findById(roomId);
    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Chatroom not found 👻'
      });
    }

    const isUserInRoom = room.activeUsers.some(
      activeUser => activeUser.user.toString() === userId.toString()
    );

    if (!isUserInRoom) {
      return res.status(403).json({
        success: false,
        message: 'You must join the chatroom first 🚪'
      });
    }

    // Create message
    const newMessage = new Message({
      content: content.trim(),
      sender: userId,
      chatroom: roomId,
      messageType,
      whisperTarget: whisperTarget || null,
      hasNeonEffect: hasNeonEffect || false,
      neonColor: neonColor || null
    });

    await newMessage.save();
    await newMessage.populate('sender', 'username profilePicture status');
    
    if (whisperTarget) {
      await newMessage.populate('whisperTarget', 'username');
    }

    // Update user's last seen in chatroom
    await room.updateUserLastSeen(userId);

    res.status(201).json({
      success: true,
      message: newMessage.getPublicData()
    });

  } catch (error) {
    console.error('Send message error:', error);
    
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
      message: 'Error sending message 🔧'
    });
  }
};

// @desc    Add reaction to message
// @route   POST /api/chat/messages/:messageId/react
// @access  Private
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required ✨'
      });
    }

    const message = await Message.findById(messageId);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found 👻'
      });
    }

    await message.addReaction(userId, emoji);
    await message.populate('sender', 'username profilePicture status');

    res.json({
      success: true,
      message: message.getPublicData()
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reaction 🔧'
    });
  }
};

module.exports = {
  getChatrooms,
  createChatroom,
  joinChatroom,
  leaveChatroom,
  getChatroomMessages,
  sendMessage,
  addReaction
};