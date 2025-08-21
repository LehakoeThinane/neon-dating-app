import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

const NeonWaveform = ({
  audioLevels = [],
  isRecording = false,
  isPlaying = false,
  progress = 0, // 0-1 for playback progress
  width = screenWidth - 60,
  height = 60,
  barCount = 50,
  animated = true,
  style = {},
}) => {
  const animatedValues = useRef([]);
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const [waveformData, setWaveformData] = useState([]);

  // Initialize animated values for each bar
  useEffect(() => {
    animatedValues.current = Array(barCount).fill(0).map(() => new Animated.Value(5));
  }, [barCount]);

  // Glow animation for recording/playing states
  useEffect(() => {
    if (isRecording || isPlaying) {
      // Continuous glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnimation.stopAnimation();
      pulseAnimation.stopAnimation();
      Animated.timing(glowAnimation, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: false,
      }).start();
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording, isPlaying]);

  // Update waveform data when audio levels change
  useEffect(() => {
    if (audioLevels && audioLevels.length > 0) {
      const processedData = processAudioLevels(audioLevels);
      setWaveformData(processedData);
      
      if (animated) {
        animateWaveform(processedData);
      }
    } else {
      // Generate idle waveform
      const idleData = generateIdleWaveform();
      setWaveformData(idleData);
      
      if (animated && !isRecording && !isPlaying) {
        animateIdleWaveform();
      }
    }
  }, [audioLevels, animated, isRecording, isPlaying]);

  // Process audio levels into waveform data
  const processAudioLevels = (levels) => {
    const step = Math.max(1, Math.floor(levels.length / barCount));
    const processedData = [];
    
    for (let i = 0; i < barCount; i++) {
      const startIndex = i * step;
      const endIndex = Math.min(startIndex + step, levels.length);
      const chunk = levels.slice(startIndex, endIndex);
      
      if (chunk.length > 0) {
        const average = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
        // Normalize to height range (5 to height-10)
        const normalizedHeight = Math.max(5, Math.min(height - 10, (average / 100) * (height - 15) + 5));
        processedData.push(normalizedHeight);
      } else {
        processedData.push(5); // Minimum height
      }
    }
    
    return processedData;
  };

  // Generate idle waveform for when no audio data
  const generateIdleWaveform = () => {
    return Array(barCount).fill(0).map((_, index) => {
      // Create a subtle wave pattern
      const wave = Math.sin((index / barCount) * Math.PI * 4) * 10 + 15;
      return Math.max(5, wave);
    });
  };

  // Animate waveform bars
  const animateWaveform = (data) => {
    const animations = data.map((targetHeight, index) => {
      return Animated.timing(animatedValues.current[index], {
        toValue: targetHeight,
        duration: 150,
        useNativeDriver: false,
      });
    });

    Animated.parallel(animations).start();
  };

  // Animate idle waveform with subtle movement
  const animateIdleWaveform = () => {
    const animations = animatedValues.current.map((animValue, index) => {
      const randomHeight = 5 + Math.random() * 15;
      return Animated.timing(animValue, {
        toValue: randomHeight,
        duration: 1000 + Math.random() * 1000,
        useNativeDriver: false,
      });
    });

    Animated.stagger(50, animations).start(() => {
      if (!isRecording && !isPlaying) {
        // Continue idle animation
        setTimeout(animateIdleWaveform, 500);
      }
    });
  };

  // Get color based on bar height and position
  const getBarColor = (barIndex, barHeight) => {
    const normalizedHeight = barHeight / height;
    const progressPosition = progress * barCount;
    
    // Color based on height (frequency visualization)
    if (normalizedHeight > 0.7) {
      return '#ff0080'; // High frequencies - Pink
    } else if (normalizedHeight > 0.4) {
      return '#8000ff'; // Mid frequencies - Purple  
    } else {
      return '#00ffff'; // Low frequencies - Cyan
    }
  };

  // Get gradient ID based on state
  const getGradientId = (barIndex) => {
    if (isRecording) return 'recordingGradient';
    if (isPlaying) return 'playingGradient';
    return 'idleGradient';
  };

  const barWidth = (width - (barCount - 1) * 2) / barCount; // 2px spacing between bars

  return (
    <Animated.View 
      style={[
        {
          width,
          height,
          justifyContent: 'center',
          alignItems: 'center',
        },
        { transform: [{ scale: pulseAnimation }] },
        style
      ]}
    >
      <Svg width={width} height={height}>
        <Defs>
          {/* Recording gradient - Pulsing red/pink */}
          <LinearGradient id="recordingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#ff0080" stopOpacity="1" />
            <Stop offset="50%" stopColor="#ff4da6" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#ff80cc" stopOpacity="0.6" />
          </LinearGradient>

          {/* Playing gradient - Cyan to purple */}
          <LinearGradient id="playingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#00ffff" stopOpacity="1" />
            <Stop offset="50%" stopColor="#4080ff" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#8000ff" stopOpacity="0.7" />
          </LinearGradient>

          {/* Idle gradient - Subtle glow */}
          <LinearGradient id="idleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#00ffff" stopOpacity="0.6" />
            <Stop offset="50%" stopColor="#4080ff" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#8000ff" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        {animatedValues.current.map((animValue, index) => {
          const x = index * (barWidth + 2);
          
          return (
            <Animated.View key={index}>
              <Rect
                x={x}
                y={height / 2}
                width={barWidth}
                height={animValue}
                fill={`url(#${getGradientId(index)})`}
                rx={barWidth / 2}
                ry={barWidth / 2}
                transform={`translate(0, ${-height / 4})`}
              />
            </Animated.View>
          );
        })}

        {/* Progress indicator for playback */}
        {isPlaying && progress > 0 && (
          <Rect
            x={0}
            y={0}
            width={width * progress}
            height={height}
            fill="rgba(255, 255, 255, 0.1)"
            rx={5}
          />
        )}
      </Svg>

      {/* Glow effect overlay */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isRecording ? '#ff0080' : '#00ffff',
          opacity: glowAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.1],
          }),
          borderRadius: 10,
        }}
        pointerEvents="none"
      />
    </Animated.View>
  );
};

export default NeonWaveform;
