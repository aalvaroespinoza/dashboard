/**
 * HomeBusWidget.tsx
 * Widget de Recorridos Próximos del Dashboard estilo iPadOS 18.
 * Muestra el sentido de viaje (Córdoba Capital ➔ Despeñaderos), empresa, horario y píldora de cuenta regresiva en vivo.
 * Al presionar la tarjeta abre directamente el visor completo de horarios (AllSchedulesModal).
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Bus, ChevronRight, ArrowRight } from 'lucide-react-native';
import { useBusStore } from '../../bus/stores/useBusStore';
import { useTodaySchedule } from '../../bus/hooks/useTodaySchedule';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HomeBusWidgetProps {
  onPress?: () => void;
  isDark?: boolean;
}

export const HomeBusWidget: React.FC<HomeBusWidgetProps> = React.memo(({
  onPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const { recomendacionIda, recomendacionVuelta } = useTodaySchedule();
  const [timeRemaining, setTimeRemaining] = useState('5h 16m');

  const departureTime = recomendacionVuelta?.recomendado?.horaSalida || '06:25';
  const companyName = recomendacionVuelta?.recomendado?.empresa || 'Canelo';
  const originName = 'Córdoba Capital';
  const originDetail = companyName;
  const destName = 'Despeñaderos';
  const destDetail = 'Terminal';

  // Cálculo de cuenta regresiva simple en vivo
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const [h, m] = departureTime.split(':').map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);

      let diffMs = target.getTime() - now.getTime();
      if (diffMs < 0) {
        // Asumir mañana
        diffMs += 24 * 60 * 60 * 1000;
      }

      const totalMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      setTimeRemaining(`${hours}h ${mins}m`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 30000);
    return () => clearInterval(interval);
  }, [departureTime]);

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      setActiveModule('bus');
    }
  };

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.99 : 1 }],
        flex: 1,
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'space-between',
        minHeight: 168,
        gap: 14,
        ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.22 : 0.03, 8),
      })}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 16, fontFamily: IOS_FONTS.bold, color: theme.text.primary, letterSpacing: -0.4 }}>
          Recorridos próximos
        </Text>

        <Pressable
          onPress={() => setActiveModule('bus')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
          })}
        >
          <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.semibold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
            Ver todos
          </Text>
          <ChevronRight size={13} color={isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light} />
        </Pressable>
      </View>

      {/* Tarjeta de Viaje */}
      <View
        style={{
          backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB',
          borderRadius: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Icono Colectivo + Origen */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: isDark ? 'rgba(100, 210, 255, 0.18)' : 'rgba(50, 173, 230, 0.14)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bus size={17} color={isDark ? APPLE_ACCENT.cyan.dark : APPLE_ACCENT.cyan.light} />
            </View>

            <View>
              <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                {originName}
              </Text>
              <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary }}>
                {originDetail}
              </Text>
            </View>
          </View>

          {/* Flecha */}
          <ArrowRight size={14} color={theme.text.tertiary} />

          {/* Destino */}
          <View>
            <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
              {destName}
            </Text>
            <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary }}>
              {destDetail}
            </Text>
          </View>

          {/* Horario */}
          <Text
            style={{
              fontSize: 14,
              fontFamily: IOS_FONTS.bold,
              color: theme.text.primary,
              fontVariant: ['tabular-nums'],
              marginLeft: 4,
            }}
          >
            {departureTime} hs
          </Text>
        </View>
      </View>

      {/* Píldora Inferior: Sale en Xh Ym */}
      <View
        style={{
          backgroundColor: isDark ? 'rgba(48, 209, 88, 0.15)' : 'rgba(52, 199, 89, 0.12)',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light,
          }}
        />
        <Text
          style={{
            fontSize: 12,
            fontFamily: IOS_FONTS.bold,
            color: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light,
          }}
        >
          Sale en {timeRemaining} ({departureTime} hs)
        </Text>
      </View>
    </Pressable>
  );
});
