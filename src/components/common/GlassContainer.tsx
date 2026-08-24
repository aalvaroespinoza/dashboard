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

  // En Android y Web, BlurView funciona con aceleración por hardware
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
