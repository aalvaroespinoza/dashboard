import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Bus,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { ResolvedBusService, Direction } from '../types';
import { ContadorVivo } from './ContadorVivo';
import { calcularHoraLlegada } from '../engine/schedule.service';

interface HorarioCardProps {
  titulo: string;
  service: ResolvedBusService | null;
  direction: Direction;
  alternativas?: ResolvedBusService[];
  onSelectAlternative?: (service: ResolvedBusService) => void;
  isDark?: boolean;
}

export const HorarioCard: React.FC<HorarioCardProps> = ({
  titulo,
  service,
  direction,
  alternativas = [],
  onSelectAlternative,
  isDark = true,
}) => {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [becUsed, setBecUsed] = useState(false);

  const isIda = direction === 'ida';

  if (!service) {
    return (
      <View
        style={{
          backgroundColor: isDark ? '#171A21' : '#FFFFFF',
          borderRadius: 20,
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isDark ? '#232733' : '#E5E7EB',
        }}
      >
        <Bus size={32} color={isDark ? '#4B5563' : '#CBD5E1'} style={{ marginBottom: 8 }} />
        <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#F3F4F6' : '#111827' }}>
          No hay {titulo.toLowerCase()} programada
        </Text>
        <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 4 }}>
          No quedan más salidas para hoy.
        </Text>
      </View>
    );
  }

  const horaLlegada = service.arrivalTime || calcularHoraLlegada(service.departureTime, direction);

  return (
    <View
      style={{
        backgroundColor: isDark ? '#171A21' : '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: isDark ? '#232733' : '#E5E7EB',
        borderTopWidth: 4,
        borderTopColor: service.companyColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: `${service.companyColor}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bus size={18} color={service.companyColor} />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '800', color: isDark ? '#F3F4F6' : '#111827' }}>
              {titulo}
            </Text>
            <Text style={{ fontSize: 11, color: service.companyColor, fontWeight: '700' }}>
              {service.companyName}
            </Text>
          </View>
        </View>

        {/* Botón BEC */}
        <Pressable
          onPress={() => setBecUsed(!becUsed)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: becUsed
              ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5')
              : (isDark ? '#12151B' : '#F1F3F5'),
            borderColor: becUsed ? '#10B981' : isDark ? '#2E3544' : '#E5E7EB',
            borderWidth: 1,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 16,
            gap: 4,
          })}
        >
          <CheckCircle2 size={13} color={becUsed ? '#10B981' : isDark ? '#6B7280' : '#9CA3AF'} />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: becUsed ? '#10B981' : isDark ? '#9CA3AF' : '#6B7280',
            }}
          >
            {becUsed ? 'BEC Usado ✓' : 'Marcar BEC'}
          </Text>
        </Pressable>
      </View>

      {/* Salida y Hora Principal */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginVertical: 6 }}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'uppercase' }}>
            {isIda ? 'Salida de Despeñaderos' : 'Salida de Córdoba'}
          </Text>
          <Text
            style={{
              fontSize: 42,
              fontWeight: '900',
              color: isDark ? '#FFFFFF' : '#111827',
              letterSpacing: -1,
              fontVariant: ['tabular-nums'],
              marginTop: 2,
            }}
          >
            {service.departureTime}
          </Text>
        </View>

        {/* ContadorVivo integrado */}
        <View style={{ paddingBottom: 6 }}>
          <ContadorVivo horaSalida={service.departureTime} companyColor={service.companyColor} size="large" isDark={isDark} />
        </View>
      </View>

      {/* Llegada Estimada */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#12151B' : '#F8FAFC',
          padding: 10,
          borderRadius: 10,
          marginTop: 6,
          borderWidth: 1,
          borderColor: isDark ? '#232733' : '#E5E7EB',
          gap: 6,
        }}
      >
        <Clock size={14} color={service.companyColor} />
        <Text style={{ fontSize: 12, color: isDark ? '#D1D5DB' : '#374151' }}>
          Llegada estimada a destino:{' '}
          <Text style={{ fontWeight: '800', color: isDark ? '#FFFFFF' : '#111827' }}>
            {horaLlegada} hs
          </Text>
        </Text>
      </View>

      {/* Alternativas Siguientes */}
      {alternativas.length > 0 && (
        <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#232733' : '#E5E7EB', paddingTop: 10 }}>
          <Pressable
            onPress={() => setShowAlternatives(!showAlternatives)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#9CA3AF' : '#6B7280' }}>
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
                  onPress={() => onSelectAlternative?.(alt)}
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
