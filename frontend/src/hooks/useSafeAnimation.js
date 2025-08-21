import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

export const useSafeAnimation = (initialValue = 1) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;
  const animationRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const startAnimation = useCallback((animationConfig, loop = false) => {
    // Stop any existing animation first
    stopAnimation();
    
    isAnimatingRef.current = true;
    
    const animation = loop ? Animated.loop(animationConfig) : animationConfig;
    animationRef.current = animation;
    
    animation.start((finished) => {
      if (finished) {
        isAnimatingRef.current = false;
        animationRef.current = null;
      }
    });
    
    return animation;
  }, []);

  const stopAnimation = useCallback((resetValue = null) => {
    if (animationRef.current && isAnimatingRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
      isAnimatingRef.current = false;
    }
    
    // Smoothly reset to specified value if provided
    if (resetValue !== null) {
      Animated.timing(animatedValue, {
        toValue: resetValue,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [animatedValue]);

  const setValue = useCallback((value) => {
    stopAnimation();
    animatedValue.setValue(value);
  }, [animatedValue]);

  return {
    animatedValue,
    startAnimation,
    stopAnimation,
    setValue,
    isAnimating: isAnimatingRef.current,
  };
};

// Helper function for pulse animations
export const createPulseAnimation = (animatedValue, config = {}) => {
  const { 
    minScale = 1, 
    maxScale = 1.1, 
    duration = 1000 
  } = config;

  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: maxScale,
      duration,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: minScale,
      duration,
      useNativeDriver: true,
    })
  ]);
};