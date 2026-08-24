import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import {
  LayoutDashboard,
  CheckCircle2,
  Flame,
  Calendar,
  Bus,
  CircleDollarSign,
  FileText,
  Settings,
  Sun,
  Moon,
} from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { ActiveModule } from '../../types';
import { IOS_COLORS } from '../../styles/theme';
import { createShadow } from '../../styles/shadows';

interface NavItem {
  id: ActiveModule;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, color: IOS_COLORS.blue },
  { id: 'tasks', label: 'Recordatorios', icon: CheckCircle2, color: IOS_COLORS.blue },
  { id: 'habits', label: 'Hábitos', icon: Flame, color: '#FF9500' },
  { id: 'calendar', label: 'Calendario', icon: Calendar, color: IOS_COLORS.purple },
  { id: 'bus', label: 'Recorridos', icon: Bus, color: IOS_COLORS.cyan },
  { id: 'finance', label: 'Finanzas', icon: CircleDollarSign, color: IOS_COLORS.green },
  { id: 'notes', label: 'Notas', icon: FileText, color: IOS_COLORS.orange },
];

interface TabletShellProps {
  children: React.ReactNode;
}

export const TabletShell: React.FC<TabletShellProps> = ({ children }) => {
  const { themeMode, activeModule, setActiveModule, toggleTheme } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.background }}>
      {/* Sidebar Fijo Izquierdo (~220px) */}
      <View
        style={{
          width: 230,
          backgroundColor: isDark ? '#121214' : '#FFFFFF',
          borderRightWidth: 1,
          borderRightColor: theme.border,
          paddingVertical: 20,
          paddingHorizontal: 14,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top: Logo MiHub & Navegación */}
        <View style={{ gap: 20 }}>
          {/* Logo MiHub con isotipo gradiente */}
          <View style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {/* Isotipo Circular */}
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: IOS_COLORS.blue,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...createShadow(IOS_COLORS.blue, { width: 0, height: 2 }, 0.3, 4),
                }}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: '#FFFFFF',
                    opacity: 0.9,
                  }}
                />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '900',
                    color: theme.text.primary,
                    letterSpacing: -0.5,
                  }}
                >
                  MiHub
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: theme.text.secondary,
                    fontWeight: '500',
                    marginTop: -1,
                  }}
                >
                  Tu vida, organizada.
                </Text>
              </View>
            </View>
          </View>

          {/* Links de Navegación */}
          <View style={{ gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeModule === item.id;
              const Icon = item.icon;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => setActiveModule(item.id)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: isActive
                      ? isDark
                        ? 'rgba(0, 122, 255, 0.20)'
                        : 'rgba(0, 122, 255, 0.12)'
                      : 'transparent',
                    gap: 12,
                  })}
                >
                  <Icon
                    size={20}
                    color={isActive ? IOS_COLORS.blue : theme.text.secondary}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? IOS_COLORS.blue : theme.text.primary,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Bottom: Ajustes & Toggle Modo Oscuro/Claro */}
        <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 14 }}>
          {/* Ajustes */}
          <Pressable
            onPress={() => setActiveModule('settings')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: activeModule === 'settings'
                ? isDark
                  ? 'rgba(0, 122, 255, 0.20)'
                  : 'rgba(0, 122, 255, 0.12)'
                : 'transparent',
              gap: 12,
            })}
          >
            <Settings
              size={20}
              color={activeModule === 'settings' ? IOS_COLORS.blue : theme.text.secondary}
              strokeWidth={activeModule === 'settings' ? 2.5 : 2}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: activeModule === 'settings' ? '700' : '500',
                color: activeModule === 'settings' ? IOS_COLORS.blue : theme.text.primary,
              }}
            >
              Ajustes
            </Text>
          </Pressable>

          {/* Switch de Tema */}
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 9,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {isDark ? <Moon size={16} color="#AF52DE" /> : <Sun size={16} color="#FF9500" />}
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text.secondary }}>
                {isDark ? 'Modo Oscuro' : 'Modo Claro'}
              </Text>
            </View>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: isDark ? '#AF52DE' : '#FF9500',
              }}
            />
          </Pressable>
        </View>
      </View>

      {/* Contenido Principal Derecho */}
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {children}
      </View>
    </View>
  );
};
