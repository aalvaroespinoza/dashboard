import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import {
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Search,
  X,
  Flame,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { useHabitsStore } from '../stores/useHabitsStore';
import { GritNavigationTab } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface GritSidebarProps {
  onOpenNewHabit: () => void;
  isDark?: boolean;
}

export const GritSidebar: React.FC<GritSidebarProps> = ({
  onOpenNewHabit,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { currentTab, setCurrentTab, searchQuery, setSearchQuery, habits, logsMap } = useHabitsStore();
  const today = '2026-08-24';

  const completedTodayCount = habits.filter((h) => logsMap[h.id]?.[today]?.is_completed).length;

  const NAV_ITEMS: { id: GritNavigationTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'today', label: 'Hoy', icon: Calendar, badge: `${completedTodayCount}/${habits.length}` },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3, badge: 'Aug 26' },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <View
      style={{
        width: 270,
        backgroundColor: theme.card,
        borderRightWidth: 1,
        borderRightColor: theme.border,
        paddingVertical: 20,
        paddingHorizontal: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      {/* 1. Header: Logo Grit + Pro Badge */}
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Isotipo Grit */}
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: '#FF9500',
                alignItems: 'center',
                justifyContent: 'center',
                ...createShadow('#FF9500', { width: 0, height: 2 }, 0.35, 6),
              }}
            >
              <Flame size={20} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 19, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.5 }}>
                Grit Habits
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                v5.8.1 · Tablet Pro
              </Text>
            </View>
          </View>

          {/* Badge Pro */}
          <View
            style={{
              backgroundColor: 'rgba(255, 149, 0, 0.15)',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(255, 149, 0, 0.3)',
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '900', color: '#FF9500' }}>
              PRO
            </Text>
          </View>
        </View>

        {/* 2. Buscador */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 8,
          }}
        >
          <Search size={14} color={theme.text.tertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar hábito..."
            placeholderTextColor={theme.text.tertiary}
            style={{ flex: 1, fontSize: 13, color: theme.text.primary, padding: 0 }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={14} color={theme.text.tertiary} />
            </Pressable>
          )}
        </View>

        {/* 3. Botón Principal + Nuevo Hábito */}
        <Pressable
          onPress={onOpenNewHabit}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FF9500',
            paddingVertical: 12,
            borderRadius: 16,
            gap: 8,
            ...createShadow('#FF9500', { width: 0, height: 4 }, 0.3, 8),
          })}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
            Nuevo Hábito
          </Text>
        </Pressable>

        {/* 4. Lista de Navegación */}
        <View style={{ gap: 6, marginTop: 4 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => setCurrentTab(item.id)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isActive
                    ? isDark
                      ? 'rgba(255, 149, 0, 0.18)'
                      : '#FFF7ED'
                    : 'transparent',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isActive ? 'rgba(255, 149, 0, 0.3)' : 'transparent',
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Icon
                    size={18}
                    color={isActive ? '#FF9500' : theme.text.secondary}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? '800' : '600',
                      color: isActive ? theme.text.primary : theme.text.secondary,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>

                {item.badge && (
                  <View
                    style={{
                      backgroundColor: isActive ? '#FF9500' : theme.cardSecondary,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '800',
                        color: isActive ? '#FFFFFF' : theme.text.tertiary,
                      }}
                    >
                      {item.badge}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 5. Footer: Racha y Energía Global */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 18,
          padding: 14,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 8,
          ...createShadow('#000000', { width: 0, height: 2 }, 0.04, 4),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Flame size={16} color="#FF9500" fill="#FF9500" />
            <Text style={{ fontSize: 13, fontWeight: '900', color: theme.text.primary }}>
              14 días seguidos
            </Text>
          </View>
          <Zap size={14} color="#34C759" fill="#34C759" />
        </View>
        <Text style={{ fontSize: 11, color: theme.text.secondary, lineHeight: 15 }}>
          ¡Tu constancia está en su punto más alto! Sigue así para romper tu récord.
        </Text>
      </View>
    </View>
  );
};
