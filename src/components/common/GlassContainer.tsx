import React from 'react';
import { View, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  isDark?: boolean;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  style,
  intensity = 35,
  tint,
  isDark = true,
}) => {
  const resolvedTint = tint || (isDark ? 'dark' : 'light');

  // En Android y tablets de gama media, BlurView en tiempo real causa caídas de frames.
  // Usamos una superficie translúcida GPU-friendly con micro-borde para máximo rendimiento (60fps).
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          {
            backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(242, 242, 247, 0.95)',
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          overflow: 'hidden',
          backgroundColor: isDark ? 'rgba(18, 18, 20, 0.82)' : 'rgba(255, 255, 255, 0.85)',
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={resolvedTint}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      />
      {children}
    </View>
  );
};
