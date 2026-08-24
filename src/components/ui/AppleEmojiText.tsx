import React from 'react';
import { Text, TextStyle, StyleProp, View } from 'react-native';
import { AppleEmoji } from './AppleEmoji';
import { EMOJI_GLOBAL_REGEX } from '../../utils/appleEmojiUtils';

interface AppleEmojiTextProps {
  children?: string;
  style?: StyleProp<TextStyle>;
  emojiSize?: number;
}

export const AppleEmojiText: React.FC<AppleEmojiTextProps> = React.memo(({
  children,
  style,
  emojiSize,
}) => {
  if (!children || typeof children !== 'string') {
    return <Text style={style}>{children}</Text>;
  }

  // Extraer tamaño de fuente del estilo si no se especificó emojiSize
  const flattenedStyle = Array.isArray(style) ? Object.assign({}, ...style) : style || {};
  const calculatedEmojiSize = emojiSize || (flattenedStyle.fontSize ? Math.round(flattenedStyle.fontSize * 1.1) : 18);

  const parts = children.split(EMOJI_GLOBAL_REGEX);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (EMOJI_GLOBAL_REGEX.test(part)) {
          return (
            <AppleEmoji
              key={index}
              emoji={part}
              size={calculatedEmojiSize}
              style={{ marginHorizontal: 2 }}
            />
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </Text>
  );
});
