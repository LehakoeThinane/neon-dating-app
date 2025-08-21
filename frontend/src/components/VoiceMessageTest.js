import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAnimation, createPulseAnimation } from '../hooks/useSafeAnimation';

const VoiceMessageTest = () => {
  const [isRecording, setIsRecording] = useState(false);
  const { animatedValue, startAnimation, stopAnimation } = useSafeAnimation(1);
  
  const handlePress = () => {
    if (!isRecording) {
      const pulseConfig = createPulseAnimation(animatedValue, {
        minScale: 1,
        maxScale: 1.05,
        duration: 1000
      });
      startAnimation(pulseConfig, true);
    } else {
      stopAnimation(1);
    }
    setIsRecording(!isRecording);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Message</Text>
        <Text style={styles.subtitle}>Tap below to record</Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.recordButton,
          isRecording && styles.recordingButton
        ]}
        onPress={handlePress}
      >
        <View style={styles.buttonInner}>
          <Text style={styles.buttonText}>
            {isRecording ? '⏹ Stop' : '🎤 Record'}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusDot,
          isRecording && styles.recordingDot
        ]} />
        <Text style={styles.statusText}>
          {isRecording ? 'Recording...' : 'Ready to record'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    opacity: 0.8,
  },
  recordButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recordingButton: {
    backgroundColor: '#ffeaa7',
    borderColor: '#fdcb6e',
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3436',
  },
  statusContainer: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#b2bec3',
    marginRight: 8,
  },
  recordingDot: {
    backgroundColor: '#ff7675',
  },
  statusText: {
    fontSize: 16,
    color: '#636e72',
  },
});

export default VoiceMessageTest;