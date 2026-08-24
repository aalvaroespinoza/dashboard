import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronRight, Plus, Folder } from 'lucide-react-native';
import { TaskList, TaskItem } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';

interface MasterListViewProps {
  lists: TaskList[];
  tasks: TaskItem[];
  onSelectList: (listId: string) => void;
  onOpenNewList: () => void;
  isDark?: boolean;
}

export const MasterListView: React.FC<MasterListViewProps> = ({
  lists,
  tasks,
  onSelectList,
  onOpenNewList,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30, gap: 16 }}
    >
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: 'hidden',
        }}
      >
        {lists.map((list, index) => {
          const count = tasks.filter((t) => t.list_id === list.id && !t.is_completed).length;
          const isLast = index === lists.length - 1;

          return (
            <Pressable
              key={list.id}
              onPress={() => onSelectList(list.id)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 16,
                paddingHorizontal: 18,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: theme.border,
              })}
            >
              {/* Left: Dot + Title */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: list.color || IOS_COLORS.blue,
                  }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: theme.text.primary,
                  }}
                >
                  {list.title}
                </Text>
              </View>

              {/* Right: Counter + Chevron */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: theme.text.secondary,
                  }}
                >
                  {count}
                </Text>
                <ChevronRight size={18} color={theme.text.tertiary} />
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Botón Inferior: + Nueva Lista */}
      <Pressable
        onPress={onOpenNewList}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 16,
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 10,
        })}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: isDark ? 'rgba(0, 122, 255, 0.2)' : '#EFF6FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={16} color={IOS_COLORS.blue} strokeWidth={2.5} />
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: IOS_COLORS.blue }}>
          Nueva lista
        </Text>
      </Pressable>
    </ScrollView>
  );
};
