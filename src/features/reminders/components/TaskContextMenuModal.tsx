/**
 * TaskContextMenuModal.tsx
 * Mini Menú Contextual iPadOS (Action Sheet) al mantener presionado (Long Press) un recordatorio.
 *
 * Opciones:
 * 1. ✏️ Editar Recordatorio -> Abre el inspector/modal de edición completo.
 * 2. 🗑️ Eliminar Recordatorio -> Elimina la tarea inmediatamente de SQLite y Zustand.
 * 3. ❌ Cancelar -> Cierra el menú.
 */

import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { Edit3, Trash2, X, ChevronRight, CheckSquare } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TaskItem } from '../../../types';
import { IOS_COLORS, IOS_FONTS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface TaskContextMenuModalProps {
  visible: boolean;
  task: TaskItem | null;
  onClose: () => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  isDark?: boolean;
}

export const TaskContextMenuModal: React.FC<TaskContextMenuModalProps> = ({
  visible,
  task,
  onClose,
  onEdit,
  onDelete,
  isDark = true,
}) => {
  if (!task) return null;

  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onClose();
    onEdit(task);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    onClose();
    onDelete(task);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '88%',
            maxWidth: 380,
            backgroundColor: theme.card,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: 'hidden',
            ...createShadow('#000000', { width: 0, height: 8 }, isDark ? 0.35 : 0.1, 20),
          }}
        >
          {/* Header con el Título del Recordatorio */}
          <View style={{ padding: 18, backgroundColor: theme.cardSecondary, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckSquare size={14} color="#007AFF" />
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: '#007AFF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Recordatorio
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: IOS_FONTS.bold,
                color: theme.text.primary,
              }}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {task.due_date && (
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                📅 Vence: {task.due_date} {task.due_time ? `• ${task.due_time}` : ''}
              </Text>
            )}
          </View>

          {/* Opciones del Menú */}
          <View style={{ padding: 8, gap: 4 }}>
            {/* Opción 1: Editar */}
            <Pressable
              onPress={handleEdit}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 14,
                backgroundColor: pressed
                  ? isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.04)'
                  : 'transparent',
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: 'rgba(0, 122, 255, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit3 size={17} color="#007AFF" />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                    Editar Recordatorio
                  </Text>
                  <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                    Modificar fecha, notas, prioridad o lista
                  </Text>
                </View>
              </View>

              <ChevronRight size={17} color={theme.text.tertiary} />
            </Pressable>

            {/* Opción 2: Eliminar (Destructivo) */}
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 14,
                backgroundColor: pressed
                  ? 'rgba(255, 59, 48, 0.1)'
                  : 'transparent',
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255, 59, 48, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={17} color="#FF3B30" />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontFamily: IOS_FONTS.bold, color: '#FF3B30' }}>
                    Eliminar Recordatorio
                  </Text>
                  <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                    Quitar este recordatorio permanentemente
                  </Text>
                </View>
              </View>

              <ChevronRight size={17} color="#FF3B30" />
            </Pressable>
          </View>

          {/* Botón Cancelar */}
          <View style={{ padding: 10, paddingTop: 4, borderTopWidth: 1, borderTopColor: theme.border }}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                width: '100%',
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.border,
              })}
            >
              <Text style={{ fontSize: 14, fontFamily: IOS_FONTS.bold, color: theme.text.secondary }}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
