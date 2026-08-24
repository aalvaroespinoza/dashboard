import React, { useMemo } from 'react';
import { View, Text, ScrollView, FlatList, Pressable } from 'react-native';
import {
  Bus,
  CheckCircle2,
  RefreshCw,
  Clock,
} from 'lucide-react-native';
import { useBusEngine } from '../hooks/useBusEngine';
import { useBusStore } from '../stores/useBusStore';
import { useAppStore } from '../../../store/useAppStore';
import { ContextualControls } from './ContextualControls';
import { HorarioCard } from './HorarioCard';
import { BusServiceCard } from './BusServiceCard';
import { calculateTimeDifference } from '../engine/schedule.service';
import { ResolvedBusService } from '../types';

export const BusScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';

  const {
    selectedCompany,
    filterType,
    toggleFavorite,
    isFavorite,
  } = useBusStore();

  const {
    nextBus,
    upcomingBuses,
    allDayServices,
    currentTime,
    currentDay,
    refresh,
  } = useBusEngine();

  const alternativas = upcomingBuses.slice(1).map((nb) => nb.service);

  // Lista de servicios del panel derecho filtrada por sentido y empresa
  const filteredScheduleList = useMemo(() => {
    let list: ResolvedBusService[] = [];

    if (filterType === 'all') {
      list = [...allDayServices.ida, ...allDayServices.vuelta];
    } else if (filterType === 'ida') {
      list = allDayServices.ida;
    } else {
      list = allDayServices.vuelta;
    }

    if (selectedCompany) {
      list = list.filter((s) => s.companyId === selectedCompany);
    }

    // Ordenar cronológicamente priorizando las salidas a partir de la hora actual
    list.sort((a, b) => {
      const diffA = calculateTimeDifference(a.departureTime, currentTime);
      const diffB = calculateTimeDifference(b.departureTime, currentTime);

      // Si ambos son futuros
      if (diffA >= -2 && diffB >= -2) {
        return diffA - diffB;
      }
      // Si uno es futuro y el otro ya pasó
      if (diffA >= -2 && diffB < -2) return -1;
      if (diffB >= -2 && diffA < -2) return 1;
      return diffA - diffB;
    });

    return list;
  }, [allDayServices, filterType, selectedCompany, currentTime]);

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: isDark ? '#0F1115' : '#F8F9FA' }}>
      {/* Columna Izquierda: Controles Contextuales + Widget Hero Próximo Colectivo */}
      <View
        style={{
          width: 400,
          backgroundColor: isDark ? '#12151B' : '#F1F3F5',
          borderRightWidth: 1,
          borderRightColor: isDark ? '#232733' : '#E5E7EB',
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Controles Contextuales */}
        <ContextualControls isDark={isDark} />

        {/* Hero Card con Contador Vivo */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
          <HorarioCard
            titulo={filterType === 'vuelta' ? 'Vuelta a Despeñaderos' : 'Ida hacia UTN / Córdoba'}
            direction={filterType === 'vuelta' ? 'vuelta' : 'ida'}
            service={nextBus ? nextBus.service : null}
            alternativas={alternativas}
            isDark={isDark}
          />

          {/* Badge informativo de modo offline */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#171A21' : '#FFFFFF',
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: isDark ? '#232733' : '#E5E7EB',
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} color="#10B981" />
            <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#4B5563', flex: 1 }}>
              Horarios y cálculos 100% offline desde almacenamiento local SQLite
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Columna Derecha: Grid / Lista Cronológica de Salidas */}
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? '#0F1115' : '#F8F9FA',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header de la Columna */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: isDark ? '#F3F4F6' : '#111827' }}>
              Cronograma de Salidas
            </Text>
            <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 2 }}>
              Día {currentDay} · Hora actual: {currentTime}
            </Text>
          </View>

          <Pressable
            onPress={refresh}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#171A21' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#232733' : '#E5E7EB',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              gap: 6,
            })}
          >
            <RefreshCw size={13} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Actualizar
            </Text>
          </Pressable>
        </View>

        {/* Lista de Servicios */}
        {filteredScheduleList.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: isDark ? '#232733' : '#E5E7EB',
              borderRadius: 14,
            }}
          >
            <Bus size={36} color={isDark ? '#4B5563' : '#CBD5E1'} />
            <Text style={{ fontSize: 14, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 10 }}>
              No se encontraron salidas con los filtros aplicados.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredScheduleList}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <BusServiceCard
                service={item}
                currentTime={currentTime}
                isFavorite={isFavorite(item.companyId)}
                onToggleFavorite={() => toggleFavorite(item.companyId)}
                isDark={isDark}
              />
            )}
          />
        )}
      </View>
    </View>
  );
};
