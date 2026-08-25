/**
 * TabletSidebar.tsx
 * Navigation Rail colapsable para Tablet / iPadOS con soporte de gestos táctiles 1:1 en vivo.
 *
 * Modo colapsado: 68px con botones cuadrados de 44px perfectamente centrados.
 * Modo expandido: 220px con íconos, títulos de módulo y badges.
 * Transición continua: Todo el texto, badges y acompañamientos visuales se expanden
 * y contraen en tiempo real de forma controlada y proporcional al arrastre del dedo.
 */

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
import { AppLogo } from '../ui/AppLogo';

const RAIL_COLLAPSED_WIDTH = 68;
const RAIL_EXPANDED_WIDTH = 220;
const RAIL_DELTA_WIDTH = RAIL_EXPANDED_WIDTH - RAIL_COLLAPSED_WIDTH; // 152px

export const TabletSidebar: React.FC = () => {
  const themeMode = useAppStore((state) => state.themeMode);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const activeModule = useAppStore((state) => state.activeModule);
  const setActiveModule = useAppStore((state) => state.setActiveModule);

  const pendingTasksCount = useTasksStore((state) => state.tasks.filter((t) => !t.is_completed).length);
  const hasCredentials = useSyncStore((state) => state.hasCredentials);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const triggerSync = useSyncStore((state) => state.triggerSync);

  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

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

  // Estilo animado del ancho total del sidebar
  const animatedContainerStyle = useAnimatedStyle(() => ({
    width: interpolate(
      expandProgress.value,
      [0, 1],
      [RAIL_COLLAPSED_WIDTH, RAIL_EXPANDED_WIDTH],
      Extrapolation.CLAMP
    ),
  }));

  // Estilo animado del título "MiHub" y subtítulo "Life OS" en la cabecera
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.2, 0.8], [0, 1], Extrapolation.CLAMP),
    width: interpolate(expandProgress.value, [0, 1], [0, 105], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(expandProgress.value, [0, 1], [-12, 0], Extrapolation.CLAMP),
      },
    ],
    overflow: 'hidden' as const,
  }));

  // Estilo animado de los labels de texto de navegación
  const animatedLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.25, 0.85], [0, 1], Extrapolation.CLAMP),
    width: interpolate(expandProgress.value, [0, 1], [0, 110], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(expandProgress.value, [0, 1], [-8, 0], Extrapolation.CLAMP),
      },
    ],
    overflow: 'hidden' as const,
  }));

  // Estilo animado del badge numérico grande
  const animatedBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.45, 0.9], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(expandProgress.value, [0.45, 0.9], [0.5, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  // Estilo animado del badge punto pequeño (modo colapsado)
  const animatedDotBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0, 0.25], [1, 0], Extrapolation.CLAMP),
  }));

  // Estilo animado del texto del footer (iCloud / Tema)
  const animatedFooterTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.3, 0.85], [0, 1], Extrapolation.CLAMP),
    width: interpolate(expandProgress.value, [0, 1], [0, 120], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(expandProgress.value, [0, 1], [-8, 0], Extrapolation.CLAMP),
      },
    ],
    overflow: 'hidden' as const,
  }));

  // Estilo animado de rotación del chevron de colapso
  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(expandProgress.value, [0, 1], [180, 0], Extrapolation.CLAMP)}deg`,
      },
    ],
  }));

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
      color: isDark ? '#5E5CE6' : '#5856D6', // System Indigo
    },
    {
      id: 'tasks',
      label: 'Recordatorios',
      icon: CheckSquare,
      color: isDark ? '#0A84FF' : '#007AFF', // System Blue
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'habits',
      label: 'Hábitos',
      icon: Zap,
      color: isDark ? '#30D158' : '#34C759', // System Green (Fitness / Activity)
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: Calendar,
      color: isDark ? '#FF453A' : '#FF3B30', // System Red (Apple Calendar)
    },
    {
      id: 'finance',
      label: 'Finanzas',
      icon: DollarSign,
      color: isDark ? '#63E6E2' : '#00C7BE', // System Mint (Apple Wallet / Finance)
    },
    {
      id: 'bus',
      label: 'Colectivos',
      icon: Bus,
      color: isDark ? '#64D2FF' : '#32ADE6', // System Cyan (Transit / Maps)
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: Settings,
      color: isDark ? '#8E8E93' : '#8A8A8E', // System Gray
    },
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
            paddingHorizontal: 12,
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'stretch',
          }}
        >
          {/* 1. Header (Logo / Botón Colapsar) */}
          <View style={{ width: '100%' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                height: 42,
                overflow: 'hidden',
              }}
            >
              {/* Logo e Icono */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <AppLogo size={36} />
                <Animated.View style={animatedHeaderStyle}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: IOS_FONTS.bold,
                      color: isDark ? '#FFFFFF' : theme.text.primary,
                      letterSpacing: -0.5,
                      lineHeight: 18,
                    }}
                    numberOfLines={1}
                  >
                    MiHub
                  </Text>
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontFamily: IOS_FONTS.semibold,
                      color: isDark ? '#9CA3AF' : '#8E8E93',
                      letterSpacing: 0.2,
                      lineHeight: 13,
                    }}
                    numberOfLines={1}
                  >
                    Life OS
                  </Text>
                </Animated.View>
              </View>

              {/* Botón de Colapso con Chevron Animado */}
              <Pressable
                onPress={toggleSidebar}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  width: 34,
                  height: 34,
                  borderRadius: 11,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Animated.View style={animatedChevronStyle}>
                  <ChevronLeft size={17} color={theme.text.secondary} />
                </Animated.View>
              </Pressable>
            </View>

            {/* 2. Items de Navegación */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                gap: 6,
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
                      width: '100%',
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
                        width: '100%',
                        height: 44,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 6,
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
                          gap: 10,
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

                        {/* Label Animado en tiempo real */}
                        <Animated.View style={animatedLabelStyle}>
                          <Text
                            style={{
                              fontSize: 13.5,
                              fontFamily: isActive ? IOS_FONTS.bold : IOS_FONTS.semibold,
                              color: isActive ? theme.text.primary : theme.text.secondary,
                            }}
                            numberOfLines={1}
                          >
                            {item.label}
                          </Text>
                        </Animated.View>
                      </View>

                      {/* Badge Grande Animado */}
                      {item.badge !== undefined && (
                        <Animated.View
                          style={[
                            animatedBadgeStyle,
                            {
                              backgroundColor: '#007AFF',
                              borderRadius: 10,
                              paddingHorizontal: 7,
                              paddingVertical: 2,
                            },
                          ]}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 11, fontFamily: IOS_FONTS.bold }}>
                            {item.badge}
                          </Text>
                        </Animated.View>
                      )}

                      {/* Badge Punto Pequeño (Modo Colapsado) */}
                      {item.badge !== undefined && (
                        <Animated.View
                          style={[
                            animatedDotBadgeStyle,
                            {
                              position: 'absolute',
                              top: 6,
                              left: 32,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#007AFF',
                            },
                          ]}
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
                        <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: IOS_FONTS.bold }}>
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
                width: '100%',
                height: 40,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 6,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E5EA',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#D1D5DB',
                gap: 10,
              })}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSyncing ? (
                  <RefreshCw size={16} color="#007AFF" />
                ) : hasCredentials ? (
                  <Cloud size={16} color="#34C759" />
                ) : (
                  <CloudOff size={16} color={theme.text.tertiary} />
                )}
              </View>

              <Animated.View style={animatedFooterTextStyle}>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.text.secondary,
                    fontFamily: IOS_FONTS.semibold,
                  }}
                  numberOfLines={1}
                >
                  {isSyncing ? 'Sincronizando...' : hasCredentials ? 'iCloud Conectado' : 'Conectar iCloud'}
                </Text>
              </Animated.View>
            </Pressable>

            {/* Dark/Light Mode Toggle */}
            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                width: '100%',
                height: 40,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 6,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E5EA',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#D1D5DB',
                gap: 10,
              })}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDark ? (
                  <Sun size={16} color="#FF9500" />
                ) : (
                  <Moon size={16} color="#5856D6" />
                )}
              </View>

              <Animated.View style={animatedFooterTextStyle}>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.text.secondary,
                    fontFamily: IOS_FONTS.semibold,
                  }}
                  numberOfLines={1}
                >
                  {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                </Text>
              </Animated.View>
            </Pressable>
          </View>
        </GlassContainer>
      </Animated.View>
    </GestureDetector>
  );
};
