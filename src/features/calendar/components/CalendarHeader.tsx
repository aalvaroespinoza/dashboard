import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { CalendarViewMode } from '../../../store/useCalendarStore';
import { IOS_COLORS } from '../../../styles/theme';
import { IOSSegmentedControl, SegmentTab } from '../../../components/ui/IOSSegmentedControl';

interface CalendarHeaderProps {
  rangeLabel: string;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  isDark?: boolean;
}

const VIEW_TABS: SegmentTab<CalendarViewMode>[] = [
  { id: 'day', label: 'Día' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
];

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  rangeLabel,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: theme.card,
      }}
    >
      {/* Rango de Fechas Visible */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.5 }}>
          {rangeLabel}
        </Text>
      </View>

      {/* Controles Derecha: Segmented View Switcher + Hoy + Flechas */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {/* Segmented Control Día / Semana / Mes con pastilla deslizante */}
        <IOSSegmentedControl<CalendarViewMode>
          tabs={VIEW_TABS}
          selectedTab={viewMode}
          onTabChange={onViewModeChange}
          isDark={isDark}
        />

        {/* Botón Hoy */}
        <Pressable
          onPress={onToday}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: theme.cardSecondary,
            borderWidth: 1,
            borderColor: theme.border,
          })}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.primary }}>
            Hoy
          </Text>
        </Pressable>

        {/* Flechas < > */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Pressable
            onPress={onPrev}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: theme.cardSecondary,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: theme.border,
            })}
          >
            <ChevronLeft size={16} color={theme.text.primary} />
          </Pressable>

          <Pressable
            onPress={onNext}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: theme.cardSecondary,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: theme.border,
            })}
          >
            <ChevronRight size={16} color={theme.text.primary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};
