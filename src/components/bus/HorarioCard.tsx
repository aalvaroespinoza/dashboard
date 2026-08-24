import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Bus,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowRight,
  RotateCcw,
} from 'lucide-react-native';
import { BusServiceItem, NextBusResult } from '../../services/busService';

interface HorarioCardProps {
  titulo: string;
  direction: 'ida' | 'vuelta';
  nextBus: NextBusResult | null;
  alternativas?: BusServiceItem[];
  onSelectService?: (service: BusServiceItem) => void;
  isDark?: boolean;
}

export const HorarioCard: React.FC<HorarioCardProps> = ({
  titulo,
  direction,
  nextBus,
  alternativas = [],
  onSelectService,
  isDark = true,
}) => {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const isIda = direction === 'ida';

  if (!nextBus) {
    return (
      <View
        style={{
          backgroundColor: isDark ? '#171A21' : '#FFFFFF',
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isDark ? '#232733' : '#E5E7EB',
        }}
      >
        <Bus size={32} color={isDark ? '#4B5563' : '#CBD5E1'} style={{ marginBottom: 8 }} />
        <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#F3F4F6' : '#111827' }}>
          Sin salidas programadas
        </Text>
        <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 4 }}>
          No quedan más servicios para hoy en sentido {isIda ? 'Ida' : 'Vuelta'}.
        </Text>
      </View>
    );
  }

  const { service, minutesUntilDeparture, formattedDeparture, status, message } = nextBus;

  const isUrgent = minutesUntilDeparture <= 15 && minutesUntilDeparture > 1;
  const isDepartingNow = minutesUntilDeparture <= 1 && minutesUntilDeparture >= -1;
  const isPassed = minutesUntilDeparture < -1;

  const getPillStyle = () => {
    if (isDepartingNow) {
      return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10B981', text: '#10B981', label: 'Saliendo ahora' };
    }
    if (isUrgent) {
      return { bg: 'rgba(239, 68, 68, 0.2)', border: '#EF4444', text: '#EF4444', label: `Sale en ${minutesUntilDeparture} min` };
    }
    if (isPassed) {
      return { bg: isDark ? '#232733' : '#F1F3F5', border: isDark ? '#2E3544' : '#E5E7EB', text: isDark ? '#9CA3AF' : '#6B7280', label: 'Ya salió' };
    }
    if (minutesUntilDeparture <= 60) {
      return { bg: 'rgba(245, 158, 11, 0.2)', border: '#F59E0B', text: '#F59E0B', label: `Sale en ${minutesUntilDeparture} min` };
    }
    return { bg: isDark ? '#1E232E' : '#E2E8F0', border: isDark ? '#2E3544' : '#CBD5E1', text: isDark ? '#D1D5DB' : '#374151', label: `Sale a las ${formattedDeparture}` };
  };

  const pill = getPillStyle();

  return (
    <View
      style={{
        backgroundColor: isDark ? '#171A21' : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: isDark ? '#232733' : '#E5E7EB',
        borderTopWidth: 4,
        borderTopColor: service.companyColor,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: `${service.companyColor}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bus size={18} color={service.companyColor} />
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#F3F4F6' : '#111827' }}>
              {titulo}
            </Text>
            <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '500' }}>
              {service.companyName}
            </Text>
          </View>
        </View>

        {/* Status countdown pill */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: pill.bg,
            borderWidth: 1,
            borderColor: pill.border,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            gap: 5,
          }}
        >
          <Zap size={13} color={pill.text} />
          <Text style={{ fontSize: 11, fontWeight: '800', color: pill.text }}>
            {pill.label}
          </Text>
        </View>
      </View>

      {/* Main Departure Display */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginVertical: 8 }}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'uppercase' }}>
            {isIda ? 'Salida de Despeñaderos' : 'Salida de Córdoba'}
          </Text>
          <Text
            style={{
              fontSize: 38,
              fontWeight: '900',
              color: isDark ? '#FFFFFF' : '#111827',
              letterSpacing: -1,
              marginTop: 2,
              fontVariant: ['tabular-nums'],
            }}
          >
            {formattedDeparture}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'uppercase' }}>
            Llegada estimada
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: service.companyColor,
              marginTop: 2,
              fontVariant: ['tabular-nums'],
            }}
          >
            {service.arrivalTime}
          </Text>
        </View>
      </View>

      {/* Info Row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#12151B' : '#F8F9FA',
          padding: 10,
          borderRadius: 8,
          marginTop: 8,
          borderWidth: 1,
          borderColor: isDark ? '#232733' : '#E5E7EB',
          gap: 6,
        }}
      >
        <Clock size={14} color={service.companyColor} />
        <Text style={{ fontSize: 12, color: isDark ? '#D1D5DB' : '#374151' }}>
          Tiempo estimado de viaje: <Text style={{ fontWeight: '700' }}>65 minutos</Text>
        </Text>
      </View>

      {/* Alternativas colapsables */}
      {alternativas.length > 0 && (
        <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#232733' : '#E5E7EB', paddingTop: 10 }}>
          <Pressable
            onPress={() => setShowAlternatives(!showAlternatives)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Ver {alternativas.length} salidas siguientes
            </Text>
            {showAlternatives ? (
              <ChevronUp size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            ) : (
              <ChevronDown size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
            )}
          </Pressable>

          {showAlternatives && (
            <View style={{ gap: 6, marginTop: 8 }}>
              {alternativas.map((alt) => (
                <Pressable
                  key={alt.id}
                  onPress={() => onSelectService?.(alt)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isDark ? '#12151B' : '#F8F9FA',
                    borderRadius: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: isDark ? '#232733' : '#E5E7EB',
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: isDark ? '#FFFFFF' : '#111827' }}>
                      {alt.departureTime}
                    </Text>
                    <Text style={{ fontSize: 12, color: alt.companyColor, fontWeight: '600' }}>
                      {alt.companyName}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280' }}>
                      Llega {alt.arrivalTime}
                    </Text>
                    <ArrowRight size={12} color={isDark ? '#6B7280' : '#9CA3AF'} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};
