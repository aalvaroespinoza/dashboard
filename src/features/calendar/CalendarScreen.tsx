import React, { useState, useEffect, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useCalendarStore, CalendarViewMode } from '../../store/useCalendarStore';
import { useAppStore } from '../../store/useAppStore';
import { CalendarEventItem } from '../../types';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarSidebar, CalendarCategory } from './components/CalendarSidebar';
import { WeekGridView } from './components/WeekGridView';
import { MonthGridView } from './components/MonthGridView';
import { EventModal } from './components/EventModal';
import { IOS_COLORS } from '../../styles/theme';

export const CalendarScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    events,
    selectedDate,
    viewMode,
    loadEvents,
    setSelectedDate,
    setViewMode,
    goToToday,
    nextPeriod,
    prevPeriod,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useCalendarStore();

  useEffect(() => {
    loadEvents();
  }, []);

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(selectedDate));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSlotInfo, setModalSlotInfo] = useState<{ dateStr?: string; hour?: number }>({});

  // Categorías de calendario
  const [categories, setCategories] = useState<CalendarCategory[]>([
    { id: 'cat-personal', name: 'Personal', color: IOS_COLORS.purple, isVisible: true },
    { id: 'cat-work', name: 'Trabajo', color: IOS_COLORS.blue, isVisible: true },
    { id: 'cat-study', name: 'Estudios', color: IOS_COLORS.orange, isVisible: true },
    { id: 'cat-bday', name: 'Cumpleaños', color: IOS_COLORS.red, isVisible: true },
  ]);

  const handleToggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isVisible: !c.isVisible } : c))
    );
  };

  // Filtrado de eventos por visibilidad de categoría
  const visibleEvents = useMemo(() => {
    const visibleNames = categories.filter((c) => c.isVisible).map((c) => c.name.toLowerCase());
    return events.filter((e) => {
      const name = (e.calendar_name || 'Personal').toLowerCase();
      return visibleNames.includes(name) || visibleNames.length === 0;
    });
  }, [events, categories]);

  // Label del rango de fechas visible
  const rangeLabel = useMemo(() => {
    const curr = new Date(currentDate);
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

    if (viewMode === 'month') {
      const monthStr = curr.toLocaleDateString('es-ES', { month: 'long' });
      return `${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)} ${curr.getFullYear()}`;
    }

    const dayName = curr.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
  }, [currentDate, viewMode]);

  const handleSelectDate = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handlePrev = () => {
    const prev = new Date(currentDate);
    if (viewMode === 'week') {
      prev.setDate(prev.getDate() - 7);
    } else if (viewMode === 'month') {
      prev.setMonth(prev.getMonth() - 1);
    } else {
      prev.setDate(prev.getDate() - 1);
    }
    handleSelectDate(prev);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 1);
    }
    handleSelectDate(next);
  };

  const handleToday = () => {
    const now = new Date();
    handleSelectDate(now);
  };

  const handleSlotPress = (dateStr: string, hour: number) => {
    setSelectedEvent(null);
    setModalSlotInfo({ dateStr, hour });
    setIsModalOpen(true);
  };

  const handleSelectEvent = (evt: CalendarEventItem) => {
    setSelectedEvent(evt);
    setModalSlotInfo({});
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: {
    title: string;
    description?: string;
    location?: string;
    start_date: string;
    end_date: string;
    color?: string;
    calendar_name?: string;
  }) => {
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, eventData);
    } else {
      await addEvent(eventData);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header Superior del Calendario */}
      <CalendarHeader
        rangeLabel={rangeLabel}
        viewMode={viewMode === 'agenda' ? 'week' : viewMode}
        onViewModeChange={(m) => setViewMode(m)}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        isDark={isDark}
      />

      {/* 2. Cuerpo Principal: Sidebar Filtros + Grilla Horaria */}
      <View style={{ flex: 1, flexDirection: 'row', position: 'relative' }}>
        {/* Sidebar Izquierdo */}
        <CalendarSidebar
          selectedDate={currentDate}
          onSelectDate={handleSelectDate}
          categories={categories}
          onToggleCategory={handleToggleCategory}
          isDark={isDark}
        />

        {/* Grilla Principal */}
        <View style={{ flex: 1 }}>
          {viewMode === 'month' ? (
            <MonthGridView
              selectedDate={currentDate}
              events={visibleEvents}
              onSelectEvent={handleSelectEvent}
              onSelectDay={(dStr) => {
                handleSelectDate(new Date(dStr));
                setViewMode('week');
              }}
              isDark={isDark}
            />
          ) : (
            <WeekGridView
              selectedDate={currentDate}
              events={visibleEvents}
              onSelectEvent={handleSelectEvent}
              onSlotPress={handleSlotPress}
              isDark={isDark}
            />
          )}
        </View>

        {/* Floating Action Button (+) abajo a la derecha */}
        <Pressable
          onPress={() => {
            setSelectedEvent(null);
            setModalSlotInfo({ dateStr: currentDate.toISOString().split('T')[0], hour: 9 });
            setIsModalOpen(true);
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: IOS_COLORS.blue,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: IOS_COLORS.blue,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 6,
            zIndex: 100,
          })}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={3} />
        </Pressable>
      </View>

      {/* Modal Crear / Editar Evento */}
      <EventModal
        visible={isModalOpen}
        event={selectedEvent}
        initialDate={modalSlotInfo.dateStr}
        initialHour={modalSlotInfo.hour}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={deleteEvent}
        isDark={isDark}
      />
    </View>
  );
};
