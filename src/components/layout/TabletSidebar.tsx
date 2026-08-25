import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
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
import { IOS_COLORS, IOS_FONTS } from '../../styles/theme';
import { GlassContainer } from '../common/GlassContainer';

const RAIL_COLLAPSED_WIDTH = 68;
const RAIL_EXPANDED_WIDTH = 220;
const RAIL_DELTA_WIDTH = RAIL_EXPANDED_WIDTH - RAIL_COLLAPSED_WIDTH; // 152px

export const TabletSidebar: React.FC = () => {
  const {
    themeMode,
    toggleTheme,
    isSidebarCollapsed,
    toggleSidebar,
    activeModule,
    setActiveModule,
  } = useAppStore();

  const { tasks } = useTasksStore();
  const { hasCredentials, isSyncing, triggerSync } = useSyncStore();

  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const pendingTasksCount = tasks.filter((t) => !t.is_completed).length;

  // Tooltip temporal en long-press (modo colapsado)
  const [tooltipItemId, setTooltipItemId] = useState<string | null>(null);

  // Valor animado Reanimated: 0 = colapsado (68px), 1 = expandido (220px)
  const expandProgress = useSharedValue(isSidebarCollapsed ? 0 : 1);
  const startProgress = useSharedValue(isSidebarCollapsed ? 0 : 1);

  React.useEffect(() => {
    expandProgress.value = withSpring(isSidebarCollapsed ? 0 : 1, {
      damping: 22,
      stiffness: 240,
      mass: 0.9,
    });
  }, [isSidebarCollapsed]);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const syncStoreCollapse = (collapsed: boolean) => {
    if (useAppStore.getState().isSidebarCollapsed !== collapsed) {
      useAppStore.setState({ isSidebarCollapsed: collapsed });
    }
  };

  // Gesto Pan con filtros direccionales estrictos para evitar disparos accidentales
  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
    .onStart(() => {
      'worklet';
      startProgress.value = expandProgress.value;
    })
    .onUpdate((e) => {
      'worklet';
      const delta = e.translationX / RAIL_DELTA_WIDTH;
      expandProgress.value = Math.max(0, Math.min(1, startProgress.value + delta));
    })
    .onEnd((e) => {
      'worklet';
      const wasCollapsed = startProgress.value < 0.5;
      let shouldExpand = false;

      if (wasCollapsed) {
        // Estaba colapsado: se expande si se arrastró más del 35% a la derecha o con velocidad positiva
        shouldExpand = expandProgress.value > 0.35 || e.velocityX > 450;
      } else {
        // Estaba expandido: se colapsa si se arrastró más del 35% a la izquierda o con velocidad negativa
        shouldExpand = !(expandProgress.value < 0.65 || e.velocityX < -450);
      }

      const targetValue = shouldExpand ? 1 : 0;
      const willBeCollapsed = !shouldExpand;

      expandProgress.value = withSpring(
        targetValue,
        {
          damping: 22,
          stiffness: 240,
          mass: 0.9,
        },
        (finished) => {
          if (finished) {
            runOnJS(syncStoreCollapse)(willBeCollapsed);
          }
        }
      );

      if (wasCollapsed !== willBeCollapsed) {
        runOnJS(triggerHaptic)();
      }
    });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    width: interpolate(
      expandProgress.value,
      [0, 1],
      [RAIL_COLLAPSED_WIDTH, RAIL_EXPANDED_WIDTH],
      Extrapolation.CLAMP
    ),
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.4, 1], [0, 1], Extrapolation.CLAMP),
    width: interpolate(expandProgress.value, [0, 1], [0, 115], Extrapolation.CLAMP),
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
    {
      id: 'tasks',
      label: 'Recordatorios',
      icon: CheckSquare,
      color: '#007AFF',
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    { id: 'habits', label: 'Hábitos', icon: Zap, color: '#FF9500' },
    { id: 'calendar', label: 'Calendario', icon: Calendar, color: '#34C759' },
    { id: 'finance', label: 'Finanzas', icon: DollarSign, color: '#32ADE6' },
    { id: 'bus', label: 'Colectivos', icon: Bus, color: '#FF2D55' },
    { id: 'settings', label: 'Ajustes', icon: Settings, color: '#8E8E93' },
  ];

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          animatedContainerStyle,
          {
            height: '100%',
            borderRightWidth: 1,
            borderRightColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
            zIndex: 60,
          },
        ]}
      >
      <GlassContainer
        isDark={isDark}
        intensity={40}
        style={{
          flex: 1,
          paddingVertical: 16,
          paddingHorizontal: isSidebarCollapsed ? 0 : 10,
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: isSidebarCollapsed ? 'center' : 'stretch',
        }}
      >
        {/* 1. Header (Logo / Botón Colapsar) */}
        <View style={{ width: '100%', alignItems: isSidebarCollapsed ? 'center' : 'stretch' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              marginBottom: 16,
              paddingHorizontal: isSidebarCollapsed ? 0 : 4,
              height: 38,
            }}
          >
            {!isSidebarCollapsed && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image
                  source={require('../../../assets/icon.png')}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                  }}
                />
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
                </View>
              </View>
            )}

            <Pressable
              onPress={toggleSidebar}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              {isSidebarCollapsed ? (
                <ChevronRight size={18} color={theme.text.secondary} />
              ) : (
                <ChevronLeft size={18} color={theme.text.secondary} />
              )}
            </Pressable>
          </View>

          {/* 2. Items de Navegación */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: 6,
              alignItems: isSidebarCollapsed ? 'center' : 'stretch',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              const showTooltip = isSidebarCollapsed && tooltipItemId === item.id;

              return (
                <View
                  key={item.id}
                  style={{
                    position: 'relative',
                    width: isSidebarCollapsed ? 44 : '100%',
                    alignItems: 'center',
                  }}
                >
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
                      width: isSidebarCollapsed ? 44 : '100%',
                      height: 44,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
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
                          ? 'rgba(255, 255, 255, 0.18)'
                          : 'rgba(0, 122, 255, 0.25)'
                        : 'transparent',
                    })}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: isSidebarCollapsed ? 0 : 10,
                      }}
                    >
                      {/* Squircle / Contenedor del Ícono */}
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
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
                          size={17}
                          color={isActive ? '#FFFFFF' : item.color}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </View>

                      {/* Label en Modo Expandido */}
                      {!isSidebarCollapsed && (
                        <Animated.Text
                          style={[
                            animatedLabelStyle,
                            {
                              fontSize: 13.5,
                              fontWeight: isActive ? '800' : '600',
                              color: isActive ? theme.text.primary : theme.text.secondary,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Animated.Text>
                      )}
                    </View>

                    {/* Badge en Modo Expandido */}
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

                    {/* Badge pequeño en Modo Colapsado */}
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

                  {/* Tooltip en Long Press (Modo Colapsado) */}
                  {showTooltip && (
                    <View
                      style={{
                        position: 'absolute',
                        left: 56,
                        top: 6,
                        backgroundColor: isDark ? '#2C2C2E' : '#1C1C1E',
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        zIndex: 999,
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 8,
                        elevation: 10,
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>
                        {item.label}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Controles Inferiores (iCloud Sync & Tema) */}
        <View
          style={{
            width: '100%',
            gap: 6,
            alignItems: isSidebarCollapsed ? 'center' : 'stretch',
          }}
        >
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
              width: isSidebarCollapsed ? 44 : '100%',
              height: 40,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              paddingHorizontal: isSidebarCollapsed ? 0 : 10,
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E5EA',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#D1D5DB',
              gap: isSidebarCollapsed ? 0 : 8,
            })}
          >
            {isSyncing ? (
              <RefreshCw size={16} color="#007AFF" />
            ) : hasCredentials ? (
              <Cloud size={16} color="#34C759" />
            ) : (
              <CloudOff size={16} color={theme.text.tertiary} />
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
              width: isSidebarCollapsed ? 44 : '100%',
              height: 40,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              paddingHorizontal: isSidebarCollapsed ? 0 : 10,
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E5EA',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#D1D5DB',
              gap: isSidebarCollapsed ? 0 : 8,
            })}
          >
            {isDark ? (
              <Sun size={16} color="#FF9500" />
            ) : (
              <Moon size={16} color="#5856D6" />
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
  </GestureDetector>
  );
};
