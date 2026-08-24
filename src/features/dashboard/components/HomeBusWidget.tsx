import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Bus, ChevronRight, MapPin, ArrowRight, Clock } from 'lucide-react-native';
import { ContadorVivo } from '../../bus/components/ContadorVivo';
import { useBusStore } from '../../bus/stores/useBusStore';
import { useAppStore } from '../../../store/useAppStore';
import { SpecularCard } from '../../../components/common/SpecularCard';
import { IOS_COLORS } from '../../../styles/theme';

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
    <SpecularCard isDark={isDark} padding={22}>
      {/* Header del Widget */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: 'rgba(255, 149, 0, 0.16)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bus size={19} color="#FF9500" strokeWidth={2.5} />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.5 }}>
              Próximo Colectivo
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text.secondary }}>
              Salida en tiempo real
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setActiveModule('bus')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            gap: 2,
          })}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#FF9500' }}>
            Recorridos
          </Text>
          <ChevronRight size={13} color="#FF9500" />
        </Pressable>
      </View>

      {/* Recorrido Origen -> Destino */}
      <View
        style={{
          backgroundColor: isDark ? '#242426' : '#F9FAFB',
          borderRadius: 18,
          padding: 14,
          borderWidth: 1,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.8)',
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#E5E5EA',
          borderLeftColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E5EA',
          borderRightColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E5EA',
          gap: 10,
          marginBottom: 14,
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
    </SpecularCard>
  );
});
