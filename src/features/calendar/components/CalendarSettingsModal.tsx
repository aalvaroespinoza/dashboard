import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, Switch, TextInput } from 'react-native';
import { X, Sliders, Calendar, Clock, Plus, Trash2, Check } from 'lucide-react-native';
import { useCalendarStore } from '../../../store/useCalendarStore';
import { IOSSegmentedControl, SegmentTab } from '../../../components/ui/IOSSegmentedControl';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface CalendarSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  isDark?: boolean;
}

type SettingsTab = 'grid' | 'timeblocking' | 'calendars';

const SETTINGS_TABS: SegmentTab<SettingsTab>[] = [
  { id: 'grid', label: 'Grilla & Vista' },
  { id: 'timeblocking', label: 'Time-Blocking' },
  { id: 'calendars', label: 'Mis Calendarios' },
];

const PRO_COLORS = [
  '#007AFF', // Azul Sistema
  '#5856D6', // Púrpura
  '#FF2D55', // Rosa
  '#FF9500', // Naranja
  '#34C759', // Verde Menta
  '#32ADE6', // Cian
  '#FFCC00', // Ámbar
  '#FF6482', // Coral
  '#5E5CE6', // Índigo
  '#30D158', // Esmeralda
  '#8E8E93', // Gris Sistema
  '#A2845E', // Marrón Cuero
];

export const CalendarSettingsModal: React.FC<CalendarSettingsModalProps> = ({
  visible,
  onClose,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    settings,
    categories,
    updateSettings,
    createCategory,
    deleteCategory,
  } = useCalendarStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('grid');

  // Formulario nuevo calendario
  const [newCalName, setNewCalName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRO_COLORS[0]);

  const handleCreateCategory = async () => {
    if (!newCalName.trim()) return;
    await createCategory(newCalName.trim(), selectedColor);
    setNewCalName('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.65)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: '90%',
            maxWidth: 520,
            backgroundColor: theme.card,
            borderRadius: 24,
            borderWidth: 1,
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.8)',
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E5EA',
            borderLeftColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
            borderRightColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
            padding: 24,
            gap: 16,
            ...createShadow('#000000', { width: 0, height: 8 }, 0.3, 16),
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: 'rgba(0, 122, 255, 0.16)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sliders size={16} color="#007AFF" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.4 }}>
                Personalización Pro
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={{
                padding: 6,
                borderRadius: 8,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
              }}
            >
              <X size={16} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Segmented Control de Pestañas */}
          <IOSSegmentedControl<SettingsTab>
            tabs={SETTINGS_TABS}
            selectedTab={activeTab}
            onTabChange={setActiveTab}
            isDark={isDark}
          />

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }} contentContainerStyle={{ gap: 14 }}>
            {/* PESTAÑA 1: GRILLA & VISTA */}
            {activeTab === 'grid' && (
              <View style={{ gap: 14 }}>
                {/* 1. Rango Horario */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                    Rango Horario Visible
                  </Text>
                  <IOSSegmentedControl<'extended' | 'work' | '24h'>
                    tabs={[
                      { id: 'work', label: 'Laboral (08-20)' },
                      { id: 'extended', label: 'Extendido (06-23)' },
                      { id: '24h', label: '24 Horas' },
                    ]}
                    selectedTab={settings.hourRange}
                    onTabChange={(mode) => updateSettings({ hourRange: mode })}
                    isDark={isDark}
                  />
                </View>

                {/* 2. Densidad de Grilla */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                    Densidad de la Grilla Semanal
                  </Text>
                  <IOSSegmentedControl<'compact' | 'standard' | 'spacious'>
                    tabs={[
                      { id: 'compact', label: 'Compacta (48px)' },
                      { id: 'standard', label: 'Estándar (60px)' },
                      { id: 'spacious', label: 'Amplia (76px)' },
                    ]}
                    selectedTab={settings.slotDensity}
                    onTabChange={(density) => updateSettings({ slotDensity: density })}
                    isDark={isDark}
                  />
                </View>

                {/* 3. Primer Día de la Semana */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                    Primer Día de la Semana
                  </Text>
                  <IOSSegmentedControl<'monday' | 'sunday'>
                    tabs={[
                      { id: 'monday', label: 'Lunes' },
                      { id: 'sunday', label: 'Domingo' },
                    ]}
                    selectedTab={settings.firstDayOfWeek}
                    onTabChange={(day) => updateSettings({ firstDayOfWeek: day })}
                    isDark={isDark}
                  />
                </View>

                {/* 4. Ocultar Fines de Semana */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                      Modo Trabajo (Ocultar Fines de Semana)
                    </Text>
                    <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                      Mostrar solo días hábiles (5 columnas)
                    </Text>
                  </View>
                  <Switch
                    value={settings.hideWeekends}
                    onValueChange={(val) => updateSettings({ hideWeekends: val })}
                    trackColor={{ false: theme.border, true: '#007AFF' }}
                  />
                </View>
              </View>
            )}

            {/* PESTAÑA 2: TIME-BLOCKING */}
            {activeTab === 'timeblocking' && (
              <View style={{ gap: 14 }}>
                {/* 1. Duración Predeterminada de Tareas */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                    Duración Estimada de Tareas Embebidas
                  </Text>
                  <IOSSegmentedControl<'15' | '30' | '45' | '60'>
                    tabs={[
                      { id: '15', label: '15 min' },
                      { id: '30', label: '30 min' },
                      { id: '45', label: '45 min' },
                      { id: '60', label: '60 min' },
                    ]}
                    selectedTab={String(settings.defaultTaskDuration) as '15' | '30' | '45' | '60'}
                    onTabChange={(duration) => updateSettings({ defaultTaskDuration: Number(duration) })}
                    isDark={isDark}
                  />
                </View>

                {/* 2. Ocultar Tareas Completadas */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                      Ocultar Tareas Completadas
                    </Text>
                    <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                      Mantener la grilla limpia al finalizar pendientes
                    </Text>
                  </View>
                  <Switch
                    value={settings.hideCompletedTasks}
                    onValueChange={(val) => updateSettings({ hideCompletedTasks: val })}
                    trackColor={{ false: theme.border, true: '#007AFF' }}
                  />
                </View>

                {/* 3. Badges D-Day */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                      Badges D-Day en Hitos y Exámenes
                    </Text>
                    <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                      Mostrar píldoras de cuenta regresiva (ej. D-Day, D-3)
                    </Text>
                  </View>
                  <Switch
                    value={settings.showDDayBadges}
                    onValueChange={(val) => updateSettings({ showDDayBadges: val })}
                    trackColor={{ false: theme.border, true: '#007AFF' }}
                  />
                </View>
              </View>
            )}

            {/* PESTAÑA 3: GESTIÓN DE CALENDARIOS & PALETAS */}
            {activeTab === 'calendars' && (
              <View style={{ gap: 14 }}>
                {/* Lista de Calendarios */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                    Calendarios Activos
                  </Text>
                  <View style={{ gap: 6 }}>
                    {categories.map((cat) => (
                      <View
                        key={cat.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: theme.cardSecondary,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: theme.border,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 7,
                              backgroundColor: cat.color,
                            }}
                          />
                          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                            {cat.name}
                          </Text>
                        </View>

                        {/* Botón Eliminar si no es default */}
                        {!cat.is_default && (
                          <Pressable
                            onPress={() => deleteCategory(cat.id)}
                            style={{ padding: 4 }}
                          >
                            <Trash2 size={15} color="#FF3B30" />
                          </Pressable>
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                {/* Formulario + Agregar Nuevo Calendario */}
                <View
                  style={{
                    backgroundColor: theme.cardSecondary,
                    padding: 14,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.primary }}>
                    + Nuevo Calendario
                  </Text>

                  <TextInput
                    value={newCalName}
                    onChangeText={setNewCalName}
                    placeholder="Nombre del nuevo calendario..."
                    placeholderTextColor={theme.text.tertiary}
                    style={{
                      backgroundColor: theme.card,
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: '700',
                      color: theme.text.primary,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  />

                  {/* Selector de Paleta Pro 12 Colores */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                    {PRO_COLORS.map((c) => {
                      const isSelected = selectedColor === c;
                      return (
                        <Pressable
                          key={c}
                          onPress={() => setSelectedColor(c)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            backgroundColor: c,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: isSelected ? 2 : 0,
                            borderColor: '#FFFFFF',
                          }}
                        >
                          {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                        </Pressable>
                      );
                    })}
                  </View>

                  <Pressable
                    onPress={handleCreateCategory}
                    style={{
                      backgroundColor: selectedColor,
                      paddingVertical: 10,
                      borderRadius: 10,
                      alignItems: 'center',
                      marginTop: 4,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF' }}>
                      Crear Calendario
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
