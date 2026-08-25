import React from 'react';
import { View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { IOS_COLORS } from '../../styles/theme';
import { TabletSidebar } from './TabletSidebar';

interface TabletShellProps {
  children: React.ReactNode;
}

export const TabletShell: React.FC<TabletShellProps> = ({ children }) => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.background }}>
      {/* Navigation Rail Colapsable con Animaciones Reanimated (68px / 220px) */}
      <TabletSidebar />

      {/* Contenido Principal */}
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {children}
      </View>
    </View>
  );
};
