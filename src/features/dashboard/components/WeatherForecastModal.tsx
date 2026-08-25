/**
 * WeatherForecastModal.tsx
 * Modal de Pronóstico del Clima estilo Apple Weather (iOS / iPadOS 18).
 * Incluye pronóstico de 24h, extendido de 7 días, selector multi-ciudad y botón deep link a la app nativa de Clima.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import {
  X,
  Sun,
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  ExternalLink,
  MapPin,
  Plus,
  Check,
} from 'lucide-react-native';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface WeatherForecastModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  isDark?: boolean;
}

const CITIES = [
  { name: 'Despeñaderos, Córdoba', temp: '18°', condition: 'Despejado', max: '22°', min: '8°', weatherUrl: 'https://weather.com/es-AR/tiempo/hoy/l/-31.81,-64.29' },
  { name: 'Córdoba Capital, Argentina', temp: '19°', condition: 'Parcialmente nublado', max: '24°', min: '11°', weatherUrl: 'https://weather.com/es-AR/tiempo/hoy/l/-31.42,-64.18' },
  { name: 'Río Tercero, Córdoba', temp: '17°', condition: 'Despejado', max: '21°', min: '7°', weatherUrl: 'https://weather.com/es-AR/tiempo/hoy/l/-32.17,-64.11' },
  { name: 'Alta Gracia, Córdoba', temp: '18°', condition: 'Soleado', max: '23°', min: '9°', weatherUrl: 'https://weather.com/es-AR/tiempo/hoy/l/-31.65,-64.43' },
  { name: 'Villa Carlos Paz, Córdoba', temp: '16°', condition: 'Despejado', max: '20°', min: '6°', weatherUrl: 'https://weather.com/es-AR/tiempo/hoy/l/-31.42,-64.49' },
];

const HOURLY_FORECAST = [
  { hour: 'Ahora', temp: '18°', icon: Sun, pop: '0%' },
  { hour: '14:00', temp: '20°', icon: Sun, pop: '0%' },
  { hour: '15:00', temp: '22°', icon: Sun, pop: '0%' },
  { hour: '16:00', temp: '21°', icon: CloudSun, pop: '5%' },
  { hour: '17:00', temp: '19°', icon: CloudSun, pop: '10%' },
  { hour: '18:00', temp: '17°', icon: CloudSun, pop: '10%' },
  { hour: '19:00', temp: '15°', icon: Sun, pop: '0%' },
  { hour: '20:00', temp: '13°', icon: Sun, pop: '0%' },
  { hour: '21:00', temp: '12°', icon: Sun, pop: '0%' },
  { hour: '22:00', temp: '11°', icon: Sun, pop: '0%' },
  { hour: '23:00', temp: '10°', icon: Sun, pop: '0%' },
];

const DAILY_FORECAST = [
  { day: 'Hoy', condition: 'Despejado', icon: Sun, min: 8, max: 22 },
  { day: 'Mié', condition: 'Soleado', icon: Sun, min: 9, max: 24 },
  { day: 'Jue', condition: 'Parcialmente nublado', icon: CloudSun, min: 11, max: 25 },
  { day: 'Vie', condition: 'Chubascos aislados', icon: CloudRain, min: 12, max: 21 },
  { day: 'Sáb', condition: 'Despejado', icon: Sun, min: 7, max: 19 },
  { day: 'Dom', condition: 'Soleado', icon: Sun, min: 8, max: 22 },
  { day: 'Lun', condition: 'Despejado', icon: Sun, min: 10, max: 24 },
];

export const WeatherForecastModal: React.FC<WeatherForecastModalProps> = ({
  visible,
  onClose,
  selectedCity,
  onSelectCity,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const currentCityObj = CITIES.find((c) => c.name === selectedCity) || CITIES[0];

  const handleOpenNativeWeatherApp = async () => {
    try {
      // Intentar protocolo nativo de Apple Weather en iOS
      const appleWeatherUrl = 'weather://';
      const supported = await Linking.canOpenURL(appleWeatherUrl);
      if (supported) {
        await Linking.openURL(appleWeatherUrl);
        return;
      }
    } catch {
      // Continuar al fallback
    }

    // Fallback web oficial
    try {
      await Linking.openURL(currentCityObj.weatherUrl);
    } catch {
      await Linking.openURL('https://weather.com');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 620,
            backgroundColor: theme.card,
            borderRadius: 28,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 18,
            maxHeight: '90%',
            ...createShadow('#000000', { width: 0, height: 8 }, isDark ? 0.35 : 0.08, 16),
          }}
        >
          {/* Header del Modal */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Sun size={20} color={isDark ? APPLE_ACCENT.yellow.dark : APPLE_ACCENT.yellow.light} />
              <Text style={{ fontSize: 18, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                Clima & Pronóstico
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color={theme.text.secondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {/* 1. Selector de Ciudades */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Mis Ciudades
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {CITIES.map((c) => {
                  const isSelected = c.name === currentCityObj.name;
                  return (
                    <Pressable
                      key={c.name}
                      onPress={() => onSelectCity(c.name)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 14,
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(10, 132, 255, 0.22)' : 'rgba(0, 122, 255, 0.14)')
                          : theme.cardSecondary,
                        borderWidth: isSelected ? 1.5 : 1,
                        borderColor: isSelected
                          ? (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light)
                          : theme.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <MapPin size={12} color={isSelected ? (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light) : theme.text.tertiary} />
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: isSelected ? IOS_FONTS.bold : IOS_FONTS.semibold,
                          color: isSelected ? (isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light) : theme.text.primary,
                        }}
                      >
                        {c.name.split(',')[0]}
                      </Text>
                      <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary }}>
                        {c.temp}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 2. Tarjeta del Clima Actual Seleccionado */}
            <View
              style={{
                backgroundColor: theme.cardSecondary,
                borderRadius: 20,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 16, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  {currentCityObj.name}
                </Text>
                <Text style={{ fontSize: 36, fontFamily: IOS_FONTS.roundedHeavy, color: theme.text.primary, fontVariant: ['tabular-nums'] }}>
                  {currentCityObj.temp}
                </Text>
                <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
                  {currentCityObj.condition} · Máx. {currentCityObj.max} · Mín. {currentCityObj.min}
                </Text>
              </View>

              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: isDark ? 'rgba(255, 214, 10, 0.18)' : 'rgba(255, 204, 0, 0.16)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sun size={34} color={isDark ? APPLE_ACCENT.yellow.dark : APPLE_ACCENT.yellow.light} />
              </View>
            </View>

            {/* 3. Pronóstico por Horas (24 Horas) */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Pronóstico por Horas
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {HOURLY_FORECAST.map((h, i) => {
                  const Icon = h.icon;
                  return (
                    <View
                      key={i}
                      style={{
                        backgroundColor: theme.cardSecondary,
                        borderRadius: 14,
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        alignItems: 'center',
                        gap: 8,
                        minWidth: 56,
                        borderWidth: 1,
                        borderColor: theme.border,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
                        {h.hour}
                      </Text>
                      <Icon size={20} color={isDark ? APPLE_ACCENT.yellow.dark : APPLE_ACCENT.yellow.light} />
                      <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary, fontVariant: ['tabular-nums'] }}>
                        {h.temp}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* 4. Pronóstico de 7 Días */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Pronóstico de 7 Días
              </Text>
              <View
                style={{
                  backgroundColor: theme.cardSecondary,
                  borderRadius: 18,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  gap: 10,
                }}
              >
                {DAILY_FORECAST.map((d, i) => {
                  const Icon = d.icon;
                  return (
                    <View
                      key={i}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottomWidth: i < DAILY_FORECAST.length - 1 ? 1 : 0,
                        borderBottomColor: theme.border,
                        paddingBottom: i < DAILY_FORECAST.length - 1 ? 8 : 0,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary, width: 44 }}>
                        {d.day}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                        <Icon size={16} color={isDark ? APPLE_ACCENT.yellow.dark : APPLE_ACCENT.yellow.light} />
                        <Text numberOfLines={1} style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                          {d.condition}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.regular, color: theme.text.secondary, width: 28, textAlign: 'right' }}>
                          {d.min}°
                        </Text>
                        {/* Barra Térmica */}
                        <View style={{ width: 60, height: 4, borderRadius: 2, backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA', overflow: 'hidden' }}>
                          <View
                            style={{
                              height: '100%',
                              width: `${Math.min(100, (d.max - d.min) * 6)}%`,
                              backgroundColor: isDark ? APPLE_ACCENT.orange.dark : APPLE_ACCENT.orange.light,
                              borderRadius: 2,
                            }}
                          />
                        </View>
                        <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.primary, width: 28, textAlign: 'right' }}>
                          {d.max}°
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Botón Deep Link a la App Nativa del Clima */}
          <Pressable
            onPress={handleOpenNativeWeatherApp}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light,
              paddingVertical: 14,
              borderRadius: 16,
              gap: 8,
              marginTop: 4,
            })}
          >
            <ExternalLink size={16} color="#FFFFFF" />
            <Text style={{ fontSize: 14, fontFamily: IOS_FONTS.bold, color: '#FFFFFF' }}>
              Abrir en App de Clima del Dispositivo
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
