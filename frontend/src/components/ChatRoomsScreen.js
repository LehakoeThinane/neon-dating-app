import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const CHAT_ROOMS = [
  {
    id: 'midnight-vibes',
    name: '#MidnightVibes',
    theme: 'midnight',
    colors: ['#1a0033', '#330066', '#1a0033'],
    accentColor: '#9966ff',
    description: 'Deep conversations under neon moonlight',
    activeUsers: 42,
    emoji: '🌙',
  },
  {
    id: 'electric-energy',
    name: '#ElectricEnergy',
    theme: 'electric',
    colors: ['#003333', '#006666', '#003333'],
    accentColor: '#00ffff',
    description: 'High-voltage connections and sparks',
    activeUsers: 67,
    emoji: '⚡️',
  },
  {
    id: 'sunset-chill',
    name: '#SunsetChill',
    theme: 'sunset',
    colors: ['#331100', '#663300', '#331100'],
    accentColor: '#ff6600',
    description: 'Warm vibes and golden hour magic',
    activeUsers: 38,
    emoji: '🌅',
  },
];

export default function ChatRoomsScreen({ navigation }) {
  const [pulseAnims] = useState(
    CHAT_ROOMS.map(() => new Animated.Value(1))
  );

  useEffect(() => {
    // Create pulsing animations for each room
    const animations = pulseAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.05,
            duration: 2000 + (index * 300), // Stagger the animations
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + (index * 300),
            useNativeDriver: true,
          }),
        ])
      );
    });

    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);

  const handleRoomPress = (room) => {
    // Navigate to individual chat room
    navigation.navigate('ChatRoom', { room });
  };

  const RoomCard = ({ room, index }) => (
    <Animated.View
      style={[
        styles.roomCard,
        { transform: [{ scale: pulseAnims[index] }] }
      ]}
    >
      <TouchableOpacity onPress={() => handleRoomPress(room)}>
        <LinearGradient
          colors={room.colors}
          style={styles.roomGradient}
        >
          <BlurView intensity={15} style={styles.roomContent}>
            {/* Room header */}
            <View style={styles.roomHeader}>
              <Text style={styles.roomEmoji}>{room.emoji}</Text>
              <View style={styles.roomInfo}>
                <Text style={[styles.roomName, { color: room.accentColor }]}>
                  {room.name}
                </Text>
                <Text style={styles.roomDescription}>
                  {room.description}
                </Text>
              </View>
            </View>

            {/* Activity indicator */}
            <View style={styles.activityContainer}>
              <View style={[styles.activityDot, { backgroundColor: room.accentColor }]} />
              <Text style={styles.activityText}>
                {room.activeUsers} souls glowing
              </Text>
            </View>

            {/* Enter button */}
            <TouchableOpacity 
              style={[styles.enterButton, { borderColor: room.accentColor }]}
              onPress={() => handleRoomPress(room)}
            >
              <Text style={[styles.enterButtonText, { color: room.accentColor }]}>
                ENTER THE VIBE
              </Text>
            </TouchableOpacity>
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a0a1a', '#0a0a0a']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NEON ROOMS</Text>
        <Text style={styles.headerSubtitle}>Choose your energy</Text>
      </View>

      {/* Rooms list */}
      <ScrollView 
        style={styles.roomsList}
        contentContainerStyle={styles.roomsContent}
        showsVerticalScrollIndicator={false}
      >
        {CHAT_ROOMS.map((room, index) => (
          <RoomCard key={room.id} room={room} index={index} />
        ))}

        {/* Special events banner */}
        <View style={styles.eventsContainer}>
          <LinearGradient
            colors={['#ff0080', '#8000ff', '#00ffff']}
            style={styles.eventsBanner}
          >
            <Text style={styles.eventsTitle}>🎉 NEON NIGHTS</Text>
            <Text style={styles.eventsSubtitle}>
              Friday-Sunday • Double Mola Earnings
            </Text>
            <Text style={styles.eventsDescription}>
              Weekend vibes with extra rewards!
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ffff',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ff0080',
    marginTop: 5,
    fontStyle: 'italic',
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  roomsList: {
    flex: 1,
  },
  roomsContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Account for tab bar
  },
  roomCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  roomGradient: {
    borderRadius: 20,
  },
  roomContent: {
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  roomEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  roomDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 5,
    fontStyle: 'italic',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activityText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  enterButton: {
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  enterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  eventsContainer: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  eventsBanner: {
    padding: 25,
    alignItems: 'center',
  },
  eventsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  eventsSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 5,
    fontWeight: 'bold',
  },
  eventsDescription: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 8,
    opacity: 0.9,
    textAlign: 'center',
  },
});
