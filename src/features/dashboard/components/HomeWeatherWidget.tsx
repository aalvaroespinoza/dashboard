/**
 * HomeWeatherWidget.tsx
 * Tarjeta de Clima interactiva estilo Apple Weather (iOS / iPadOS) con gradiente pastel y acabado Glassmorphism.
 * Al presionar abre el modal detallado de pronóstico con selector multi-ciudad y deep link.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Sun,
  Droplets,
  Wind,
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HomeWeatherWidgetProps {
  onPress?: () => void;
  currentCity?: string;
  isDark?: boolean;
}

export const HomeWeatherWidget: React.FC<HomeWeatherWidgetProps> = ({
  onPress,
  currentCity = 'Despeñaderos, Córdoba',
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.99 : 1 }],
        opacity: pressed ? 0.9 : 1,
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5EA',
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        ...createShadow('#000000', { width: 0, height: 3 }, isDark ? 0.2 : 0.04, 8),
      })}
    >
      {/* Lado Izquierdo: Sol brillante + Temperatura 18° + Estado */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        {/* Sol con Aura Dorada */}
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: isDark ? 'rgba(255, 214, 10, 0.18)' : 'rgba(255, 204, 0, 0.16)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: isDark ? 'rgba(255, 214, 10, 0.35)' : 'rgba(255, 204, 0, 0.3)',
          }}
        >
          <Sun size={30} color={isDark ? APPLE_ACCENT.yellow.dark : APPLE_ACCENT.yellow.light} strokeWidth={2.3} />
        </View>

        {/* Temperatura & Condición */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text
              style={{
                fontSize: 36,
                fontFamily: IOS_FONTS.roundedHeavy,
                color: theme.text.primary,
                letterSpacing: -1,
                fontVariant: ['tabular-nums'],
              }}
            >
              18°
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: IOS_FONTS.bold,
                color: theme.text.primary,
              }}
            >
              Despejado
            </Text>
          </View>

          {/* Ubicación */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MapPin size={12} color={theme.text.tertiary} />
            <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
              {currentCity}
            </Text>
          </View>
        </View>
      </View>

      {/* Lado Derecho: Rango Térmico & Métricas Secundarias + Chevron */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {/* Max / Min Badge */}
        <View
          style={{
            backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: 'flex-end',
          }}
        >
          <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.semibold, color: theme.text.tertiary, textTransform: 'uppercase' }}>
            Rango Térmico
          </Text>
          <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary, fontVariant: ['tabular-nums'] }}>
            Máx. 22° · Mín. 8°
          </Text>
        </View>

        {/* Humedad & Viento */}
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Droplets size={12} color={isDark ? APPLE_ACCENT.cyan.dark : APPLE_ACCENT.cyan.light} />
            <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
              48% Humedad
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Wind size={12} color={isDark ? APPLE_ACCENT.teal.dark : APPLE_ACCENT.teal.light} />
            <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
              12 km/h SSE
            </Text>
          </View>
        </View>

        <ChevronRight size={16} color={theme.text.tertiary} />
      </View>
    </Pressable>
  );
};
