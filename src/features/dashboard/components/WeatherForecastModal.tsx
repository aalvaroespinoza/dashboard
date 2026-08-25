/**
 * WeatherForecastModal.tsx
 * Modal de Pronóstico del Clima estilo Apple Weather (iOS / iPadOS 18).
 * - Conectado en tiempo real a Open-Meteo API.
 * - Ciudad por defecto: Despeñaderos, Córdoba (con opción de buscar y agregar cualquier ciudad del mundo).
 * - Pronóstico de 24 horas y 7 días reales.
 * - Soporte universal para tablets Huawei / Android / iOS / Web vía Google Weather y weather://.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  CloudLightning,
  Wind,
  Droplets,
  ExternalLink,
  MapPin,
  Plus,
  Trash2,
  Search,
  Check,
  RefreshCw,
} from 'lucide-react-native';
import { useWeatherStore } from '../../../store/useWeatherStore';
import { WeatherLocation } from '../../../services/weatherService';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface WeatherForecastModalProps {
  visible: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const WeatherForecastModal: React.FC<WeatherForecastModalProps> = ({
  visible,
  onClose,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    locations,
    selectedLocationId,
    weatherData,
    isLoading,
    searchQuery,
    searchResults,
    isSearching,
    selectLocation,
    addLocation,
    removeLocation,
    searchCities,
    clearSearchResults,
    refreshWeather,
  } = useWeatherStore();

  const [isAddingCity, setIsAddingCity] = useState(false);

  const selectedLoc = locations.find((l) => l.id === selectedLocationId) || locations[0];

  const handleOpenNativeWeather = async () => {
    const locName = selectedLoc?.name || 'Despeñaderos, Córdoba';
    
    // 1. Intentar protocolo nativo de Apple Weather (si es iOS/iPadOS)
    try {
      const appleUrl = 'weather://';
      const canOpen = await Linking.canOpenURL(appleUrl);
      if (canOpen) {
        await Linking.openURL(appleUrl);
        return;
      }
    } catch {
      // Continuar al fallback
    }

    // 2. Fallback universal óptimo para Huawei Tablet / Android / Web
    // Abre directamente la tarjeta interactiva de clima en el navegador del dispositivo
    try {
      const query = encodeURIComponent(`clima ${locName}`);
      await Linking.openURL(`https://www.google.com/search?q=${query}`);
    } catch {
      await Linking.openURL(`https://weather.com/es-AR/tiempo/hoy/l/${selectedLoc?.lat || -31.81},${selectedLoc?.lon || -64.29}`);
    }
  };

  const getWeatherIcon = (code: number, size: number = 20) => {
    const color = isDark ? APPLE_ACCENT.yellow.dark : APPLE_ACCENT.yellow.light;
    if (code === 0 || code === 1) return <Sun size={size} color={color} strokeWidth={2.3} />;
    if (code === 2) return <CloudSun size={size} color={color} strokeWidth={2.3} />;
    if (code === 3) return <Cloud size={size} color={theme.text.secondary} strokeWidth={2.3} />;
    if (code >= 51 && code <= 82) return <CloudRain size={size} color={isDark ? APPLE_ACCENT.cyan.dark : APPLE_ACCENT.cyan.light} strokeWidth={2.3} />;
    if (code >= 95) return <CloudLightning size={size} color={isDark ? APPLE_ACCENT.purple.dark : APPLE_ACCENT.purple.light} strokeWidth={2.3} />;
    return <Sun size={size} color={color} strokeWidth={2.3} />;
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
            gap: 16,
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

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable
                onPress={refreshWeather}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RefreshCw size={15} color={theme.text.secondary} />
              </Pressable>

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
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {/* 1. Selector de Ciudades & Botón Agregar */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Mis Ciudades
                </Text>
                <Pressable
                  onPress={() => {
                    setIsAddingCity(!isAddingCity);
                    if (isAddingCity) clearSearchResults();
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={13} color={isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light} />
                  <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
                    {isAddingCity ? 'Cancelar' : 'Agregar Ciudad'}
                  </Text>
                </Pressable>
              </View>

              {/* Formulario de Búsqueda de Ciudades */}
              {isAddingCity && (
                <View
                  style={{
                    backgroundColor: theme.cardSecondary,
                    padding: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light,
                    gap: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Search size={14} color={theme.text.tertiary} />
                    <TextInput
                      value={searchQuery}
                      onChangeText={searchCities}
                      placeholder="Buscar ciudad (ej. Córdoba, Río Tercero, Madrid)..."
                      placeholderTextColor={theme.text.tertiary}
                      autoFocus
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontFamily: IOS_FONTS.semibold,
                        color: theme.text.primary,
                        padding: 0,
                      }}
                    />
                    {isSearching && <ActivityIndicator size="small" color={isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light} />}
                  </View>

                  {/* Resultados de búsqueda */}
                  {searchResults.length > 0 && (
                    <View style={{ gap: 4, marginTop: 4 }}>
                      {searchResults.map((city) => (
                        <Pressable
                          key={city.id}
                          onPress={async () => {
                            await addLocation(city);
                            setIsAddingCity(false);
                            clearSearchResults();
                          }}
                          style={({ pressed }) => ({
                            opacity: pressed ? 0.75 : 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            borderRadius: 10,
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
                          })}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <MapPin size={12} color={isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light} />
                            <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.semibold, color: theme.text.primary }}>
                              {city.name}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light }}>
                            + Añadir
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Chips de Ciudades Guardadas */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {locations.map((loc) => {
                  const isSelected = loc.id === selectedLocationId;
                  const isDefault = loc.id === 'despenaderos-cba';
                  return (
                    <Pressable
                      key={loc.id}
                      onPress={() => selectLocation(loc.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 7,
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
                        {loc.name.split(',')[0]}
                      </Text>

                      {!isDefault && (
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            removeLocation(loc.id);
                          }}
                          style={{ padding: 2 }}
                        >
                          <X size={12} color={theme.text.tertiary} />
                        </Pressable>
                      )}
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
              <View style={{ gap: 2, flex: 1 }}>
                <Text style={{ fontSize: 16, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  {weatherData?.locationName || selectedLoc?.name || 'Despeñaderos, Córdoba'}
                </Text>
                <Text style={{ fontSize: 36, fontFamily: IOS_FONTS.roundedHeavy, color: theme.text.primary, fontVariant: ['tabular-nums'] }}>
                  {weatherData ? `${weatherData.temperature}°` : '18°'}
                </Text>
                <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
                  {weatherData?.condition || 'Despejado'} · Máx. {weatherData?.tempMax ?? 22}° · Mín. {weatherData?.tempMin ?? 8}°
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
                {getWeatherIcon(weatherData?.code ?? 0, 32)}
              </View>
            </View>

            {/* 3. Pronóstico por Horas (24 Horas) */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Pronóstico por Horas
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {(weatherData?.hourly || []).map((h, i) => (
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
                      {h.hourLabel}
                    </Text>
                    {getWeatherIcon(h.code, 18)}
                    <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary, fontVariant: ['tabular-nums'] }}>
                      {h.temp}°
                    </Text>
                  </View>
                ))}
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
                {(weatherData?.daily || []).map((d, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottomWidth: i < (weatherData?.daily.length || 0) - 1 ? 1 : 0,
                      borderBottomColor: theme.border,
                      paddingBottom: i < (weatherData?.daily.length || 0) - 1 ? 8 : 0,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary, width: 44 }}>
                      {d.dayLabel}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      {getWeatherIcon(d.code, 16)}
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
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Botón Deep Link Universal (Huawei / Android / iOS / Web) */}
          <Pressable
            onPress={handleOpenNativeWeather}
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
              Abrir Clima en Navegador / App del Dispositivo
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
