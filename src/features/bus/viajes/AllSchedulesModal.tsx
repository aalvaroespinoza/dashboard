import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TextInput, ScrollView, Pressable } from 'react-native';
import { X, Search, Bus, Filter, Clock, MapPin } from 'lucide-react-native';
import { rawScheduleEntries } from '../data/schedules';
import { COMPANIES_LIST } from '../data/companies';
import { IOS_COLORS } from '../../../styles/theme';
import { DayOfWeek } from '../types';

interface AllSchedulesModalProps {
  visible: boolean;
  onClose: () => void;
  diaSeleccionado: DayOfWeek;
  isDark?: boolean;
}

export const AllSchedulesModal: React.FC<AllSchedulesModalProps> = ({
  visible,
  onClose,
  diaSeleccionado,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | 'all'>('all');
  const [selectedSentido, setSelectedSentido] = useState<'all' | 'ida' | 'vuelta'>('all');

  const filteredSchedules = useMemo(() => {
    return rawScheduleEntries.filter((entry) => {
      // Filtrar por día
      if (entry.dia !== diaSeleccionado) return false;

      // Filtrar por sentido
      if (selectedSentido !== 'all' && entry.sentido !== selectedSentido) return false;

      // Filtrar por empresa
      if (selectedCompany !== 'all' && entry.empresa.toLowerCase() !== selectedCompany.toLowerCase()) {
        return false;
      }

      // Filtrar por búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesEmpresa = entry.empresa.toLowerCase().includes(q);
        const matchesSalida = entry.horaSalida.includes(q);
        const matchesLlegada = entry.horaLlegada.includes(q);
        if (!matchesEmpresa && !matchesSalida && !matchesLlegada) {
          return false;
        }
      }

      return true;
    });
  }, [diaSeleccionado, selectedSentido, selectedCompany, searchQuery]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            width: '90%',
            maxWidth: 750,
            maxHeight: '88%',
            backgroundColor: theme.card,
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text.primary }}>
                Grilla Completa de Horarios
              </Text>
              <Text style={{ fontSize: 12, color: theme.text.secondary, textTransform: 'capitalize' }}>
                Día {diaSeleccionado} · {filteredSchedules.length} servicios disponibles
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color={theme.text.primary} />
            </Pressable>
          </View>

          {/* Buscador */}
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
            <Search size={16} color={theme.text.tertiary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por hora o empresa..."
              placeholderTextColor={theme.text.tertiary}
              style={{ flex: 1, fontSize: 13, color: theme.text.primary, padding: 0 }}
            />
          </View>

          {/* Filtros por Sentido y Empresa */}
          <View style={{ gap: 8 }}>
            {/* Sentido Pills */}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'ida', label: 'Ida (a Cba)' },
                { id: 'vuelta', label: 'Vuelta (a Despeñaderos)' },
              ].map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => setSelectedSentido(s.id as any)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: selectedSentido === s.id ? IOS_COLORS.blue : theme.cardSecondary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: selectedSentido === s.id ? '#FFFFFF' : theme.text.secondary,
                    }}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Empresa Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 32 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Pressable
                  onPress={() => setSelectedCompany('all')}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: selectedCompany === 'all' ? (isDark ? '#3A3A3C' : '#E5E5EA') : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.primary }}>
                    Todas las empresas
                  </Text>
                </Pressable>

                {COMPANIES_LIST.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedCompany(c.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor: selectedCompany === c.id ? `${c.color}25` : 'transparent',
                      gap: 4,
                    }}
                  >
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.color }} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: selectedCompany === c.id ? c.color : theme.text.secondary }}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Grilla Scrollable de Horarios */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {filteredSchedules.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Bus size={32} color={theme.text.tertiary} />
                <Text style={{ color: theme.text.secondary, fontSize: 13, marginTop: 8 }}>
                  No se encontraron colectivos con estos filtros
                </Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {filteredSchedules.map((entry, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: theme.cardSecondary,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View>
                        <Text style={{ fontSize: 15, fontWeight: '900', color: theme.text.primary }}>
                          {entry.horaSalida} hs
                        </Text>
                        <Text style={{ fontSize: 10, color: theme.text.tertiary }}>
                          Llega: {entry.horaLlegada} hs
                        </Text>
                      </View>

                      <View
                        style={{
                          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: theme.border,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                          {entry.empresa}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: entry.sentido === 'ida' ? '#32ADE6' : IOS_COLORS.purple }}>
                        {entry.sentido === 'ida' ? 'Hacia Córdoba' : 'Hacia Despeñaderos'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
