import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const NeonButton = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, accent, ghost
  size = 'medium', // small, medium, large
  theme = 'electric', // electric, midnight, sunset
  disabled = false,
  loading = false,
  icon = null,
  className = '',
  ...props
}) => {
  // Theme color configurations
  const themes = {
    electric: {
      primary: ['#00ffff', '#00ff80'],
      secondary: ['#0080ff', '#00ffff'],
      accent: ['#00ff80', '#0080ff'],
      text: '#ffffff',
      shadow: '#00ffff',
    },
    midnight: {
      primary: ['#8000ff', '#ff0080'],
      secondary: ['#4000cc', '#8000ff'],
      accent: ['#ff0080', '#4000cc'],
      text: '#ffffff',
      shadow: '#8000ff',
    },
    sunset: {
      primary: ['#ff8000', '#ff0080'],
      secondary: ['#ff4000', '#ff8000'],
      accent: ['#ff0080', '#ff4000'],
      text: '#ffffff',
      shadow: '#ff8000',
    },
  };

  // Size configurations
  const sizes = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 14,
      borderRadius: 16,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      fontSize: 16,
      borderRadius: 20,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      fontSize: 18,
      borderRadius: 24,
    },
  };

  const currentTheme = themes[theme];
  const currentSize = sizes[size];

  // Get gradient colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case 'secondary':
        return currentTheme.secondary;
      case 'accent':
        return currentTheme.accent;
      case 'ghost':
        return ['transparent', 'transparent'];
      default:
        return currentTheme.primary;
    }
  };

  // Get button styles
  const getButtonStyles = () => {
    const baseStyle = {
      borderRadius: currentSize.borderRadius,
      paddingVertical: currentSize.paddingVertical,
      paddingHorizontal: currentSize.paddingHorizontal,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    if (variant === 'ghost') {
      return {
        ...baseStyle,
        borderWidth: 2,
        borderColor: currentTheme.shadow,
        backgroundColor: 'transparent',
      };
    }

    return baseStyle;
  };

  // Get text styles
  const getTextStyles = () => ({
    color: variant === 'ghost' ? currentTheme.shadow : currentTheme.text,
    fontSize: currentSize.fontSize,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: currentTheme.shadow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: variant === 'ghost' ? 5 : 10,
  });

  // Get shadow styles
  const getShadowStyles = () => ({
    shadowColor: currentTheme.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: disabled ? 0.3 : 0.8,
    shadowRadius: disabled ? 5 : 15,
    elevation: disabled ? 2 : 8,
  });

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  const ButtonContent = () => (
    <View style={[getButtonStyles(), getShadowStyles()]}>
      {variant !== 'ghost' ? (
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            ...getButtonStyles(),
            paddingVertical: 0,
            paddingHorizontal: 0,
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
        />
      ) : null}
      
      <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 1 }}>
        {icon && (
          <View style={{ marginRight: title ? 8 : 0 }}>
            {icon}
          </View>
        )}
        
        {title && (
          <Text style={getTextStyles()}>
            {loading ? 'Loading...' : title}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={className}
      {...props}
    >
      <Animatable.View
        animation={disabled ? undefined : 'pulse'}
        iterationCount="infinite"
        duration={2000}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <ButtonContent />
      </Animatable.View>
    </TouchableOpacity>
  );
};

export default NeonButton;
