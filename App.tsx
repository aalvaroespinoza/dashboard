import './global.css';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { getDatabase } from './src/db/database';
import { useAppStore } from './src/store/useAppStore';
import { useSyncStore } from './src/store/useSyncStore';
import { TabletShell } from './src/components/layout/TabletShell';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { HabitsScreen } from './src/features/habits/HabitsScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { FinanceScreen } from './src/screens/FinanceScreen';
import { BusRoutesScreen } from './src/screens/BusRoutesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { IOS_COLORS } from './src/styles/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    'SF-Pro-Display-Regular': require('./assets/fonts/SF-Pro-Display-Regular.otf'),
    'SF-Pro-Display-Semibold': require('./assets/fonts/SF-Pro-Display-Semibold.otf'),
    'SF-Pro-Display-Bold': require('./assets/fonts/SF-Pro-Display-Bold.otf'),
    'SF-Pro-Rounded-Medium': require('./assets/fonts/SF-Pro-Rounded-Medium.otf'),
    'SF-Pro-Rounded-Bold': require('./assets/fonts/SF-Pro-Rounded-Bold.otf'),
    'SF-Pro-Rounded-Heavy': require('./assets/fonts/SF-Pro-Rounded-Heavy.otf'),
    'JetBrainsMono-Bold': require('./assets/fonts/JetBrainsMono-Bold.ttf'),
  });

  const { themeMode, activeModule, initApp } = useAppStore();
  const { loadCredentials } = useSyncStore();

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Inicializar base de datos SQLite y esquema
        await getDatabase();
        // 2. Inicializar ajustes y tema
        await initApp();
        // 3. Cargar credenciales guardadas en SecureStore
        await loadCredentials();

        setIsDbReady(true);
      } catch (err: any) {
        console.error('Error inicializando app:', err);
        setInitError(err.message || 'Error inicializando la base de datos');
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isDbReady && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isDbReady, fontsLoaded, fontError]);

  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  if (!isDbReady || (!fontsLoaded && !fontError)) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? '#000000' : '#F2F2F7',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {initError ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#FF3B30', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
              Error al inicializar
            </Text>
            <Text style={{ color: theme.text.secondary, fontSize: 13, textAlign: 'center' }}>
              {initError}
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ color: theme.text.primary, fontSize: 18, fontWeight: '800', marginTop: 16 }}>
              MiHub
            </Text>
            <Text style={{ color: theme.text.secondary, fontSize: 12, marginTop: 4 }}>
              Cargando tu vida organizada...
            </Text>
          </View>
        )}
      </View>
    );
  }

  const renderActiveScreen = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'tasks':
        return <TasksScreen />;
      case 'habits':
        return <HabitsScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'bus':
        return <BusRoutesScreen />;
      case 'finance':
        return <FinanceScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: theme.background,
          }}
        >
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <TabletShell>
            {renderActiveScreen()}
          </TabletShell>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
