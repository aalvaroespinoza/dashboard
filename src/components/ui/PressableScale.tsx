import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { IOS_SPRINGS } from '../../styles/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  /**
   * Escala mínima alcanzada al presionar (default: 0.96 para cards/elementos estándar)
   */
  activeScale?: number;
  /**
   * Opacidad al presionar (default: 0.85)
   */
  activeOpacity?: number;
  /**
   * Preset de física spring a utilizar (default: 'snappy')
   */
  springPreset?: keyof typeof IOS_SPRINGS;
  /**
   * Estilo de la vista animada
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Clases de NativeWind / Tailwind
   */
  className?: string;
  children?: React.ReactNode;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
  activeScale = 0.96,
  activeOpacity = 0.85,
  springPreset = 'snappy',
  style,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const springConfig = IOS_SPRINGS[springPreset] || IOS_SPRINGS.snappy;

  const handlePressIn = (event: GestureResponderEvent) => {
    'worklet';
    if (!disabled) {
      scale.value = withSpring(activeScale, springConfig);
      opacity.value = withSpring(activeOpacity, springConfig);
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    'worklet';
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
      opacity.value = withSpring(1, springConfig);
    }
    onPressOut?.(event);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
};
