import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

class VoiceService {
  constructor() {
    this.recording = null;
    this.sound = null;
    this.isRecording = false;
    this.isPlaying = false;
    this.recordingDuration = 0;
    this.maxDuration = 30000; // 30 seconds in milliseconds
    this.recordingTimer = null;
    this.audioLevels = []; // For waveform visualization
    this.onAudioLevelUpdate = null; // Callback for real-time waveform
    this.onDurationUpdate = null; // Callback for duration updates
  }

  // Initialize audio permissions and settings
  async initialize() {
    try {
      console.log('🎵 Initializing VoiceService...');
      
      // Request audio recording permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission denied');
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      console.log('✅ VoiceService initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ VoiceService initialization failed:', error);
      throw error;
    }
  }

  // Start recording with real-time audio level monitoring
  async startRecording() {
    try {
      if (this.isRecording) {
        console.warn('⚠️ Already recording');
        return;
      }

      console.log('🎤 Starting voice recording...');

      // Stop any existing playback
      await this.stopPlayback();

      // Create recording with high quality settings
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(recordingOptions);

      // Set up real-time monitoring
      this.recording.setOnRecordingStatusUpdate(this.onRecordingStatusUpdate.bind(this));

      // Start recording
      await this.recording.startAsync();
      this.isRecording = true;
      this.recordingDuration = 0;
      this.audioLevels = [];

      // Start duration timer
      this.startDurationTimer();

      console.log('✅ Recording started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      throw error;
    }
  }

  // Stop recording and return the audio file
  async stopRecording() {
    try {
      if (!this.isRecording || !this.recording) {
        console.warn('⚠️ No active recording to stop');
        return null;
      }

      console.log('🛑 Stopping voice recording...');

      // Stop the recording
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      // Clear recording state
      this.isRecording = false;
      this.clearDurationTimer();

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      const recordingData = {
        uri: uri,
        duration: this.recordingDuration,
        size: fileInfo.size,
        audioLevels: this.audioLevels,
        timestamp: new Date().toISOString(),
      };

      console.log('✅ Recording stopped successfully:', recordingData);
      
      // Clean up
      this.recording = null;
      
      return recordingData;
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      throw error;
    }
  }

  // Play voice message with real-time position updates
  async playVoiceMessage(uri, onPositionUpdate = null) {
    try {
      console.log('▶️ Playing voice message:', uri);

      // Stop any existing playback
      await this.stopPlayback();

      // Create sound object
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, isLooping: false },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      this.onPositionUpdate = onPositionUpdate;

      // Start playback
      await this.sound.playAsync();
      this.isPlaying = true;

      console.log('✅ Playback started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to play voice message:', error);
      throw error;
    }
  }

  // Stop current playback
  async stopPlayback() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
        console.log('🛑 Playback stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping playback:', error);
    }
  }

  // Pause/Resume playback
  async pausePlayback() {
    try {
      if (this.sound && this.isPlaying) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
        console.log('⏸️ Playback paused');
      }
    } catch (error) {
      console.error('❌ Error pausing playback:', error);
    }
  }

  async resumePlayback() {
    try {
      if (this.sound && !this.isPlaying) {
        await this.sound.playAsync();
        this.isPlaying = true;
        console.log('▶️ Playback resumed');
      }
    } catch (error) {
      console.error('❌ Error resuming playback:', error);
    }
  }

  // Set playback speed (0.5x to 2x)
  async setPlaybackSpeed(speed) {
    try {
      if (this.sound) {
        await this.sound.setRateAsync(speed, true);
        console.log(`🎵 Playback speed set to ${speed}x`);
      }
    } catch (error) {
      console.error('❌ Error setting playback speed:', error);
    }
  }

  // Recording status update handler (for real-time waveform)
  onRecordingStatusUpdate(status) {
    if (status.isRecording) {
      // Simulate audio level for waveform (in real app, you'd get actual audio data)
      const audioLevel = Math.random() * 100; // 0-100
      this.audioLevels.push(audioLevel);
      
      // Notify callback for real-time waveform updates
      if (this.onAudioLevelUpdate) {
        this.onAudioLevelUpdate(audioLevel, this.audioLevels);
      }
    }
  }

  // Playback status update handler
  onPlaybackStatusUpdate(status) {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        this.isPlaying = false;
        console.log('✅ Playback finished');
      }
      
      // Notify position updates for progress bar
      if (this.onPositionUpdate && status.positionMillis && status.durationMillis) {
        this.onPositionUpdate(status.positionMillis, status.durationMillis);
      }
    }
  }

  // Duration timer for recording
  startDurationTimer() {
    this.recordingTimer = setInterval(() => {
      this.recordingDuration += 100; // Update every 100ms
      
      // Notify duration callback
      if (this.onDurationUpdate) {
        this.onDurationUpdate(this.recordingDuration, this.maxDuration);
      }
      
      // Auto-stop at max duration
      if (this.recordingDuration >= this.maxDuration) {
        this.stopRecording();
      }
    }, 100);
  }

  clearDurationTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }

  // Utility methods
  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Generate waveform data from audio levels
  generateWaveformData(audioLevels, targetPoints = 50) {
    if (!audioLevels || audioLevels.length === 0) return [];
    
    const step = Math.max(1, Math.floor(audioLevels.length / targetPoints));
    const waveformData = [];
    
    for (let i = 0; i < audioLevels.length; i += step) {
      const chunk = audioLevels.slice(i, i + step);
      const average = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
      waveformData.push(Math.max(5, average)); // Minimum height of 5
    }
    
    return waveformData;
  }

  // Clean up resources
  async cleanup() {
    try {
      await this.stopRecording();
      await this.stopPlayback();
      this.clearDurationTimer();
      console.log('🧹 VoiceService cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export default new VoiceService();
