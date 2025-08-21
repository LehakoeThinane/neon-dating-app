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

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What's your ideal Friday night?",
    options: [
      { text: "Dancing under neon lights", value: "party", points: 2 },
      { text: "Deep conversations over coffee", value: "intimate", points: 3 },
      { text: "Gaming marathon with friends", value: "chill", points: 1 },
      { text: "Exploring the city's hidden gems", value: "adventure", points: 2 },
    ]
  },
  {
    id: 2,
    question: "How do you handle conflict?",
    options: [
      { text: "Face it head-on with honesty", value: "direct", points: 3 },
      { text: "Take time to cool down first", value: "thoughtful", points: 2 },
      { text: "Try to find humor in the situation", value: "lighthearted", points: 2 },
      { text: "Avoid it until it resolves itself", value: "avoidant", points: 1 },
    ]
  },
  {
    id: 3,
    question: "What attracts you most in someone?",
    options: [
      { text: "Their sense of humor", value: "funny", points: 2 },
      { text: "Their ambition and drive", value: "ambitious", points: 3 },
      { text: "Their kindness and empathy", value: "kind", points: 3 },
      { text: "Their mysterious aura", value: "mysterious", points: 1 },
    ]
  },
  {
    id: 4,
    question: "Your communication style is:",
    options: [
      { text: "Emoji and memes all the way", value: "playful", points: 1 },
      { text: "Long, thoughtful messages", value: "deep", points: 3 },
      { text: "Quick and to the point", value: "efficient", points: 2 },
      { text: "Voice notes and calls", value: "personal", points: 2 },
    ]
  },
  {
    id: 5,
    question: "What's your love language?",
    options: [
      { text: "Quality time together", value: "time", points: 3 },
      { text: "Physical touch and affection", value: "touch", points: 2 },
      { text: "Words of affirmation", value: "words", points: 2 },
      { text: "Acts of service", value: "service", points: 3 },
    ]
  }
];

export default function ConnectionQuizScreen({ navigation }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isSparkTriggered, setIsSparkTriggered] = useState(false);

  // Animation values
  const progressAnim = new Animated.Value(0);
  const sparkAnim = new Animated.Value(0);
  const glowAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    // Update progress bar
    Animated.timing(progressAnim, {
      toValue: (currentQuestion / QUIZ_QUESTIONS.length) * 100,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();

    return () => glowAnimation.stop();
  }, [currentQuestion]);

  const handleAnswer = (option) => {
    const newAnswers = [...answers, option];
    const newScore = totalScore + option.points;
    
    setAnswers(newAnswers);
    setTotalScore(newScore);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed
      setShowResult(true);
      
      // Check if spark should be triggered (7/10+ compatibility)
      const compatibility = (newScore / 15) * 10; // Max possible score is 15
      if (compatibility >= 7) {
        setIsSparkTriggered(true);
        triggerSparkAnimation();
      }
    }
  };

  const triggerSparkAnimation = () => {
    // Epic spark animation sequence
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(sparkAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setTotalScore(0);
    setShowResult(false);
    setIsSparkTriggered(false);
    sparkAnim.setValue(0);
    scaleAnim.setValue(1);
  };

  const getCompatibilityLevel = () => {
    const compatibility = (totalScore / 15) * 10;
    if (compatibility >= 9) return { level: "ELECTRIC", color: "#00ffff", emoji: "⚡️" };
    if (compatibility >= 7) return { level: "SPARKING", color: "#ff0080", emoji: "✨" };
    if (compatibility >= 5) return { level: "WARMING UP", color: "#ff6600", emoji: "🔥" };
    return { level: "GETTING TO KNOW", color: "#9966ff", emoji: "💜" };
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const sparkOpacity = sparkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (showResult) {
    const compatibility = getCompatibilityLevel();
    const compatibilityScore = Math.round((totalScore / 15) * 10);

    return (
      <LinearGradient
        colors={['#0a0a0a', '#1a0a2a', '#0a0a0a']}
        style={styles.container}
      >
        {/* Spark Animation Overlay */}
        {isSparkTriggered && (
          <Animated.View style={[styles.sparkOverlay, { opacity: sparkOpacity }]}>
            <Text style={styles.sparkText}>⚡️✨💫⚡️</Text>
            <Text style={styles.sparkMessage}>CONNECTION SPARK!</Text>
            <Text style={styles.sparkSubtext}>DMs Unlocked!</Text>
          </Animated.View>
        )}

        <ScrollView contentContainerStyle={styles.resultContent}>
          <Animated.View style={[styles.resultContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.resultTitle}>COMPATIBILITY SCAN</Text>
            <Text style={styles.resultSubtitle}>Complete ⚡️</Text>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreNumber}>{compatibilityScore}/10</Text>
              <Text style={[styles.scoreLevel, { color: compatibility.color }]}>
                {compatibility.emoji} {compatibility.level}
              </Text>
            </View>

            <BlurView intensity={20} style={styles.resultCard}>
              <Text style={styles.resultDescription}>
                {compatibilityScore >= 7 
                  ? "🎉 Amazing connection! You've unlocked direct messaging and special features. Your neon aura is glowing bright!"
                  : "Keep exploring! Complete more quizzes with different people to find your perfect spark. Every connection teaches us something new."
                }
              </Text>

              {compatibilityScore >= 7 && (
                <View style={styles.unlockedFeatures}>
                  <Text style={styles.featuresTitle}>✨ UNLOCKED FEATURES:</Text>
                  <Text style={styles.featureItem}>💬 Direct Messaging</Text>
                  <Text style={styles.featureItem}>💌 Secret Admirer Letters</Text>
                  <Text style={styles.featureItem}>🎵 Voice Notes</Text>
                  <Text style={styles.featureItem}>⭐ Premium Glow Effect</Text>
                </View>
              )}
            </BlurView>

            <TouchableOpacity style={styles.actionButton} onPress={resetQuiz}>
              <LinearGradient
                colors={['#ff0080', '#00ffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>TAKE ANOTHER QUIZ</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back to Rooms</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a0a2a', '#0a0a0a']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CONNECTION QUIZ</Text>
        <Text style={styles.headerSubtitle}>Earn your way to deeper connections</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                opacity: glowOpacity,
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
        </Text>
      </View>

      {/* Question */}
      <ScrollView style={styles.questionContainer}>
        <BlurView intensity={15} style={styles.questionCard}>
          <Text style={styles.questionNumber}>Q{currentQuestion + 1}</Text>
          <Text style={styles.questionText}>
            {QUIZ_QUESTIONS[currentQuestion].question}
          </Text>

          <View style={styles.optionsContainer}>
            {QUIZ_QUESTIONS[currentQuestion].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleAnswer(option)}
              >
                <LinearGradient
                  colors={['rgba(0, 255, 255, 0.1)', 'rgba(255, 0, 128, 0.1)']}
                  style={styles.optionGradient}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ffff',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ff0080',
    marginTop: 5,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ffff',
    borderRadius: 2,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 10,
    opacity: 0.8,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionCard: {
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 16,
    color: '#ff0080',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  questionText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 25,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  optionGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
  },
  optionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Result styles
  sparkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  sparkText: {
    fontSize: 60,
    marginBottom: 20,
  },
  sparkMessage: {
    fontSize: 32,
    color: '#00ffff',
    fontWeight: 'bold',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 10,
  },
  sparkSubtext: {
    fontSize: 18,
    color: '#ff0080',
    fontWeight: 'bold',
  },
  resultContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 28,
    color: '#00ffff',
    fontWeight: 'bold',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 5,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#ff0080',
    marginBottom: 30,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreNumber: {
    fontSize: 48,
    color: '#ffffff',
    fontWeight: 'bold',
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scoreLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  resultCard: {
    width: '100%',
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    marginBottom: 30,
  },
  resultDescription: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  unlockedFeatures: {
    alignItems: 'center',
  },
  featuresTitle: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featureItem: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.9,
  },
  actionButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 15,
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
  backButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666666',
    fontSize: 16,
  },
});
