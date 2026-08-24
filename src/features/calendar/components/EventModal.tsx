import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, Pressable, ScrollView } from 'react-native';
import { X, Trash2, Clock, MapPin } from 'lucide-react-native';
import { CalendarEventItem } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';
import { CalendarCategory } from './CalendarSidebar';

interface EventModalProps {
  visible: boolean;
  event: CalendarEventItem | null;
  initialDate?: string;
  initialHour?: number;
  categories: CalendarCategory[];
  onClose: () => void;
  onSave: (eventData: {
    title: string;
    description?: string;
    location?: string;
    start_date: string;
    end_date: string;
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
      setSelectedCategory(event.calendar_name || 'Personal');
      setColor(event.color || IOS_COLORS.blue);
    } else {
      const today = initialDate || new Date().toISOString().split('T')[0];
      const startH = initialHour !== undefined ? initialHour.toString().padStart(2, '0') : '09';
      const endH = initialHour !== undefined ? (initialHour + 1).toString().padStart(2, '0') : '10';

      setTitle('');
      setDescription('');
      setLocation('');
      setDateStr(today);
      setStartTime(`${startH}:00`);
      setEndTime(`${endH}:00`);
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
          backgroundColor: 'rgba(0,0,0,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: 480,
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text.primary }}>
              {event ? 'Editar Evento' : 'Nuevo Evento'}
            </Text>
            <Pressable onPress={onClose}>
              <X size={20} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Título */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary, marginBottom: 6 }}>
            Título
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Nombre del evento o reunión"
            placeholderTextColor={theme.text.tertiary}
            style={{
              backgroundColor: theme.cardSecondary,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 10,
              padding: 12,
              fontSize: 14,
              color: theme.text.primary,
              marginBottom: 14,
            }}
          />

          {/* Calendario / Categoría */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary, marginBottom: 6 }}>
            Calendario
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => {
                  setSelectedCategory(cat.name);
                  setColor(cat.color);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: selectedCategory === cat.name ? `${cat.color}20` : theme.cardSecondary,
                  borderWidth: 1,
                  borderColor: selectedCategory === cat.name ? cat.color : theme.border,
                  gap: 6,
                }}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cat.color }} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: selectedCategory === cat.name ? cat.color : theme.text.primary,
                  }}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Fecha y Horas */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            <View style={{ flex: 1.2 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary, marginBottom: 6 }}>
                Fecha
              </Text>
              <TextInput
                value={dateStr}
                onChangeText={setDateStr}
                placeholder="2026-08-24"
                placeholderTextColor={theme.text.tertiary}
                style={{
                  backgroundColor: theme.cardSecondary,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 13,
                  color: theme.text.primary,
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary, marginBottom: 6 }}>
                Inicio
              </Text>
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                placeholderTextColor={theme.text.tertiary}
                style={{
                  backgroundColor: theme.cardSecondary,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 13,
                  color: theme.text.primary,
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary, marginBottom: 6 }}>
                Fin
              </Text>
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="10:00"
                placeholderTextColor={theme.text.tertiary}
                style={{
                  backgroundColor: theme.cardSecondary,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 13,
                  color: theme.text.primary,
                }}
              />
            </View>
          </View>

          {/* Ubicación */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary, marginBottom: 6 }}>
            Ubicación / Sala virtual
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Google Meet, Oficina Central, etc."
            placeholderTextColor={theme.text.tertiary}
            style={{
              backgroundColor: theme.cardSecondary,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 10,
              padding: 10,
              fontSize: 13,
              color: theme.text.primary,
              marginBottom: 20,
            }}
          />

          {/* Botones de acción */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {event && onDelete ? (
              <Pressable
                onPress={async () => {
                  await onDelete(event.id);
                  onClose();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 59, 48, 0.1)',
                  gap: 6,
                }}
              >
                <Trash2 size={15} color={IOS_COLORS.red} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: IOS_COLORS.red }}>
                  Eliminar
                </Text>
              </Pressable>
            ) : (
              <View />
            )}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={onClose}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 10,
                  backgroundColor: theme.cardSecondary,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text.secondary }}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 9,
                  borderRadius: 10,
                  backgroundColor: IOS_COLORS.blue,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>
                  Guardar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
