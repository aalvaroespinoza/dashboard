import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { getSpecularCardStyle } from '../../styles/theme';
import { createShadow } from '../../styles/shadows';

interface SpecularCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  isDark?: boolean;
  padding?: number;
}

export const SpecularCard: React.FC<SpecularCardProps> = ({
  children,
  style,
  isDark = true,
  padding = 22,
}) => {
  const specularStyle = getSpecularCardStyle(isDark);
  const shadow = createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.22 : 0.04, 10);

  return (
    <View
      style={[
        specularStyle,
        {
          padding,
          ...shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
