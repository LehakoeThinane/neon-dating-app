const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

// Basic test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🌈 Neon Dating API is running!', 
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      chat: '/api/chat',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/me',
      chatrooms: 'GET /api/chat/rooms',
      createRoom: 'POST /api/chat/rooms'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME
    });
    console.log('🔥 MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 5001;

const startServer = async () => {
  await connectDB();
  
  // Start HTTP server
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
  });
  
  // Start Socket.io server on different port
  const socketServer = http.createServer();
  const socketIO = socketIo(socketServer, {
    cors: {
      origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ["http://localhost:8081"],
      methods: ["GET", "POST"]
    }
  });
  
  // Socket handler
  const socketHandler = require('./utils/socketHandler');
  const socketHandlerInstance = socketHandler(socketIO);
  
  socketServer.listen(SOCKET_PORT, () => {
    console.log(`💫 Socket.io server running on port ${SOCKET_PORT}`);
    console.log('💫 Ready to build something amazing!');
  });
};

startServer();