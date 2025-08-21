# 🌈 Neon Dating App - Frontend

A React Native + Expo dating app with neon cyberpunk aesthetics and real-time chat features.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- For iOS: Xcode (macOS only) or Expo Go app
- For Android: Android Studio or Expo Go app

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
# Start Expo development server
npm start

# Or specific platforms
npm run ios          # iOS Simulator (macOS only)
npm run android      # Android Emulator
npm run web          # Web browser
npm run tunnel       # Tunnel for physical devices
```

3. **Run on device:**
   - Install **Expo Go** from App Store/Google Play
   - Scan the QR code from the terminal
   - Or press `w` for web version

## 🎨 Features

- **Neon Cyberpunk UI** with electric, midnight, and sunset themes
- **Real-time Chat** with Socket.io integration
- **Connection Quiz** system for compatibility matching
- **Voice Messages** with neon waveform visualizations
- **Profile Glow System** based on user activity
- **Themed Chat Rooms** with dynamic backgrounds

## 🔧 Backend Integration

The frontend connects to the Node.js backend at:
- **Development:** `http://localhost:5000`
- **Socket.io:** Real-time chat and notifications
- **Authentication:** JWT token-based auth system

## 📱 Development

### Project Structure
```
src/
├── components/     # Reusable neon components
├── screens/        # App screens
├── services/       # API and auth services
├── config/         # Configuration files
└── navigation/     # Navigation setup
```

### Available Scripts
- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run tunnel` - Create tunnel for remote devices

## 🎯 Next Steps

1. Complete authentication screens
2. Build chat room interface
3. Implement connection quiz
4. Add voice message features
5. Create profile management

## 🌟 Tech Stack

- **React Native** + **Expo**
- **NativeWind** (Tailwind CSS for React Native)
- **Socket.io Client** for real-time features
- **React Navigation** for routing
- **Expo Linear Gradient** for neon effects
- **React Native Reanimated** for animations

---

**Ready to light up the dating world with neon vibes!** ⚡💖
