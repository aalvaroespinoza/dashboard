import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  LayoutDashboard,
  CheckSquare,
  Zap,
  Calendar,
  DollarSign,
  Bus,
  Settings,
} from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTasksStore } from '../../store/useTasksStore';
import { ActiveModule } from '../../types';
import { IOS_COLORS, IOS_FONTS } from '../../styles/theme';
import { GlassContainer } from '../common/GlassContainer';

export const TabletBottomBar: React.FC = () => {
  const { themeMode, activeModule, setActiveModule } = useAppStore();
  const { tasks } = useTasksStore();
  const insets = useSafeAreaInsets();

  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const pendingTasksCount = tasks.filter((t) => !t.is_completed).length;

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const navItems: {
    id: ActiveModule;
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: LayoutDashboard,
      color: isDark ? '#5E5CE6' : '#5856D6',
    },
    {
      id: 'tasks',
      label: 'Recordatorios',
      icon: CheckSquare,
      color: isDark ? '#0A84FF' : '#007AFF',
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'habits',
      label: 'Hábitos',
      icon: Zap,
      color: isDark ? '#30D158' : '#34C759',
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: Calendar,
      color: isDark ? '#FF453A' : '#FF3B30',
    },
    {
      id: 'finance',
      label: 'Finanzas',
      icon: DollarSign,
      color: isDark ? '#63E6E2' : '#00C7BE',
    },
    {
      id: 'bus',
      label: 'Colectivos',
      icon: Bus,
      color: isDark ? '#64D2FF' : '#32ADE6',
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: Settings,
      color: isDark ? '#8E8E93' : '#8A8A8E',
    },
  ];

  return (
    <View
      style={{
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
        backgroundColor: isDark ? 'rgba(18, 18, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 6,
        paddingHorizontal: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => {
                triggerHaptic();
                setActiveModule(item.id);
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 4,
                paddingHorizontal: 6,
                borderRadius: 12,
                minWidth: 46,
              })}
            >
              <View style={{ position: 'relative' }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: isActive
                      ? item.color
                      : isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    size={17}
                    color={isActive ? '#FFFFFF' : theme.text.secondary}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </View>

                {item.badge !== undefined && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -3,
                      right: -5,
                      backgroundColor: '#007AFF',
                      borderRadius: 7,
                      minWidth: 14,
                      height: 14,
                      paddingHorizontal: 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1.5,
                      borderColor: isDark ? '#121216' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 9, fontFamily: IOS_FONTS.bold }}>
                      {item.badge}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={{
                  fontSize: 10,
                  fontFamily: isActive ? IOS_FONTS.bold : IOS_FONTS.semibold,
                  color: isActive ? (isDark ? '#FFFFFF' : item.color) : theme.text.tertiary,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
