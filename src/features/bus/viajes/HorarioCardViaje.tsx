import React, { useState, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Bus,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Moon,
  Sparkles,
  RotateCcw,
} from 'lucide-react-native';
import { RawScheduleEntry, Direction } from '../types';
import { addMinutes, timeToMins, OFFSET_PARADA_VUELTA_MIN } from '../engine/recommendation-engine';
import { IOS_COLORS } from '../../../styles/theme';

interface HorarioCardViajeProps {
  titulo: string;
  recomendacion: {
    recomendado: RawScheduleEntry | null;
    alternativas: RawScheduleEntry[];
  };
  direction: 'ida' | 'vuelta';
  becUsado: boolean;
  onToggleBec: () => void;
  onSelectAlternative: (alt: RawScheduleEntry) => void;
  onResetAutomatic: () => void;
  isManualOverride: boolean;
  horaActualHHMM: string;
  isDark?: boolean;
}

export const HorarioCardViaje: React.FC<HorarioCardViajeProps> = ({
  titulo,
  recomendacion,
  direction,
  becUsado,
  onToggleBec,
  onSelectAlternative,
  onResetAutomatic,
  isManualOverride,
  horaActualHHMM,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const [verAlternativas, setVerAlternativas] = useState(false);

  const currentRecomendado = recomendacion.recomendado;
  const alternativas = recomendacion.alternativas;

  const esVuelta = direction === 'vuelta';

  // Hora de salida o paso por parada
  const horaReal = esVuelta && currentRecomendado
    ? addMinutes(currentRecomendado.horaSalida, OFFSET_PARADA_VUELTA_MIN)
    : currentRecomendado?.horaSalida || '06:30';

  // Cálculo de estado y minutos restantes
  const statusInfo = useMemo(() => {
    if (!horaReal) return { label: 'Sin datos', color: theme.text.tertiary, bg: theme.cardSecondary };

    const currMins = timeToMins(horaActualHHMM);
    const busMins = timeToMins(horaReal);
    const diff = busMins - currMins;

    if (diff < -5) {
      return { label: 'Ya salió', color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.15)' };
    }
    if (diff <= 5 && diff >= -5) {
      return { label: 'Salir ahora', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)' };
    }
    if (diff > 5 && diff <= 30) {
      return { label: `En ${diff} min`, color: '#34C759', bg: 'rgba(52, 199, 89, 0.15)' };
    }

    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return {
      label: h > 0 ? `En ${h}h ${m}m` : `En ${m} min`,
      color: IOS_COLORS.blue,
      bg: 'rgba(0, 122, 255, 0.15)',
    };
  }, [horaReal, horaActualHHMM]);

  // Llegada estimada
  const horaLlegadaEstimada = useMemo(() => {
    if (currentRecomendado?.horaLlegada) return currentRecomendado.horaLlegada;
    return addMinutes(horaReal, 65);
  }, [currentRecomendado, horaReal]);

  if (!currentRecomendado) {
    return (
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 22,
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.border,
          gap: 10,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.cardSecondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Moon size={22} color={theme.text.tertiary} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text.primary }}>
          No hay {titulo.toLowerCase()} programada
        </Text>
        <Text style={{ fontSize: 12, color: theme.text.secondary }}>
          Disfrutá tu día o descansá en casa.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        gap: 14,
        opacity: becUsado ? 0.8 : 1,
      }}
    >
      {/* 1. Cabecera: Sentido + Empresa + Botón BEC */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: esVuelta
                ? isDark
                  ? 'rgba(175, 82, 222, 0.15)'
                  : '#F5F3FF'
                : isDark
                ? 'rgba(50, 173, 230, 0.15)'
                : '#E0F2FE',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bus size={20} color={esVuelta ? IOS_COLORS.purple : '#32ADE6'} />
          </View>

          <View>
            <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text.primary }}>
              {titulo}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '900',
                color: theme.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {currentRecomendado.empresa}
            </Text>
          </View>
        </View>

        {/* Botón Marcar BEC */}
        <Pressable
          onPress={onToggleBec}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: becUsado
              ? isDark
                ? 'rgba(52, 199, 89, 0.2)'
                : '#ECFDF5'
              : theme.cardSecondary,
            borderWidth: 1,
            borderColor: becUsado ? IOS_COLORS.green : theme.border,
            gap: 6,
          })}
        >
          {becUsado ? (
            <CheckCircle2 size={13} color={IOS_COLORS.green} />
          ) : (
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                borderWidth: 1.5,
                borderColor: theme.text.tertiary,
              }}
            />
          )}
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: becUsado ? IOS_COLORS.green : theme.text.secondary,
            }}
          >
            {becUsado ? 'BEC Usado' : 'Marcar BEC'}
          </Text>
        </Pressable>
      </View>

      {/* 2. Horario Principal y Badge de Estado */}
      <View>
        <Text style={{ fontSize: 12, color: theme.text.secondary, fontWeight: '600', marginBottom: 2 }}>
          {esVuelta ? 'Paso por parada Ministerio:' : 'Salida de Despeñaderos:'}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text
              style={{
                fontSize: 38,
                fontWeight: '900',
                color: theme.text.primary,
                letterSpacing: -1,
                fontVariant: ['tabular-nums'],
              }}
            >
              {horaReal}
            </Text>
            {esVuelta && currentRecomendado.horaSalida && (
              <Text style={{ fontSize: 11, color: theme.text.tertiary, fontWeight: '600' }}>
                (Sale Terminal: {currentRecomendado.horaSalida} hs)
              </Text>
            )}
          </View>

          {/* Badge de Urgencia / Tiempo Restante */}
          <View
            style={{
              backgroundColor: statusInfo.bg,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: statusInfo.color,
              }}
            />
            <Text style={{ fontSize: 12, fontWeight: '800', color: statusInfo.color }}>
              {statusInfo.label}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Llegada Estimada a Destino */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.cardSecondary,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          gap: 8,
        }}
      >
        <Clock size={14} color={IOS_COLORS.cyan} />
        <Text style={{ fontSize: 12, color: theme.text.secondary, fontWeight: '600' }}>
          Llegada estimada a destino:{' '}
          <Text style={{ fontWeight: '800', color: theme.text.primary }}>
            {horaLlegadaEstimada} hs
          </Text>
        </Text>
      </View>

      {/* 4. Manual Override Notice (si el usuario eligió otro horario) */}
      {isManualOverride && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isDark ? 'rgba(255, 149, 0, 0.15)' : '#FEF3C7',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: IOS_COLORS.orange }}>
            Horario seleccionado manualmente
          </Text>
          <Pressable
            onPress={onResetAutomatic}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <RotateCcw size={12} color={IOS_COLORS.orange} />
            <Text style={{ fontSize: 11, fontWeight: '800', color: IOS_COLORS.orange }}>
              Restablecer
            </Text>
          </Pressable>
        </View>
      )}

      {/* 5. Desplegable de Alternativas */}
      {alternativas.length > 0 && (
        <View>
          <Pressable
            onPress={() => setVerAlternativas(!verAlternativas)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.75 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: theme.border,
            })}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: IOS_COLORS.blue }}>
              {verAlternativas
                ? 'Ocultar opciones'
                : `Ver siguientes ${alternativas.length} opciones de viaje`}
            </Text>
            {verAlternativas ? (
              <ChevronUp size={16} color={IOS_COLORS.blue} />
            ) : (
              <ChevronDown size={16} color={IOS_COLORS.blue} />
            )}
          </Pressable>

          {/* Lista Acordeón de Alternativas */}
          {verAlternativas && (
            <View style={{ gap: 6, marginTop: 10 }}>
              {alternativas.map((alt, idx) => {
                const salida = esVuelta
                  ? addMinutes(alt.horaSalida, OFFSET_PARADA_VUELTA_MIN)
                  : alt.horaSalida;

                return (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      onSelectAlternative(alt);
                      setVerAlternativas(false);
                    }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.75 : 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: theme.cardSecondary,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                    })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.primary }}>
                        {salida} hs
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.secondary, textTransform: 'uppercase' }}>
                        · {alt.empresa}
                      </Text>
                    </View>

                    <Text style={{ fontSize: 11, fontWeight: '700', color: IOS_COLORS.blue }}>
                      Seleccionar
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
};
