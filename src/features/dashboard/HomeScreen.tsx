/**
 * HomeScreen.tsx
 * Pantalla Principal de MiHub estilo iPadOS / Apple HIG (Landscape Tablet 1400px).
 *
 * Estructura Bento Grid de 3 Niveles:
 * 1. Header con Saludo Dinámico, Fecha y Avatar de Perfil con ProfileSettingsModal.
 * 2. Fila Superior: Widget de Clima iOS (Temperatura 18°, Despejado, Rango 22°/8°, Despeñaderos).
 * 3. Nivel Central: 2 Columnas Principales (Recordatorios con Tags y Creación Rápida vs Calendario Split 50/50).
 * 4. Nivel Inferior: 3 Widgets Horizontales (Colectivos con Cuenta Regresiva, Finanzas Spline y Hábitos Grit con Timer).
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  Search,
  Bell,
} from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTasksStore } from '../../store/useTasksStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useHabitsStore } from '../habits/stores/useHabitsStore';
import { HomeWeatherWidget } from './components/HomeWeatherWidget';
import { HomeRemindersWidget } from './components/HomeRemindersWidget';
import { HomeCalendarWidget } from './components/HomeCalendarWidget';
import { HomeBusWidget } from './components/HomeBusWidget';
import { HomeFinanceWidget } from './components/HomeFinanceWidget';
import { HomeHabitsWidget } from './components/HomeHabitsWidget';
import { ProfileSettingsModal } from '../../components/ui/ProfileSettingsModal';
import { CreateReminderModal } from '../reminders/components/CreateReminderModal';
import { AppleEmoji } from '../../components/ui/AppleEmoji';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../styles/theme';
import { createShadow } from '../../styles/shadows';

export const HomeScreen: React.FC = () => {
  const { themeMode, userName, userAvatar, initApp } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const { lists, loadTasksAndLists, addTask } = useTasksStore();
  const { loadEvents } = useCalendarStore();
  const { loadFinanceData } = useFinanceStore();
  const { loadHabitsData } = useHabitsStore();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  // Hidratación asíncrona paralela no bloqueante en SQLite
  useEffect(() => {
    initApp();
    Promise.allSettled([
      loadTasksAndLists(),
      loadEvents(),
      loadFinanceData(),
      loadHabitsData(),
    ]);
  }, []);

  // Formato de fecha para el subtítulo: "Martes, 25 de agosto · Despeñaderos, Córdoba"
  const formattedDate = useMemo(() => {
    const today = new Date();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    const dayName = dayNames[today.getDay()];
    const dayNum = today.getDate();
    const monthName = monthNames[today.getMonth()];
    return `${dayName}, ${dayNum} de ${monthName} · Despeñaderos, Córdoba`;
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000000' : theme.canvas,
      }}
      contentContainerStyle={{
        padding: 24,
        paddingBottom: 48,
        gap: 18,
      }}
    >
      {/* 1. Header Bar Superior */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Saludo & Subtítulo */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text
              style={{
                fontSize: 32,
                fontFamily: IOS_FONTS.bold,
                color: theme.text.primary,
                letterSpacing: -0.8,
              }}
            >
              Hola, {userName || 'Álvaro'}
            </Text>
            <AppleEmoji emoji="👋" size={28} />
          </View>
          <Text
            style={{
              fontSize: 13,
              fontFamily: IOS_FONTS.regular,
              color: theme.text.secondary,
              marginTop: 2,
            }}
          >
            {formattedDate}
          </Text>
        </View>

        {/* Acciones del Header: Búsqueda, Notificaciones y Avatar de Perfil */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Botón Buscar */}
          <Pressable
            style={({ pressed }) => ({
              opacity: pressed ? 0.75 : 1,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              justifyContent: 'center',
              ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.15 : 0.03, 4),
            })}
          >
            <Search size={18} color={theme.text.primary} />
          </Pressable>

          {/* Botón Notificaciones */}
          <Pressable
            style={({ pressed }) => ({
              opacity: pressed ? 0.75 : 1,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              justifyContent: 'center',
              ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.15 : 0.03, 4),
            })}
          >
            <Bell size={18} color={theme.text.primary} />
          </Pressable>

          {/* Botón Circular de Perfil (Avatar Memoji) */}
          <Pressable
            onPress={() => setIsProfileModalOpen(true)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: isDark ? 'rgba(10, 132, 255, 0.22)' : 'rgba(0, 122, 255, 0.15)',
              borderWidth: 2,
              borderColor: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light,
              alignItems: 'center',
              justifyContent: 'center',
              ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.2 : 0.04, 6),
            })}
          >
            <AppleEmoji emoji={userAvatar || '👨‍💻'} size={24} />
          </Pressable>
        </View>
      </View>

      {/* 2. Fila Superior: Widget de Clima iOS */}
      <HomeWeatherWidget isDark={isDark} />

      {/* 3. Nivel Central: 2 Columnas Principales (Recordatorios vs Calendario Split) */}
      <View style={{ flexDirection: 'row', gap: 18, alignItems: 'stretch' }}>
        {/* Columna Izquierda (~48%): Recordatorios Inteligentes */}
        <View style={{ flex: 1 }}>
          <HomeRemindersWidget
            onQuickTaskPress={() => setIsCreateTaskModalOpen(true)}
            isDark={isDark}
          />
        </View>

        {/* Columna Derecha (~52%): Próximos Eventos + Mini Grilla Semanal */}
        <View style={{ flex: 1.15 }}>
          <HomeCalendarWidget isDark={isDark} />
        </View>
      </View>

      {/* 4. Nivel Inferior: 3 Widgets Horizontales (Colectivos, Finanzas, Hábitos) */}
      <View style={{ flexDirection: 'row', gap: 18, alignItems: 'stretch' }}>
        {/* Widget 1: Recorridos / Colectivos */}
        <HomeBusWidget isDark={isDark} />

        {/* Widget 2: Finanzas del Mes */}
        <HomeFinanceWidget isDark={isDark} />

        {/* Widget 3: Hábitos y Rutinas Grit */}
        <HomeHabitsWidget isDark={isDark} />
      </View>

      {/* Modal de Perfil & Ajustes */}
      <ProfileSettingsModal
        visible={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        isDark={isDark}
      />

      {/* Modal de Creación Rápida de Tareas */}
      <CreateReminderModal
        visible={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        lists={lists}
        onAddTask={async (taskData) => {
          await addTask(taskData);
          setIsCreateTaskModalOpen(false);
        }}
        isDark={isDark}
      />
    </ScrollView>
  );
};
