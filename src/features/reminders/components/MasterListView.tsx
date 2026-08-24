import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronRight, Plus, Folder, Hash, Tag } from 'lucide-react-native';
import { TaskList, TaskItem } from '../../../types';
import { AppleEmoji } from '../../../components/ui/AppleEmoji';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface MasterListViewProps {
  lists: TaskList[];
  tasks: TaskItem[];
  onSelectList: (listId: string) => void;
  onOpenNewList: () => void;
  onSelectTag?: (tag: string) => void;
  isDark?: boolean;
}

export const MasterListView: React.FC<MasterListViewProps> = ({
  lists,
  tasks,
  onSelectList,
  onOpenNewList,
  onSelectTag,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  // Extraer todas las etiquetas únicas con sus conteos
  const tagsMap: Record<string, number> = {};
  tasks.forEach((t) => {
    if (!t.is_completed && t.tags) {
      t.tags.forEach((tag) => {
        tagsMap[tag] = (tagsMap[tag] || 0) + 1;
      });
    }
  });

  const uniqueTags = Object.keys(tagsMap);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30, gap: 20 }}
    >
      {/* 1. Sección: Mis Listas */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase', paddingLeft: 4 }}>
          Mis Listas
        </Text>

        <View
          style={{
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
            overflow: 'hidden',
            ...createShadow('#000000', { width: 0, height: 2 }, isDark ? 0.2 : 0.03, 6),
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
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA',
                })}
              >
                {/* Left: Icono Circular + Título */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: list.color || IOS_COLORS.blue,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {list.icon ? (
                      <AppleEmoji emoji={list.icon} size={18} />
                    ) : (
                      <Folder size={16} color="#FFFFFF" />
                    )}
                  </View>

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

                {/* Right: Contador + Chevron */}
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

        {/* Botón: + Nueva Lista */}
        <Pressable
          onPress={onOpenNewList}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderWidth: 1,
            borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
            gap: 10,
          })}
        >
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: 'rgba(0, 122, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={16} color={IOS_COLORS.blue} strokeWidth={2.5} />
          </View>
          <Text style={{ fontSize: 14, fontWeight: '800', color: IOS_COLORS.blue }}>
            Nueva Lista
          </Text>
        </Pressable>
      </View>

      {/* 2. Sección: Etiquetas (#Tags) */}
      {uniqueTags.length > 0 && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
            <Tag size={13} color={theme.text.secondary} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
              Etiquetas
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {uniqueTags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => onSelectTag?.(tag)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  gap: 6,
                })}
              >
                <Hash size={13} color={IOS_COLORS.cyan} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.primary }}>
                  {tag}
                </Text>
                <View
                  style={{
                    backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: theme.text.secondary }}>
                    {tagsMap[tag]}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};
