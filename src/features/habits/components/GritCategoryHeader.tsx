import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import { HabitCategory } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';
import { IOS_SPRINGS } from '../../../styles/animations';

interface GritCategoryHeaderProps {
  category: HabitCategory;
  isOpen: boolean;
  onToggle: () => void;
  completedCount: number;
  totalCount: number;
  isDark?: boolean;
}

const MINI_RADIUS = 10;
const MINI_CIRCUMFERENCE = 2 * Math.PI * MINI_RADIUS;

export const GritCategoryHeader: React.FC<GritCategoryHeaderProps> = ({
  category,
  isOpen,
  onToggle,
  completedCount,
  totalCount,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const rotation = useSharedValue(isOpen ? 0 : -90);

  React.useEffect(() => {
    rotation.value = withSpring(isOpen ? 0 : -90, IOS_SPRINGS.snappy);
  }, [isOpen]);

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const strokeDashoffset = MINI_CIRCUMFERENCE * (1 - progress);
  const catColor = category.color || '#FF9500';

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 4,
        marginTop: 8,
        marginBottom: 8,
      })}
    >
      {/* Izquierda: Emoji + Nombre de Categoría */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ fontSize: 24 }}>{category.emoji}</Text>
        <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.4 }}>
          {category.name}
        </Text>
      </View>

      {/* Derecha: Mini Anillo SVG + Badge + Chevron */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {/* Mini Anillo SVG de Progreso */}
        <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width="26" height="26" viewBox="0 0 26 26">
            <Circle
              cx="13"
              cy="13"
              r={MINI_RADIUS}
              stroke={isDark ? '#2C2C2E' : '#E5E5EA'}
              strokeWidth="2.5"
              fill="none"
            />
            <Circle
              cx="13"
              cy="13"
              r={MINI_RADIUS}
              stroke={catColor}
              strokeWidth="2.5"
              fill="none"
              strokeDasharray={MINI_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 13 13)"
            />
          </Svg>
        </View>

        {/* Badge de Conteo */}
        <View
          style={{
            backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary }}>
            {completedCount}/{totalCount}
          </Text>
        </View>

        {/* Chevron Rotativo */}
        <Animated.View style={animatedChevronStyle}>
          <ChevronDown size={18} color={theme.text.secondary} />
        </Animated.View>
      </View>
    </Pressable>
  );
};
