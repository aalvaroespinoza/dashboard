import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  LinearTransition,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import { HabitCategory, HabitItem, HabitLogItem } from '../../../types';
import { HabitCard } from './HabitCard';
import { IOS_COLORS } from '../../../styles/theme';
import { IOS_SPRINGS } from '../../../styles/animations';
import { createShadow } from '../../../styles/shadows';

interface HabitSectionAccordionProps {
  category: HabitCategory;
  habits: HabitItem[];
  recentDates: string[];
  logsMap: Record<string, Record<string, HabitLogItem>>;
  onOpenTimerModal?: (habit: HabitItem) => void;
  onOpenNoteModal?: (habit: HabitItem) => void;
  isDark?: boolean;
}

export const HabitSectionAccordion: React.FC<HabitSectionAccordionProps> = ({
  category,
  habits,
  recentDates,
  logsMap,
  onOpenTimerModal,
  onOpenNoteModal,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const [isOpen, setIsOpen] = useState(true);

  const rotation = useSharedValue(0);
  const today = new Date().toISOString().split('T')[0];

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    rotation.value = withSpring(next ? 0 : -90, IOS_SPRINGS.snappy);
  };

  const animatedChevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const completedTodayCount = habits.filter(
    (h) => logsMap[h.id]?.[today]?.is_completed
  ).length;

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(20).stiffness(160)}
      style={{
        backgroundColor: theme.card,
        borderRadius: 32,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 16,
        ...createShadow('#000000', { width: 0, height: 2 }, 0.04, 6),
      }}
    >
      {/* Header del Acordeón */}
      <Pressable
        onPress={toggleOpen}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 28 }}>{category.emoji}</Text>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary }}>
              {category.name}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.text.secondary }}>
              {completedTodayCount} de {habits.length} completados hoy
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Badge de Progreso */}
          <View
            style={{
              backgroundColor: category.color ? `${category.color}20` : theme.cardSecondary,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: category.color ? `${category.color}40` : theme.border,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '900',
                color: category.color || IOS_COLORS.blue,
              }}
            >
              {completedTodayCount === habits.length && habits.length > 0
                ? '¡Completado! ✨'
                : `${Math.round((completedTodayCount / (habits.length || 1)) * 100)}%`}
            </Text>
          </View>

          {/* Chevron Rotativo */}
          <Animated.View style={animatedChevronStyle}>
            <ChevronDown size={20} color={theme.text.secondary} />
          </Animated.View>
        </View>
      </Pressable>

      {/* Lista de Tarjetas del Hábito */}
      {isOpen && (
        <View style={{ gap: 12 }}>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              recentDates={recentDates}
              logsForHabit={logsMap[habit.id] || {}}
              onOpenTimerModal={onOpenTimerModal}
              onOpenNoteModal={onOpenNoteModal}
              isDark={isDark}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
};
