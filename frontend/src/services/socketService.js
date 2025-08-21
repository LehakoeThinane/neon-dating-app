import io from 'socket.io-client';
import apiService from './apiService';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentRoom = null;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection
  async connect() {
    try {
      const socketURL = apiService.getSocketURL();
      const authToken = apiService.getAuthToken();

      if (!authToken) {
        throw new Error('No authentication token available');
      }

      console.log('🔌 Connecting to Socket.io server:', socketURL);

      this.socket = io(socketURL, {
        auth: {
          token: authToken,
        },
        transports: ['websocket'],
        timeout: 10000,
        forceNew: true,
      });

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('✅ Socket connected successfully');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ Socket connection error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Socket connection failed:', error);
      throw error;
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentRoom = null;
    }
  }

  // Setup core event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('🟢 Socket connected');
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('🔴 Socket disconnected:', reason);
      this.emit('connection_status', { connected: false, reason });
      
      // Auto-reconnect logic
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.emit('connection_error', error);
      this.handleReconnection();
    });

    // Chat events
    this.socket.on('new_message', (data) => {
      console.log('💬 New message received:', data);
      this.emit('new_message', data);
    });

    this.socket.on('new_whisper', (data) => {
      console.log('💌 New whisper received:', data);
      this.emit('new_whisper', data);
    });

    this.socket.on('user_joined', (data) => {
      console.log('👋 User joined room:', data);
      this.emit('user_joined', data);
    });

    this.socket.on('user_left', (data) => {
      console.log('👋 User left room:', data);
      this.emit('user_left', data);
    });

    this.socket.on('room_users_update', (data) => {
      console.log('👥 Room users updated:', data);
      this.emit('room_users_update', data);
    });

    this.socket.on('typing_start', (data) => {
      this.emit('typing_start', data);
    });

    this.socket.on('typing_stop', (data) => {
      this.emit('typing_stop', data);
    });

    // System events
    this.socket.on('notification', (data) => {
      console.log('🔔 Notification received:', data);
      this.emit('notification', data);
    });

    this.socket.on('achievement_unlocked', (data) => {
      console.log('🏆 Achievement unlocked:', data);
      this.emit('achievement_unlocked', data);
    });

    this.socket.on('mola_earned', (data) => {
      console.log('⚡️ Mola earned:', data);
      this.emit('mola_earned', data);
    });
  }

  // Handle reconnection attempts
  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect().catch(console.error);
        }
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
    }
  }

  // ==================== ROOM MANAGEMENT ====================

  // Join a chat room
  joinRoom(roomId) {
    if (!this.isConnected || !this.socket) {
      throw new Error('Socket not connected');
    }

    console.log(`🚪 Joining room: ${roomId}`);
    
    // Leave current room if any
    if (this.currentRoom && this.currentRoom !== roomId) {
      this.leaveRoom(this.currentRoom);
    }

    this.socket.emit('join_room', { roomId });
    this.currentRoom = roomId;
  }

  // Leave a chat room
  leaveRoom(roomId) {
    if (!this.isConnected || !this.socket) {
      return;
    }

    console.log(`🚪 Leaving room: ${roomId}`);
    this.socket.emit('leave_room', { roomId });
    
    if (this.currentRoom === roomId) {
      this.currentRoom = null;
    }
  }

  // ==================== MESSAGING ====================

  // Send a message to current room
  sendMessage(messageData) {
    if (!this.isConnected || !this.socket || !this.currentRoom) {
      throw new Error('Not connected to a room');
    }

    const payload = {
      roomId: this.currentRoom,
      ...messageData,
      timestamp: new Date().toISOString(),
    };

    console.log('📤 Sending message:', payload);
    this.socket.emit('send_message', payload);
  }

  // Send a whisper message
  sendWhisper(targetUserId, messageData) {
    if (!this.isConnected || !this.socket || !this.currentRoom) {
      throw new Error('Not connected to a room');
    }

    const payload = {
      roomId: this.currentRoom,
      targetUserId,
      ...messageData,
      timestamp: new Date().toISOString(),
    };

    console.log('💌 Sending whisper:', payload);
    this.socket.emit('send_whisper', payload);
  }

  // ==================== TYPING INDICATORS ====================

  // Start typing indicator
  startTyping() {
    if (!this.isConnected || !this.socket || !this.currentRoom) {
      return;
    }

    this.socket.emit('typing_start', { roomId: this.currentRoom });
  }

  // Stop typing indicator
  stopTyping() {
    if (!this.isConnected || !this.socket || !this.currentRoom) {
      return;
    }

    this.socket.emit('typing_stop', { roomId: this.currentRoom });
  }

  // ==================== EVENT MANAGEMENT ====================

  // Add event listener
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  // Emit event to listeners
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).clear();
    }
  }

  // ==================== STATUS METHODS ====================

  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  getCurrentRoom() {
    return this.currentRoom;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      currentRoom: this.currentRoom,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // ==================== UTILITY METHODS ====================

  // Request room users list
  requestRoomUsers() {
    if (!this.isConnected || !this.socket || !this.currentRoom) {
      return;
    }

    this.socket.emit('get_room_users', { roomId: this.currentRoom });
  }

  // Update user status
  updateUserStatus(status) {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.emit('update_status', { status });
  }

  // Ping server for connection test
  ping() {
    if (!this.isConnected || !this.socket) {
      return Promise.reject(new Error('Socket not connected'));
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      this.socket.emit('ping', startTime);
      
      this.socket.once('pong', (timestamp) => {
        const latency = Date.now() - timestamp;
        console.log(`🏓 Socket latency: ${latency}ms`);
        resolve(latency);
      });
    });
  }
}

// Export singleton instance
export default new SocketService();
