import React, { useState, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useAppStore } from '../../store/useAppStore';
import { useTasksStore } from '../../store/useTasksStore';
import { CalendarEventItem, CalendarViewMode, UnifiedCalendarItem } from '../../types';
import { CalendarHeader } from './components/CalendarHeader';
import { WeekGridView } from './components/WeekGridView';
import { MonthHybridView } from './components/MonthHybridView';
import { DayTimelineView } from './components/DayTimelineView';
import { EventModal } from './components/EventModal';
import { CalendarSettingsModal } from './components/CalendarSettingsModal';
import { IOS_COLORS } from '../../styles/theme';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

export const CalendarScreen: React.FC = () => {
  const themeMode = useAppStore((state) => state.themeMode);
  const { contentPadding } = useResponsiveLayout();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const events = useCalendarStore((state) => state.events);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const viewMode = useCalendarStore((state) => state.viewMode);
  const categories = useCalendarStore((state) => state.categories);
  const settings = useCalendarStore((state) => state.settings);
  const loadEvents = useCalendarStore((state) => state.loadEvents);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const setViewMode = useCalendarStore((state) => state.setViewMode);
  const goToToday = useCalendarStore((state) => state.goToToday);
  const nextPeriod = useCalendarStore((state) => state.nextPeriod);
  const prevPeriod = useCalendarStore((state) => state.prevPeriod);
  const toggleCategoryVisibility = useCalendarStore((state) => state.toggleCategoryVisibility);
  const addEvent = useCalendarStore((state) => state.addEvent);
  const updateEvent = useCalendarStore((state) => state.updateEvent);
  const deleteEvent = useCalendarStore((state) => state.deleteEvent);
  const getUnifiedItemsForDate = useCalendarStore((state) => state.getUnifiedItemsForDate);
  const getUnifiedItemsForRange = useCalendarStore((state) => state.getUnifiedItemsForRange);

  const loadTasksAndLists = useTasksStore((state) => state.loadTasksAndLists);

  useEffect(() => {
    loadEvents();
    loadTasksAndLists();
  }, []);

  const [inspectingItem, setInspectingItem] = useState<CalendarEventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalSlotInfo, setModalSlotInfo] = useState<{ dateStr?: string; hour?: number }>({});

  const currentDateObj = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDate]);

  // Label del rango de fechas visible en el Header
  const rangeLabel = useMemo(() => {
    const curr = currentDateObj;
    if (viewMode === 'week') {
      const dayOfWeek = (curr.getDay() + 6) % 7;
      const monday = new Date(curr);
      monday.setDate(curr.getDate() - dayOfWeek);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const monDay = monday.getDate();
      const sunDay = sunday.getDate();
      const monthStr = sunday.toLocaleDateString('es-ES', { month: 'long' });
      const year = sunday.getFullYear();

      return `${monDay} - ${sunDay} de ${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)}, ${year}`;
    }

    if (viewMode === 'month_hybrid') {
      const monthStr = curr.toLocaleDateString('es-ES', { month: 'long' });
      return `${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)} ${curr.getFullYear()}`;
    }

    const dayName = curr.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
  }, [currentDateObj, viewMode]);

  // Items unificados para el día seleccionado
  const unifiedItemsForSelectedDate = useMemo(() => {
    return getUnifiedItemsForDate(selectedDate);
  }, [selectedDate, events, categories, settings]);

  // Items unificados para la semana completa
  const unifiedItemsForWeek = useMemo(() => {
    const curr = currentDateObj;
    const dayOfWeek = (curr.getDay() + 6) % 7;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startStr = monday.toISOString().split('T')[0];
    const endStr = sunday.toISOString().split('T')[0];

    return getUnifiedItemsForRange(startStr, endStr);
  }, [currentDateObj, events, categories, settings]);

  // Metadata de todos los eventos del mes (para los dots de la cuadrícula)
  const allEventsForMonthMap = useMemo(() => {
    const curr = currentDateObj;
    const year = curr.getFullYear();
    const month = curr.getMonth();

    const firstDay = new Date(year, month - 1, 20).toISOString().split('T')[0];
    const lastDay = new Date(year, month + 1, 10).toISOString().split('T')[0];

    const monthItems = getUnifiedItemsForRange(firstDay, lastDay);
    const map: Record<string, { count: number; colors: string[] }> = {};

    monthItems.forEach((item) => {
      if (!map[item.date]) {
        map[item.date] = { count: 0, colors: [] };
      }
      map[item.date].count++;
      if (item.color && !map[item.date].colors.includes(item.color)) {
        map[item.date].colors.push(item.color);
      }
    });

    return map;
  }, [currentDateObj, events, categories, settings]);

  const handleOpenNewEvent = (dateStr?: string, hour?: number) => {
    setInspectingItem(null);
    setModalSlotInfo({ dateStr: dateStr || selectedDate, hour });
    setIsModalOpen(true);
  };

  const handleOpenEditEvent = (item: UnifiedCalendarItem) => {
    if (item.event_id) {
      const evt = events.find((e) => e.id === item.event_id);
      if (evt) {
        setInspectingItem(evt);
        setIsModalOpen(true);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : theme.background }}>
      {/* 1. Header con Switcher Día / Semana / Mes, Fechas, Categorías y Acciones */}
      <CalendarHeader
        rangeLabel={rangeLabel}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={prevPeriod}
        onNext={nextPeriod}
        onToday={goToToday}
        categories={categories}
        onToggleCategory={toggleCategoryVisibility}
        onAddEvent={() => handleOpenNewEvent(selectedDate)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDark={isDark}
      />

      {/* 2. Área Central al 100% de Ancho según ViewMode */}
      <View style={{ flex: 1, padding: contentPadding }}>
        {viewMode === 'month_hybrid' ? (
          // Vista Híbrida 50/50 Samsung One UI
          <MonthHybridView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            unifiedItems={unifiedItemsForSelectedDate}
            allEventsForMonth={allEventsForMonthMap}
            onOpenNewEvent={handleOpenNewEvent}
            onOpenEditEvent={handleOpenEditEvent}
            onPrevMonth={prevPeriod}
            onNextMonth={nextPeriod}
            isDark={isDark}
          />
        ) : viewMode === 'day' ? (
          // Vista Línea de Tiempo Diaria Detallada
          <DayTimelineView
            date={selectedDate}
            items={unifiedItemsForSelectedDate}
            onPressItem={handleOpenEditEvent}
            isDark={isDark}
            slotHeight={settings.slotDensity === 'compact' ? 48 : settings.slotDensity === 'spacious' ? 76 : 64}
          />
        ) : (
          // Vista Grilla Horaria Semanal Apple iPadOS
          <WeekGridView
            selectedDate={currentDateObj}
            unifiedItems={unifiedItemsForWeek}
            settings={settings}
            onSelectEvent={handleOpenEditEvent}
            onSlotPress={(dateStr, hour) => handleOpenNewEvent(dateStr, hour)}
            isDark={isDark}
          />
        )}
      </View>

      {/* Modal Inspector / Creador de Eventos e Hitos */}
      <EventModal
        visible={isModalOpen}
        event={inspectingItem}
        initialDate={modalSlotInfo.dateStr || selectedDate}
        initialHour={modalSlotInfo.hour}
        categories={categories}
        onClose={() => {
          setIsModalOpen(false);
          setInspectingItem(null);
        }}
        onSave={async (eventData) => {
          if (inspectingItem) {
            await updateEvent(inspectingItem.id, {
              ...eventData,
              is_milestone: eventData.is_milestone ? 1 : 0,
            });
          } else {
            await addEvent(eventData);
          }
        }}
        onDelete={async (id) => {
          await deleteEvent(id);
          setIsModalOpen(false);
          setInspectingItem(null);
        }}
        isDark={isDark}
      />

      {/* Modal de Configuración y Personalización Pro */}
      <CalendarSettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
      />
    </View>
  );
};
