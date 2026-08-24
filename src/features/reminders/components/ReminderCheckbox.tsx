import React, { useEffect } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { IOS_SPRINGS } from '../../../styles/animations';
import { IOS_COLORS } from '../../../styles/theme';
import { useAppStore } from '../../../store/useAppStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ReminderCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  color?: string;
  size?: number;
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ReminderCheckbox: React.FC<ReminderCheckboxProps> = ({
  checked,
  onToggle,
  color = IOS_COLORS.blue,
  size = 22,
  isDark: propIsDark,
  style,
}) => {
  const { themeMode } = useAppStore();
  const isDark = propIsDark !== undefined ? propIsDark : themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const scale = useSharedValue(1);
  const fillProgress = useSharedValue(checked ? 1 : 0);
  const checkmarkOpacity = useSharedValue(checked ? 1 : 0);
  const checkmarkRotation = useSharedValue(checked ? 0 : -15);

  useEffect(() => {
    if (checked) {
      // Fase 2 y 3: Rebote a 1.15 y asentamiento en 1.0 + Relleno y rotación del checkmark
      scale.value = withSequence(
        withSpring(1.15, IOS_SPRINGS.snappy),
        withSpring(1.0, IOS_SPRINGS.snappy)
      );
      fillProgress.value = withSpring(1, IOS_SPRINGS.snappy);
      checkmarkOpacity.value = withTiming(1, { duration: 180 });
      checkmarkRotation.value = withSpring(0, IOS_SPRINGS.snappy);
    } else {
      // Desmarcar: Pulso sutil y vaciado rápido
      scale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1.0, IOS_SPRINGS.snappy)
      );
      fillProgress.value = withTiming(0, { duration: 150 });
      checkmarkOpacity.value = withTiming(0, { duration: 100 });
      checkmarkRotation.value = withTiming(-15, { duration: 100 });
    }
  }, [checked]);

  const handlePressIn = () => {
    'worklet';
    // Fase 1 (Press): Contracción a 0.8
    scale.value = withSpring(0.8, IOS_SPRINGS.snappy);
  };

  const handlePressOut = () => {
    'worklet';
    if (!checked) {
      scale.value = withSpring(1.0, IOS_SPRINGS.snappy);
    }
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const defaultBorderColor = isDark ? '#6366F6' : '#C7C7CC';
    const borderColor = interpolateColor(
      fillProgress.value,
      [0, 1],
      [defaultBorderColor, color]
    );

    const backgroundColor = interpolateColor(
      fillProgress.value,
      [0, 1],
      ['rgba(0,0,0,0)', color]
    );

    return {
      transform: [{ scale: scale.value }],
      borderColor,
      backgroundColor,
    };
  });

  const animatedCheckmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: checkmarkOpacity.value,
      transform: [{ rotate: `${checkmarkRotation.value}deg` }],
    };
  });

  return (
    <AnimatedPressable
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        animatedContainerStyle,
        style,
      ]}
    >
      <Animated.View style={animatedCheckmarkStyle}>
        <Check
          size={Math.round(size * 0.58)}
          color="#FFFFFF"
          strokeWidth={3.2}
        />
      </Animated.View>
    </AnimatedPressable>
  );
};
