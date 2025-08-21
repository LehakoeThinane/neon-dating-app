const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chatroom = require('../models/Chatroom');
const Message = require('../models/Message');

// Store active connections
const activeConnections = new Map();

const socketHandler = (io) => {
  io.on('connection', async (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // Authenticate user when they connect
    socket.on('authenticate', async (token) => {
      try {
        if (!token) {
          socket.emit('auth_error', { message: 'No token provided' });
          return;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
          socket.emit('auth_error', { message: 'Invalid token or user not found' });
          return;
        }

        // Store user info in socket
        socket.userId = user._id.toString();
        socket.username = user.username;

        // Store connection
        activeConnections.set(socket.userId, {
          socketId: socket.id,
          user: user.getPublicProfile(),
          joinedAt: new Date(),
          currentRooms: []
        });

        // Update user status to online
        user.status = 'online';
        user.lastSeen = new Date();
        await user.save();

        socket.emit('authenticated', {
          success: true,
          user: user.getPublicProfile()
        });

        console.log(`✅ User authenticated: ${user.username} (${socket.id})`);

      } catch (error) {
        console.error('Socket authentication error:', error);
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Join a chatroom
    socket.on('join_room', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { roomId } = data;
        const room = await Chatroom.findById(roomId);

        if (!room || !room.isActive) {
          socket.emit('error', { message: 'Chatroom not found' });
          return;
        }

        // Check if room is full
        if (room.activeUsers.length >= room.maxUsers) {
          socket.emit('error', { message: 'Chatroom is full' });
          return;
        }

        // Add user to room in database
        await room.addUser(socket.userId);
        await room.populate('activeUsers.user', 'username status profilePicture');

        // Join socket room for real-time updates
        socket.join(roomId);

        // Update active connections
        const connection = activeConnections.get(socket.userId);
        if (connection) {
          connection.currentRooms.push(roomId);
        }

        // Notify room about new user
        socket.to(roomId).emit('user_joined', {
          user: {
            id: socket.userId,
            username: socket.username
          },
          message: `${socket.username} joined the room! 🎉`
        });

        // Send room info to user
        socket.emit('room_joined', {
          room: room.getPublicInfo(),
          activeUsers: room.activeUsers.map(au => au.user)
        });

        console.log(`👥 ${socket.username} joined room: ${room.name}`);

      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave a chatroom
    socket.on('leave_room', async (data) => {
      try {
        if (!socket.userId) return;

        const { roomId } = data;
        const room = await Chatroom.findById(roomId);

        if (room) {
          // Remove user from room in database
          await room.removeUser(socket.userId);

          // Leave socket room
          socket.leave(roomId);

          // Update active connections
          const connection = activeConnections.get(socket.userId);
          if (connection) {
            connection.currentRooms = connection.currentRooms.filter(r => r !== roomId);
          }

          // Notify room about user leaving
          socket.to(roomId).emit('user_left', {
            user: {
              id: socket.userId,
              username: socket.username
            },
            message: `${socket.username} left the room 👋`
          });

          socket.emit('room_left', { roomId });
          console.log(`👋 ${socket.username} left room: ${room.name}`);
        }

      } catch (error) {
        console.error('Leave room error:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    // Send a message
    socket.on('send_message', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { roomId, content, messageType = 'public', whisperTarget, hasNeonEffect, neonColor } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        // Verify user is in chatroom
        const room = await Chatroom.findById(roomId);
        if (!room || !room.isActive) {
          socket.emit('error', { message: 'Chatroom not found' });
          return;
        }

        const isUserInRoom = room.activeUsers.some(
          activeUser => activeUser.user.toString() === socket.userId.toString()
        );

        if (!isUserInRoom) {
          socket.emit('error', { message: 'You must join the chatroom first' });
          return;
        }

        // Create and save message
        const newMessage = new Message({
          content: content.trim(),
          sender: socket.userId,
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
        await room.updateUserLastSeen(socket.userId);

        const messageData = newMessage.getPublicData();

        // Handle different message types
        if (messageType === 'whisper' && whisperTarget) {
          // Send whisper only to sender and target
          const targetConnection = Array.from(activeConnections.values())
            .find(conn => conn.user.id === whisperTarget);
          
          if (targetConnection) {
            socket.to(targetConnection.socketId).emit('new_message', messageData);
          }
          socket.emit('new_message', messageData); // Send back to sender
          
          console.log(`💬 Whisper from ${socket.username} to target in ${room.name}`);
        } else {
          // Send public message to all users in room
          io.to(roomId).emit('new_message', messageData);
          console.log(`📢 Public message from ${socket.username} in ${room.name}`);
        }

        // Send confirmation to sender
        socket.emit('message_sent', {
          success: true,
          messageId: newMessage._id
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Add reaction to message
    socket.on('add_reaction', async (data) => {
      try {
        if (!socket.userId) return;

        const { messageId, emoji } = data;

        const message = await Message.findById(messageId);
        if (!message || message.isDeleted) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        await message.addReaction(socket.userId, emoji);
        await message.populate('sender', 'username profilePicture status');

        const messageData = message.getPublicData();

        // Broadcast reaction update to all users in the chatroom
        io.to(message.chatroom.toString()).emit('reaction_updated', {
          messageId: messageId,
          reactions: messageData.reactions,
          totalReactions: messageData.totalReactions
        });

        console.log(`❤️ Reaction ${emoji} from ${socket.username}`);

      } catch (error) {
        console.error('Add reaction error:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Update user status
    socket.on('update_status', async (data) => {
      try {
        if (!socket.userId) return;

        const { status } = data;
        
        if (!['online', 'busy', 'away', 'offline'].includes(status)) {
          socket.emit('error', { message: 'Invalid status' });
          return;
        }

        const user = await User.findById(socket.userId);
        if (user) {
          user.status = status;
          user.lastSeen = new Date();
          await user.save();

          // Update active connection
          const connection = activeConnections.get(socket.userId);
          if (connection) {
            connection.user.status = status;
          }

          // Broadcast status update to all rooms user is in
          connection.currentRooms.forEach(roomId => {
            socket.to(roomId).emit('user_status_updated', {
              userId: socket.userId,
              username: socket.username,
              status: status
            });
          });

          socket.emit('status_updated', { status });
          console.log(`📱 ${socket.username} status updated to: ${status}`);
        }

      } catch (error) {
        console.error('Update status error:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      if (!socket.userId) return;
      
      const { roomId } = data;
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      if (!socket.userId) return;
      
      const { roomId } = data;
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping: false
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        if (!socket.userId) {
          console.log(`🔌 Anonymous user disconnected: ${socket.id}`);
          return;
        }

        console.log(`🔌 User disconnected: ${socket.username} (${socket.id})`);

        // Get user's active rooms
        const connection = activeConnections.get(socket.userId);
        if (connection) {
          // Leave all rooms
          for (const roomId of connection.currentRooms) {
            const room = await Chatroom.findById(roomId);
            if (room) {
              await room.removeUser(socket.userId);
              
              // Notify room users
              socket.to(roomId).emit('user_left', {
                user: {
                  id: socket.userId,
                  username: socket.username
                },
                message: `${socket.username} disconnected 👋`
              });
            }
          }

          // Remove from active connections
          activeConnections.delete(socket.userId);
        }

        // Update user status to offline
        const user = await User.findById(socket.userId);
        if (user) {
          user.status = 'offline';
          user.lastSeen = new Date();
          await user.save();
        }

      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Utility function to get active users
  const getActiveUsers = () => {
    return Array.from(activeConnections.values()).map(conn => ({
      user: conn.user,
      joinedAt: conn.joinedAt,
      currentRooms: conn.currentRooms.length
    }));
  };

  // Utility function to broadcast to all users
  const broadcastToAll = (event, data) => {
    io.emit(event, data);
  };

  return {
    getActiveUsers,
    broadcastToAll,
    activeConnections
  };
};

module.exports = socketHandler;
