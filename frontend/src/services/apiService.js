import AsyncStorage from '@react-native-async-storage/async-storage';

// Get your computer's IP address for mobile development
// Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) to find your IP
// IMPORTANT: Replace this with your actual computer's IP address!
// Example: If your IP is 192.168.1.105, change the line below to:
// const COMPUTER_IP = '192.168.1.105';
const COMPUTER_IP = '192.168.0.38'; // ← Your actual IP address!

// API Configuration
const API_BASE_URL = __DEV__ 
  ? `http://${COMPUTER_IP}:5000/api`  // Development - use computer IP
  : 'https://your-production-api.com/api';  // Production

const SOCKET_URL = __DEV__
  ? `http://${COMPUTER_IP}:5001`  // Development Socket.io - use computer IP
  : 'https://your-production-socket.com';  // Production Socket.io

class ApiService {
  constructor() {
    this.token = null;
    this.baseURL = API_BASE_URL;
    this.socketURL = SOCKET_URL;
  }

  // Initialize service and load stored token
  async init() {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        this.token = storedToken;
      }
    } catch (error) {
      console.error('Failed to load stored token:', error);
    }
  }

  // Generic request method with error handling
  // ...existing code...

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      
      // Add timeout handling
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ API Success: ${endpoint}`, data);
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`❌ Request timeout: ${url}`);
        throw new Error(`Connection timed out. Please check if your backend server is running at ${COMPUTER_IP}:5000`);
      }
      console.error(`❌ API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // ==================== AUTHENTICATION ====================

  async register(userData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.token) {
        await this.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(credentials) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.token) {
        await this.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem('authToken');
      this.token = null;
      console.log('🚪 User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async setAuthToken(token) {
    try {
      this.token = token;
      await AsyncStorage.setItem('authToken', token);
      console.log('🔐 Auth token stored successfully');
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  // ==================== USER PROFILE ====================

  async getProfile() {
    try {
      return await this.request('/user/profile');
    } catch (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
  }

  async updateProfile(profileData) {
    try {
      return await this.request('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  async uploadProfileImage(imageUri) {
    try {
      const formData = new FormData();
      formData.append('profileImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      return await this.request('/user/profile/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
    } catch (error) {
      throw new Error(`Failed to upload profile image: ${error.message}`);
    }
  }

  // ==================== CHAT ROOMS ====================

  async getChatRooms() {
    try {
      return await this.request('/chat/rooms');
    } catch (error) {
      throw new Error(`Failed to fetch chat rooms: ${error.message}`);
    }
  }

  async getRoomMessages(roomId, limit = 50, offset = 0) {
    try {
      return await this.request(`/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`);
    } catch (error) {
      throw new Error(`Failed to fetch room messages: ${error.message}`);
    }
  }

  async sendMessage(roomId, messageData) {
    try {
      return await this.request(`/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async sendWhisper(roomId, targetUserId, messageData) {
    try {
      return await this.request(`/chat/rooms/${roomId}/whisper`, {
        method: 'POST',
        body: JSON.stringify({
          ...messageData,
          targetUserId,
        }),
      });
    } catch (error) {
      throw new Error(`Failed to send whisper: ${error.message}`);
    }
  }

  async getRoomUsers(roomId) {
    try {
      return await this.request(`/chat/rooms/${roomId}/users`);
    } catch (error) {
      throw new Error(`Failed to fetch room users: ${error.message}`);
    }
  }

  // ==================== CONNECTION QUIZ ====================

  async getQuizQuestions() {
    try {
      return await this.request('/quiz/questions');
    } catch (error) {
      throw new Error(`Failed to fetch quiz questions: ${error.message}`);
    }
  }

  async submitQuizAnswers(answers) {
    try {
      return await this.request('/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
    } catch (error) {
      throw new Error(`Failed to submit quiz answers: ${error.message}`);
    }
  }

  async getCompatibilityMatches(userId) {
    try {
      return await this.request(`/quiz/compatibility/${userId}`);
    } catch (error) {
      throw new Error(`Failed to fetch compatibility matches: ${error.message}`);
    }
  }

  // ==================== MOLA SYSTEM ====================

  async getMolaBalance() {
    try {
      const response = await this.request('/user/mola');
      return response.balance || 0;
    } catch (error) {
      throw new Error(`Failed to fetch Mola balance: ${error.message}`);
    }
  }

  async earnMola(amount, reason) {
    try {
      return await this.request('/user/mola/earn', {
        method: 'POST',
        body: JSON.stringify({ amount, reason }),
      });
    } catch (error) {
      throw new Error(`Failed to earn Mola: ${error.message}`);
    }
  }

  async spendMola(amount, reason) {
    try {
      return await this.request('/user/mola/spend', {
        method: 'POST',
        body: JSON.stringify({ amount, reason }),
      });
    } catch (error) {
      throw new Error(`Failed to spend Mola: ${error.message}`);
    }
  }

  // ==================== ACHIEVEMENTS ====================

  async getAchievements() {
    try {
      return await this.request('/user/achievements');
    } catch (error) {
      throw new Error(`Failed to fetch achievements: ${error.message}`);
    }
  }

  async unlockAchievement(achievementId) {
    try {
      return await this.request('/user/achievements/unlock', {
        method: 'POST',
        body: JSON.stringify({ achievementId }),
      });
    } catch (error) {
      throw new Error(`Failed to unlock achievement: ${error.message}`);
    }
  }

  // ==================== EVENTS ====================

  async getEvents() {
    try {
      return await this.request('/events');
    } catch (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  async joinEvent(eventId) {
    try {
      return await this.request(`/events/${eventId}/join`, {
        method: 'POST',
      });
    } catch (error) {
      throw new Error(`Failed to join event: ${error.message}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  getSocketURL() {
    return this.socketURL;
  }

  getAuthToken() {
    return this.token;
  }

  // Health check for API connection
  async healthCheck() {
    try {
      const response = await this.request('/health');
      console.log('🏥 API Health Check:', response);
      return response;
    } catch (error) {
      console.error('❌ API Health Check Failed:', error);
      throw error;
    }
  }
}


// Export singleton instance
export default new ApiService();
