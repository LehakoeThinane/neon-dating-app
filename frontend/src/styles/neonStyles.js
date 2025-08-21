import { StyleSheet } from 'react-native';

// Neon color palette
export const neonColors = {
  // Neon Color Palette
  neon: {
    pink: '#ff0080',
    cyan: '#00ffff',
    purple: '#8000ff',
    green: '#00ff80',
    orange: '#ff8000',
    blue: '#0080ff',
    yellow: '#ffff00',
  },
  // Dark Theme Base
  dark: {
    900: '#0a0a0a',
    800: '#1a1a1a',
    700: '#2a2a2a',
    600: '#3a3a3a',
    500: '#4a4a4a',
  },
  // Room Themes
  midnight: {
    primary: '#8000ff',
    secondary: '#ff0080',
    accent: '#4000cc',
  },
  electric: {
    primary: '#00ffff',
    secondary: '#00ff80',
    accent: '#0080ff',
  },
  sunset: {
    primary: '#ff8000',
    secondary: '#ff0080',
    accent: '#ff4000',
  }
};

// Neon styles for React Native components
export const neonStyles = StyleSheet.create({
  // Basic neon glow effect
  neonGlow: {
    color: neonColors.neon.cyan,
    textShadowColor: neonColors.neon.cyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  
  // Neon border effect
  neonBorder: {
    borderWidth: 1,
    borderColor: neonColors.neon.cyan,
    shadowColor: neonColors.neon.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5, // Android shadow
  },
  
  // Container with dark background
  darkContainer: {
    backgroundColor: neonColors.dark[900],
    flex: 1,
  },
  
  // Neon text variants
  neonTextPink: {
    color: neonColors.neon.pink,
    textShadowColor: neonColors.neon.pink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontWeight: 'bold',
  },
  
  neonTextCyan: {
    color: neonColors.neon.cyan,
    textShadowColor: neonColors.neon.cyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontWeight: 'bold',
  },
  
  neonTextGreen: {
    color: neonColors.neon.green,
    textShadowColor: neonColors.neon.green,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontWeight: 'bold',
  },
  
  // Neon button base
  neonButtonBase: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  
  // Electric theme button
  electricButton: {
    borderWidth: 2,
    borderColor: neonColors.electric.primary,
    shadowColor: neonColors.electric.primary,
  },
  
  // Midnight theme button
  midnightButton: {
    borderWidth: 2,
    borderColor: neonColors.midnight.primary,
    shadowColor: neonColors.midnight.primary,
  },
  
  // Sunset theme button
  sunsetButton: {
    borderWidth: 2,
    borderColor: neonColors.sunset.primary,
    shadowColor: neonColors.sunset.primary,
  },
  
  // Center content
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: neonColors.dark[900],
  },
  
  // Neon card
  neonCard: {
    backgroundColor: neonColors.dark[800],
    borderRadius: 15,
    padding: 20,
    margin: 10,
    borderWidth: 1,
    borderColor: neonColors.dark[600],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default neonStyles;
