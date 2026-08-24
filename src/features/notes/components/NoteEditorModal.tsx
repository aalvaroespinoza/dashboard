import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, Pressable, ScrollView } from 'react-native';
import { X, Trash2, Pin } from 'lucide-react-native';
import { NoteItem } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';

interface NoteEditorModalProps {
  visible: boolean;
  note: NoteItem | null;
  folders: string[];
  onClose: () => void;
  onSave: (noteData: {
    title: string;
    content: string;
    folder: string;
    tags?: string[];
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onTogglePin?: (id: string) => Promise<void>;
  isDark?: boolean;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  visible,
  note,
  folders,
  onClose,
  onSave,
  onDelete,
  onTogglePin,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folder, setFolder] = useState('General');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setFolder(note.folder || 'General');
    } else {
      setTitle('');
      setContent('');
      setFolder(folders.length > 0 ? folders[0] : 'General');
    }
  }, [note, visible]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    await onSave({
      title: title.trim() || 'Nota sin título',
      content: content.trim(),
      folder: folder || 'General',
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
            width: 540,
            maxHeight: '85%',
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text.primary }}>
              {note ? 'Editar Nota' : 'Nueva Nota'}
            </Text>
            <Pressable onPress={onClose}>
              <X size={20} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Carpeta Selector */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary, marginBottom: 6 }}>
            Carpeta
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 36, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {folders.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFolder(f)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: folder === f ? (isDark ? 'rgba(0, 122, 255, 0.2)' : '#EFF6FF') : theme.cardSecondary,
                    borderWidth: 1,
                    borderColor: folder === f ? IOS_COLORS.blue : theme.border,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: folder === f ? IOS_COLORS.blue : theme.text.primary }}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Título */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Título de la nota"
            placeholderTextColor={theme.text.tertiary}
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: theme.text.primary,
              marginBottom: 12,
              padding: 0,
            }}
          />

          {/* Contenido */}
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Escribe el contenido de la nota aquí..."
            placeholderTextColor={theme.text.tertiary}
            multiline
            style={{
              flex: 1,
              minHeight: 180,
              backgroundColor: theme.cardSecondary,
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              color: theme.text.primary,
              textAlignVertical: 'top',
              marginBottom: 16,
              lineHeight: 20,
            }}
          />

          {/* Acciones */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {note && onDelete ? (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={async () => {
                    await onDelete(note.id);
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

                {onTogglePin && (
                  <Pressable
                    onPress={async () => {
                      await onTogglePin(note.id);
                      onClose();
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: theme.cardSecondary,
                      gap: 6,
                    }}
                  >
                    <Pin size={15} color={Boolean(note.is_pinned) ? IOS_COLORS.orange : theme.text.secondary} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                      {Boolean(note.is_pinned) ? 'Desfijar' : 'Fijar'}
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View />
            )}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={onClose}
                style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.cardSecondary }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text.secondary }}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: IOS_COLORS.blue }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
