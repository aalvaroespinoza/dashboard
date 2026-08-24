import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import {
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
  X,
  AlertTriangle,
  Flame,
} from 'lucide-react-native';
import { HabitItem } from '../../../types';
import { useHabitsStore } from '../stores/useHabitsStore';
import { AppleEmoji } from '../../../components/ui/AppleEmoji';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface GritHabitOptionsMenuProps {
  visible: boolean;
  habit: HabitItem | null;
  onClose: () => void;
  onEdit: (habit: HabitItem) => void;
  isDark?: boolean;
}

export const GritHabitOptionsMenu: React.FC<GritHabitOptionsMenuProps> = ({
  visible,
  habit,
  onClose,
  onEdit,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { archiveHabit, resetStreak, deleteHabit } = useHabitsStore();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (!habit) return null;

  const isArchived = Boolean(habit.is_archived);

  const handleArchiveToggle = async () => {
    await archiveHabit(habit.id, !isArchived);
    onClose();
  };

  const handleResetStreak = async () => {
    await resetStreak(habit.id);
    onClose();
  };

  const handleConfirmDelete = async () => {
    await deleteHabit(habit.id);
    setIsDeleteConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Modal visible={visible && !isDeleteConfirmOpen} transparent animationType="fade">
        <Pressable
          onPress={onClose}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: 380,
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 8,
              ...createShadow('#000000', { width: 0, height: 6 }, 0.25, 16),
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginBottom: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppleEmoji emoji={habit.icon} size={22} />
                <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '900', color: theme.text.primary, maxWidth: 220 }}>
                  {habit.title}
                </Text>
              </View>
              <Pressable onPress={onClose}>
                <X size={18} color={theme.text.secondary} />
              </Pressable>
            </View>

            <View style={{ height: 1, backgroundColor: theme.border }} />

            {/* Opción 1: Editar Hábito */}
            <Pressable
              onPress={() => {
                onClose();
                onEdit(habit);
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 14,
                backgroundColor: theme.cardSecondary,
                gap: 12,
              })}
            >
              <Edit3 size={18} color={IOS_COLORS.blue} />
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                  Editar Hábito
                </Text>
                <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                  Modificar metas, color, frecuencia y recordatorios
                </Text>
              </View>
            </Pressable>

            {/* Opción 2: Pausar / Archivar */}
            <Pressable
              onPress={handleArchiveToggle}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 14,
                backgroundColor: theme.cardSecondary,
                gap: 12,
              })}
            >
              <Archive size={18} color="#FF9500" />
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                  {isArchived ? 'Desarchivar Hábito' : 'Pausar / Archivar'}
                </Text>
                <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                  {isArchived ? 'Restaurar hábito al panel de hoy' : 'Ocultar sin borrar el historial de logs'}
                </Text>
              </View>
            </Pressable>

            {/* Opción 3: Reiniciar Racha */}
            <Pressable
              onPress={handleResetStreak}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 14,
                backgroundColor: theme.cardSecondary,
                gap: 12,
              })}
            >
              <RotateCcw size={18} color={IOS_COLORS.purple} />
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                  Reiniciar Contador de Racha
                </Text>
                <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                  Restablecer racha actual a 0
                </Text>
              </View>
            </Pressable>

            <View style={{ height: 1, backgroundColor: theme.border }} />

            {/* Opción 4: Eliminar Hábito */}
            <Pressable
              onPress={() => setIsDeleteConfirmOpen(true)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 14,
                backgroundColor: 'rgba(255, 59, 48, 0.12)',
                gap: 12,
              })}
            >
              <Trash2 size={18} color="#FF3B30" />
              <View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FF3B30' }}>
                  Eliminar Hábito
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255, 59, 48, 0.8)' }}>
                  Borrar permanentemente y vaciar sus registros
                </Text>
              </View>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de Confirmación Destructiva */}
      <Modal visible={isDeleteConfirmOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View
            style={{
              width: '90%',
              maxWidth: 400,
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 16,
              alignItems: 'center',
            }}
          >
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 59, 48, 0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={26} color="#FF3B30" />
            </View>

            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, textAlign: 'center' }}>
              ¿Eliminar hábito permanentemente?
            </Text>

            <Text style={{ fontSize: 13, color: theme.text.secondary, textAlign: 'center', lineHeight: 18 }}>
              Se eliminará <Text style={{ fontWeight: '800', color: theme.text.primary }}>"{habit.title}"</Text> y todos sus registros históricos en SQLite. Esta acción no se puede deshacer.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 }}>
              <Pressable
                onPress={() => setIsDeleteConfirmOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.cardSecondary,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmDelete}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: '#FF3B30',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                  Eliminar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
