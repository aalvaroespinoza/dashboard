/**
 * IOSDateTimePicker.tsx
 * Selector de Fecha y Hora interactivo estilo Apple Reminders (iOS / iPadOS).
 *
 * Características:
 * 1. Fila estilo Ajustes iOS con Toggle Switch "Fecha" y "Hora".
 * 2. Mini Calendario Mensual con inicio en Lunes, navegación < Mes >, detección de 'Hoy',
 *    selección táctil de cualquier día del calendario y chips rápidos (Hoy, Mañana, +1 Semana).
 * 3. Selector de Hora con scroll vertical de Horas (00-23) y Minutos (pasos de 5m),
 *    junto con chips rápidos de horarios comunes (09:00, 13:00, 18:00, 21:00).
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import { IOS_COLORS, IOS_FONTS } from '../../styles/theme';

interface IOSDateTimePickerProps {
  hasDate: boolean;
  onToggleDate: (enabled: boolean) => void;
  dueDate: string | null; // YYYY-MM-DD
  onChangeDate: (date: string) => void;
  hasTime: boolean;
  onToggleTime: (enabled: boolean) => void;
  dueTime: string | null; // HH:MM
  onChangeTime: (time: string) => void;
  accentColor?: string;
  isDark?: boolean;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export const IOSDateTimePicker: React.FC<IOSDateTimePickerProps> = ({
  hasDate,
  onToggleDate,
  dueDate,
  onChangeDate,
  hasTime,
  onToggleTime,
  dueTime,
  onChangeTime,
  accentColor = '#007AFF',
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    if (dueDate) {
      const [y, m, d] = dueDate.split('-').map(Number);
      return new Date(y, m - 1, d || 1);
    }
    return new Date();
  });

  useEffect(() => {
    if (dueDate) {
      const [y, m, d] = dueDate.split('-').map(Number);
      setCurrentViewDate(new Date(y, m - 1, d || 1));
    }
  }, [dueDate]);

  const viewYear = currentViewDate.getFullYear();
  const viewMonth = currentViewDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Matriz de días del mes actual con offset de Lunes
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    // Ajustar domingo (0) para que la semana empiece en Lunes (0)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInCurrentMonth = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // Días del mes anterior
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNum);
      const str = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: str === dueDate,
      });
    }

    // Días del mes actual
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const str = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr: str,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: str === todayStr,
        isSelected: str === dueDate,
      });
    }

    // Días del mes siguiente para completar múltiplos de 7
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nextDate = new Date(viewYear, viewMonth + 1, n);
      const str = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      cells.push({
        dateStr: str,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: str === dueDate,
      });
    }

    return cells;
  }, [viewYear, viewMonth, dueDate, todayStr]);

  // Formato legible de fecha seleccionada
  const formattedDateString = useMemo(() => {
    if (!dueDate) return 'Sin fecha';
    const [y, m, d] = dueDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][dateObj.getDay()];
    const monthName = MONTH_NAMES[dateObj.getMonth()].slice(0, 3).toLowerCase();
    return `${dayName}, ${d} ${monthName} ${y !== new Date().getFullYear() ? y : ''}`.trim();
  }, [dueDate]);

  // Accesos rápidos
  const handleQuickPreset = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    const str = `${y}-${m}-${d}`;
    onChangeDate(str);
    if (!hasDate) onToggleDate(true);
  };

  const selectedHour = dueTime ? dueTime.split(':')[0] || '09' : '09';
  const selectedMinute = dueTime ? dueTime.split(':')[1] || '00' : '00';

  const handleHourSelect = (h: string) => {
    const newTime = `${h}:${selectedMinute}`;
    onChangeTime(newTime);
    if (!hasTime) onToggleTime(true);
  };

  const handleMinuteSelect = (min: string) => {
    const newTime = `${selectedHour}:${min}`;
    onChangeTime(newTime);
    if (!hasTime) onToggleTime(true);
  };

  const handleQuickTimePreset = (timeStr: string) => {
    onChangeTime(timeStr);
    if (!hasTime) onToggleTime(true);
  };

  return (
    <View
      style={{
        backgroundColor: theme.cardSecondary,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
      }}
    >
      {/* 1. Fila Switch FECHA */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: hasDate ? '#FF3B30' : (isDark ? '#3A3A3C' : '#E5E5EA'),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarIcon size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontFamily: IOS_FONTS.semibold, color: theme.text.primary }}>
              Fecha
            </Text>
            {hasDate && dueDate && (
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: accentColor }}>
                {formattedDateString}
              </Text>
            )}
          </View>
        </View>

        <Switch
          value={hasDate}
          onValueChange={(val) => {
            onToggleDate(val);
            if (val && !dueDate) {
              onChangeDate(todayStr);
            }
          }}
          trackColor={{ false: isDark ? '#39393D' : '#E9E9EB', true: '#34C759' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* 2. Mini Calendario Mensual Desplegable */}
      {hasDate && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.border,
            padding: 14,
            gap: 12,
            backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.4)',
          }}
        >
          {/* Chips rápidos de fecha */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <Pressable
              onPress={() => handleQuickPreset(0)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
                backgroundColor: dueDate === todayStr ? `${accentColor}25` : theme.card,
                borderWidth: 1,
                borderColor: dueDate === todayStr ? accentColor : theme.border,
              })}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: IOS_FONTS.bold,
                  color: dueDate === todayStr ? accentColor : theme.text.secondary,
                }}
              >
                Hoy
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleQuickPreset(1)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
              })}
            >
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary }}>
                Mañana
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleQuickPreset(7)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
              })}
            >
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary }}>
                +1 Semana
              </Text>
            </Pressable>
          </View>

          {/* Header del Calendario: < Mes Año > */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Pressable
                onPress={handlePrevMonth}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  backgroundColor: theme.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                })}
              >
                <ChevronLeft size={16} color={theme.text.primary} />
              </Pressable>

              <Pressable
                onPress={handleNextMonth}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  backgroundColor: theme.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.border,
                })}
              >
                <ChevronRight size={16} color={theme.text.primary} />
              </Pressable>
            </View>
          </View>

          {/* Días de la semana L M M J V S D */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {WEEK_DAYS.map((d, idx) => (
              <View key={idx} style={{ width: 34, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.tertiary }}>
                  {d}
                </Text>
              </View>
            ))}
          </View>

          {/* Cuadrícula de Días */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {calendarCells.map((cell, idx) => {
              const isSelected = cell.isSelected;
              const isToday = cell.isToday;

              return (
                <Pressable
                  key={idx}
                  onPress={() => {
                    onChangeDate(cell.dateStr);
                    if (!cell.isCurrentMonth) {
                      const [y, m] = cell.dateStr.split('-').map(Number);
                      setCurrentViewDate(new Date(y, m - 1, 1));
                    }
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    width: `${100 / 7}%`,
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected
                        ? accentColor
                        : isToday
                        ? isDark
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,122,255,0.1)'
                        : 'transparent',
                      borderWidth: isToday && !isSelected ? 1.5 : 0,
                      borderColor: accentColor,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: isSelected || isToday ? IOS_FONTS.bold : IOS_FONTS.regular,
                        color: isSelected
                          ? '#FFFFFF'
                          : cell.isCurrentMonth
                          ? theme.text.primary
                          : theme.text.tertiary,
                      }}
                    >
                      {cell.dayNumber}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* 3. Fila Switch HORA */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: hasTime ? '#007AFF' : (isDark ? '#3A3A3C' : '#E5E5EA'),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontFamily: IOS_FONTS.semibold, color: theme.text.primary }}>
              Hora
            </Text>
            {hasTime && dueTime && (
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: accentColor }}>
                {dueTime} hs
              </Text>
            )}
          </View>
        </View>

        <Switch
          value={hasTime}
          onValueChange={(val) => {
            onToggleTime(val);
            if (val && !dueTime) {
              onChangeTime('09:00');
            }
          }}
          trackColor={{ false: isDark ? '#39393D' : '#E9E9EB', true: '#34C759' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* 4. Selector de Hora con Scroll Vertical Desplegable */}
      {hasTime && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.border,
            padding: 14,
            gap: 12,
            backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.4)',
          }}
        >
          {/* Chips de horario común */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'Mañana (09:00)', time: '09:00' },
              { label: 'Mediodía (13:00)', time: '13:00' },
              { label: 'Tarde (18:00)', time: '18:00' },
              { label: 'Noche (21:00)', time: '21:00' },
            ].map((preset) => {
              const isSelected = dueTime === preset.time;
              return (
                <Pressable
                  key={preset.time}
                  onPress={() => handleQuickTimePreset(preset.time)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    backgroundColor: isSelected ? `${accentColor}25` : theme.card,
                    borderWidth: 1,
                    borderColor: isSelected ? accentColor : theme.border,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: IOS_FONTS.bold,
                      color: isSelected ? accentColor : theme.text.secondary,
                    }}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Ruedas de Selección Horas / Minutos en ScrollView */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 4,
            }}
          >
            {/* Columna Horas */}
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.tertiary, textTransform: 'uppercase' }}>
                Hora
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, paddingHorizontal: 4 }}
                style={{ maxWidth: 220 }}
              >
                {HOURS.map((h) => {
                  const isSelected = selectedHour === h;
                  return (
                    <Pressable
                      key={h}
                      onPress={() => handleHourSelect(h)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.75 : 1,
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: isSelected ? accentColor : theme.card,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: isSelected ? accentColor : theme.border,
                      })}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: IOS_FONTS.bold,
                          color: isSelected ? '#FFFFFF' : theme.text.primary,
                        }}
                      >
                        {h}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <Text style={{ fontSize: 20, fontFamily: IOS_FONTS.bold, color: theme.text.tertiary, paddingTop: 14 }}>
              :
            </Text>

            {/* Columna Minutos */}
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.tertiary, textTransform: 'uppercase' }}>
                Minuto
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, paddingHorizontal: 4 }}
                style={{ maxWidth: 220 }}
              >
                {MINUTES.map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => handleMinuteSelect(m)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.75 : 1,
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: isSelected ? accentColor : theme.card,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: isSelected ? accentColor : theme.border,
                      })}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: IOS_FONTS.bold,
                          color: isSelected ? '#FFFFFF' : theme.text.primary,
                        }}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
