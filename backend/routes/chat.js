const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getChatrooms,
  createChatroom,
  joinChatroom,
  leaveChatroom,
  getChatroomMessages,
  sendMessage,
  addReaction
} = require('../controllers/chatController');

// All chat routes require authentication
router.use(authenticate);

// Chatroom routes
router.get('/rooms', getChatrooms);
router.post('/rooms', createChatroom);
router.post('/rooms/:roomId/join', joinChatroom);
router.post('/rooms/:roomId/leave', leaveChatroom);

// Message routes
router.get('/rooms/:roomId/messages', getChatroomMessages);
router.post('/rooms/:roomId/messages', sendMessage);

// Reaction routes
router.post('/messages/:messageId/react', addReaction);

module.exports = router;