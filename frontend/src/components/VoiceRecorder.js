import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import voiceService from '../services/voiceService';
import NeonWaveform from './NeonWaveform';

const { width, height } = Dimensions.get('window');

const VoiceRecorder = ({ onVoiceRecorded, onCancel, visible = true }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Animations
  const recordButtonScale = useRef(new Animated.Value(1)).current;
  const recordButtonGlow = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const slideUpAnimation = useRef(new Animated.Value(height)).current;
  const sparkleRotation = useRef(new Animated.Value(0)).current;

  // Initialize voice service
  useEffect(() => {
    if (visible) {
      initializeVoiceService();
      animateSlideUp();
    } else {
      animateSlideDown();
    }
  }, [visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceService.cleanup();
    };
  }, []);

  const initializeVoiceService = async () => {
    try {
      await voiceService.initialize();
      
      // Set up callbacks for real-time updates
      voiceService.onAudioLevelUpdate = (level, levels) => {
        setAudioLevels([...levels]);
      };
      
      voiceService.onDurationUpdate = (duration, maxDuration) => {
        setRecordingDuration(duration);
      };
      
      setIsInitialized(true);
      console.log('🎵 VoiceRecorder initialized');
    } catch (error) {
      console.error('❌ Failed to initialize voice recorder:', error);
      Alert.alert(
        'Microphone Permission Required',
        'Please allow microphone access to record voice messages.',
        [{ text: 'OK', onPress: onCancel }]
      );
    }
  };

  const animateSlideUp = () => {
    Animated.spring(slideUpAnimation, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Start sparkle rotation
    Animated.loop(
      Animated.timing(sparkleRotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  const animateSlideDown = () => {
    Animated.timing(slideUpAnimation, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const startRecording = async () => {
    if (!isInitialized) return;

    try {
      await voiceService.startRecording();
      setIsRecording(true);
      setRecordingDuration(0);
      setAudioLevels([]);
      
      // Start recording animations
      startRecordingAnimations();
      
      console.log('🎤 Recording started');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      const recordingData = await voiceService.stopRecording();
      setIsRecording(false);
      
      // Stop recording animations
      stopRecordingAnimations();
      
      if (recordingData && onVoiceRecorded) {
        onVoiceRecorded(recordingData);
      }
      
      console.log('🛑 Recording stopped');
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording. Please try again.');
    }
  };

  const cancelRecording = async () => {
    if (isRecording) {
      await voiceService.stopRecording();
      setIsRecording(false);
      stopRecordingAnimations();
    }
    
    if (onCancel) {
      onCancel();
    }
  };

  const startRecordingAnimations = () => {
    // Record button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordButtonScale, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(recordButtonScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Record button glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordButtonGlow, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(recordButtonGlow, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Overall pulse effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopRecordingAnimations = () => {
    recordButtonScale.stopAnimation();
    recordButtonGlow.stopAnimation();
    pulseAnimation.stopAnimation();
    
    Animated.parallel([
      Animated.timing(recordButtonScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(recordButtonGlow, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    const remaining = Math.max(0, 30000 - recordingDuration);
    return formatTime(remaining);
  };

  const getProgressPercentage = () => {
    return (recordingDuration / 30000) * 100;
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideUpAnimation }] }
      ]}
    >
      <BlurView intensity={30} style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(10, 10, 10, 0.95)', 'rgba(26, 10, 42, 0.95)', 'rgba(10, 10, 10, 0.95)']}
          style={styles.gradient}
        >
          {/* Animated sparkles */}
          <Animated.View 
            style={[
              styles.sparkle,
              styles.sparkle1,
              {
                transform: [{
                  rotate: sparkleRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }
            ]}
          >
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.sparkle,
              styles.sparkle2,
              {
                transform: [{
                  rotate: sparkleRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['360deg', '0deg'],
                  })
                }]
              }
            ]}
          >
            <Text style={styles.sparkleText}>⚡️</Text>
          </Animated.View>

          <Animated.View style={[styles.content, { transform: [{ scale: pulseAnimation }] }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isRecording ? 'RECORDING...' : 'VOICE MESSAGE'}
              </Text>
              <Text style={styles.subtitle}>
                {isRecording ? `${getRemainingTime()} remaining` : 'Tap to record (30s max)'}
              </Text>
            </View>

            {/* Waveform Visualization */}
            <View style={styles.waveformContainer}>
              <NeonWaveform
                audioLevels={audioLevels}
                isRecording={isRecording}
                width={width - 80}
                height={80}
                barCount={40}
                animated={true}
              />
            </View>

            {/* Progress Bar */}
            {isRecording && (
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      { width: `${getProgressPercentage()}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {formatTime(recordingDuration)} / 0:30
                </Text>
              </View>
            )}

            {/* Recording Controls */}
            <View style={styles.controlsContainer}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelRecording}
              >
                <LinearGradient
                  colors={['#666666', '#333333']}
                  style={styles.cancelButtonGradient}
                >
                  <Text style={styles.cancelButtonText}>✕</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Record Button */}
              <Animated.View
                style={[
                  styles.recordButtonContainer,
                  {
                    transform: [{ scale: recordButtonScale }],
                    shadowOpacity: recordButtonGlow.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.8],
                    }),
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={isRecording ? stopRecording : startRecording}
                  disabled={!isInitialized}
                >
                  <LinearGradient
                    colors={
                      isRecording 
                        ? ['#ff0080', '#ff4da6', '#ff80cc']
                        : ['#00ffff', '#4080ff', '#8000ff']
                    }
                    style={styles.recordButtonGradient}
                  >
                    <Text style={styles.recordButtonText}>
                      {isRecording ? '⏹' : '🎤'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Glow effect */}
                <Animated.View
                  style={[
                    styles.recordButtonGlow,
                    {
                      opacity: recordButtonGlow,
                      backgroundColor: isRecording ? '#ff0080' : '#00ffff',
                    }
                  ]}
                />
              </Animated.View>

              {/* Send Button (only show when not recording) */}
              {!isRecording && audioLevels.length > 0 && (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={() => {
                    // This would be handled by the stop recording logic
                    // For now, just close the recorder
                    onCancel();
                  }}
                >
                  <LinearGradient
                    colors={['#00ff80', '#00cc66']}
                    style={styles.sendButtonGradient}
                  >
                    <Text style={styles.sendButtonText}>➤</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {/* Instructions */}
            <Text style={styles.instructions}>
              {isRecording 
                ? 'Tap the stop button when finished'
                : 'Hold and speak clearly for best quality'
              }
            </Text>
          </Animated.View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  blurContainer: {
    width: width - 40,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  gradient: {
    padding: 30,
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
    zIndex: 1,
  },
  sparkle1: {
    top: 20,
    right: 30,
  },
  sparkle2: {
    bottom: 20,
    left: 30,
  },
  sparkleText: {
    fontSize: 20,
    opacity: 0.7,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff0080',
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#00ffff',
    marginTop: 8,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  waveformContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 15,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff0080',
    borderRadius: 2,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  cancelButton: {
    marginRight: 30,
  },
  cancelButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  recordButtonContainer: {
    position: 'relative',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  recordButton: {
    zIndex: 2,
  },
  recordButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonText: {
    fontSize: 30,
  },
  recordButtonGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 50,
    zIndex: 1,
  },
  sendButton: {
    marginLeft: 30,
  },
  sendButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructions: {
    color: '#cccccc',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default VoiceRecorder;
