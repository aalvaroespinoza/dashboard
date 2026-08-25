import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import {
  Bus,
  MapPin,
  Clock,
  Search,
  CheckCircle2,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Star,
  RefreshCw,
  Navigation,
} from 'lucide-react-native';
import { useBusStore } from '../../stores/useBusStore';
import { useBusSchedule } from '../../hooks/useBusSchedule';
import { useAppStore } from '../../store/useAppStore';
import { HorarioCard } from './HorarioCard';
import { BusScheduleList } from './BusScheduleList';
import { DayType } from '../../types';

export const BusScheduleScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';

  const {
    routes,
    selectedRouteId,
    originStop,
    destinationStop,
    selectedDirection,
    selectedDayType,
    stops,
    searchQuery,
    searchResults,
    loadRoutesAndPreferences,
    selectRoute,
    setDirection,
    setDayType,
    toggleFavoriteRoute,
    isRouteFavorite,
    setSearchQuery,
  } = useBusStore();

  const {
    nextBus,
    upcomingBuses,
    allDayServices,
    currentTime,
    currentDay,
    refresh,
  } = useBusSchedule({
    companyId: selectedRouteId,
    direction: selectedDirection,
  });

  useEffect(() => {
    loadRoutesAndPreferences();
  }, []);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const idaServices = allDayServices.filter((s) => s.direction === 'ida');
  const vueltaServices = allDayServices.filter((s) => s.direction === 'vuelta');

  const alternativas = upcomingBuses.slice(1).map((ub) => ub.service);

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: isDark ? '#0F1115' : '#F8F9FA' }}>
      {/* Panel 1: Selector de Empresas / Líneas */}
      <View
        style={{
          flex: 1,
          minWidth: 220,
          maxWidth: 300,
          backgroundColor: isDark ? '#12151B' : '#F1F3F5',
          borderRightWidth: 1,
          borderRightColor: isDark ? '#232733' : '#E5E7EB',
          padding: 16,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'uppercase', marginBottom: 12 }}>
          Líneas y Empresas
        </Text>

        {/* Buscador de paradas o líneas */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#171A21' : '#FFFFFF',
            borderRadius: 8,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: isDark ? '#2E3544' : '#E2E8F0',
            marginBottom: 14,
          }}
        >
          <Search size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar parada o línea..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 6,
              fontSize: 12,
              color: isDark ? '#F3F4F6' : '#111827',
            }}
          />
        </View>

        {/* Lista de Líneas */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {searchQuery.trim().length > 0 && searchResults.length > 0 ? (
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#6B7280' : '#9CA3AF' }}>
                RESULTADOS ({searchResults.length})
              </Text>
              {searchResults.map((res) => (
                <Pressable
                  key={`${res.route.id}-${res.stop.id}`}
                  onPress={() => {
                    selectRoute(res.route.id);
                    setDirection(res.stop.direction);
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.85 : 1,
                    backgroundColor: isDark ? '#171A21' : '#FFFFFF',
                    borderRadius: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: isDark ? '#232733' : '#E5E7EB',
                  })}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: res.route.color }}>
                    {res.route.line_number}
                  </Text>
                  <Text style={{ fontSize: 12, color: isDark ? '#F3F4F6' : '#111827', marginTop: 2 }}>
                    Parada: {res.stop.name}
                  </Text>
                  <Text style={{ fontSize: 10, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 2 }}>
                    Sentido: {res.stop.direction === 'outbound' ? 'Ida' : 'Vuelta'}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {routes.map((route) => {
                const isSel = route.id === selectedRouteId;
                const isFav = isRouteFavorite(route.id);

                return (
                  <Pressable
                    key={route.id}
                    onPress={() => selectRoute(route.id)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.9 : 1,
                      backgroundColor: isSel ? (isDark ? '#1E232E' : '#FFFFFF') : isDark ? '#171A21' : '#FFFFFF',
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: isSel ? route.color : isDark ? '#232733' : '#E5E7EB',
                      borderLeftWidth: 5,
                      borderLeftColor: route.color,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isSel ? 0.08 : 0,
                      shadowRadius: 2,
                    })}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: route.color }}>
                        {route.name}
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation?.();
                            toggleFavoriteRoute(route.id);
                          }}
                          style={{ padding: 4 }}
                        >
                          <Star
                            size={16}
                            color={isFav ? '#F59E0B' : isDark ? '#4B5563' : '#CBD5E1'}
                            fill={isFav ? '#F59E0B' : 'transparent'}
                          />
                        </Pressable>
                        <Bus size={17} color={route.color} />
                      </View>
                    </View>

                    <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 4 }}>
                      {route.description}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Navigation size={12} color={isDark ? '#6B7280' : '#9CA3AF'} style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 11, color: isDark ? '#D1D5DB' : '#4B5563', fontWeight: '500' }}>
                        {route.origin} ↔ {route.destination}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Panel 2: HorarioCard (Hero en Vivo) & Paradas */}
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? '#171A21' : '#FFFFFF',
          borderRightWidth: 1,
          borderRightColor: isDark ? '#232733' : '#E5E7EB',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* HorarioCard con contador en vivo */}
        <HorarioCard
          titulo={selectedDirection === 'outbound' ? 'Ida hacia Córdoba' : 'Vuelta hacia Despeñaderos'}
          direction={selectedDirection === 'outbound' ? 'ida' : 'vuelta'}
          nextBus={nextBus}
          alternativas={alternativas}
          isDark={isDark}
        />

        {/* Secuencia de Paradas */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 18, marginBottom: 10 }}>
          PUNTOS DE EMBARQUE Y PARADAS ({stops.length})
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {stops.length === 0 ? (
            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
              <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>No hay paradas registradas</Text>
            </View>
          ) : (
            <View style={{ paddingLeft: 12 }}>
              {stops.map((stop, index) => {
                const isFirst = index === 0;
                const isLast = index === stops.length - 1;

                return (
                  <View key={stop.id} style={{ flexDirection: 'row', alignItems: 'flex-start', minHeight: 48 }}>
                    {/* Timeline */}
                    <View style={{ alignItems: 'center', width: 24, marginRight: 12 }}>
                      <View
                        style={{
                          width: isFirst || isLast ? 14 : 9,
                          height: isFirst || isLast ? 14 : 9,
                          borderRadius: 7,
                          backgroundColor: isFirst || isLast ? selectedRoute?.color || '#6366F1' : isDark ? '#2E3544' : '#CBD5E1',
                          borderWidth: 2,
                          borderColor: isDark ? '#171A21' : '#FFFFFF',
                        }}
                      />
                      {!isLast && (
                        <View
                          style={{
                            width: 2,
                            flex: 1,
                            backgroundColor: isDark ? '#2E3544' : '#E2E8F0',
                            marginVertical: 2,
                          }}
                        />
                      )}
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1, paddingBottom: 12 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: isFirst || isLast ? '700' : '500',
                          color: isDark ? '#F3F4F6' : '#111827',
                        }}
                      >
                        {stop.name}
                      </Text>
                      <Text style={{ fontSize: 10, color: isDark ? '#6B7280' : '#9CA3AF', marginTop: 1 }}>
                        {isFirst ? 'Origen' : isLast ? 'Destino' : `Parada #${stop.sequence_order}`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Panel 3: Grilla y Lista Completa de Horarios */}
      <View
        style={{
          flex: 1.3,
          minWidth: 260,
          maxWidth: 380,
          backgroundColor: isDark ? '#12151B' : '#F8F9FA',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#F3F4F6' : '#111827' }}>
            Cronograma Diario
          </Text>

          <Pressable onPress={refresh} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280' }}>{currentTime}</Text>
          </Pressable>
        </View>

        {/* BusScheduleList con pestañas Ida / Vuelta */}
        <BusScheduleList
          idaServices={idaServices}
          vueltaServices={vueltaServices}
          nextBusServiceId={nextBus?.service.id}
          isDark={isDark}
        />

        {/* Badge Offline */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#171A21' : '#FFFFFF',
            borderRadius: 8,
            padding: 10,
            marginTop: 12,
            borderWidth: 1,
            borderColor: isDark ? '#232733' : '#E5E7EB',
          }}
        >
          <CheckCircle2 size={16} color="#10B981" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#4B5563', flex: 1 }}>
            Horarios offline con SQLite y recálculo en vivo
          </Text>
        </View>
      </View>
    </View>
  );
};
