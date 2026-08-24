import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import {
  LayoutDashboard,
  CheckSquare,
  Zap,
  Calendar,
  DollarSign,
  FileText,
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

export const TabletSidebar: React.FC = () => {
  const { themeMode, toggleTheme, isSidebarCollapsed, toggleSidebar, activeModule, setActiveModule } = useAppStore();
  const { tasks } = useTasksStore();
  const { hasCredentials, isSyncing, triggerSync } = useSyncStore();

  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const pendingTasksCount = tasks.filter((t) => !t.is_completed).length;

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
    { id: 'notes', label: 'Notas', icon: FileText, color: '#FFCC00' },
    { id: 'bus', label: 'Colectivos', icon: Bus, color: '#FF2D55' },
    { id: 'settings', label: 'Ajustes', icon: Settings, color: '#8E8E93' },
  ];

  return (
    <GlassContainer
      isDark={isDark}
      intensity={40}
      style={{
        width: isSidebarCollapsed ? 78 : 246,
        borderRightWidth: 1,
        borderRightColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
        height: '100%',
        paddingVertical: 18,
        paddingHorizontal: isSidebarCollapsed ? 8 : 12,
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

        {/* 2. Lista de Navegación con Squircles y Acentos iPadOS */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <View style={{ gap: 4 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => setActiveModule(item.id)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                    paddingVertical: 9,
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
                    {/* Squircle con Color de Sistema */}
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
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
                        size={15}
                        color={isActive ? '#FFFFFF' : item.color}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </View>

                    {!isSidebarCollapsed && (
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: isActive ? '800' : '600',
                          color: isActive ? theme.text.primary : theme.text.secondary,
                        }}
                      >
                        {item.label}
                      </Text>
                    )}
                  </View>

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
                </Pressable>
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
  );
};
