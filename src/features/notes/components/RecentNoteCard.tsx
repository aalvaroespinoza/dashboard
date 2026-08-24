import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight, Pin } from 'lucide-react-native';
import { NoteItem } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';

interface RecentNoteCardProps {
  note: NoteItem;
  onPress: (note: NoteItem) => void;
  isDark?: boolean;
}

export const RecentNoteCard: React.FC<RecentNoteCardProps> = ({
  note,
  onPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) {
        const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        return `Hoy ${time}`;
      }
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Pressable
      onPress={() => onPress(note)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.card,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      })}
    >
      {/* Título y Fecha */}
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {Boolean(note.is_pinned) && (
            <Pin size={13} color={IOS_COLORS.orange} fill={IOS_COLORS.orange} />
          )}
          <Text
            numberOfLines={1}
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: theme.text.primary,
              flex: 1,
            }}
          >
            {note.title || 'Nota sin título'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 12, color: theme.text.secondary, fontWeight: '500' }}>
            {formatDate(note.updated_at)}
          </Text>
          {note.folder && note.folder !== 'General' && (
            <View
              style={{
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 10, color: theme.text.tertiary, fontWeight: '600' }}>
                {note.folder}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Chevron */}
      <ChevronRight size={18} color={theme.text.tertiary} />
    </Pressable>
  );
};
