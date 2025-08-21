import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import VoiceRecorder from './VoiceRecorder';
import VoicePlayer from './VoicePlayer';

const { width, height } = Dimensions.get('window');

// Mock data for demonstration
const MOCK_MESSAGES = [
  {
    id: 1,
    user: 'NeonQueen',
    message: 'Hey everyone! Love the vibes in here ✨',
    timestamp: new Date(Date.now() - 300000),
    isWhisper: false,
    glowLevel: 'veteran',
    type: 'text',
  },
  {
    id: 2,
    user: 'ElectricSoul',
    message: 'First time here, the energy is incredible! 🔥',
    timestamp: new Date(Date.now() - 240000),
    isWhisper: false,
    glowLevel: 'newbie',
    type: 'text',
  },
  {
    id: 3,
    user: 'CyberHeart',
    message: '*whispers to NeonQueen* Your profile caught my eye 💜',
    timestamp: new Date(Date.now() - 180000),
    isWhisper: true,
    glowLevel: 'regular',
    whisperTo: 'NeonQueen',
    type: 'text',
  },
  {
    id: 4,
    user: 'VoiceVibes',
    timestamp: new Date(Date.now() - 120000),
    isWhisper: false,
    glowLevel: 'veteran',
    type: 'voice',
    voiceMessage: {
      uri: 'mock-voice-uri',
      duration: 15000,
      audioLevels: [20, 45, 60, 30, 80, 55, 25, 70, 40, 90, 35, 65, 20, 50, 75],
      timestamp: new Date(Date.now() - 120000).toISOString(),
    }
  },
];

const MOCK_USERS = [
  { username: 'NeonQueen', glowLevel: 'veteran', status: 'online' },
  { username: 'ElectricSoul', glowLevel: 'newbie', status: 'online' },
  { username: 'CyberHeart', glowLevel: 'regular', status: 'online' },
  { username: 'DigitalDream', glowLevel: 'veteran', status: 'away' },
  { username: 'VoltageVibes', glowLevel: 'regular', status: 'online' },
];

export default function ChatRoomScreen({ route, navigation }) {
  const { room } = route.params;
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isWhisperMode, setIsWhisperMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserList, setShowUserList] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVoiceMessage, setRecordedVoiceMessage] = useState(null);
  
  const scrollViewRef = useRef();
  const pulseAnim = new Animated.Value(1);
  const glowAnim = new Animated.Value(0);

  useEffect(() => {
    // Room pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
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

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: 'You',
        message: isWhisperMode && selectedUser 
          ? `*whispers to ${selectedUser}* ${newMessage}` 
          : newMessage,
        timestamp: new Date(),
        isWhisper: isWhisperMode && selectedUser,
        glowLevel: 'regular',
        whisperTo: selectedUser,
        type: 'text',
      };

      setMessages([...messages, message]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else if (recordedVoiceMessage) {
      const message = {
        id: messages.length + 1,
        user: 'You',
        timestamp: new Date(),
        isWhisper: isWhisperMode && selectedUser,
        glowLevel: 'regular',
        type: 'voice',
        voiceMessage: recordedVoiceMessage,
      };

      setMessages([...messages, message]);
      setRecordedVoiceMessage(null);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const getGlowColor = (glowLevel) => {
    switch (glowLevel) {
      case 'newbie': return '#9966ff';
      case 'regular': return '#00ffff';
      case 'veteran': return '#ff0080';
      default: return '#ffffff';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#00ff00';
      case 'away': return '#ffaa00';
      case 'busy': return '#ff0000';
      default: return '#666666';
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const glowIntensity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = (voiceMessage) => {
    setIsRecording(false);
    setRecordedVoiceMessage(voiceMessage);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={room.colors}
          style={styles.background}
        >
          {/* Header */}
          <BlurView intensity={20} style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text style={styles.roomEmoji}>{room.emoji}</Text>
              <View>
                <Text style={[styles.roomName, { color: room.accentColor }]}>
                  {room.name}
                </Text>
                <Text style={styles.activeUsers}>
                  {MOCK_USERS.filter(u => u.status === 'online').length} souls glowing
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.usersButton}
              onPress={() => setShowUserList(!showUserList)}
            >
              <Text style={styles.usersButtonText}>👥</Text>
            </TouchableOpacity>
          </BlurView>

          {/* User List Sidebar */}
          {showUserList && (
            <BlurView intensity={25} style={styles.userListSidebar}>
              <Text style={styles.userListTitle}>SOULS IN THE ROOM</Text>
              {MOCK_USERS.map((user, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.userItem}
                  onPress={() => {
                    setSelectedUser(user.username);
                    setIsWhisperMode(true);
                    setShowUserList(false);
                  }}
                >
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(user.status) }]} />
                  <Text style={[styles.username, { color: getGlowColor(user.glowLevel) }]}>
                    {user.username}
                  </Text>
                  <Text style={styles.glowBadge}>{user.glowLevel}</Text>
                </TouchableOpacity>
              ))}
            </BlurView>
          )}

          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <Animated.View 
                key={msg.id} 
                style={[
                  styles.messageContainer,
                  msg.isWhisper && styles.whisperMessage,
                  { opacity: glowIntensity }
                ]}
              >
                <BlurView 
                  intensity={msg.isWhisper ? 30 : 15} 
                  style={[
                    styles.messageBubble,
                    msg.isWhisper && { borderColor: '#ff0080', borderWidth: 1 }
                  ]}
                >
                  <View style={styles.messageHeader}>
                    <Text style={[styles.messageUser, { color: getGlowColor(msg.glowLevel) }]}>
                      {msg.user}
                    </Text>
                    <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
                  </View>
                  {msg.type === 'text' ? (
                    <Text style={[
                      styles.messageText,
                      msg.isWhisper && { fontStyle: 'italic', color: '#ff0080' }
                    ]}>
                      {msg.message}
                    </Text>
                  ) : (
                    <VoicePlayer voiceMessage={msg.voiceMessage} />
                  )}
                </BlurView>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Input Area */}
          <BlurView intensity={25} style={styles.inputContainer}>
            {isWhisperMode && selectedUser && (
              <View style={styles.whisperIndicator}>
                <Text style={styles.whisperText}>
                  💌 Whispering to {selectedUser}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setIsWhisperMode(false);
                    setSelectedUser(null);
                  }}
                >
                  <Text style={styles.cancelWhisper}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputRow}>
              <TouchableOpacity 
                style={[styles.whisperButton, isWhisperMode && styles.whisperButtonActive]}
                onPress={() => setIsWhisperMode(!isWhisperMode)}
              >
                <Text style={styles.whisperButtonText}>💌</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.messageInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder={isWhisperMode ? "Whisper something sweet..." : "Share your energy..."}
                placeholderTextColor="#666"
                multiline
                maxLength={200}
              />

              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <LinearGradient
                  colors={[room.accentColor, '#ffffff']}
                  style={styles.sendButtonGradient}
                >
                  <Text style={styles.sendButtonText}>⚡️</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                <LinearGradient
                  colors={[room.accentColor, '#ffffff']}
                  style={styles.recordButtonGradient}
                >
                  {isRecording ? (
                    <Text style={styles.recordButtonText}>🔴</Text>
                  ) : (
                    <Text style={styles.recordButtonText}>🎙️</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {isRecording && (
                <VoiceRecorder onStopRecording={stopRecording} />
              )}
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomEmoji: {
    fontSize: 30,
    marginRight: 10,
  },
  roomName: {
    fontSize: 20,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  activeUsers: {
    color: '#cccccc',
    fontSize: 12,
    opacity: 0.8,
  },
  usersButton: {
    padding: 10,
  },
  usersButtonText: {
    fontSize: 20,
  },
  userListSidebar: {
    position: 'absolute',
    right: 0,
    top: 100,
    width: 200,
    maxHeight: 300,
    zIndex: 1000,
    padding: 15,
    borderRadius: 15,
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userListTitle: {
    color: '#00ffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  username: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  glowBadge: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 15,
  },
  whisperMessage: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  messageBubble: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  messageUser: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  messageTime: {
    color: '#666',
    fontSize: 12,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  whisperIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 128, 0.2)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  whisperText: {
    color: '#ff0080',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelWhisper: {
    color: '#ff0080',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  whisperButton: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  whisperButtonActive: {
    backgroundColor: 'rgba(255, 0, 128, 0.3)',
    borderColor: '#ff0080',
  },
  whisperButtonText: {
    fontSize: 18,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 18,
  },
  recordButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  recordButtonGradient: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonText: {
    fontSize: 18,
  },
});
