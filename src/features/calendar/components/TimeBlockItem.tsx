import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Clock, MapPin, CheckCircle2, Flag } from 'lucide-react-native';
import { UnifiedCalendarItem } from '../../../types';
import { ReminderCheckbox } from '../../reminders/components/ReminderCheckbox';
import { AppleEmojiText } from '../../../components/ui/AppleEmojiText';
import { useTasksStore } from '../../../store/useTasksStore';
import { IOS_COLORS, getTintStyle } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface TimeBlockItemProps {
  item: UnifiedCalendarItem;
  onPress?: (item: UnifiedCalendarItem) => void;
  isCompact?: boolean;
  isDark?: boolean;
}

export const TimeBlockItem: React.FC<TimeBlockItemProps> = ({
  item,
  onPress,
  isCompact = false,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const toggleTaskComplete = useTasksStore((state) => state.toggleTaskComplete);

  const isTask = item.type === 'task';
  const isCompleted = Boolean(item.is_completed);
  const color = item.color || '#007AFF';
  const tint = getTintStyle(color, isDark);

  const handleToggleTask = () => {
    if (item.task_id) {
      toggleTaskComplete(item.task_id);
    }
  };

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: pressed ? 0.85 : isCompleted ? 0.6 : 1,
        backgroundColor: tint.backgroundColor,
        borderRadius: 14,
        borderWidth: 1,
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.8)',
        borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#E5E5EA',
        borderLeftColor: color, // Borde izquierdo saturado al 100%
        borderLeftWidth: 4,
        borderRightColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E5EA',
        paddingVertical: isCompact ? 6 : 10,
        paddingHorizontal: isCompact ? 8 : 12,
        marginBottom: 6,
        overflow: 'hidden',
        ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.18 : 0.03, 4),
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
        {/* Checkbox circular si es una Tarea (Google Time-Blocking) */}
        {isTask && (
          <View style={{ marginTop: 1 }}>
            <ReminderCheckbox
              checked={isCompleted}
              onToggle={handleToggleTask}
              color={color}
              size={18}
              isDark={isDark}
            />
          </View>
        )}

        {/* Info Principal */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <AppleEmojiText
                style={{
                  fontSize: isCompact ? 12 : 14,
                  fontWeight: '800',
                  color: isCompleted ? theme.text.tertiary : theme.text.primary,
                  textDecorationLine: isCompleted ? 'line-through' : 'none',
                  flex: 1,
                }}
              >
                {item.title}
              </AppleEmojiText>
            </View>

            {/* Badge D-Day / Milestone */}
            {item.d_day_text && (
              <View
                style={{
                  backgroundColor: item.d_day_text === 'D-Day' ? '#FF3B30' : '#FF9500',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                  marginLeft: 4,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#FFFFFF' }}>
                  {item.d_day_text}
                </Text>
              </View>
            )}
          </View>

          {/* Subtítulo / Horario / Ubicación */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {item.start_time && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Clock size={10} color={theme.text.secondary} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                  {item.start_time}{item.end_time ? ` - ${item.end_time}` : ''}
                </Text>
              </View>
            )}

            {item.is_all_day && (
              <Text style={{ fontSize: 10, fontWeight: '800', color: color, textTransform: 'uppercase' }}>
                Todo el día
              </Text>
            )}

            {item.location && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <MapPin size={10} color={theme.text.tertiary} />
                <Text style={{ fontSize: 11, color: theme.text.tertiary }} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            )}

            {item.calendar_name && (
              <Text style={{ fontSize: 10, fontWeight: '700', color: theme.text.tertiary }}>
                · {item.calendar_name}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};
