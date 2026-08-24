import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Clock, ArrowRight } from 'lucide-react-native';
import { BusServiceItem } from '../../services/busService';

interface BusServiceCardProps {
  service: BusServiceItem;
  isNext?: boolean;
  onPress?: () => void;
  isDark?: boolean;
}

/**
 * Tarjeta nativa para un servicio de colectivo con hora de salida prominente,
 * llegada estimada, empresa y notas.
 */
export const BusServiceCard: React.FC<BusServiceCardProps> = ({
  service,
  isNext = false,
  onPress,
  isDark = true,
}) => {
  const isIda = service.direction === 'ida';
  const routeLabel = isIda ? 'Despeñaderos → Córdoba' : 'Córdoba → Despeñaderos';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        backgroundColor: isDark ? '#171A21' : '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: isNext ? service.companyColor : isDark ? '#232733' : '#E5E7EB',
        borderLeftWidth: 4,
        borderLeftColor: service.companyColor,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Bloque horario */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '900',
              color: isDark ? '#F3F4F6' : '#111827',
              fontVariant: ['tabular-nums'],
            }}
          >
            {service.departureTime}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ArrowRight size={13} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: isDark ? '#9CA3AF' : '#6B7280',
                fontVariant: ['tabular-nums'],
              }}
            >
              {service.arrivalTime}
            </Text>
          </View>

          {isNext && (
            <View
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderColor: '#F59E0B',
                borderWidth: 1,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
                marginLeft: 4,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#F59E0B' }}>
                PRÓXIMO
              </Text>
            </View>
          )}
        </View>

        {/* Badge de Empresa */}
        <View
          style={{
            backgroundColor: `${service.companyColor}20`,
            borderColor: service.companyColor,
            borderWidth: 1,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', color: service.companyColor }}>
            {service.companyName}
          </Text>
        </View>
      </View>

      {/* Fila secundaria: Ruta & Línea */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
        <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '500' }}>
          {routeLabel}
        </Text>
        {service.line && (
          <>
            <Text style={{ fontSize: 11, color: isDark ? '#4B5563' : '#CBD5E1' }}>•</Text>
            <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280' }}>
              {service.line}
            </Text>
          </>
        )}
      </View>

      {/* Notas opcionales */}
      {service.notes && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
          <Clock size={11} color={isDark ? '#6B7280' : '#9CA3AF'} />
          <Text style={{ fontSize: 10, color: isDark ? '#6B7280' : '#9CA3AF', fontStyle: 'italic' }}>
            {service.notes}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
