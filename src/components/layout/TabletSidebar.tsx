import React, { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  LayoutDashboard,
  CheckSquare,
  Zap,
  Calendar,
  DollarSign,
  Bus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTasksStore } from '../../store/useTasksStore';
import { useSyncStore } from '../../store/useSyncStore';
import { ActiveModule } from '../../types';
import { IOS_COLORS } from '../../styles/theme';
import { GlassContainer } from '../common/GlassContainer';

const RAIL_COLLAPSED_WIDTH = 68;
const RAIL_EXPANDED_WIDTH = 220;
const ANIMATION_DURATION = 280;
const ANIMATION_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

export const TabletSidebar: React.FC = () => {
  const { themeMode, toggleTheme, isSidebarCollapsed, toggleSidebar, activeModule, setActiveModule } = useAppStore();
  const { tasks } = useTasksStore();
  const { hasCredentials, isSyncing, triggerSync } = useSyncStore();

  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const pendingTasksCount = tasks.filter((t) => !t.is_completed).length;

  // Tooltip state for collapsed mode
  const [tooltipItemId, setTooltipItemId] = useState<string | null>(null);

  // Reanimated shared value: 0 = collapsed, 1 = expanded
  const expandProgress = useSharedValue(isSidebarCollapsed ? 0 : 1);

  // Sync when isSidebarCollapsed changes (from store)
  React.useEffect(() => {
    expandProgress.value = withTiming(
      isSidebarCollapsed ? 0 : 1,
      { duration: ANIMATION_DURATION, easing: ANIMATION_EASING }
    );
  }, [isSidebarCollapsed]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    width: interpolate(
      expandProgress.value,
      [0, 1],
      [RAIL_COLLAPSED_WIDTH, RAIL_EXPANDED_WIDTH],
      Extrapolation.CLAMP
    ),
    paddingHorizontal: interpolate(
      expandProgress.value,
      [0, 1],
      [6, 12],
      Extrapolation.CLAMP
    ),
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.4, 1], [0, 1], Extrapolation.CLAMP),
    width: interpolate(expandProgress.value, [0, 1], [0, 120], Extrapolation.CLAMP),
    overflow: 'hidden' as const,
  }));

  const navItems: {
    id: ActiveModule;
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, color: '#5856D6' },
    { id: 'tasks', label: 'Recordatorios', icon: CheckSquare, color: '#007AFF', badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'habits', label: 'Hábitos', icon: Zap, color: '#FF9500' },
    { id: 'calendar', label: 'Calendario', icon: Calendar, color: '#34C759' },
    { id: 'finance', label: 'Finanzas', icon: DollarSign, color: '#32ADE6' },
    { id: 'bus', label: 'Colectivos', icon: Bus, color: '#FF2D55' },
    { id: 'settings', label: 'Ajustes', icon: Settings, color: '#8E8E93' },
  ];

  return (
    <Animated.View
      style={[
        animatedContainerStyle,
        {
          height: '100%',
          borderRightWidth: 1,
          borderRightColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
        }
      ]}
    >
      <GlassContainer
        isDark={isDark}
        intensity={40}
        style={{
          flex: 1,
          paddingVertical: 18,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* 1. Header de Marca (MiHub) */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              marginBottom: 20,
              paddingHorizontal: isSidebarCollapsed ? 0 : 8,
            }}
          >
            {!isSidebarCollapsed && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: '#007AFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16 }}>M</Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '900',
                      color: theme.text.primary,
                      letterSpacing: -0.5,
                    }}
                  >
                    MiHub
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: theme.text.tertiary, textTransform: 'uppercase' }}>
                    iPadOS 18
                  </Text>
                </View>
              </View>
            )}

            <Pressable
              onPress={toggleSidebar}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 6,
                borderRadius: 10,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
              })}
            >
              {isSidebarCollapsed ? (
                <ChevronRight size={16} color={theme.text.secondary} />
              ) : (
                <ChevronLeft size={16} color={theme.text.secondary} />
              )}
            </Pressable>
          </View>

          {/* 2. Lista de Navegación */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
            <View style={{ gap: 4 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                const showTooltip = isSidebarCollapsed && tooltipItemId === item.id;

                return (
                  <View key={item.id} style={{ position: 'relative' }}>
                    <Pressable
                      onPress={() => setActiveModule(item.id)}
                      onLongPress={() => {
                        if (isSidebarCollapsed) {
                          setTooltipItemId(item.id);
                          setTimeout(() => setTooltipItemId(null), 1500);
                        }
                      }}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.8 : 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                        paddingVertical: 10,
                        paddingHorizontal: isSidebarCollapsed ? 0 : 10,
                        borderRadius: 14,
                        backgroundColor: isActive
                          ? isDark
                            ? 'rgba(255, 255, 255, 0.12)'
                            : 'rgba(0, 122, 255, 0.12)'
                          : 'transparent',
                        borderWidth: 1,
                        borderColor: isActive
                          ? isDark
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(0, 122, 255, 0.2)'
                          : 'transparent',
                      })}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {/* Squircle — más grande en modo colapsado para mejor touch target */}
                        <View
                          style={{
                            width: isSidebarCollapsed ? 36 : 28,
                            height: isSidebarCollapsed ? 36 : 28,
                            borderRadius: isSidebarCollapsed ? 11 : 8,
                            backgroundColor: isActive
                              ? item.color
                              : isDark
                              ? 'rgba(255, 255, 255, 0.08)'
                              : '#E5E5EA',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon
                            size={isSidebarCollapsed ? 18 : 15}
                            color={isActive ? '#FFFFFF' : item.color}
                            strokeWidth={isActive ? 2.5 : 2}
                          />
                        </View>

                        {/* Label animado */}
                        <Animated.Text
                          style={[
                            animatedLabelStyle,
                            {
                              fontSize: 14,
                              fontWeight: isActive ? '800' : '600',
                              color: isActive ? theme.text.primary : theme.text.secondary,
                            }
                          ]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Animated.Text>
                      </View>

                      {/* Badge de conteo (solo expandido) */}
                      {!isSidebarCollapsed && item.badge !== undefined && (
                        <View
                          style={{
                            backgroundColor: '#007AFF',
                            borderRadius: 10,
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '900' }}>
                            {item.badge}
                          </Text>
                        </View>
                      )}

                      {/* Badge pequeño en modo colapsado */}
                      {isSidebarCollapsed && item.badge !== undefined && (
                        <View
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#007AFF',
                          }}
                        />
                      )}
                    </Pressable>

                    {/* Tooltip de nombre en longPress modo colapsado */}
                    {showTooltip && (
                      <View
                        style={{
                          position: 'absolute',
                          left: RAIL_COLLAPSED_WIDTH - 2,
                          top: 8,
                          backgroundColor: isDark ? '#3A3A3C' : '#1C1C1E',
                          borderRadius: 10,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          zIndex: 999,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 8,
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                          {item.label}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* 3. Controles Inferiores (Sincronización iCloud & Tema) */}
        <View style={{ gap: 6 }}>
          {/* CalDAV Sync Button */}
          <Pressable
            onPress={() => {
              if (hasCredentials && !isSyncing) {
                triggerSync();
              } else if (!hasCredentials) {
                setActiveModule('settings');
              }
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              paddingVertical: 9,
              paddingHorizontal: isSidebarCollapsed ? 0 : 10,
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E5EA',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#D1D5DB',
              gap: 8,
            })}
          >
            {isSyncing ? (
              <RefreshCw size={15} color="#007AFF" />
            ) : hasCredentials ? (
              <Cloud size={15} color="#34C759" />
            ) : (
              <CloudOff size={15} color={theme.text.tertiary} />
            )}

            {!isSidebarCollapsed && (
              <Text
                style={{
                  fontSize: 12,
                  color: theme.text.secondary,
                  fontWeight: '700',
                }}
              >
                {isSyncing ? 'Sincronizando...' : hasCredentials ? 'iCloud Conectado' : 'Conectar iCloud'}
              </Text>
            )}
          </Pressable>

          {/* Dark/Light Mode Toggle */}
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              paddingVertical: 9,
              paddingHorizontal: isSidebarCollapsed ? 0 : 10,
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E5EA',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#D1D5DB',
              gap: 8,
            })}
          >
            {isDark ? (
              <Sun size={15} color="#FF9500" />
            ) : (
              <Moon size={15} color="#5856D6" />
            )}

            {!isSidebarCollapsed && (
              <Text
                style={{
                  fontSize: 12,
                  color: theme.text.secondary,
                  fontWeight: '700',
                }}
              >
                {isDark ? 'Modo Claro' : 'Modo Oscuro'}
              </Text>
            )}
          </Pressable>
        </View>
      </GlassContainer>
    </Animated.View>
  );
};
