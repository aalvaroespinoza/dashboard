import React from 'react';
import { View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { IOS_COLORS } from '../../styles/theme';
import { TabletSidebar } from './TabletSidebar';
import { TabletBottomBar } from './TabletBottomBar';

interface TabletShellProps {
  children: React.ReactNode;
}

export const TabletShell: React.FC<TabletShellProps> = ({ children }) => {
  const { themeMode } = useAppStore();
  const { isLandscape } = useResponsiveLayout();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: isLandscape ? 'row' : 'column',
        backgroundColor: theme.background,
      }}
    >
      {/* Navigation Rail Colapsable en Landscape (68px / 220px) */}
      {isLandscape && <TabletSidebar />}

      {/* Contenido Principal */}
      <View style={{ flex: 1, backgroundColor: theme.background, overflow: 'hidden' }}>
        {children}
      </View>

      {/* Navigation Bar Inferior en Portrait / Vertical */}
      {!isLandscape && <TabletBottomBar />}
    </View>
  );
};

