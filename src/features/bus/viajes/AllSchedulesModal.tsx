/**
 * AllSchedulesModal.tsx
 * Grilla Completa de Horarios en 2 Columnas Paralelas (Ida y Vuelta)
 * Estilo iPadOS 18 (Apple HIG) con tipografía JetBrains Mono, badges dinámicos
 * de empresa, cálculo de duración, detector de próximo colectivo e interacción para fijar viaje.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  X,
  Search,
  Bus,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Check,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { rawScheduleEntries } from '../data/schedules';
import { companies, COMPANIES_LIST } from '../data/companies';
import { IOS_COLORS, IOS_FONTS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import type { DayOfWeek, RawScheduleEntry } from '../types';

interface AllSchedulesModalProps {
  visible: boolean;
  onClose: () => void;
  diaSeleccionado: DayOfWeek;
  onSelectDay?: (day: DayOfWeek) => void;
  onSelectSchedule?: (entry: RawScheduleEntry, sentido: 'ida' | 'vuelta') => void;
  activeIdaEntry?: RawScheduleEntry | null;
  activeVueltaEntry?: RawScheduleEntry | null;
  horaActualHHMM?: string;
  isToday?: boolean;
  isDark?: boolean;
}

const DIAS: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'lunes', label: 'Lunes', short: 'Lun' },
  { id: 'martes', label: 'Martes', short: 'Mar' },
  { id: 'miercoles', label: 'Miércoles', short: 'Mié' },
  { id: 'jueves', label: 'Jueves', short: 'Jue' },
  { id: 'viernes', label: 'Viernes', short: 'Vie' },
  { id: 'sabado', label: 'Sábado', short: 'Sáb' },
  { id: 'domingo', label: 'Domingo', short: 'Dom' },
];

/**
 * Calcula la duración estimada en horas y minutos entre salida y llegada
 */
function calculateDuration(salida: string, llegada: string): string {
  try {
    const [h1, m1] = salida.split(':').map(Number);
    const [h2, m2] = llegada.split(':').map(Number);
    let diffMin = h2 * 60 + m2 - (h1 * 60 + m1);
    if (diffMin < 0) diffMin += 1440; // cruza medianoche
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins} min`;
  } catch {
    return '65 min';
  }
}

/**
 * Retorna el color oficial de la empresa
 */
function getCompanyColor(empresaName: string): string {
  const norm = empresaName.toLowerCase();
  if (norm.includes('canelo')) return companies.canelo?.color || '#0071e3';
  if (norm.includes('inter') || norm.includes('córdoba')) return companies.intercordoba?.color || '#34c759';
  if (norm.includes('lumasa')) return companies.lumasa?.color || '#ff9500';
  if (norm.includes('sierras')) return '#5856D6';
  if (norm.includes('lep')) return '#FF2D55';
  if (norm.includes('fono')) return '#32ADE6';
  return '#007AFF';
}

export const AllSchedulesModal: React.FC<AllSchedulesModalProps> = ({
  visible,
  onClose,
  diaSeleccionado,
  onSelectDay,
  onSelectSchedule,
  activeIdaEntry,
  activeVueltaEntry,
  horaActualHHMM = '08:00',
  isToday = false,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [currentDay, setCurrentDay] = useState<DayOfWeek>(diaSeleccionado);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | 'all'>('all');

  // Sincronizar día externo si cambia
  React.useEffect(() => {
    setCurrentDay(diaSeleccionado);
  }, [diaSeleccionado]);

  // Filtrar todos los horarios del día
  const allDaySchedules = useMemo(() => {
    return rawScheduleEntries.filter((entry) => {
      // 1. Filtrar por día
      if (entry.dia !== currentDay) return false;

      // 2. Filtrar por empresa
      if (selectedCompany !== 'all') {
        const normEntry = entry.empresa.toLowerCase();
        const normSelected = selectedCompany.toLowerCase();
        if (!normEntry.includes(normSelected)) return false;
      }

      // 3. Filtrar por texto de búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesEmpresa = entry.empresa.toLowerCase().includes(q);
        const matchesSalida = entry.horaSalida.includes(q);
        const matchesLlegada = entry.horaLlegada.includes(q);
        if (!matchesEmpresa && !matchesSalida && !matchesLlegada) {
          return false;
        }
      }

      return true;
    });
  }, [currentDay, selectedCompany, searchQuery]);

  // Separar en dos columnas ordenadas cronológicamente
  const idaList = useMemo(() => {
    return allDaySchedules
      .filter((e) => e.sentido === 'ida')
      .sort((a, b) => a.horaSalida.localeCompare(b.horaSalida));
  }, [allDaySchedules]);

  const vueltaList = useMemo(() => {
    return allDaySchedules
      .filter((e) => e.sentido === 'vuelta')
      .sort((a, b) => a.horaSalida.localeCompare(b.horaSalida));
  }, [allDaySchedules]);

  // Encontrar el próximo colectivo más cercano a la hora actual (si es hoy)
  const nextIda = useMemo(() => {
    if (!isToday) return null;
    return idaList.find((e) => e.horaSalida >= horaActualHHMM) || null;
  }, [idaList, horaActualHHMM, isToday]);

  const nextVuelta = useMemo(() => {
    if (!isToday) return null;
    return vueltaList.find((e) => e.horaSalida >= horaActualHHMM) || null;
  }, [vueltaList, horaActualHHMM, isToday]);

  const handleDayChange = (day: DayOfWeek) => {
    setCurrentDay(day);
    if (onSelectDay) onSelectDay(day);
  };

  const renderScheduleCard = (
    entry: RawScheduleEntry,
    sentido: 'ida' | 'vuelta',
    isNext: boolean,
    isSelected: boolean
  ) => {
    const compColor = getCompanyColor(entry.empresa);
    const duration = calculateDuration(entry.horaSalida, entry.horaLlegada);

    return (
      <View
        key={`${entry.dia}-${entry.sentido}-${entry.empresa}-${entry.horaSalida}`}
        style={{
          backgroundColor: isSelected
            ? isDark
              ? 'rgba(0, 122, 255, 0.18)'
              : '#EFF6FF'
            : isDark
            ? '#1C1C1E'
            : '#FFFFFF',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.5,
          borderColor: isSelected
            ? '#007AFF'
            : isNext
            ? '#FF9500'
            : isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : '#E5E5EA',
          borderLeftWidth: 4,
          borderLeftColor: isSelected ? '#007AFF' : compColor,
          gap: 10,
          ...createShadow(
            isSelected ? '#007AFF' : '#000000',
            { width: 0, height: 2 },
            isDark ? (isSelected ? 0.25 : 0.12) : 0.03,
            6
          ),
        }}
      >
        {/* Fila Superior: Horarios + Duración */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text
              style={{
                fontSize: 19,
                fontFamily: IOS_FONTS.mono,
                color: theme.text.primary,
                letterSpacing: -0.5,
              }}
            >
              {entry.horaSalida}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Text style={{ fontSize: 11, color: theme.text.tertiary }}>→</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: IOS_FONTS.mono,
                  color: theme.text.secondary,
                }}
              >
                {entry.horaLlegada}
              </Text>
            </View>
          </View>

          {/* Badges: Próximo o Duración */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {isNext && (
              <View
                style={{
                  backgroundColor: 'rgba(255, 149, 0, 0.18)',
                  borderColor: '#FF9500',
                  borderWidth: 1,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Zap size={10} color="#FF9500" fill="#FF9500" />
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#FF9500' }}>
                  PRÓXIMO
                </Text>
              </View>
            )}

            <View
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F2F2F7',
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary }}>
                ⏱️ {duration}
              </Text>
            </View>
          </View>
        </View>

        {/* Fila Inferior: Empresa Badge + Botón Fijar Viaje */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: `${compColor}18`,
              borderColor: `${compColor}40`,
              borderWidth: 1,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
              gap: 5,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: compColor }} />
            <Text
              style={{
                fontSize: 11,
                fontFamily: IOS_FONTS.semibold,
                color: compColor,
                textTransform: 'uppercase',
              }}
            >
              {entry.empresa}
            </Text>
          </View>

          {/* Botón Táctil: Fijar como viaje de hoy */}
          {onSelectSchedule && (
            <Pressable
              onPress={() => onSelectSchedule(entry, sentido)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: isSelected
                  ? '#007AFF'
                  : isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : '#F2F2F7',
                borderWidth: 1,
                borderColor: isSelected ? '#007AFF' : theme.border,
                gap: 4,
              })}
            >
              {isSelected ? (
                <>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFFFFF' }}>
                    Fijado
                  </Text>
                </>
              ) : (
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.primary }}>
                  Fijar viaje
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.68)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: '95%',
            maxWidth: 980,
            height: '90%',
            backgroundColor: theme.card,
            borderRadius: 24,
            padding: 22,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 16,
            ...createShadow('#000000', { width: 0, height: 8 }, isDark ? 0.35 : 0.08, 20),
          }}
        >
          {/* 1. Header Principal con Título y Botón Cerrar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  backgroundColor: 'rgba(0, 122, 255, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bus size={22} color="#007AFF" />
              </View>
              <View>
                <Text style={{ fontSize: 20, fontFamily: IOS_FONTS.bold, color: theme.text.primary, letterSpacing: -0.5 }}>
                  Grilla Completa de Horarios
                </Text>
                <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                  {allDaySchedules.length} servicios disponibles · {idaList.length} de Ida · {vueltaList.length} de Vuelta
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.border,
              })}
            >
              <X size={18} color={theme.text.primary} />
            </Pressable>
          </View>

          {/* 2. Barra Unificada de Herramientas: Días, Buscador y Empresas */}
          <View style={{ gap: 10 }}>
            {/* Fila A: Selector de Días + Buscador */}
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              {/* Segmented Control de Días */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ gap: 6 }}
              >
                {DIAS.map((d) => {
                  const isSelected = currentDay === d.id;
                  return (
                    <Pressable
                      key={d.id}
                      onPress={() => handleDayChange(d.id)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.8 : 1,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 10,
                        backgroundColor: isSelected ? '#007AFF' : theme.cardSecondary,
                        borderWidth: 1,
                        borderColor: isSelected ? '#007AFF' : theme.border,
                      })}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: isSelected ? IOS_FONTS.bold : IOS_FONTS.semibold,
                          color: isSelected ? '#FFFFFF' : theme.text.secondary,
                        }}
                      >
                        {d.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Buscador */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.cardSecondary,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                  width: 220,
                  gap: 8,
                }}
              >
                <Search size={14} color={theme.text.tertiary} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar hora o empresa..."
                  placeholderTextColor={theme.text.tertiary}
                  style={{ flex: 1, fontSize: 12, color: theme.text.primary, padding: 0 }}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <X size={12} color={theme.text.tertiary} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Fila B: Chips de Filtro por Empresa */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6, alignItems: 'center' }}
            >
              <Pressable
                onPress={() => setSelectedCompany('all')}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                  backgroundColor: selectedCompany === 'all' ? (isDark ? '#3A3A3C' : '#E5E5EA') : 'transparent',
                  borderWidth: 1,
                  borderColor: selectedCompany === 'all' ? theme.border : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: IOS_FONTS.bold,
                    color: selectedCompany === 'all' ? theme.text.primary : theme.text.secondary,
                  }}
                >
                  Todas las Empresas
                </Text>
              </Pressable>

              {COMPANIES_LIST.map((c) => {
                const isSelected = selectedCompany === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedCompany(isSelected ? 'all' : c.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                      backgroundColor: isSelected ? `${c.color}25` : 'transparent',
                      borderWidth: 1,
                      borderColor: isSelected ? c.color : theme.border,
                      gap: 5,
                    }}
                  >
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.color }} />
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: IOS_FONTS.semibold,
                        color: isSelected ? c.color : theme.text.secondary,
                      }}
                    >
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* 3. Grid de 2 Columnas Paralelas: IDA y VUELTA */}
          <View style={{ flex: 1, flexDirection: 'row', gap: 16 }}>
            {/* COLUMNA 1: IDA (Despeñaderos → Córdoba) */}
            <View
              style={{
                flex: 1,
                backgroundColor: theme.cardSecondary,
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 12,
              }}
            >
              {/* Cabecera de Columna Ida */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 9,
                      backgroundColor: 'rgba(0, 122, 255, 0.18)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowUpRight size={16} color="#007AFF" />
                  </View>
                  <Text style={{ fontSize: 14, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                    Ida hacia Córdoba
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: 'rgba(0, 122, 255, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: '#007AFF' }}>
                    {idaList.length}
                  </Text>
                </View>
              </View>

              {/* Lista Scrollable de Colectivos de Ida */}
              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
                {idaList.length === 0 ? (
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 }}>
                    <Bus size={28} color={theme.text.tertiary} />
                    <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                      Sin colectivos de ida con estos filtros
                    </Text>
                  </View>
                ) : (
                  idaList.map((entry) => {
                    const isNext = nextIda?.horaSalida === entry.horaSalida && nextIda?.empresa === entry.empresa;
                    const isSelected =
                      activeIdaEntry?.horaSalida === entry.horaSalida &&
                      activeIdaEntry?.empresa === entry.empresa;
                    return renderScheduleCard(entry, 'ida', isNext, isSelected);
                  })
                )}
              </ScrollView>
            </View>

            {/* COLUMNA 2: VUELTA (Córdoba → Despeñaderos) */}
            <View
              style={{
                flex: 1,
                backgroundColor: theme.cardSecondary,
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 12,
              }}
            >
              {/* Cabecera de Columna Vuelta */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 9,
                      backgroundColor: 'rgba(175, 82, 222, 0.18)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowDownLeft size={16} color="#AF52DE" />
                  </View>
                  <Text style={{ fontSize: 14, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                    Vuelta a Despeñaderos
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: 'rgba(175, 82, 222, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: '#AF52DE' }}>
                    {vueltaList.length}
                  </Text>
                </View>
              </View>

              {/* Lista Scrollable de Colectivos de Vuelta */}
              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
                {vueltaList.length === 0 ? (
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 }}>
                    <Bus size={28} color={theme.text.tertiary} />
                    <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                      Sin colectivos de vuelta con estos filtros
                    </Text>
                  </View>
                ) : (
                  vueltaList.map((entry) => {
                    const isNext =
                      nextVuelta?.horaSalida === entry.horaSalida &&
                      nextVuelta?.empresa === entry.empresa;
                    const isSelected =
                      activeVueltaEntry?.horaSalida === entry.horaSalida &&
                      activeVueltaEntry?.empresa === entry.empresa;
                    return renderScheduleCard(entry, 'vuelta', isNext, isSelected);
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
