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

// Mock events data
const NEON_EVENTS = [
  {
    id: 1,
    title: 'Neon Nights Weekend',
    subtitle: 'Double Mola Earnings!',
    description: 'Join the electric energy every Friday-Sunday! Double your Mola earnings and unlock exclusive weekend features.',
    startDate: '2024-02-09',
    endDate: '2024-02-11',
    status: 'active',
    color: '#ff0080',
    icon: '🎉',
    features: ['2x Mola Earnings', 'Exclusive Neon Rooms', 'Weekend Badges', 'Special Animations'],
  },
  {
    id: 2,
    title: 'Electric Connection Quiz',
    subtitle: 'Weekly Challenge',
    description: 'Take the ultimate compatibility quiz with enhanced spark effects and bonus rewards!',
    startDate: '2024-02-12',
    endDate: '2024-02-18',
    status: 'upcoming',
    color: '#00ffff',
    icon: '⚡️',
    features: ['Enhanced Sparks', 'Bonus Mola', 'Rare Achievements', 'Quiz Leaderboard'],
  },
  {
    id: 3,
    title: 'Midnight Vibes Marathon',
    subtitle: 'Chat Room Takeover',
    description: 'The #MidnightVibes room gets special effects and exclusive features for 48 hours!',
    startDate: '2024-02-15',
    endDate: '2024-02-17',
    status: 'upcoming',
    color: '#9966ff',
    icon: '🌙',
    features: ['Room Takeover', 'Special Effects', 'Exclusive Whispers', 'Midnight Badges'],
  },
  {
    id: 4,
    title: 'Valentine\'s Spark Festival',
    subtitle: 'Love is Electric',
    description: 'Special Valentine\'s themed rooms, enhanced connection features, and romantic neon effects!',
    startDate: '2024-02-14',
    endDate: '2024-02-14',
    status: 'upcoming',
    color: '#ff6600',
    icon: '💜',
    features: ['Romantic Rooms', 'Love Sparks', 'Valentine Badges', 'Cupid Mode'],
  },
];

export default function EventsScreen({ navigation }) {
  // Animation values
  const pulseAnim = new Animated.Value(1);
  const glowAnim = new Animated.Value(0);

  useEffect(() => {
    // Pulse animation for active events
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#00ff00';
      case 'upcoming': return '#ffff00';
      case 'ended': return '#666666';
      default: return '#ffffff';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'LIVE NOW';
      case 'upcoming': return 'COMING SOON';
      case 'ended': return 'ENDED';
      default: return 'UNKNOWN';
    }
  };

  const EventCard = ({ event, index }) => {
    const isActive = event.status === 'active';
    
    return (
      <Animated.View
        style={[
          styles.eventCard,
          isActive && { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <BlurView intensity={20} style={styles.eventBlur}>
          <LinearGradient
            colors={[
              `${event.color}20`,
              'rgba(0, 0, 0, 0.8)',
              `${event.color}10`
            ]}
            style={styles.eventGradient}
          >
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
              <Text style={styles.statusText}>{getStatusText(event.status)}</Text>
            </View>

            {/* Event Header */}
            <View style={styles.eventHeader}>
              <Text style={styles.eventIcon}>{event.icon}</Text>
              <View style={styles.eventTitleContainer}>
                <Text style={[styles.eventTitle, { color: event.color }]}>
                  {event.title}
                </Text>
                <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
              </View>
            </View>

            {/* Event Description */}
            <Text style={styles.eventDescription}>{event.description}</Text>

            {/* Event Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>FEATURES:</Text>
              <View style={styles.featuresGrid}>
                {event.features.map((feature, idx) => (
                  <View key={idx} style={[styles.featureTag, { borderColor: event.color }]}>
                    <Text style={[styles.featureText, { color: event.color }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Event Dates */}
            <View style={styles.datesContainer}>
              <Text style={styles.datesText}>
                📅 {event.startDate} - {event.endDate}
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              disabled={event.status === 'ended'}
            >
              <LinearGradient
                colors={
                  event.status === 'active' 
                    ? [event.color, '#ffffff'] 
                    : event.status === 'upcoming'
                    ? ['#333333', '#666666']
                    : ['#1a1a1a', '#333333']
                }
                style={styles.actionGradient}
              >
                <Text style={[
                  styles.actionText,
                  { color: event.status === 'ended' ? '#666666' : '#000000' }
                ]}>
                  {event.status === 'active' ? 'JOIN NOW' : 
                   event.status === 'upcoming' ? 'SET REMINDER' : 'ENDED'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a0a2a', '#0a0a0a']}
      style={styles.container}
    >
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1],
      })}]}>
        <Text style={styles.headerTitle}>⚡️ NEON EVENTS</Text>
        <Text style={styles.headerSubtitle}>Electric experiences await</Text>
      </Animated.View>

      {/* Events List */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {NEON_EVENTS.map((event, index) => (
          <EventCard key={event.id} event={event} index={index} />
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            More electric events coming soon! ⚡️
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    fontStyle: 'italic',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  eventCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  eventBlur: {
    borderRadius: 20,
  },
  eventGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  eventTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  eventSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    fontStyle: 'italic',
  },
  eventDescription: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  featureText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  datesContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  datesText: {
    color: '#cccccc',
    fontSize: 14,
  },
  actionButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    color: '#666666',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
