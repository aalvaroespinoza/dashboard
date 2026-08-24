import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface CurrentTimeIndicatorProps {
  hourHeight?: number; // default 64px por hora
  isDark?: boolean;
}

export const CurrentTimeIndicator: React.FC<CurrentTimeIndicatorProps> = React.memo(({
  hourHeight = 64,
  isDark = true,
}) => {
  const [now, setNow] = useState(() => new Date());

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.9);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Actualizar la hora cada 60 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const topPosition = ((hours * 60 + minutes) / 60) * hourHeight;
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: topPosition,
        left: 0,
        right: 0,
        zIndex: 50,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Punto Rojo Pulsante con Horario */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -6 }}>
        <Animated.View
          style={[
            {
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#FF3B30',
            },
            animatedDotStyle,
          ]}
        />
        <View
          style={{
            backgroundColor: '#FF3B30',
            paddingHorizontal: 5,
            paddingVertical: 1.5,
            borderRadius: 4,
            marginLeft: 2,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '900' }}>
            {timeString}
          </Text>
        </View>
      </View>

      {/* Línea Roja Sólida */}
      <View
        style={{
          flex: 1,
          height: 2,
          backgroundColor: '#FF3B30',
          marginLeft: 4,
        }}
      />
    </View>
  );
});
