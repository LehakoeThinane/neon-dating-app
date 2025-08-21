// API Configuration for Neon Dating App
const API_CONFIG = {
  // Backend server configuration
  BASE_URL: __DEV__ ? 'http://localhost:5000' : 'https://your-production-url.com',
  SOCKET_URL: __DEV__ ? 'http://localhost:5000' : 'https://your-production-url.com',
  
  // API endpoints matching your backend
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      ME: '/api/auth/me',
      UPDATE_STATUS: '/api/auth/status',
      LOGOUT: '/api/auth/logout',
    },
    
    // Chat endpoints
    CHAT: {
      ROOMS: '/api/chat/rooms',
      CREATE_ROOM: '/api/chat/rooms',
      JOIN_ROOM: '/api/chat/rooms/join',
      LEAVE_ROOM: '/api/chat/rooms/leave',
      MESSAGES: '/api/chat/messages',
      SEND_MESSAGE: '/api/chat/messages',
    },
  },
  
  // Request configuration
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Helper function to build full URL
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token) => {
  return {
    ...API_CONFIG.HEADERS,
    Authorization: token ? `Bearer ${token}` : undefined,
  };
};

export default API_CONFIG;
