import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Clock, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react-native';

interface ContadorVivoProps {
  horaSalida: string;
  companyColor?: string;
  size?: 'small' | 'large';
  isDark?: boolean;
}

export const ContadorVivo: React.FC<ContadorVivoProps> = ({
  horaSalida,
  companyColor = '#6366F1',
  size = 'large',
  isDark = true,
}) => {
  const [minutosRestantes, setMinutosRestantes] = useState<number | null>(null);
  const [segundosRestantes, setSegundosRestantes] = useState<number>(0);

  // Animación de pulso con Reanimated
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.7);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.4, { duration: 900 })
      ),
      -1,
      true
    );
  }, []);

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  useEffect(() => {
    const calcular = () => {
      if (!horaSalida) return;
      const [h, m] = horaSalida.split(':').map(Number);
      const ahora = new Date();
      const salida = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        h || 0,
        m || 0,
        0,
        0
      );

      const diffMs = salida.getTime() - ahora.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const mins = Math.floor(diffSecs / 60);
      const secs = Math.max(0, diffSecs % 60);

      setMinutosRestantes(mins);
      setSegundosRestantes(secs);
    };

    calcular();
    const timer = setInterval(calcular, 1000); // Ticker en vivo cada 1 segundo
    return () => clearInterval(timer);
  }, [horaSalida]);

  if (minutosRestantes === null) {
    return (
      <View style={{ paddingVertical: 4 }}>
        <Text style={{ fontSize: 12, color: isDark ? '#6B7280' : '#9CA3AF' }}>Calculando...</Text>
      </View>
    );
  }

  // 1. Ya pasó
  if (minutosRestantes < -1) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#1F2430' : '#F1F3F5',
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderWidth: 1,
          borderColor: isDark ? '#2E3544' : '#E5E7EB',
          gap: 6,
        }}
      >
        <Clock size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
        <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#9CA3AF' : '#6B7280' }}>
          El colectivo ya salió
        </Text>
      </View>
    );
  }

  // 2. Saliendo ahora (0 a 1 min)
  if (minutosRestantes <= 1 && minutosRestantes >= -1) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(16, 185, 129, 0.18)',
          borderColor: '#10B981',
          borderWidth: 1,
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: size === 'large' ? 6 : 3,
          gap: 6,
        }}
      >
        <Animated.View
          style={[
            {
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#10B981',
            },
            animatedDotStyle,
          ]}
        />
        <Zap size={14} color="#10B981" />
        <Text style={{ fontSize: size === 'large' ? 13 : 11, fontWeight: '800', color: '#10B981' }}>
          ¡Saliendo ahora!
        </Text>
      </View>
    );
  }

  // 3. En riesgo / Urgente (<= 15 min) -> Rojo
  if (minutosRestantes <= 15) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(239, 68, 68, 0.18)',
          borderColor: '#EF4444',
          borderWidth: 1,
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: size === 'large' ? 6 : 3,
          gap: 6,
        }}
      >
        <Animated.View
          style={[
            {
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#EF4444',
            },
            animatedDotStyle,
          ]}
        />
        <AlertTriangle size={14} color="#EF4444" />
        <Text style={{ fontSize: size === 'large' ? 14 : 11, fontWeight: '800', color: '#EF4444' }}>
          Faltan {minutosRestantes}m {segundosRestantes.toString().padStart(2, '0')}s
        </Text>
      </View>
    );
  }

  // 4. Salir pronto (16 a 30 min) -> Amarillo
  if (minutosRestantes <= 30) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          borderColor: '#F59E0B',
          borderWidth: 1,
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: size === 'large' ? 6 : 3,
          gap: 6,
        }}
      >
        <Animated.View
          style={[
            {
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#F59E0B',
            },
            animatedDotStyle,
          ]}
        />
        <Clock size={14} color="#F59E0B" />
        <Text style={{ fontSize: size === 'large' ? 13 : 11, fontWeight: '700', color: '#F59E0B' }}>
          Sale en {minutosRestantes} min
        </Text>
      </View>
    );
  }

  // 5. Tiempo suficiente (> 30 min) -> Verde / Neutro
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
        borderColor: '#10B981',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: size === 'large' ? 6 : 3,
        gap: 6,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#10B981',
        }}
      />
      <CheckCircle2 size={13} color="#10B981" />
      <Text style={{ fontSize: size === 'large' ? 13 : 11, fontWeight: '700', color: '#10B981' }}>
        Sale en {minutosRestantes >= 60 ? `${Math.floor(minutosRestantes / 60)}h ${minutosRestantes % 60}m` : `${minutosRestantes} min`} ({horaSalida} hs)
      </Text>
    </View>
  );
};
