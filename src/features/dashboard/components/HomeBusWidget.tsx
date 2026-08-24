import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Bus, ChevronRight, MapPin, ArrowRight, Clock } from 'lucide-react-native';
import { ContadorVivo } from '../../bus/components/ContadorVivo';
import { useBusStore } from '../../bus/stores/useBusStore';
import { useAppStore } from '../../../store/useAppStore';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HomeBusWidgetProps {
  isDark?: boolean;
}

export const HomeBusWidget: React.FC<HomeBusWidgetProps> = React.memo(({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { setActiveModule } = useAppStore();

  const { nextBuses, refreshCalculations, loadSavedPreferences } = useBusStore();

  useEffect(() => {
    loadSavedPreferences().then(() => {
      refreshCalculations();
    });
  }, []);

  const nextBus = nextBuses && nextBuses.length > 0 ? nextBuses[0] : null;

  const defaultDeparture = '20:45';
  const horaSalida = nextBus?.service?.departureTime || defaultDeparture;
  const empresaNombre = nextBus?.service?.companyName || 'Buses LEP';
  const origen = nextBus?.service?.direction === 'vuelta' ? 'Córdoba Capital' : 'Despeñaderos';
  const destino = nextBus?.service?.direction === 'vuelta' ? 'Despeñaderos' : 'Córdoba Capital';

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
        gap: 14,
        ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.2 : 0.04, 8),
      }}
    >
      {/* Header del Widget */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: 'rgba(255, 149, 0, 0.16)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bus size={18} color="#FF9500" strokeWidth={2.5} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.4 }}>
            Próximo Colectivo
          </Text>
        </View>

        <Pressable
          onPress={() => setActiveModule('bus')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#FF9500' }}>
            Recorridos
          </Text>
          <ChevronRight size={15} color="#FF9500" />
        </Pressable>
      </View>

      {/* Recorrido Origen -> Destino */}
      <View
        style={{
          backgroundColor: isDark ? '#242426' : '#F9FAFB',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color={IOS_COLORS.blue} />
            <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text.primary }}>
              {origen}
            </Text>
          </View>

          <ArrowRight size={14} color={theme.text.tertiary} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color="#34C759" />
            <Text style={{ fontSize: 14, fontWeight: '800', color: theme.text.primary }}>
              {destino}
            </Text>
          </View>
        </View>

        {/* Empresa + Horario Salida */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA', paddingTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#FF9500',
              }}
            />
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
              {empresaNombre}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Clock size={12} color={theme.text.secondary} />
            <Text style={{ fontSize: 13, fontWeight: '900', color: theme.text.primary }}>
              {horaSalida} hs
            </Text>
          </View>
        </View>
      </View>

      {/* Contador Vivo Aislado */}
      <View style={{ alignItems: 'center' }}>
        <ContadorVivo
          horaSalida={horaSalida}
          companyColor="#FF9500"
          size="large"
          isDark={isDark}
        />
      </View>
    </View>
  );
});
