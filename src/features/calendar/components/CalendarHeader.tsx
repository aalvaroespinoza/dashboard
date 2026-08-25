import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react-native';
import { CalendarViewMode, CalendarCategoryItem } from '../../../types';
import { IOS_COLORS, IOS_FONTS } from '../../../styles/theme';
import { IOSSegmentedControl, SegmentTab } from '../../../components/ui/IOSSegmentedControl';
import { createShadow } from '../../../styles/shadows';

interface CalendarHeaderProps {
  rangeLabel: string;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  categories?: CalendarCategoryItem[];
  onToggleCategory?: (id: string) => void;
  onAddEvent?: () => void;
  onOpenSettings?: () => void;
  isDark?: boolean;
}

const VIEW_TABS: SegmentTab<CalendarViewMode>[] = [
  { id: 'day', label: 'Día' },
  { id: 'week', label: 'Semana' },
  { id: 'month_hybrid', label: 'Mes' },
];

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  rangeLabel,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  categories = [],
  onToggleCategory,
  onAddEvent,
  onOpenSettings,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: isDark ? 'rgba(20, 20, 22, 0.75)' : 'rgba(255, 255, 255, 0.75)',
        gap: 12,
      }}
    >
      {/* Fila Superior: Título/Rango + Segmented Control + Botones */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Rango de Fechas Visible */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 22, fontFamily: IOS_FONTS.bold, color: theme.text.primary, letterSpacing: -0.6 }}>
            {rangeLabel}
          </Text>
        </View>

        {/* Segmented Control Día / Semana / Mes */}
        <View style={{ minWidth: 260 }}>
          <IOSSegmentedControl<CalendarViewMode>
            tabs={VIEW_TABS}
            selectedTab={viewMode}
            onTabChange={onViewModeChange}
            isDark={isDark}
          />
        </View>

        {/* Controles Derecha: Hoy + Flechas < > + Botón + Evento + Settings */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Botón Hoy */}
          <Pressable
            onPress={onToday}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA',
            })}
          >
            <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
              Hoy
            </Text>
          </Pressable>

          {/* Flechas < > */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Pressable
              onPress={onPrev}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA',
              })}
            >
              <ChevronLeft size={16} color={theme.text.primary} />
            </Pressable>

            <Pressable
              onPress={onNext}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA',
              })}
            >
              <ChevronRight size={16} color={theme.text.primary} />
            </Pressable>
          </View>

          {/* Botón + Nuevo Evento */}
          {onAddEvent && (
            <Pressable
              onPress={onAddEvent}
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FF3B30',
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 10,
                gap: 5,
                ...createShadow('#FF3B30', { width: 0, height: 2 }, 0.3, 6),
              })}
            >
              <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: '#FFFFFF' }}>
                Evento
              </Text>
            </Pressable>
          )}

          {/* Botón Ajustes */}
          {onOpenSettings && (
            <Pressable
              onPress={onOpenSettings}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5EA',
              })}
            >
              <Settings size={15} color={theme.text.secondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Fila Inferior: Category Filter Pills (Scroll Horizontal) */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.tertiary, marginRight: 4 }}>
            Calendarios:
          </Text>
          {categories.map((cat) => {
            const isVisible = cat.is_visible === 1;
            return (
              <Pressable
                key={cat.id}
                onPress={() => onToggleCategory && onToggleCategory(cat.id)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 20,
                  backgroundColor: isVisible
                    ? isDark
                      ? `${cat.color}25`
                      : `${cat.color}15`
                    : isDark
                    ? 'rgba(255, 255, 255, 0.05)'
                    : '#F2F2F7',
                  borderWidth: 1,
                  borderColor: isVisible ? cat.color : theme.border,
                  gap: 6,
                })}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: isVisible ? cat.color : theme.text.tertiary,
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: isVisible ? IOS_FONTS.semibold : IOS_FONTS.regular,
                    color: isVisible ? theme.text.primary : theme.text.tertiary,
                  }}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};
