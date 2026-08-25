/**
 * HomeWeatherWidget.tsx
 * Tarjeta de Clima interactiva estilo Apple Weather (iOS / iPadOS) con gradiente pastel y acabado Glassmorphism.
 * Conectado en tiempo real a Open-Meteo para mostrar el clima real de Despeñaderos, Córdoba (o la ciudad activa).
 */

import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Droplets,
  Wind,
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import { useWeatherStore } from '../../../store/useWeatherStore';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HomeWeatherWidgetProps {
  onPress?: () => void;
  isDark?: boolean;
}

export const HomeWeatherWidget: React.FC<HomeWeatherWidgetProps> = ({
  onPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    weatherData,
    loadWeatherStore,
    locations,
    selectedLocationId,
  } = useWeatherStore();

  useEffect(() => {
    loadWeatherStore();
  }, []);

  const activeLoc = locations.find((l) => l.id === selectedLocationId) || locations[0];
  const cityName = weatherData?.locationName || activeLoc?.name || 'Despeñaderos, Córdoba';
  const temp = weatherData ? `${weatherData.temperature}°` : '18°';
  const condition = weatherData?.condition || 'Despejado';
  const maxTemp = weatherData ? `${weatherData.tempMax}°` : '22°';
  const minTemp = weatherData ? `${weatherData.tempMin}°` : '8°';
  const humidity = weatherData ? `${weatherData.humidity}%` : '48%';
  const windSpeed = weatherData ? `${weatherData.windSpeed} km/h` : '12 km/h';
  const code = weatherData?.code ?? 0;

  const renderWeatherIcon = () => {
    const color = isDark ? APPLE_ACCENT.yellow.dark : APPLE_ACCENT.yellow.light;
    if (code === 0 || code === 1) return <Sun size={30} color={color} strokeWidth={2.3} />;
    if (code === 2) return <CloudSun size={30} color={color} strokeWidth={2.3} />;
    if (code === 3) return <Cloud size={30} color={theme.text.secondary} strokeWidth={2.3} />;
    if (code >= 51 && code <= 82) return <CloudRain size={30} color={isDark ? APPLE_ACCENT.cyan.dark : APPLE_ACCENT.cyan.light} strokeWidth={2.3} />;
    if (code >= 95) return <CloudLightning size={30} color={isDark ? APPLE_ACCENT.purple.dark : APPLE_ACCENT.purple.light} strokeWidth={2.3} />;
    return <Sun size={30} color={color} strokeWidth={2.3} />;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.99 : 1 }],
        opacity: pressed ? 0.9 : 1,
        backgroundColor: theme.card,
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: theme.border,
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        ...createShadow('#000000', { width: 0, height: 3 }, isDark ? 0.2 : 0.04, 8),
      })}
    >
      {/* Lado Izquierdo: Icono del Clima + Temperatura Real + Estado */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        {/* Aura de Clima */}
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
          {renderWeatherIcon()}
        </View>

        {/* Temperatura & Condición Real */}
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
              {temp}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: IOS_FONTS.bold,
                color: theme.text.primary,
              }}
            >
              {condition}
            </Text>
          </View>

          {/* Ubicación Real */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MapPin size={12} color={theme.text.tertiary} />
            <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
              {cityName}
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
            Máx. {maxTemp} · Mín. {minTemp}
          </Text>
        </View>

        {/* Humedad & Viento */}
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Droplets size={12} color={isDark ? APPLE_ACCENT.cyan.dark : APPLE_ACCENT.cyan.light} />
            <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
              {humidity} Humedad
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Wind size={12} color={isDark ? APPLE_ACCENT.teal.dark : APPLE_ACCENT.teal.light} />
            <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
              {windSpeed}
            </Text>
          </View>
        </View>

        <ChevronRight size={16} color={theme.text.tertiary} />
      </View>
    </Pressable>
  );
};
