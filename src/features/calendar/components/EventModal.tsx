import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, Pressable, ScrollView, Switch } from 'react-native';
import { X, Trash2, Clock, MapPin, Flag, Calendar } from 'lucide-react-native';
import { CalendarEventItem } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';
import { CalendarCategoryItem } from '../../../store/useCalendarStore';
import { createShadow } from '../../../styles/shadows';

interface EventModalProps {
  visible: boolean;
  event: CalendarEventItem | null;
  initialDate?: string;
  initialHour?: number;
  categories: CalendarCategoryItem[];
  onClose: () => void;
  onSave: (eventData: {
    title: string;
    description?: string;
    location?: string;
    start_date: string;
    end_date: string;
    is_milestone?: boolean;
    d_day_target?: string;
    color?: string;
    calendar_name?: string;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isDark?: boolean;
}

export const EventModal: React.FC<EventModalProps> = ({
  visible,
  event,
  initialDate,
  initialHour,
  categories,
  onClose,
  onSave,
  onDelete,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isMilestone, setIsMilestone] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Personal');
  const [color, setColor] = useState<string>(IOS_COLORS.blue);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setDateStr(event.start_date.split('T')[0]);
      setStartTime(event.start_date.includes('T') ? event.start_date.split('T')[1].slice(0, 5) : '09:00');
      setEndTime(event.end_date.includes('T') ? event.end_date.split('T')[1].slice(0, 5) : '10:00');
      setIsMilestone(Boolean(event.is_milestone));
      setSelectedCategory(event.calendar_name || 'Personal');
      setColor(event.color || IOS_COLORS.blue);
    } else {
      const today = initialDate || '2026-08-24';
      const startH = initialHour !== undefined ? initialHour.toString().padStart(2, '0') : '09';
      const endH = initialHour !== undefined ? (initialHour + 1).toString().padStart(2, '0') : '10';

      setTitle('');
      setDescription('');
      setLocation('');
      setDateStr(today);
      setStartTime(`${startH}:00`);
      setEndTime(`${endH}:00`);
      setIsMilestone(false);
      setSelectedCategory(categories.length > 0 ? categories[0].name : 'Personal');
      setColor(categories.length > 0 ? categories[0].color : IOS_COLORS.blue);
    }
  }, [event, visible, initialDate, initialHour]);

  const handleSave = async () => {
    if (!title.trim()) return;

    const start_date = `${dateStr}T${startTime}:00`;
    const end_date = `${dateStr}T${endTime}:00`;

    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      start_date,
      end_date,
      is_milestone: isMilestone,
      d_day_target: isMilestone ? dateStr : undefined,
      color,
      calendar_name: selectedCategory,
    });

    onClose();
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
            maxWidth: 460,
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
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.4 }}>
              {event ? 'Editar Evento' : 'Nuevo Evento'}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {event && onDelete && (
                <Pressable onPress={() => onDelete(event.id)}>
                  <Trash2 size={18} color="#FF3B30" />
                </Pressable>
              )}
              <Pressable onPress={onClose}>
                <X size={18} color={theme.text.secondary} />
              </Pressable>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 14 }}>
            {/* Título */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                Título
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Nombre del evento..."
                placeholderTextColor={theme.text.tertiary}
                style={{
                  backgroundColor: theme.cardSecondary,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: '700',
                  color: theme.text.primary,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              />
            </View>

            {/* Fecha y Horario */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                  Fecha (YYYY-MM-DD)
                </Text>
                <TextInput
                  value={dateStr}
                  onChangeText={setDateStr}
                  placeholder="2026-08-24"
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: '700',
                    color: theme.text.primary,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                />
              </View>

              <View style={{ width: 85, gap: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                  Inicio
                </Text>
                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: '700',
                    color: theme.text.primary,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                />
              </View>

              <View style={{ width: 85, gap: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                  Fin
                </Text>
                <TextInput
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="10:00"
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: '700',
                    color: theme.text.primary,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                />
              </View>
            </View>

            {/* Hito / Examen (D-Day) Switch */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Flag size={16} color={isMilestone ? '#FF3B30' : theme.text.secondary} />
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                    Hito / Examen (D-Day)
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                    Mostrar badge de cuenta regresiva
                  </Text>
                </View>
              </View>
              <Switch
                value={isMilestone}
                onValueChange={setIsMilestone}
                trackColor={{ false: theme.border, true: '#FF3B30' }}
              />
            </View>

            {/* Ubicación */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                Ubicación / Sala
              </Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="ej. Aula 304 - Campus Virtual"
                placeholderTextColor={theme.text.tertiary}
                style={{
                  backgroundColor: theme.cardSecondary,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: '700',
                  color: theme.text.primary,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              />
            </View>

            {/* Selector de Categoría / Calendario */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                Calendario
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => {
                        setSelectedCategory(cat.name);
                        setColor(cat.color);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: isSelected ? cat.color : theme.cardSecondary,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        gap: 6,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: isSelected ? '#FFFFFF' : cat.color,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: isSelected ? '#FFFFFF' : theme.text.primary,
                        }}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Botón Guardar */}
          <Pressable
            onPress={handleSave}
            style={{
              backgroundColor: color || '#007AFF',
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>
              Guardar Evento
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
