import apiService from './apiService';
import socketService from './socketService';

class AuthService {
  constructor() {
    this.user = null;
    this.isInitialized = false;
  }

  // Initialize auth service
  async init() {
    try {
      console.log('🔐 Initializing AuthService...');
      
      // Initialize API service first
      await apiService.init();
      
      // Check if user is authenticated
      if (apiService.isAuthenticated()) {
        try {
          // Try to get user profile to validate token
          const profile = await apiService.getProfile();
          this.user = profile;
          console.log('✅ User authenticated:', profile.username);
        } catch (error) {
          console.warn('⚠️ Token invalid, logging out:', error.message);
          await this.logout();
        }
      }
      
      this.isInitialized = true;
      console.log('✅ AuthService initialized');
    } catch (error) {
      console.error('❌ AuthService initialization failed:', error);
      this.isInitialized = true; // Still mark as initialized to prevent blocking
    }
  }

  // Register new user
  async register(userData) {
    try {
      console.log('📝 Registering user:', userData.username);
      
      const response = await apiService.register({
        username: userData.username,
        password: userData.password,
        age: userData.age,
        gender: userData.gender,
        interestedIn: userData.interestedIn,
        bio: userData.bio,
        interests: userData.interests,
      });

      this.user = response.user;
      
      // Connect to socket after successful registration
      await this.connectSocket();
      
      console.log('✅ Registration successful:', this.user.username);
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      console.log('🔑 Logging in user:', credentials.username || credentials.email);
      
      const response = await apiService.login(credentials);
      this.user = response.user;
      
      // Connect to socket after successful login
      await this.connectSocket();
      
      console.log('✅ Login successful:', this.user.username);
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      console.log('🚪 Logging out user...');
      
      // Disconnect socket first
      socketService.disconnect();
      
      // Clear API token
      await apiService.logout();
      
      // Clear user data
      this.user = null;
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local data even if API call fails
      this.user = null;
    }
  }

  // Connect to socket service
  async connectSocket() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User not authenticated');
      }
      
      console.log('🔌 Connecting to socket service...');
      await socketService.connect();
      console.log('✅ Socket connected successfully');
    } catch (error) {
      console.error('❌ Socket connection failed:', error);
      // Don't throw error - socket connection failure shouldn't block login
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      console.log('📝 Updating user profile...');
      const response = await apiService.updateProfile(profileData);
      
      // Update local user data
      this.user = { ...this.user, ...response.user };
      
      console.log('✅ Profile updated successfully');
      return response;
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(imageUri) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      console.log('📷 Uploading profile image...');
      const response = await apiService.uploadProfileImage(imageUri);
      
      // Update local user data with new image URL
      if (response.imageUrl) {
        this.user.profileImage = response.imageUrl;
      }
      
      console.log('✅ Profile image uploaded successfully');
      return response;
    } catch (error) {
      console.error('❌ Profile image upload failed:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.user && apiService.isAuthenticated();
  }

  // Get user's glow level
  getUserGlowLevel() {
    if (!this.user) return 'newbie';
    
    const stats = this.user.stats || {};
    const totalActivity = (stats.messagesGlowing || 0) + 
                         (stats.quizzesTaken || 0) + 
                         (stats.connectionsSparkled || 0);
    
    if (totalActivity >= 1000) return 'legend';
    if (totalActivity >= 500) return 'veteran';
    if (totalActivity >= 100) return 'regular';
    return 'newbie';
  }

  // Get user's Mola balance
  async getMolaBalance() {
    try {
      if (!this.isAuthenticated()) {
        return 0;
      }
      
      return await apiService.getMolaBalance();
    } catch (error) {
      console.error('❌ Failed to get Mola balance:', error);
      return 0;
    }
  }

  // Earn Mola
  async earnMola(amount, reason) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User not authenticated');
      }
      
      const response = await apiService.earnMola(amount, reason);
      console.log(`⚡️ Earned ${amount} Mola for: ${reason}`);
      return response;
    } catch (error) {
      console.error('❌ Failed to earn Mola:', error);
      throw error;
    }
  }

  // Check if service is initialized
  isInitializedStatus() {
    return this.isInitialized;
  }

  // Get authentication status for debugging
  getAuthStatus() {
    return {
      isInitialized: this.isInitialized,
      isAuthenticated: this.isAuthenticated(),
      hasUser: !!this.user,
      username: this.user?.username,
      glowLevel: this.getUserGlowLevel(),
      socketConnected: socketService.isSocketConnected(),
    };
  }

  // Refresh user data from server
  async refreshUserData() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 Refreshing user data...');
      const profile = await apiService.getProfile();
      this.user = profile;
      
      console.log('✅ User data refreshed');
      return profile;
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AuthService();
