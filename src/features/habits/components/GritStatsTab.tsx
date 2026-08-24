import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import {
  Trophy,
  Flame,
  Clock,
  Star,
  Zap,
  Lock,
  Unlock,
  Calendar as CalendarIcon,
  TrendingUp,
} from 'lucide-react-native';
import { useHabitsStore } from '../stores/useHabitsStore';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface GritStatsTabProps {
  isDark?: boolean;
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const GritStatsTab: React.FC<GritStatsTabProps> = ({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const {
    getAugustHeatmap,
    getStreaksSummary,
    isStatsUnlocked,
    unlockStats,
  } = useHabitsStore();

  const heatmap = getAugustHeatmap();
  const streaks = getStreaksSummary();

  // El 1 de agosto de 2026 fue Sábado (índice 5 en LUN=0 ... DOM=6)
  // Añadimos 5 celdas vacías al inicio para alinear con Lunes
  const leadingOffset = 5;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 24, gap: 24, maxWidth: 960 }}
    >
      {/* 1. Header de Estadísticas */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.6 }}>
            Estadísticas & Rendimiento
          </Text>
          <Text style={{ fontSize: 13, color: theme.text.secondary, marginTop: 2 }}>
            Agosto 2026 · Resumen mensual de constancia y foco
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(52, 199, 89, 0.15)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(52, 199, 89, 0.3)',
            gap: 6,
          }}
        >
          <TrendingUp size={15} color="#34C759" />
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#34C759' }}>
            +28% vs mes anterior
          </Text>
        </View>
      </View>

      {/* 2. Cuadrícula de Récords y Rachas */}
      <View style={{ flexDirection: 'row', gap: 14 }}>
        {/* Récord 1: Mejor Racha */}
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            borderRadius: 22,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 8,
            ...createShadow('#000000', { width: 0, height: 2 }, 0.04, 4),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255, 149, 0, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trophy size={18} color="#FF9500" />
            </View>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF9500' }}>
              RÉCORD
            </Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '900', color: theme.text.primary }}>
            {streaks.bestStreak.count} días
          </Text>
          <Text style={{ fontSize: 12, color: theme.text.secondary }}>
            {streaks.bestStreak.icon} {streaks.bestStreak.title}
          </Text>
        </View>

        {/* Récord 2: Horas de Foco */}
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            borderRadius: 22,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 8,
            ...createShadow('#000000', { width: 0, height: 2 }, 0.04, 4),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(0, 122, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={18} color={IOS_COLORS.blue} />
            </View>
            <Text style={{ fontSize: 11, fontWeight: '800', color: IOS_COLORS.blue }}>
              DEEP WORK
            </Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '900', color: theme.text.primary }}>
            {streaks.totalFocusHours} horas
          </Text>
          <Text style={{ fontSize: 12, color: theme.text.secondary }}>
            Tiempo acumulado en foco
          </Text>
        </View>

        {/* Récord 3: Días Perfectos */}
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            borderRadius: 22,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 8,
            ...createShadow('#000000', { width: 0, height: 2 }, 0.04, 4),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(52, 199, 89, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Star size={18} color="#34C759" fill="#34C759" />
            </View>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#34C759' }}>
              100% CHECK
            </Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '900', color: theme.text.primary }}>
            {streaks.perfectDays} días
          </Text>
          <Text style={{ fontSize: 12, color: theme.text.secondary }}>
            Días con hábitos al 100%
          </Text>
        </View>

        {/* Récord 4: Puntos Totales */}
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            borderRadius: 22,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 8,
            ...createShadow('#000000', { width: 0, height: 2 }, 0.04, 4),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(175, 82, 222, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={18} color={IOS_COLORS.purple} fill={IOS_COLORS.purple} />
            </View>
            <Text style={{ fontSize: 11, fontWeight: '800', color: IOS_COLORS.purple }}>
              ENERGÍA
            </Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '900', color: theme.text.primary }}>
            {streaks.totalPoints.toLocaleString()} pts
          </Text>
          <Text style={{ fontSize: 12, color: theme.text.secondary }}>
            Puntaje gamificado
          </Text>
        </View>
      </View>

      {/* 3. Calendario Mensual de Calor (Agosto 2026) */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 16,
          ...createShadow('#000000', { width: 0, height: 2 }, 0.04, 6),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <CalendarIcon size={18} color="#FF9500" />
            <Text style={{ fontSize: 17, fontWeight: '900', color: theme.text.primary }}>
              Mapa de Calor · Agosto 2026
            </Text>
          </View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
            Hoy: 24 de agosto
          </Text>
        </View>

        {/* Días de la semana header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
          {WEEKDAYS.map((d, i) => (
            <View key={i} style={{ width: 38, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.tertiary }}>
                {d}
              </Text>
            </View>
          ))}
        </View>

        {/* Grid de 31 Días */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
          {/* Celdas vacías de compensación */}
          {Array.from({ length: leadingOffset }).map((_, idx) => (
            <View key={`empty-${idx}`} style={{ width: 38, height: 38 }} />
          ))}

          {/* Días del 1 al 31 */}
          {heatmap.map((item) => {
            const isToday = item.isToday;
            const rate = item.completionRate;

            let bgColor = isDark ? '#2C2C2E' : '#E5E5EA';
            let textColor = theme.text.secondary;

            if (item.isFuture) {
              bgColor = 'transparent';
              textColor = theme.text.tertiary;
            } else if (rate >= 0.8) {
              bgColor = '#34C759';
              textColor = '#FFFFFF';
            } else if (rate >= 0.5) {
              bgColor = isDark ? 'rgba(52, 199, 89, 0.45)' : '#86EFAC';
              textColor = isDark ? '#FFFFFF' : '#14532D';
            } else if (rate > 0) {
              bgColor = isDark ? 'rgba(52, 199, 89, 0.2)' : '#DCFCE7';
              textColor = '#34C759';
            }

            return (
              <View
                key={item.dayNumber}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: bgColor,
                  borderWidth: isToday ? 2 : 0,
                  borderColor: isToday ? '#FF9500' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isToday || rate >= 0.8 ? '900' : '700',
                    color: isToday ? '#FF9500' : textColor,
                  }}
                >
                  {item.dayNumber}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 4. Resúmenes Semanales */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 16,
          ...createShadow('#000000', { width: 0, height: 2 }, 0.04, 6),
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: '900', color: theme.text.primary }}>
          Rendimiento por Semanas
        </Text>

        {[
          { label: 'Semana 1 (1 - 7 Ago)', rate: 74, habitsCompleted: 26 },
          { label: 'Semana 2 (8 - 14 Ago)', rate: 82, habitsCompleted: 29 },
          { label: 'Semana 3 (15 - 21 Ago)', rate: 91, habitsCompleted: 32 },
          { label: 'Semana 4 (22 - 28 Ago)', rate: 88, habitsCompleted: 14 },
        ].map((w, idx) => (
          <View key={idx} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.primary }}>
                {w.label}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#34C759' }}>
                {w.rate}%
              </Text>
            </View>

            {/* Barra de Progreso */}
            <View
              style={{
                height: 10,
                backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                borderRadius: 5,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${w.rate}%`,
                  height: '100%',
                  backgroundColor: '#34C759',
                  borderRadius: 5,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
