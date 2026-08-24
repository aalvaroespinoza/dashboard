import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Layers,
  Filter,
  Check,
} from 'lucide-react-native';
import { useBusStore } from '../stores/useBusStore';
import { ALL_SCENARIOS } from '../data/scenarios';
import { COMPANIES_LIST } from '../data/companies';
import { DayOfWeek } from '../types';

interface ContextualControlsProps {
  isDark?: boolean;
}

export const ContextualControls: React.FC<ContextualControlsProps> = ({ isDark = true }) => {
  const {
    activeScenario,
    isAutoScenarioMode,
    selectedCompany,
    filterType,
    selectedDay,
    setScenario,
    toggleAutoMode,
    setCompanyFilter,
    setFilterType,
    setSelectedDay,
  } = useBusStore();

  const days: { id: DayOfWeek; label: string }[] = [
    { id: 'lunes', label: 'Lun' },
    { id: 'martes', label: 'Mar' },
    { id: 'miercoles', label: 'Mié' },
    { id: 'jueves', label: 'Jue' },
    { id: 'viernes', label: 'Vie' },
    { id: 'sabado', label: 'Sáb' },
  ];

  return (
    <View style={{ gap: 12 }}>
      {/* Fila 1: Botón Modo Automático + Selector de Sentido */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* Toggle Modo Automático */}
        <Pressable
          onPress={toggleAutoMode}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isAutoScenarioMode
              ? (isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF')
              : (isDark ? '#171A21' : '#F1F3F5'),
            borderColor: isAutoScenarioMode ? '#6366F1' : isDark ? '#2E3544' : '#E5E7EB',
            borderWidth: 1,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
            gap: 6,
          })}
        >
          <Sparkles size={14} color={isAutoScenarioMode ? '#6366F1' : isDark ? '#9CA3AF' : '#6B7280'} />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: isAutoScenarioMode ? '#6366F1' : isDark ? '#9CA3AF' : '#6B7280',
            }}
          >
            {isAutoScenarioMode ? 'Modo Auto: ON' : 'Modo Auto: OFF'}
          </Text>
        </Pressable>

        {/* Píldoras Sentido: Todos / Ida / Vuelta */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: isDark ? '#12151B' : '#F1F3F5',
            borderRadius: 16,
            padding: 2,
            borderWidth: 1,
            borderColor: isDark ? '#232733' : '#E5E7EB',
          }}
        >
          <Pressable
            onPress={() => setFilterType('all')}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: filterType === 'all' ? (isDark ? '#2E3544' : '#FFFFFF') : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: filterType === 'all' ? (isDark ? '#FFFFFF' : '#111827') : isDark ? '#9CA3AF' : '#6B7280',
              }}
            >
              Todos
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterType('ida')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: filterType === 'ida' ? '#6366F1' : 'transparent',
              gap: 3,
            }}
          >
            <ArrowUpRight size={11} color={filterType === 'ida' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280'} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: filterType === 'ida' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280',
              }}
            >
              Ida
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterType('vuelta')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: filterType === 'vuelta' ? '#10B981' : 'transparent',
              gap: 3,
            }}
          >
            <ArrowDownLeft size={11} color={filterType === 'vuelta' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280'} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: filterType === 'vuelta' ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280',
              }}
            >
              Vuelta
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Fila 2: Selector de Días de la semana */}
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {days.map((d) => {
          const isSel = selectedDay === d.id;
          return (
            <Pressable
              key={d.id}
              onPress={() => setSelectedDay(d.id)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: isSel ? (isDark ? '#2E3544' : '#E2E8F0') : isDark ? '#171A21' : '#F1F3F5',
                borderWidth: 1,
                borderColor: isSel ? '#6366F1' : isDark ? '#232733' : '#E5E7EB',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isSel ? '800' : '600',
                  color: isSel ? (isDark ? '#FFFFFF' : '#111827') : isDark ? '#9CA3AF' : '#6B7280',
                }}
              >
                {d.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Fila 3: Chips de Empresas Operadoras */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        <Pressable
          onPress={() => setCompanyFilter(null)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 14,
            backgroundColor: selectedCompany === null ? (isDark ? '#2E3544' : '#E2E8F0') : isDark ? '#171A21' : '#FFFFFF',
            borderWidth: 1,
            borderColor: selectedCompany === null ? '#6366F1' : isDark ? '#232733' : '#E5E7EB',
            gap: 4,
          }}
        >
          <Filter size={11} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#F3F4F6' : '#111827' }}>
            Todas las empresas
          </Text>
        </Pressable>

        {COMPANIES_LIST.map((comp) => {
          const isSel = selectedCompany === comp.id;
          return (
            <Pressable
              key={comp.id}
              onPress={() => setCompanyFilter(isSel ? null : comp.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 14,
                backgroundColor: isSel ? `${comp.color}25` : isDark ? '#171A21' : '#FFFFFF',
                borderWidth: 1,
                borderColor: isSel ? comp.color : isDark ? '#232733' : '#E5E7EB',
                gap: 5,
              }}
            >
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: comp.color }} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isSel ? '800' : '600',
                  color: isSel ? comp.color : isDark ? '#D1D5DB' : '#374151',
                }}
              >
                {comp.shortName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Fila 4: Escenario Activo */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#171A21' : '#F8FAFC',
          borderRadius: 10,
          padding: 8,
          borderWidth: 1,
          borderColor: isDark ? '#232733' : '#E2E8F0',
          gap: 6,
        }}
      >
        <Layers size={13} color="#6366F1" />
        <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280', flex: 1 }}>
          Escenario:{' '}
          <Text style={{ fontWeight: '800', color: isDark ? '#F3F4F6' : '#111827' }}>
            {ALL_SCENARIOS.find((s) => s.id === activeScenario)?.label || activeScenario}
          </Text>
        </Text>
      </View>
    </View>
  );
};
