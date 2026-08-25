import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  ArrowRight,
  Clock,
  Star,
  Bus,
  CheckCircle2,
  AlertCircle,
  Navigation,
} from 'lucide-react-native';
import { ResolvedBusService } from '../types';
import { calculateTimeDifference, getServiceStatus } from '../engine/schedule.service';

interface BusServiceCardProps {
  service: ResolvedBusService;
  currentTime?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPress?: () => void;
  isDark?: boolean;
}

const BusServiceCardComponent: React.FC<BusServiceCardProps> = ({
  service,
  currentTime,
  isFavorite = false,
  onToggleFavorite,
  onPress,
  isDark = true,
}) => {
  const isIda = service.direction === 'ida';
  const origin = isIda ? 'Despeñaderos' : 'Córdoba Terminal';
  const destination = isIda ? 'Córdoba (UTN)' : 'Despeñaderos';

  const diff = currentTime ? calculateTimeDifference(service.departureTime, currentTime) : null;
  const statusInfo = diff !== null ? getServiceStatus(diff) : null;

  const isNext = statusInfo?.status === 'urgent' || statusInfo?.status === 'departing_now';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        backgroundColor: isDark ? '#171A21' : '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: isNext ? service.companyColor : isDark ? '#232733' : '#E5E7EB',
        borderLeftWidth: 5,
        borderLeftColor: service.companyColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isNext ? 0.08 : 0.03,
        shadowRadius: 3,
      })}
    >
      {/* Header Fila 1: Hora de Salida, Empresa y Favorito */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
          {/* Hora de salida prominente monospace */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: '900',
              color: isDark ? '#FFFFFF' : '#111827',
              fontVariant: ['tabular-nums'],
              letterSpacing: -0.5,
            }}
          >
            {service.departureTime}
          </Text>

          {/* Flecha + Hora de llegada */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ArrowRight size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: service.companyColor,
                fontVariant: ['tabular-nums'],
              }}
            >
              {service.arrivalTime}
            </Text>
          </View>
        </View>

        {/* Badge de Empresa y Botón Favorito */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              backgroundColor: `${service.companyColor}20`,
              borderColor: service.companyColor,
              borderWidth: 1,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: service.companyColor }}>
              {service.companyName}
            </Text>
          </View>

          {onToggleFavorite && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onToggleFavorite();
              }}
              style={{ padding: 4 }}
            >
              <Star
                size={16}
                color={isFavorite ? '#F59E0B' : isDark ? '#4B5563' : '#CBD5E1'}
                fill={isFavorite ? '#F59E0B' : 'transparent'}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Fila 2: Recorrido y Estado */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Navigation size={11} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '500' }}>
            {origin} → {destination}
          </Text>
        </View>

        {/* Estado del Servicio */}
        {statusInfo && (
          <View
            style={{
              backgroundColor:
                statusInfo.status === 'departing_now'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : statusInfo.status === 'urgent'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : statusInfo.status === 'upcoming'
                  ? 'rgba(245, 158, 11, 0.2)'
                  : isDark
                  ? '#12151B'
                  : '#F1F3F5',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '800',
                color:
                  statusInfo.status === 'departing_now'
                    ? '#10B981'
                    : statusInfo.status === 'urgent'
                    ? '#EF4444'
                    : statusInfo.status === 'upcoming'
                    ? '#F59E0B'
                    : isDark
                    ? '#9CA3AF'
                    : '#6B7280',
              }}
            >
              {statusInfo.badgeText}
            </Text>
          </View>
        )}
      </View>

      {/* Notas / Observaciones */}
      {service.notes && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 }}>
          <Clock size={10} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <Text style={{ fontSize: 10, color: isDark ? '#6B7280' : '#9CA3AF', fontStyle: 'italic' }}>
            {service.notes}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export const BusServiceCard = React.memo(BusServiceCardComponent);
