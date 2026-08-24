import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import {
  MoreHorizontal,
  Plus,
  Edit2,
  Trash2,
  X,
  FolderPlus,
} from 'lucide-react-native';
import { ListSection } from '../../../types';
import { useTasksStore } from '../../../store/useTasksStore';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface ReminderSectionHeaderProps {
  section: ListSection | null;
  listId: string;
  tasksCount: number;
  completedCount: number;
  onAddTaskInSection: (sectionId?: string | null) => void;
  isDark?: boolean;
}

export const ReminderSectionHeader: React.FC<ReminderSectionHeaderProps> = ({
  section,
  listId,
  tasksCount,
  completedCount,
  onAddTaskInSection,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { updateSection, deleteSection } = useTasksStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newName, setNewName] = useState(section?.name || '');

  const sectionName = section ? section.name : 'Sin Sección';

  const handleSaveRename = async () => {
    if (!section || !newName.trim()) return;
    await updateSection(section.id, newName.trim());
    setIsRenameModalOpen(false);
  };

  const handleDelete = async () => {
    if (!section) return;
    await deleteSection(section.id);
    setIsMenuOpen(false);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 4,
        marginTop: 14,
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA',
      }}
    >
      {/* Título de la Sección + Contador */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 17, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.3 }}>
          {sectionName}
        </Text>
        <View
          style={{
            backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary }}>
            {completedCount}/{tasksCount}
          </Text>
        </View>
      </View>

      {/* Acciones de Sección (+ y ···) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Pressable
          onPress={() => onAddTaskInSection(section?.id)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={15} color={IOS_COLORS.blue} strokeWidth={2.5} />
        </Pressable>

        {section && (
          <Pressable
            onPress={() => setIsMenuOpen(true)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MoreHorizontal size={15} color={theme.text.secondary} />
          </Pressable>
        )}
      </View>

      {/* Menú de Sección */}
      <Modal visible={isMenuOpen} transparent animationType="fade">
        <Pressable
          onPress={() => setIsMenuOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 280,
              backgroundColor: theme.card,
              borderRadius: 18,
              padding: 10,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 4,
              ...createShadow('#000000', { width: 0, height: 4 }, 0.25, 12),
            }}
          >
            <Pressable
              onPress={() => {
                setIsMenuOpen(false);
                setIsRenameModalOpen(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 10,
                gap: 10,
              }}
            >
              <Edit2 size={16} color={theme.text.primary} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                Renombrar Sección
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 10,
                gap: 10,
              }}
            >
              <Trash2 size={16} color="#FF3B30" />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#FF3B30' }}>
                Eliminar Sección
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Modal para Renombrar Sección */}
      <Modal visible={isRenameModalOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View
            style={{
              width: '90%',
              maxWidth: 380,
              backgroundColor: theme.card,
              borderRadius: 22,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 14,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '900', color: theme.text.primary }}>
              Renombrar Sección
            </Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Nombre de la sección..."
              placeholderTextColor={theme.text.tertiary}
              style={{
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
                fontSize: 15,
                fontWeight: '700',
                color: theme.text.primary,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setIsRenameModalOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: theme.cardSecondary,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.primary }}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveRename}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: IOS_COLORS.blue,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>
                  Guardar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
