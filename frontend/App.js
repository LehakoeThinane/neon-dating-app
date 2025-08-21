import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Services
import authService from './src/services/authService';

// Components
import LoginScreen from './src/components/LoginScreen';
import RegisterScreen from './src/components/RegisterScreen';
import MainTabNavigator from './src/components/MainTabNavigator';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize auth service
      await authService.init();
      
      // Check if user is authenticated
      setIsAuthenticated(authService.isAuthenticated());
      
      // Simulate loading time for splash screen
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsLoading(false);
      await SplashScreen.hideAsync();
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashTitle}>⚡️💜 Neon Dating</Text>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: '#00ffff',
          background: '#0a0a0a',
          card: '#1a1a1a',
          text: '#ffffff',
          border: '#2a2a2a',
          notification: '#ff0080',
        },
      }}
    >
      <StatusBar style="light" backgroundColor="#0a0a0a" />
      
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0a0a0a' },
        }}
      >
        {isAuthenticated ? (
          // Authenticated screens
          <Stack.Screen name="Main">
            {props => <MainTabNavigator {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          // Authentication screens
          <>
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onAuthSuccess={handleAuthSuccess} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {props => <RegisterScreen {...props} onAuthSuccess={handleAuthSuccess} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#00ffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  comingSoon: {
    color: '#ffffff',
    marginTop: 20,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    color: '#00ffff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
    opacity: 0.8,
  },
});
