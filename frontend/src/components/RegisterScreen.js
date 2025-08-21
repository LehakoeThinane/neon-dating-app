import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import authService from '../services/authService'; // Import the authService

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation, onAuthSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // Add error state

  // Animation values
  const sparkleAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    // Sparkle animation
    const sparkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();

    sparkleAnimation.start();

    return () => sparkleAnimation.stop();
  }, []);

  const handleRegister = async () => {
    // Debug: Log form data to see what's filled
    console.log(' Form data:', formData);
    
    // Validation with specific field checks
    const missingFields = [];
    
    if (!formData.username.trim()) missingFields.push('username');
    if (!formData.email.trim()) missingFields.push('email');
    if (!formData.password.trim()) missingFields.push('password');
    if (!formData.confirmPassword.trim()) missingFields.push('confirm password');
    if (!formData.age) missingFields.push('age');
    if (!formData.location.trim()) missingFields.push('location');
    
    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.age < 18 || formData.age > 100) {
      setError('Please enter a valid age (18-100)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Prepare registration data
      const registrationData = {
        username: formData.username.trim(),
        password: formData.password.trim(),
        age: parseInt(formData.age),
        gender: 'prefer-not-to-say', // Valid enum value
        interestedIn: ['everyone'], // Valid enum value
        bio: `Hey there! I'm ${formData.username.trim()} and I'm ready to make some electric connections! ⚡️`,
        interests: ['music', 'art', 'gaming'], // Valid enum values (lowercase)
      };

      console.log('🚀 Sending registration data to backend:', registrationData);

      // Attempt registration with backend
      await authService.register(registrationData);

      // Success! Navigate to main app
      onAuthSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0a0a0a', '#1a0a2a', '#0a0a0a']}
        style={styles.background}
      >
        {/* Animated sparkles */}
        <Animated.View style={[styles.sparkle1, { opacity: sparkleOpacity }]}>
          <Text style={styles.sparkleText}>✨</Text>
        </Animated.View>
        <Animated.View style={[styles.sparkle2, { opacity: sparkleOpacity }]}>
          <Text style={styles.sparkleText}>⚡️</Text>
        </Animated.View>
        <Animated.View style={[styles.sparkle3, { opacity: sparkleOpacity }]}>
          <Text style={styles.sparkleText}>💫</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { transform: [{ translateY: slideAnim }] }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>JOIN THE GLOW</Text>
              <Text style={styles.subtitle}>Create your neon identity</Text>
            </View>

            {/* Registration form */}
            <BlurView intensity={25} style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>USERNAME</Text>
                <TextInput
                  style={styles.input}
                  value={formData.username}
                  onChangeText={(value) => updateFormData('username', value)}
                  placeholder="Choose your neon handle"
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  placeholder="Enter your email"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>AGE</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.age}
                    onChangeText={(value) => updateFormData('age', value)}
                    placeholder="21"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 2, marginLeft: 10 }]}>
                  <Text style={styles.inputLabel}>LOCATION</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.location}
                    onChangeText={(value) => updateFormData('location', value)}
                    placeholder="City, State"
                    placeholderTextColor="#666"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  placeholder="Create a strong password"
                  placeholderTextColor="#666"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  placeholder="Confirm your password"
                  placeholderTextColor="#666"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#ff0080', '#8000ff', '#00ffff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'IGNITING YOUR GLOW...' : 'IGNITE THE SPARK '}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>
                  Already glowing? <Text style={styles.linkHighlight}>Enter Here</Text>
                </Text>
              </TouchableOpacity>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
            </BlurView>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  sparkle1: {
    position: 'absolute',
    top: height * 0.15,
    right: 30,
    zIndex: 1,
  },
  sparkle2: {
    position: 'absolute',
    top: height * 0.3,
    left: 20,
    zIndex: 1,
  },
  sparkle3: {
    position: 'absolute',
    bottom: height * 0.2,
    right: 50,
    zIndex: 1,
  },
  sparkleText: {
    fontSize: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff0080',
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#00ffff',
    marginTop: 8,
    fontStyle: 'italic',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  formContainer: {
    padding: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 128, 0.3)',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputLabel: {
    color: '#ff0080',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 128, 0.5)',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  registerButton: {
    marginTop: 25,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  loginLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  linkText: {
    color: '#cccccc',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#00ffff',
    fontWeight: 'bold',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    marginBottom: 20,
  },
});
