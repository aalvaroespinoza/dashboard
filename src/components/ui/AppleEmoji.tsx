import React, { useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { getAppleEmojiUrl } from '../../utils/appleEmojiUtils';

interface AppleEmojiProps {
  emoji: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export const AppleEmoji: React.FC<AppleEmojiProps> = React.memo(({
  emoji,
  size = 22,
  style,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!emoji) return null;

  // Si falló la carga de la imagen remota, renderizar fallback nativo con tamaño exacto
  if (hasError) {
    return (
      <Text
        style={{
          fontSize: size,
          lineHeight: size * 1.15,
          textAlign: 'center',
          includeFontPadding: false,
        }}
      >
        {emoji}
      </Text>
    );
  }

  const uri = getAppleEmojiUrl(emoji);

  return (
    <Image
      source={{ uri }}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
      contentFit="contain"
      cachePolicy="memory-disk"
      priority="high"
      transition={120}
      onError={() => setHasError(true)}
    />
  );
});
