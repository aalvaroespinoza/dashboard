import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useHabitsStore } from '../stores/useHabitsStore';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface GritDateScrubberProps {
  isDark?: boolean;
}

const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

export const GritDateScrubber: React.FC<GritDateScrubberProps> = ({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { recentDates, selectedDate, setSelectedDate, habits, logsMap } = useHabitsStore();

  return (
    <View style={{ marginBottom: 12 }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={recentDates}
        keyExtractor={(item) => item}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
        renderItem={({ item: dateStr }) => {
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === '2026-08-24';

          const [y, m, d] = dateStr.split('-').map(Number);
          const dateObj = new Date(y, m - 1, d);
          const dayName = DAY_NAMES[dateObj.getDay()];
          const dayNumber = d;

          // Check if all habits or at least some were completed on this date
          const completedCount = habits.filter((h) => logsMap[h.id]?.[dateStr]?.is_completed).length;
          const hasActivity = completedCount > 0;

          return (
            <Pressable
              onPress={() => setSelectedDate(dateStr)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                alignItems: 'center',
                justifyContent: 'center',
                width: 58,
                paddingVertical: 10,
                borderRadius: 18,
                backgroundColor: isSelected
                  ? '#FF9500'
                  : isDark
                  ? '#1C1C1E'
                  : '#FFFFFF',
                borderWidth: 1.5,
                borderColor: isSelected
                  ? '#FF9500'
                  : isToday
                  ? 'rgba(255, 149, 0, 0.4)'
                  : theme.border,
                gap: 4,
                ...createShadow(
                  isSelected ? '#FF9500' : '#000000',
                  { width: 0, height: 2 },
                  isSelected ? 0.25 : 0.03,
                  4
                ),
              })}
            >
              {/* Nombre del Día */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '800',
                  color: isSelected
                    ? '#FFFFFF'
                    : isToday
                    ? '#FF9500'
                    : theme.text.tertiary,
                  letterSpacing: 0.5,
                }}
              >
                {dayName}
              </Text>

              {/* Número del Día */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '900',
                  color: isSelected
                    ? '#FFFFFF'
                    : isToday
                    ? '#FF9500'
                    : theme.text.primary,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {dayNumber}
              </Text>

              {/* Punto de Estado */}
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: isSelected
                    ? '#FFFFFF'
                    : hasActivity
                    ? '#34C759'
                    : 'transparent',
                }}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
};
