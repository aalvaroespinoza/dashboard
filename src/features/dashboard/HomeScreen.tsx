import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { FadeInUp, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import {
  Search,
  Bell,
  User,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Gift,
  Bus,
  Check,
  TrendingUp,
  Calendar as CalendarIcon,
} from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTasksStore } from '../../store/useTasksStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { IOS_COLORS } from '../../styles/theme';

export const HomeScreen: React.FC = () => {
  const { themeMode, setActiveModule } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const { tasks, loadTasksAndLists, toggleTaskComplete } = useTasksStore();
  const { events, loadEvents } = useCalendarStore();
  const { summary, loadFinanceData } = useFinanceStore();

  useEffect(() => {
    loadTasksAndLists();
    loadEvents();
    loadFinanceData();
  }, []);

  const [currentDate] = useState<Date>(() => new Date());

  // Formato de fecha para el saludo: "Martes, 20 de mayo"
  const formattedDate = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const str = currentDate.toLocaleDateString('es-ES', options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [currentDate]);

  // Recordatorios no completados de hoy
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => !t.is_completed);
  }, [tasks]);

  // Lista de próximos eventos
  const upcomingEvents = useMemo(() => {
    if (events.length > 0) {
      return events.slice(0, 4);
    }
    // Fallback de demostración con estilo idéntico a las capturas de MiHub
    return [
      {
        id: 'evt-client',
        title: 'Reunión con cliente',
        subtitle: 'Mañana 08:00 - 10:00',
        icon: Briefcase,
        color: '#34C759',
        bgColor: isDark ? 'rgba(52, 199, 89, 0.15)' : '#ECFDF5',
      },
      {
        id: 'evt-bday',
        title: 'Cumpleaños de Ana',
        subtitle: 'Sábado 24 de mayo',
        icon: Gift,
        color: '#FF3B30',
        bgColor: isDark ? 'rgba(255, 59, 48, 0.15)' : '#FEF2F2',
      },
      {
        id: 'evt-project',
        title: 'Entrega de proyecto',
        subtitle: 'Lunes 26 de mayo 14:00',
        icon: Bus,
        color: '#007AFF',
        bgColor: isDark ? 'rgba(0, 122, 255, 0.15)' : '#EFF6FF',
      },
    ];
  }, [events, isDark]);

  // Mini Calendario: Generar días del mes actual
  const { monthName, yearNumber, calendarDays, currentDayNumber } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    const monthStr = currentDate.toLocaleDateString('es-ES', { month: 'long' });
    const capitalizedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);

    // Primer día del mes (0 = domingo, 1 = lunes)
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Lunes = 0
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const daysArray: { day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Días del mes previo
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      daysArray.push({ day: prevMonthDays - i, isCurrentMonth: false, isToday: false });
    }

    // Días del mes actual
    for (let i = 1; i <= totalDaysInMonth; i++) {
      daysArray.push({
        day: i,
        isCurrentMonth: true,
        isToday: i === currentDay,
      });
    }

    // Completar hasta múltiplo de 7
    const remaining = 35 - daysArray.length;
    for (let i = 1; i <= (remaining > 0 ? remaining : 42 - daysArray.length); i++) {
      daysArray.push({ day: i, isCurrentMonth: false, isToday: false });
    }

    return {
      monthName: capitalizedMonth,
      yearNumber: year,
      calendarDays: daysArray.slice(0, 35),
      currentDayNumber: currentDay,
    };
  }, [currentDate]);

  const formatCurrency = (val: number) => `$${val.toLocaleString('es-AR')}`;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 24, gap: 20 }}
    >
      {/* 1. Header Superior */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '900',
              color: theme.text.primary,
              letterSpacing: -0.8,
            }}
          >
            Hola, Álvaro 👋
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: theme.text.secondary,
              fontWeight: '500',
              marginTop: 2,
            }}
          >
            {formattedDate}
          </Text>
        </View>

        {/* Acciones Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={17} color={theme.text.secondary} />
          </Pressable>

          <Pressable
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Bell size={17} color={theme.text.secondary} />
            {/* Red Notification Dot */}
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 9,
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: IOS_COLORS.red,
              }}
            />
          </Pressable>

          {/* User Avatar */}
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: IOS_COLORS.blue,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
            }}
          >
            <User size={18} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* 2. Fila de Métricas Rápidas (4 Cards Horizontales) */}
      <View style={{ flexDirection: 'row', gap: 14 }}>
        {/* Card 1: Tareas Hoy */}
        <Pressable
          onPress={() => setActiveModule('tasks')}
          style={({ pressed }) => ({
            flex: 1,
            opacity: pressed ? 0.85 : 1,
            backgroundColor: theme.card,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
          })}
        >
          <Text style={{ fontSize: 32, fontWeight: '900', color: IOS_COLORS.blue, letterSpacing: -0.5 }}>
            {todayTasks.length > 0 ? todayTasks.length : 3}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text.secondary, marginTop: 4 }}>
            Tareas hoy
          </Text>
        </Pressable>

        {/* Card 2: Eventos Hoy */}
        <Pressable
          onPress={() => setActiveModule('calendar')}
          style={({ pressed }) => ({
            flex: 1,
            opacity: pressed ? 0.85 : 1,
            backgroundColor: theme.card,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
          })}
        >
          <Text style={{ fontSize: 32, fontWeight: '900', color: IOS_COLORS.purple, letterSpacing: -0.5 }}>
            {events.length > 0 ? events.length : 2}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text.secondary, marginTop: 4 }}>
            Eventos hoy
          </Text>
        </Pressable>

        {/* Card 3: Ingresos Este Mes */}
        <Pressable
          onPress={() => setActiveModule('finance')}
          style={({ pressed }) => ({
            flex: 1.2,
            opacity: pressed ? 0.85 : 1,
            backgroundColor: theme.card,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
          })}
        >
          <Text style={{ fontSize: 24, fontWeight: '900', color: IOS_COLORS.green, letterSpacing: -0.5 }}>
            {formatCurrency(summary?.totalIncome || 1850000)}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text.secondary, marginTop: 4 }}>
            Ingresos este mes
          </Text>
        </Pressable>

        {/* Card 4: Gastos Este Mes */}
        <Pressable
          onPress={() => setActiveModule('finance')}
          style={({ pressed }) => ({
            flex: 1.2,
            opacity: pressed ? 0.85 : 1,
            backgroundColor: theme.card,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
          })}
        >
          <Text style={{ fontSize: 24, fontWeight: '900', color: IOS_COLORS.red, letterSpacing: -0.5 }}>
            {formatCurrency(summary?.totalExpense || 1120000)}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text.secondary, marginTop: 4 }}>
            Gastos este mes
          </Text>
        </Pressable>
      </View>

      {/* 3. Sección Central: Grid de Dos Columnas */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {/* COLUMNA IZQUIERDA (Próximos eventos + Resumen Financiero) */}
        <View style={{ flex: 1, gap: 16 }}>
          {/* Widget 1: Próximos Eventos */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: theme.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text.primary }}>
                Próximos eventos
              </Text>
              <Pressable onPress={() => setActiveModule('calendar')}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: IOS_COLORS.blue }}>
                  Ver todos
                </Text>
              </Pressable>
            </View>

            <View style={{ gap: 10 }}>
              {upcomingEvents.map((evt, idx) => {
                const IconComponent = (evt as any).icon || Briefcase;
                const iconColor = (evt as any).color || (evt as any).color || IOS_COLORS.blue;
                const bgColor = (evt as any).bgColor || (isDark ? 'rgba(0, 122, 255, 0.15)' : '#EFF6FF');

                return (
                  <Pressable
                    key={evt.id || idx}
                    onPress={() => setActiveModule('calendar')}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.8 : 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: theme.cardSecondary,
                      padding: 12,
                      borderRadius: 14,
                      gap: 12,
                    })}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: bgColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={18} color={iconColor} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                        {evt.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.text.secondary, marginTop: 2 }}>
                        {(evt as any).subtitle || ((evt as any).start_date?.includes('T') ? (evt as any).start_date.split('T')[1].slice(0, 5) + ' hs' : '08:00 - 10:00')}
                      </Text>
                    </View>

                    <ChevronRight size={16} color={theme.text.tertiary} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Widget 2: Resumen Financiero con Curva SVG fluida */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: theme.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text.primary }}>
                Resumen financiero
              </Text>
              <Pressable onPress={() => setActiveModule('finance')}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: IOS_COLORS.blue }}>
                  Ver más
                </Text>
              </Pressable>
            </View>

            {/* Labels Ingresos y Gastos */}
            <View style={{ flexDirection: 'row', gap: 20, marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 11, color: theme.text.secondary }}>Ingresos</Text>
                <Text style={{ fontSize: 15, fontWeight: '800', color: IOS_COLORS.green }}>
                  {formatCurrency(summary?.totalIncome || 1850000)}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 11, color: theme.text.secondary }}>Gastos</Text>
                <Text style={{ fontSize: 15, fontWeight: '800', color: IOS_COLORS.red }}>
                  {formatCurrency(summary?.totalExpense || 1120000)}
                </Text>
              </View>
            </View>

            {/* Gráfico de Ondas SVG Bezier */}
            <View style={{ width: '100%', height: 90, marginVertical: 4 }}>
              <Svg width="100%" height="90" viewBox="0 0 320 90">
                <Defs>
                  <LinearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={IOS_COLORS.green} stopOpacity="0.25" />
                    <Stop offset="1" stopColor={IOS_COLORS.green} stopOpacity="0.0" />
                  </LinearGradient>
                </Defs>

                {/* Línea Verde de Ingresos */}
                <Path
                  d="M 10,40 Q 50,18 90,38 T 170,22 T 250,34 T 310,24"
                  fill="none"
                  stroke={IOS_COLORS.green}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Línea Roja de Gastos */}
                <Path
                  d="M 10,65 Q 50,75 90,62 T 170,55 T 250,68 T 310,58"
                  fill="none"
                  stroke={IOS_COLORS.red}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Puntos destacados */}
                <Circle cx="310" cy="24" r="3.5" fill={IOS_COLORS.green} />
                <Circle cx="310" cy="58" r="3.5" fill={IOS_COLORS.red} />
              </Svg>
            </View>

            {/* Días del Eje X */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
              {['1', '6', '11', '16', '21', '26', '31'].map((d) => (
                <Text key={d} style={{ fontSize: 10, color: theme.text.tertiary, fontWeight: '600' }}>
                  {d}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* COLUMNA DERECHA (Recordatorios hoy + Mini Calendario) */}
        <View style={{ flex: 1, gap: 16 }}>
          {/* Widget 3: Recordatorios Hoy (Estilo Grit) */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: theme.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text.primary }}>
                Recordatorios hoy
              </Text>
              <Pressable onPress={() => setActiveModule('tasks')}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: IOS_COLORS.blue }}>
                  Ver todos
                </Text>
              </Pressable>
            </View>

            {/* Lista de Tareas Hoy */}
            <View style={{ gap: 10 }}>
              {(todayTasks.length > 0
                ? todayTasks.slice(0, 3)
                : [
                    { id: 't-1', title: 'Estudiar Vue 3', due_time: '10:00', is_completed: 0 },
                    { id: 't-2', title: 'Enviar informe', due_time: '12:30', is_completed: 0 },
                    { id: 't-3', title: 'Entrenar', due_time: '18:00', is_completed: 0 },
                  ]
              ).map((task) => {
                const isCompleted = Boolean(task.is_completed);

                return (
                  <Animated.View
                    key={task.id}
                    entering={FadeInUp.springify().damping(18).stiffness(180)}
                    exiting={FadeOutDown.duration(120)}
                    layout={LinearTransition.springify().damping(20).stiffness(160)}
                  >
                    <Pressable
                      onPress={() => toggleTaskComplete(task.id)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.8 : 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.cardSecondary,
                        padding: 12,
                        borderRadius: 14,
                        gap: 12,
                      })}
                    >
                      {/* Checkbox Circular */}
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: isCompleted ? IOS_COLORS.blue : theme.text.tertiary,
                          backgroundColor: isCompleted ? IOS_COLORS.blue : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isCompleted && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </View>

                      <Text
                        style={{
                          flex: 1,
                          fontSize: 13.5,
                          fontWeight: '600',
                          color: isCompleted ? theme.text.tertiary : theme.text.primary,
                          textDecorationLine: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </Text>

                      {task.due_time && (
                        <View
                          style={{
                            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: theme.border,
                          }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                            {task.due_time}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* Widget 4: Mini Calendario Mensual */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 18,
              borderWidth: 1,
              borderColor: theme.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.03,
              shadowRadius: 4,
            }}
          >
            {/* Header Mini Calendario */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text.primary }}>
                {monthName} {yearNumber}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Pressable
                  onPress={() => setActiveModule('calendar')}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: theme.cardSecondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={14} color={theme.text.secondary} />
                </Pressable>
                <Pressable
                  onPress={() => setActiveModule('calendar')}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: theme.cardSecondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={14} color={theme.text.secondary} />
                </Pressable>
              </View>
            </View>

            {/* Días de la semana L M M J V S D */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <Text
                  key={i}
                  style={{
                    width: 28,
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: '700',
                    color: theme.text.tertiary,
                  }}
                >
                  {d}
                </Text>
              ))}
            </View>

            {/* Grilla de Días */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', gap: 4 }}>
              {calendarDays.map((item, index) => {
                const isSelected = item.isToday;

                return (
                  <Pressable
                    key={index}
                    onPress={() => setActiveModule('calendar')}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isSelected ? IOS_COLORS.blue : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: isSelected ? '800' : item.isCurrentMonth ? '600' : '400',
                        color: isSelected
                          ? '#FFFFFF'
                          : item.isCurrentMonth
                          ? theme.text.primary
                          : theme.text.quaternary,
                      }}
                    >
                      {item.day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
