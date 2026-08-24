import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import {
  Search,
  Bell,
  User,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTasksStore } from '../../store/useTasksStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { DashboardTopRow } from './components/DashboardTopRow';
import { HomeRemindersWidget } from './components/HomeRemindersWidget';
import { HomeFinanceWidget } from './components/HomeFinanceWidget';
import { HomeBusWidget } from './components/HomeBusWidget';
import { HomeCalendarWidget } from './components/HomeCalendarWidget';
import { IOS_COLORS } from '../../styles/theme';
import { createShadow } from '../../styles/shadows';

export const HomeScreen: React.FC = () => {
  const { themeMode, setActiveModule } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const { loadTasksAndLists } = useTasksStore();
  const { loadEvents } = useCalendarStore();
  const { loadFinanceData } = useFinanceStore();

  // Hidratación asíncrona paralela no bloqueante
  useEffect(() => {
    Promise.allSettled([
      loadTasksAndLists(),
      loadEvents(),
      loadFinanceData(),
    ]);
  }, []);

  const [currentDate] = useState<Date>(() => new Date());

  // Formato de fecha para el saludo: "Lunes, 24 de agosto de 2026"
  const formattedDate = useMemo(() => {
    return 'Lunes, 24 de agosto de 2026';
  }, [currentDate]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000000' : theme.background,
      }}
      contentContainerStyle={{
        padding: 24,
        paddingBottom: 60,
        gap: 20,
      }}
    >
      {/* 1. Header General con Saludo y Fecha */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.8 }}>
              Hola, Álvaro
            </Text>
            <Text style={{ fontSize: 26 }}>👋</Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text.secondary, marginTop: 3 }}>
            {formattedDate} · Despeñaderos, Córdoba
          </Text>
        </View>

        {/* Acciones Rápidas & Badge de Estado SQLite */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Badge SQLite 100% Offline */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
              gap: 6,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#34C759',
              }}
            />
            <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.primary }}>
              SQLite Local
            </Text>
          </View>

          {/* Botón Hábitos Rápidos */}
          <Pressable
            onPress={() => setActiveModule('habits')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 149, 0, 0.16)',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(255, 149, 0, 0.3)',
              gap: 6,
            })}
          >
            <Zap size={15} color="#FF9500" strokeWidth={2.5} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#FF9500' }}>
              Hábitos
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 2. Top Row (4 Métricas Rápidas Estáticas) */}
      <DashboardTopRow isDark={isDark} />

      {/* 3. Bento Grid Asimétrico 60/40 en Landscape Tablet */}
      <View style={{ flexDirection: 'row', gap: 18, alignItems: 'flex-start' }}>
        {/* Columna Izquierda (Ancho ~58-60%): Recordatorios & Finanzas */}
        <View style={{ flex: 1.45, gap: 18 }}>
          <HomeRemindersWidget isDark={isDark} />
          <HomeFinanceWidget isDark={isDark} />
        </View>

        {/* Columna Derecha (Ancho ~40-42%): Próximo Colectivo & Agenda Calendario */}
        <View style={{ flex: 1, gap: 18 }}>
          <HomeBusWidget isDark={isDark} />
          <HomeCalendarWidget isDark={isDark} />
        </View>
      </View>
    </ScrollView>
  );
};
