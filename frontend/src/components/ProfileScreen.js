import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Mock user data
const USER_PROFILE = {
  username: 'NeonSoul',
  age: 25,
  location: 'Neo Tokyo',
  glowLevel: 'veteran', // newbie, regular, veteran, legend
  mola: 2847,
  joinDate: '2024-01-15',
  bio: 'Dancing through life with electric energy ⚡️ Love deep conversations under neon lights 💜',
  interests: ['Dancing', 'Art', 'Music', 'Gaming', 'Philosophy'],
  stats: {
    connectionsSparkled: 23,
    quizzesTaken: 47,
    messagesGlowing: 1205,
    neonNightsAttended: 8,
  },
  achievements: [
    { id: 1, name: 'First Spark', icon: '✨', earned: true, description: 'Created your first connection spark' },
    { id: 2, name: 'Quiz Master', icon: '🧪', earned: true, description: 'Completed 25+ compatibility quizzes' },
    { id: 3, name: 'Neon Veteran', icon: '⚡️', earned: true, description: 'Reached veteran glow level' },
    { id: 4, name: 'Weekend Warrior', icon: '🎉', earned: true, description: 'Attended 5+ Neon Nights events' },
    { id: 5, name: 'Whisper King', icon: '💌', earned: false, description: 'Send 100 whisper messages' },
    { id: 6, name: 'Legend Status', icon: '👑', earned: false, description: 'Reach legendary glow level' },
  ],
  preferences: {
    ageRange: [22, 30],
    interests: ['Art', 'Music', 'Dancing'],
    lookingFor: 'Meaningful connections',
  },
  isPremium: true,
};

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Animation values
  const glowAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);
  const molaCountAnim = new Animated.Value(0);

  useEffect(() => {
    // Glow animation based on user level
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: getGlowSpeed(USER_PROFILE.glowLevel),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: getGlowSpeed(USER_PROFILE.glowLevel),
          useNativeDriver: true,
        }),
      ])
    );

    // Profile pulse animation
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

    // Mola counter animation
    Animated.timing(molaCountAnim, {
      toValue: USER_PROFILE.mola,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    glowAnimation.start();
    pulseAnimation.start();

    return () => {
      glowAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const getGlowSpeed = (level) => {
    switch (level) {
      case 'newbie': return 3000;
      case 'regular': return 2000;
      case 'veteran': return 1500;
      case 'legend': return 1000;
      default: return 2500;
    }
  };

  const getGlowColor = (level) => {
    switch (level) {
      case 'newbie': return '#9966ff';
      case 'regular': return '#00ffff';
      case 'veteran': return '#ff0080';
      case 'legend': return '#ffd700';
      default: return '#ffffff';
    }
  };

  const getGlowIntensity = (level) => {
    switch (level) {
      case 'newbie': return 0.3;
      case 'regular': return 0.5;
      case 'veteran': return 0.8;
      case 'legend': return 1.0;
      default: return 0.3;
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, getGlowIntensity(USER_PROFILE.glowLevel)],
  });

  const animatedMola = molaCountAnim.interpolate({
    inputRange: [0, USER_PROFILE.mola],
    outputRange: [0, USER_PROFILE.mola],
    extrapolate: 'clamp',
  });

  const ProfileHeader = () => (
    <Animated.View style={[styles.profileHeader, { transform: [{ scale: pulseAnim }] }]}>
      <Animated.View 
        style={[
          styles.avatarContainer,
          { 
            shadowColor: getGlowColor(USER_PROFILE.glowLevel),
            shadowOpacity: glowOpacity,
            shadowRadius: 20,
          }
        ]}
      >
        <LinearGradient
          colors={[getGlowColor(USER_PROFILE.glowLevel), 'transparent']}
          style={styles.avatarGlow}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {USER_PROFILE.glowLevel === 'legend' ? '👑' : 
               USER_PROFILE.glowLevel === 'veteran' ? '⚡️' :
               USER_PROFILE.glowLevel === 'regular' ? '🔥' : '💜'}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <Text style={[styles.username, { color: getGlowColor(USER_PROFILE.glowLevel) }]}>
        {USER_PROFILE.username}
      </Text>
      <Text style={styles.userInfo}>
        {USER_PROFILE.age} • {USER_PROFILE.location}
      </Text>
      <Text style={styles.glowLevel}>
        {USER_PROFILE.glowLevel.toUpperCase()} GLOW
      </Text>

      {USER_PROFILE.isPremium && (
        <View style={styles.premiumBadge}>
          <LinearGradient
            colors={['#ffd700', '#ff8c00']}
            style={styles.premiumGradient}
          >
            <Text style={styles.premiumText}>⭐ PREMIUM SOUL</Text>
          </LinearGradient>
        </View>
      )}
    </Animated.View>
  );

  const MolaCounter = () => (
    <BlurView intensity={20} style={styles.molaContainer}>
      <Text style={styles.molaLabel}>MOLA ENERGY</Text>
      <View style={styles.molaRow}>
        <Text style={styles.molaIcon}>⚡️</Text>
        <Animated.Text style={styles.molaCount}>
          {animatedMola.interpolate({
            inputRange: [0, USER_PROFILE.mola],
            outputRange: [0, USER_PROFILE.mola],
            extrapolate: 'clamp',
          }).__getValue().toFixed(0)}
        </Animated.Text>
      </View>
    </BlurView>
  );

  const StatsSection = () => (
    <BlurView intensity={15} style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>NEON STATS</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{USER_PROFILE.stats.connectionsSparkled}</Text>
          <Text style={styles.statLabel}>Sparks Created</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{USER_PROFILE.stats.quizzesTaken}</Text>
          <Text style={styles.statLabel}>Quizzes Taken</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{USER_PROFILE.stats.messagesGlowing}</Text>
          <Text style={styles.statLabel}>Messages Sent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{USER_PROFILE.stats.neonNightsAttended}</Text>
          <Text style={styles.statLabel}>Neon Nights</Text>
        </View>
      </View>
    </BlurView>
  );

  const AchievementsSection = () => (
    <BlurView intensity={15} style={styles.achievementsContainer}>
      <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
      <View style={styles.achievementsGrid}>
        {USER_PROFILE.achievements.map((achievement) => (
          <View 
            key={achievement.id} 
            style={[
              styles.achievementItem,
              achievement.earned && styles.achievementEarned
            ]}
          >
            <Text style={[
              styles.achievementIcon,
              !achievement.earned && styles.achievementIconLocked
            ]}>
              {achievement.earned ? achievement.icon : '🔒'}
            </Text>
            <Text style={[
              styles.achievementName,
              !achievement.earned && styles.achievementNameLocked
            ]}>
              {achievement.name}
            </Text>
          </View>
        ))}
      </View>
    </BlurView>
  );

  const BioSection = () => (
    <BlurView intensity={15} style={styles.bioContainer}>
      <Text style={styles.sectionTitle}>ABOUT ME</Text>
      <Text style={styles.bioText}>{USER_PROFILE.bio}</Text>
      
      <View style={styles.interestsContainer}>
        <Text style={styles.interestsTitle}>INTERESTS</Text>
        <View style={styles.interestsRow}>
          {USER_PROFILE.interests.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    </BlurView>
  );

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a0a2a', '#0a0a0a']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />
        <MolaCounter />
        <StatsSection />
        <AchievementsSection />
        <BioSection />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <LinearGradient
              colors={['#ff0080', '#00ffff']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>EDIT PROFILE</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 20,
    elevation: 10,
  },
  avatarGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 40,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 5,
  },
  userInfo: {
    color: '#cccccc',
    fontSize: 16,
    marginBottom: 10,
  },
  glowLevel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    opacity: 0.8,
  },
  premiumBadge: {
    marginTop: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumGradient: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  premiumText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  molaContainer: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    marginBottom: 20,
    alignItems: 'center',
  },
  molaLabel: {
    color: '#00ffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  molaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  molaIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  molaCount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statsContainer: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 128, 0.3)',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ff0080',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  statLabel: {
    color: '#cccccc',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  achievementsContainer: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementEarned: {
    borderColor: 'rgba(0, 255, 255, 0.5)',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  achievementName: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  achievementNameLocked: {
    color: '#666666',
  },
  bioContainer: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 30,
  },
  bioText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  interestsContainer: {
    alignItems: 'center',
  },
  interestsTitle: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  interestTag: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.5)',
  },
  interestText: {
    color: '#00ffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: 15,
  },
  editButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  settingsButton: {
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
  },
  settingsText: {
    color: '#cccccc',
    fontSize: 16,
  },
});
