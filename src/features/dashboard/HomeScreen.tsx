/**
 * HomeScreen.tsx
 * Pantalla Principal de MiHub estilo iPadOS / Apple HIG (Landscape Tablet 1400px).
 *
 * Todos los widgets son 100% interactivos y conectados a SQLite:
 * 1. Header con Saludo Dinámico, Fecha y Avatar de Perfil con ProfileSettingsModal.
 * 2. Widget de Clima iOS: Conectado a Open-Meteo para Despeñaderos, Córdoba (con opción de agregar más ciudades).
 * 3. Nivel Central:
 *    - Recordatorios Inteligentes con checkboxes táctiles, tags y apertura de ReminderDetailSheet.
 *    - Calendario Split 50/50 con selector de días sincronizado e inspección de EventModal.
 * 4. Nivel Inferior:
 *    - Colectivos con cuenta regresiva en vivo y apertura de AllSchedulesModal.
 *    - Finanzas Spline con balance real y acceso directo a movimientos.
 *    - Hábitos Grit con carrusel deslizable, long-press submenu y temporizadores/contadores activos.
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
import { useWeatherStore } from '../../store/useWeatherStore';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { HomeWeatherWidget } from './components/HomeWeatherWidget';
import { HomeRemindersWidget } from './components/HomeRemindersWidget';
import { HomeCalendarWidget } from './components/HomeCalendarWidget';
import { HomeBusWidget } from './components/HomeBusWidget';
import { HomeFinanceWidget } from './components/HomeFinanceWidget';
import { HomeHabitsWidget } from './components/HomeHabitsWidget';
import { WeatherForecastModal } from './components/WeatherForecastModal';
import { ProfileSettingsModal } from '../../components/ui/ProfileSettingsModal';
import { CreateReminderModal } from '../reminders/components/CreateReminderModal';
import { ReminderDetailSheet } from '../reminders/components/ReminderDetailSheet';
import { EventModal } from '../calendar/components/EventModal';
import { AllSchedulesModal } from '../bus/viajes/AllSchedulesModal';
import { AppleEmoji } from '../../components/ui/AppleEmoji';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../styles/theme';
import { createShadow } from '../../styles/shadows';
import { TaskItem, CalendarEventItem } from '../../types';

export const HomeScreen: React.FC = () => {
  const themeMode = useAppStore((state) => state.themeMode);
  const userName = useAppStore((state) => state.userName);
  const userAvatar = useAppStore((state) => state.userAvatar);
  const initApp = useAppStore((state) => state.initApp);
  const setActiveModule = useAppStore((state) => state.setActiveModule);
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const lists = useTasksStore((state) => state.lists);
  const tasks = useTasksStore((state) => state.tasks);
  const loadTasksAndLists = useTasksStore((state) => state.loadTasksAndLists);
  const addTask = useTasksStore((state) => state.addTask);
  const updateTask = useTasksStore((state) => state.updateTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);

  const calendarCategories = useCalendarStore((state) => state.categories);
  const loadEvents = useCalendarStore((state) => state.loadEvents);
  const loadCategories = useCalendarStore((state) => state.loadCategories);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const deleteEvent = useCalendarStore((state) => state.deleteEvent);

  const loadFinanceData = useFinanceStore((state) => state.loadFinanceData);
  const loadHabitsData = useHabitsStore((state) => state.loadHabitsData);
  const loadWeatherStore = useWeatherStore((state) => state.loadWeatherStore);

  // Estados de Modales Interactivos
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedTaskForSheet, setSelectedTaskForSheet] = useState<TaskItem | null>(null);
  const [selectedEventForModal, setSelectedEventForModal] = useState<CalendarEventItem | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAllSchedulesModalOpen, setIsAllSchedulesModalOpen] = useState(false);

  // Hidratación asíncrona paralela no bloqueante en SQLite
  useEffect(() => {
    initApp();
    Promise.allSettled([
      loadTasksAndLists(),
      loadEvents(),
      loadCategories(),
      loadFinanceData(),
      loadHabitsData(),
      loadWeatherStore(),
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

  const { isLandscape, contentPadding } = useResponsiveLayout();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000000' : theme.canvas,
      }}
      contentContainerStyle={{
        padding: contentPadding,
        paddingBottom: 64,
        gap: isLandscape ? 18 : 14,
      }}
    >
      {/* 1. Header Bar Superior */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Saludo & Subtítulo */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text
              style={{
                fontSize: isLandscape ? 32 : 26,
                fontFamily: IOS_FONTS.bold,
                color: theme.text.primary,
                letterSpacing: -0.8,
              }}
            >
              Hola, {userName || 'Álvaro'}
            </Text>
            <AppleEmoji emoji="👋" size={isLandscape ? 28 : 24} />
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
            onPress={() => setActiveModule('tasks')}
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
            onPress={() => setIsProfileModalOpen(true)}
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

      {/* 2. Fila Superior: Widget de Clima iOS (Conectado a Open-Meteo) */}
      <HomeWeatherWidget
        onPress={() => setIsWeatherModalOpen(true)}
        isDark={isDark}
      />

      {/* 3. Nivel Central: 2 Columnas Principales (Recordatorios vs Calendario Split) */}
      <View style={{ flexDirection: isLandscape ? 'row' : 'column', gap: 16, alignItems: 'stretch' }}>
        {/* Columna Izquierda: Recordatorios Inteligentes */}
        <View style={{ flex: 1 }}>
          <HomeRemindersWidget
            onQuickTaskPress={() => setIsCreateTaskModalOpen(true)}
            onTaskPress={(task) => setSelectedTaskForSheet(task)}
            isDark={isDark}
          />
        </View>

        {/* Columna Derecha: Próximos Eventos + Mini Grilla Semanal */}
        <View style={{ flex: isLandscape ? 1.15 : 1 }}>
          <HomeCalendarWidget
            onEventPress={(event) => {
              setSelectedEventForModal(event);
              setIsEventModalOpen(true);
            }}
            isDark={isDark}
          />
        </View>
      </View>

      {/* 4. Nivel Inferior: Widgets de Colectivos, Finanzas, Hábitos */}
      <View style={{ flexDirection: isLandscape ? 'row' : 'column', gap: 16, alignItems: 'stretch' }}>
        {/* Widget 1: Recorridos / Colectivos */}
        <HomeBusWidget
          onPress={() => setIsAllSchedulesModalOpen(true)}
          isDark={isDark}
        />

        {/* Widget 2: Finanzas del Mes */}
        <HomeFinanceWidget
          onPress={() => setActiveModule('finance')}
          isDark={isDark}
        />

        {/* Widget 3: Hábitos y Rutinas Grit */}
        <HomeHabitsWidget isDark={isDark} />
      </View>

      {/* MODAL 1: Perfil & Ajustes */}
      <ProfileSettingsModal
        visible={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        isDark={isDark}
      />

      {/* MODAL 2: Pronóstico del Clima Extendido */}
      <WeatherForecastModal
        visible={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        isDark={isDark}
      />

      {/* MODAL 3: Creación Rápida de Recordatorios */}
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

      {/* MODAL 4: Detalle & Edición de Recordatorio */}
      {selectedTaskForSheet && (
        <ReminderDetailSheet
          visible={Boolean(selectedTaskForSheet)}
          task={selectedTaskForSheet}
          lists={lists}
          subtasks={tasks.filter((t) => t.parent_id === selectedTaskForSheet.id)}
          onClose={() => setSelectedTaskForSheet(null)}
          onSave={async (updates) => {
            await updateTask(selectedTaskForSheet.id, updates);
            setSelectedTaskForSheet(null);
          }}
          onDelete={async (id) => {
            await deleteTask(id);
            setSelectedTaskForSheet(null);
          }}
          isDark={isDark}
        />
      )}

      {/* MODAL 5: Detalle & Edición de Evento de Calendario */}
      <EventModal
        visible={isEventModalOpen}
        event={selectedEventForModal}
        categories={calendarCategories}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEventForModal(null);
        }}
        onSave={async (eventData) => {
          if (selectedEventForModal && !selectedEventForModal.id.startsWith('mock-')) {
            await updateEvent(selectedEventForModal.id, {
              ...eventData,
              is_milestone: eventData.is_milestone ? 1 : 0,
            });
          } else {
            await addEvent(eventData);
          }
          setIsEventModalOpen(false);
          setSelectedEventForModal(null);
        }}
        onDelete={async (id) => {
          if (!id.startsWith('mock-')) {
            await deleteEvent(id);
          }
          setIsEventModalOpen(false);
          setSelectedEventForModal(null);
        }}
        isDark={isDark}
      />

      {/* MODAL 6: Grilla Completa de Horarios de Colectivos */}
      <AllSchedulesModal
        visible={isAllSchedulesModalOpen}
        onClose={() => setIsAllSchedulesModalOpen(false)}
        diaSeleccionado="martes"
        horaActualHHMM="06:25"
        isToday={true}
        isDark={isDark}
      />
    </ScrollView>
  );
};
