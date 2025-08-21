import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import voiceService from '../services/voiceService';
import NeonWaveform from './NeonWaveform';

const { width } = Dimensions.get('window');

const VoicePlayer = ({ 
  voiceMessage, 
  style = {},
  compact = false,
  showWaveform = true,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(voiceMessage?.duration || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animations
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const playButtonGlow = useRef(new Animated.Value(0)).current;
  const waveformPulse = useRef(new Animated.Value(1)).current;
  const speedButtonGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (voiceMessage && autoPlay) {
      playVoiceMessage();
    }
  }, [voiceMessage, autoPlay]);

  useEffect(() => {
    if (isPlaying) {
      startPlayingAnimations();
    } else {
      stopPlayingAnimations();
    }
  }, [isPlaying]);

  const playVoiceMessage = async () => {
    if (!voiceMessage?.uri) return;

    try {
      setIsLoaded(true);
      
      await voiceService.playVoiceMessage(
        voiceMessage.uri,
        (position, totalDuration) => {
          setCurrentPosition(position);
          setDuration(totalDuration);
        }
      );
      
      setIsPlaying(true);
      console.log('▶️ Voice message playback started');
    } catch (error) {
      console.error('❌ Failed to play voice message:', error);
      setIsLoaded(false);
    }
  };

  const pausePlayback = async () => {
    try {
      await voiceService.pausePlayback();
      setIsPlaying(false);
      console.log('⏸️ Voice message paused');
    } catch (error) {
      console.error('❌ Failed to pause playback:', error);
    }
  };

  const resumePlayback = async () => {
    try {
      await voiceService.resumePlayback();
      setIsPlaying(true);
      console.log('▶️ Voice message resumed');
    } catch (error) {
      console.error('❌ Failed to resume playback:', error);
    }
  };

  const stopPlayback = async () => {
    try {
      await voiceService.stopPlayback();
      setIsPlaying(false);
      setCurrentPosition(0);
      setIsLoaded(false);
      console.log('⏹️ Voice message stopped');
    } catch (error) {
      console.error('❌ Failed to stop playback:', error);
    }
  };

  const changePlaybackSpeed = async (speed) => {
    try {
      await voiceService.setPlaybackSpeed(speed);
      setPlaybackSpeed(speed);
      
      // Animate speed button
      Animated.sequence([
        Animated.timing(speedButtonGlow, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(speedButtonGlow, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
      
      console.log(`🎵 Playback speed changed to ${speed}x`);
    } catch (error) {
      console.error('❌ Failed to change playback speed:', error);
    }
  };

  const startPlayingAnimations = () => {
    // Play button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(playButtonScale, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(playButtonScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Play button glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(playButtonGlow, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(playButtonGlow, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Waveform pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveformPulse, {
          toValue: 1.02,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(waveformPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPlayingAnimations = () => {
    playButtonScale.stopAnimation();
    playButtonGlow.stopAnimation();
    waveformPulse.stopAnimation();
    
    Animated.parallel([
      Animated.timing(playButtonScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(playButtonGlow, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(waveformPulse, {
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

  const getProgress = () => {
    if (!duration) return 0;
    return currentPosition / duration;
  };

  const getSpeedColors = (speed) => {
    switch (speed) {
      case 0.5: return ['#ff8000', '#ff4000']; // Orange
      case 1: return ['#00ffff', '#0080ff']; // Cyan
      case 1.5: return ['#8000ff', '#4000ff']; // Purple
      case 2: return ['#ff0080', '#ff0040']; // Pink
      default: return ['#00ffff', '#0080ff'];
    }
  };

  if (!voiceMessage) return null;

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={20} style={styles.blurContainer}>
        <LinearGradient
          colors={
            compact 
              ? ['rgba(10, 10, 10, 0.8)', 'rgba(26, 10, 42, 0.8)']
              : ['rgba(10, 10, 10, 0.9)', 'rgba(26, 10, 42, 0.9)', 'rgba(10, 10, 10, 0.9)']
          }
          style={styles.gradient}
        >
          {/* Waveform Visualization */}
          {showWaveform && (
            <Animated.View 
              style={[
                styles.waveformContainer,
                { transform: [{ scale: waveformPulse }] }
              ]}
            >
              <NeonWaveform
                audioLevels={voiceMessage.audioLevels || []}
                isPlaying={isPlaying}
                progress={getProgress()}
                width={compact ? width - 120 : width - 100}
                height={compact ? 40 : 60}
                barCount={compact ? 25 : 40}
                animated={true}
              />
            </Animated.View>
          )}

          {/* Controls Container */}
          <View style={[styles.controlsContainer, compact && styles.compactControls]}>
            {/* Play/Pause Button */}
            <Animated.View
              style={[
                styles.playButtonContainer,
                {
                  transform: [{ scale: playButtonScale }],
                  shadowOpacity: playButtonGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                }
              ]}
            >
              <TouchableOpacity
                style={styles.playButton}
                onPress={isPlaying ? pausePlayback : (isLoaded ? resumePlayback : playVoiceMessage)}
              >
                <LinearGradient
                  colors={isPlaying ? ['#ff0080', '#ff4da6'] : ['#00ffff', '#4080ff']}
                  style={[styles.playButtonGradient, compact && styles.compactPlayButton]}
                >
                  <Text style={[styles.playButtonText, compact && styles.compactPlayButtonText]}>
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Glow effect */}
              <Animated.View
                style={[
                  styles.playButtonGlow,
                  compact && styles.compactPlayButtonGlow,
                  {
                    opacity: playButtonGlow,
                    backgroundColor: isPlaying ? '#ff0080' : '#00ffff',
                  }
                ]}
              />
            </Animated.View>

            {/* Time Display and Progress */}
            <View style={styles.timeContainer}>
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      { width: `${getProgress() * 100}%` }
                    ]}
                  />
                </View>
              </View>
              
              <View style={styles.timeDisplay}>
                <Text style={[styles.timeText, compact && styles.compactTimeText]}>
                  {formatTime(currentPosition)}
                </Text>
                <Text style={[styles.timeSeparator, compact && styles.compactTimeText]}>
                  /
                </Text>
                <Text style={[styles.timeText, compact && styles.compactTimeText]}>
                  {formatTime(duration)}
                </Text>
              </View>
            </View>

            {/* Speed Control */}
            {!compact && (
              <View style={styles.speedContainer}>
                <Animated.View
                  style={[
                    styles.speedButton,
                    {
                      shadowOpacity: speedButtonGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.2, 0.6],
                      }),
                    }
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => {
                      const speeds = [0.5, 1, 1.5, 2];
                      const currentIndex = speeds.indexOf(playbackSpeed);
                      const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
                      changePlaybackSpeed(nextSpeed);
                    }}
                  >
                    <LinearGradient
                      colors={getSpeedColors(playbackSpeed)}
                      style={styles.speedButtonGradient}
                    >
                      <Text style={styles.speedButtonText}>
                        {playbackSpeed}x
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Speed button glow */}
                  <Animated.View
                    style={[
                      styles.speedButtonGlow,
                      {
                        opacity: speedButtonGlow,
                        backgroundColor: getSpeedColors(playbackSpeed)[0],
                      }
                    ]}
                  />
                </Animated.View>
              </View>
            )}

            {/* Stop Button */}
            {!compact && isLoaded && (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopPlayback}
              >
                <LinearGradient
                  colors={['#666666', '#333333']}
                  style={styles.stopButtonGradient}
                >
                  <Text style={styles.stopButtonText}>⏹</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Voice Message Info */}
          {!compact && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Voice Message • {formatTime(voiceMessage.duration || duration)}
              </Text>
              {voiceMessage.timestamp && (
                <Text style={styles.timestampText}>
                  {new Date(voiceMessage.timestamp).toLocaleTimeString()}
                </Text>
              )}
            </View>
          )}
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  blurContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  gradient: {
    padding: 15,
  },
  waveformContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactControls: {
    justifyContent: 'flex-start',
  },
  playButtonContainer: {
    position: 'relative',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
    marginRight: 15,
  },
  playButton: {
    zIndex: 2,
  },
  playButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  playButtonText: {
    fontSize: 20,
    color: '#ffffff',
  },
  compactPlayButtonText: {
    fontSize: 16,
  },
  playButtonGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 30,
    zIndex: 1,
  },
  compactPlayButtonGlow: {
    borderRadius: 25,
  },
  timeContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  progressContainer: {
    marginBottom: 5,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffff',
    borderRadius: 1.5,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  compactTimeText: {
    fontSize: 10,
  },
  timeSeparator: {
    color: '#666666',
    fontSize: 12,
    marginHorizontal: 4,
    fontFamily: 'monospace',
  },
  speedContainer: {
    marginHorizontal: 10,
  },
  speedButton: {
    position: 'relative',
    shadowColor: '#8000ff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
  },
  speedButtonGradient: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  speedButtonGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 20,
    zIndex: 1,
  },
  stopButton: {
    marginLeft: 10,
  },
  stopButtonGradient: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  infoText: {
    color: '#00ffff',
    fontSize: 11,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  timestampText: {
    color: '#666666',
    fontSize: 10,
    marginTop: 2,
  },
});

export default VoicePlayer;
