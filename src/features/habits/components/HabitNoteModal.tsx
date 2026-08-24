import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { X, Check, FileText, Sparkles, Clock } from 'lucide-react-native';
import { HabitItem } from '../../../types';
import { useHabitsStore } from '../stores/useHabitsStore';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface HabitNoteModalProps {
  visible: boolean;
  habit: HabitItem | null;
  onClose: () => void;
  isDark?: boolean;
}

export const HabitNoteModal: React.FC<HabitNoteModalProps> = ({
  visible,
  habit,
  onClose,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { logsMap, saveHabitNote } = useHabitsStore();
  const today = new Date().toISOString().split('T')[0];

  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (habit) {
      const currentLog = logsMap[habit.id]?.[today];
      setNoteText(currentLog?.notes || '');
    }
  }, [habit, visible]);

  const handleSave = async () => {
    if (!habit) return;
    await saveHabitNote(habit.id, noteText.trim());
    onClose();
  };

  if (!habit) return null;

  const nowFormatted = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
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
            maxWidth: 500,
            backgroundColor: theme.card,
            borderRadius: 28,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 16,
            ...createShadow('#000000', { width: 0, height: 6 }, 0.2, 16),
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 22 }}>{habit.icon}</Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: theme.text.primary }}>
                  Bitácora de Hábito
                </Text>
                <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                  {habit.title} · {nowFormatted} hs
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color={theme.text.primary} />
            </Pressable>
          </View>

          {/* Text Area */}
          <View
            style={{
              backgroundColor: theme.cardSecondary,
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 8,
            }}
          >
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Escribe tus reflexiones, avances o notas de la sesión..."
              placeholderTextColor={theme.text.tertiary}
              multiline
              maxLength={4000}
              style={{
                fontSize: 14,
                color: theme.text.primary,
                minHeight: 120,
                textAlignVertical: 'top',
                padding: 0,
              }}
            />

            {/* Contador de Caracteres */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Text style={{ fontSize: 10, color: theme.text.tertiary, fontWeight: '600' }}>
                {noteText.length} / 4000
              </Text>
            </View>
          </View>

          {/* Botones de Acción */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.secondary }}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={{
                flex: 1.5,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: IOS_COLORS.blue,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>
                Guardar Nota
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
