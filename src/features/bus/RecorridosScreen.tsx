import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  Search,
  Bus,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useBusEngine } from './hooks/useBusEngine';
import { useBusStore } from './stores/useBusStore';
import { scenarios } from './data/scenarios';
import { companies } from './data/companies';
import { BusScreen } from './components/BusScreen';
import { IOS_COLORS } from '../../styles/theme';
import { useAppStore } from '../../store/useAppStore';

interface RouteItem {
  id: string;
  title: string;
  subtitle: string;
  lines: string;
  timeEstimate: string;
  color: string;
  iconBg: string;
  scenarioId: string;
  direction: 'ida' | 'vuelta';
}

export const RecorridosScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    activeScenario,
    setScenario,
    filterType,
    setFilterType,
    favorites,
    toggleFavorite,
  } = useBusStore();

  const { nextBus, timeRemainingFormatted, status } = useBusEngine();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteDetail, setSelectedRouteDetail] = useState<string | null>(null);

  // Lista de rutas favoritas
  const favoriteRoutes: RouteItem[] = [
    {
      id: 'fav-1',
      title: 'Despeñaderos → Córdoba (Facultad)',
      subtitle: 'Canelo · Intercórdoba · Lumasa',
      lines: 'Líneas: Canelo - Intercórdoba',
      timeEstimate: timeRemainingFormatted ? `${timeRemainingFormatted}` : '06:30 hs',
      color: '#0071E3',
      iconBg: isDark ? 'rgba(0, 113, 227, 0.2)' : '#EFF6FF',
      scenarioId: 'hacia-cordoba',
      direction: 'ida',
    },
    {
      id: 'fav-2',
      title: 'Córdoba (Ministerio) → Despeñaderos',
      subtitle: 'Intercórdoba · Canelo · Lumasa',
      lines: 'Líneas: Intercórdoba - Canelo',
      timeEstimate: '16:10 hs',
      color: '#34C759',
      iconBg: isDark ? 'rgba(52, 199, 89, 0.2)' : '#ECFDF5',
      scenarioId: 'hacia-despenaderos',
      direction: 'vuelta',
    },
  ];

  // Lista de todos los recorridos
  const allRoutes: RouteItem[] = [
    {
      id: 'route-desp-cba',
      title: 'Despeñaderos → Córdoba (Directo)',
      subtitle: 'Terminal Despeñaderos → Terminal Córdoba',
      lines: 'Líneas: Canelo, Intercórdoba, Lumasa',
      timeEstimate: '65 min',
      color: '#0071E3',
      iconBg: isDark ? 'rgba(0, 113, 227, 0.2)' : '#EFF6FF',
      scenarioId: 'hacia-cordoba',
      direction: 'ida',
    },
    {
      id: 'route-cba-desp',
      title: 'Córdoba → Despeñaderos (Directo)',
      subtitle: 'Terminal Córdoba / Ministerio → Despeñaderos',
      lines: 'Líneas: Intercórdoba, Canelo, Lumasa',
      timeEstimate: '65 min',
      color: '#34C759',
      iconBg: isDark ? 'rgba(52, 199, 89, 0.2)' : '#ECFDF5',
      scenarioId: 'hacia-despenaderos',
      direction: 'vuelta',
    },
  ];

  // Filtrar según el término de búsqueda
  const filteredAllRoutes = useMemo(() => {
    if (!searchQuery.trim()) return allRoutes;
    const q = searchQuery.toLowerCase();
    return allRoutes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.lines.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Si hay un recorrido seleccionado en detalle, mostramos la vista completa con contador vivo y grilla
  if (selectedRouteDetail) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: theme.card,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            gap: 10,
          }}
        >
          <Pressable
            onPress={() => setSelectedRouteDetail(null)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: theme.cardSecondary,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: IOS_COLORS.blue }}>
              ‹ Volver a Recorridos
            </Text>
          </Pressable>
        </View>
        <BusScreen />
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 24, gap: 20 }}
    >
      {/* 1. Header y Buscador estilo iOS */}
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.8 }}>
            Recorridos
          </Text>

          <Pressable
            onPress={() => setSelectedRouteDetail('live-board')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.card,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 6,
            }}
          >
            <Sparkles size={14} color={IOS_COLORS.blue} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: IOS_COLORS.blue }}>
              Ver Horarios en Vivo
            </Text>
          </Pressable>
        </View>

        {/* Input Buscador */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: PlatformSelect(10, 8),
            gap: 10,
          }}
        >
          <Search size={18} color={theme.text.tertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar recorrido o línea"
            placeholderTextColor={theme.text.tertiary}
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: '500',
              color: theme.text.primary,
              padding: 0,
            }}
          />
        </View>
      </View>

      {/* 2. Sección: Favoritos */}
      {!searchQuery && (
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text.primary }}>
            Favoritos
          </Text>

          <View style={{ gap: 10 }}>
            {favoriteRoutes.map((route) => (
              <Pressable
                key={route.id}
                onPress={() => {
                  setScenario(route.scenarioId);
                  setFilterType(route.direction);
                  setSelectedRouteDetail(route.id);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.card,
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 3,
                  gap: 14,
                })}
              >
                {/* Icono de colectivo circular */}
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: route.iconBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bus size={22} color={route.color} />
                </View>

                {/* Info del trayecto */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text.primary }}>
                    {route.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.text.secondary, marginTop: 2 }}>
                    {route.lines}
                  </Text>
                </View>

                {/* Tiempo estimado + Chevron */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text.primary }}>
                    {route.timeEstimate}
                  </Text>
                  <ChevronRight size={18} color={theme.text.tertiary} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* 3. Sección: Todos los recorridos */}
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text.primary }}>
          {searchQuery ? `Resultados (${filteredAllRoutes.length})` : 'Todos los recorridos'}
        </Text>

        <View style={{ gap: 10 }}>
          {filteredAllRoutes.map((route) => (
            <Pressable
              key={route.id}
              onPress={() => {
                setScenario(route.scenarioId);
                setFilterType(route.direction);
                setSelectedRouteDetail(route.id);
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.card,
                borderRadius: 18,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 3,
                gap: 14,
              })}
            >
              {/* Icono de colectivo */}
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: route.iconBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bus size={22} color={route.color} />
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text.primary }}>
                  {route.title}
                </Text>
                <Text style={{ fontSize: 12, color: theme.text.secondary, marginTop: 2 }}>
                  {route.lines}
                </Text>
              </View>

              {/* Tiempo / Salida + Chevron */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.secondary }}>
                  {route.timeEstimate}
                </Text>
                <ChevronRight size={18} color={theme.text.tertiary} />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

function PlatformSelect<T>(nativeVal: T, webVal: T): T {
  return typeof window !== 'undefined' ? webVal : nativeVal;
}
