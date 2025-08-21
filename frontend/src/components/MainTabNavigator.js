import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import screens
import RoomsStackNavigator from './RoomsStackNavigator';
import ConnectionQuizScreen from './ConnectionQuizScreen';
import ProfileScreen from './ProfileScreen';
import EventsScreen from './EventsScreen';

const Tab = createBottomTabNavigator();

// Temporary placeholder for screens we haven't created yet
const ComingSoonScreen = ({ title, icon }) => (
  <LinearGradient
    colors={['#0a0a0a', '#1a0a1a', '#0a0a0a']}
    style={styles.container}
  >
    <Text style={styles.comingSoonIcon}>{icon}</Text>
    <Text style={styles.comingSoonTitle}>{title}</Text>
    <Text style={styles.comingSoonText}>Coming Soon!</Text>
  </LinearGradient>
);

export default function MainTabNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: 'rgba(0, 255, 255, 0.3)',
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#00ffff',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          letterSpacing: 1,
        },
      }}
    >
      <Tab.Screen
        name="Rooms"
        component={RoomsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color }]}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Quiz"
        component={ConnectionQuizScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color }]}>🧪</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.tabIcon, focused && styles.focusedTabIcon]}>
              👤
            </Text>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, focused && styles.focusedTabLabel]}>
              Profile
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={[styles.tabIcon, { color }]}>🎉</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
  },
  comingSoonIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  comingSoonTitle: {
    color: '#00ffff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  comingSoonText: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.8,
  },
  focusedTabIcon: {
    color: '#00ffff',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  focusedTabLabel: {
    color: '#00ffff',
  },
});
