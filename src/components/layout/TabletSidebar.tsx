import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  CheckSquare,
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

export const TabletSidebar: React.FC = () => {
  const { themeMode, toggleTheme, isSidebarCollapsed, toggleSidebar, activeModule, setActiveModule } = useAppStore();
  const { tasks } = useTasksStore();
  const { hasCredentials, isSyncing, triggerSync } = useSyncStore();

  const isDark = themeMode === 'dark';
  const pendingTasksCount = tasks.filter((t) => !t.is_completed).length;

  const navItems: { id: ActiveModule; label: string; icon: React.ComponentType<any>; badge?: number }[] = [
    { id: 'tasks', label: 'Recordatorios', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'finance', label: 'Finanzas', icon: DollarSign },
    { id: 'notes', label: 'Notas', icon: FileText },
    { id: 'bus', label: 'Colectivos', icon: Bus },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <View
      style={{
        width: isSidebarCollapsed ? 76 : 240,
        backgroundColor: isDark ? '#12151B' : '#F1F3F5',
        borderRightWidth: 1,
        borderRightColor: isDark ? '#232733' : '#E5E7EB',
        height: '100%',
        paddingVertical: 18,
        paddingHorizontal: isSidebarCollapsed ? 8 : 14,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Header / Brand */}
      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            marginBottom: 24,
            paddingHorizontal: isSidebarCollapsed ? 0 : 6,
          }}
        >
          {!isSidebarCollapsed && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  backgroundColor: '#6366F1',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>G</Text>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: isDark ? '#F3F4F6' : '#111827',
                  letterSpacing: -0.5,
                }}
              >
                Dashboard
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={toggleSidebar}
            style={{
              padding: 6,
              borderRadius: 8,
              backgroundColor: isDark ? '#1E232E' : '#E5E7EB',
            }}
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={18} color={isDark ? '#9CA3AF' : '#4B5563'} />
            ) : (
              <ChevronLeft size={18} color={isDark ? '#9CA3AF' : '#4B5563'} />
            )}
          </TouchableOpacity>
        </View>

        {/* Navigation Items */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setActiveModule(item.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                  paddingVertical: 10,
                  paddingHorizontal: isSidebarCollapsed ? 0 : 12,
                  borderRadius: 10,
                  marginBottom: 6,
                  backgroundColor: isActive
                    ? isDark
                      ? '#1E232E'
                      : '#FFFFFF'
                    : 'transparent',
                  borderWidth: isActive ? 1 : 0,
                  borderColor: isDark ? '#2E3544' : '#E2E8F0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isActive ? 0.08 : 0,
                  shadowRadius: 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    size={20}
                    color={isActive ? '#6366F1' : isDark ? '#9CA3AF' : '#6B7280'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {!isSidebarCollapsed && (
                    <Text
                      style={{
                        marginLeft: 12,
                        fontSize: 14,
                        fontWeight: isActive ? '600' : '500',
                        color: isActive
                          ? isDark
                            ? '#FFFFFF'
                            : '#111827'
                          : isDark
                          ? '#9CA3AF'
                          : '#6B7280',
                      }}
                    >
                      {item.label}
                    </Text>
                  )}
                </View>

                {!isSidebarCollapsed && item.badge !== undefined && (
                  <View
                    style={{
                      backgroundColor: '#6366F1',
                      borderRadius: 12,
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                      {item.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bottom Controls */}
      <View style={{ gap: 8 }}>
        {/* CalDAV Sync Button */}
        <TouchableOpacity
          onPress={() => {
            if (hasCredentials && !isSyncing) {
              triggerSync();
            } else if (!hasCredentials) {
              setActiveModule('settings');
            }
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            paddingVertical: 9,
            paddingHorizontal: isSidebarCollapsed ? 0 : 12,
            borderRadius: 8,
            backgroundColor: isDark ? '#171A21' : '#E5E7EB',
          }}
        >
          {isSyncing ? (
            <RefreshCw size={16} color="#6366F1" />
          ) : hasCredentials ? (
            <Cloud size={16} color="#10B981" />
          ) : (
            <CloudOff size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
          )}

          {!isSidebarCollapsed && (
            <Text
              style={{
                marginLeft: 10,
                fontSize: 12,
                color: isDark ? '#9CA3AF' : '#4B5563',
                fontWeight: '500',
              }}
            >
              {isSyncing ? 'Sincronizando...' : hasCredentials ? 'iCloud Conectado' : 'Conectar iCloud'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Dark/Light Mode Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            paddingVertical: 9,
            paddingHorizontal: isSidebarCollapsed ? 0 : 12,
            borderRadius: 8,
            backgroundColor: isDark ? '#171A21' : '#E5E7EB',
          }}
        >
          {isDark ? (
            <Sun size={16} color="#F59E0B" />
          ) : (
            <Moon size={16} color="#6366F1" />
          )}

          {!isSidebarCollapsed && (
            <Text
              style={{
                marginLeft: 10,
                fontSize: 12,
                color: isDark ? '#9CA3AF' : '#4B5563',
                fontWeight: '500',
              }}
            >
              {isDark ? 'Modo Claro' : 'Modo Oscuro'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
