import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Calendar,
  Clock,
  Flag,
  Tag,
  Folder,
  Plus,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Check,
  CornerDownRight,
} from 'lucide-react-native';
import { Priority, TaskList } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';
import { RECURRENCE_PRESETS, getHumanReadableRRule } from '../../../services/recurrenceService';
import { createShadow } from '../../../styles/shadows';

interface QuickTaskToolbarProps {
  lists: TaskList[];
  activeListId?: string | null;
  onAddTask: (task: {
    title: string;
    list_id: string;
    parent_id?: string | null;
    notes?: string;
    due_date?: string;
    due_time?: string;
    priority?: Priority;
    flagged?: number;
    rrule?: string | null;
    tags?: string[];
  }) => Promise<void>;
  isDark?: boolean;
}

export const QuickTaskToolbar: React.FC<QuickTaskToolbarProps> = ({
  lists,
  activeListId,
  onAddTask,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [title, setTitle] = useState('');
  const [selectedList, setSelectedList] = useState<string>(
    activeListId || lists[0]?.id || 'list-default'
  );
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('none');
  const [flagged, setFlagged] = useState<boolean>(false);
  const [rrule, setRRule] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isTagsInputVisible, setIsTagsInputVisible] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // Menús Popover flotantes
  const [activePopover, setActivePopover] = useState<'date' | 'priority' | 'list' | 'repeat' | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const weekendStr = (() => {
    const d = new Date();
    const day = d.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSaturday);
    return d.toISOString().split('T')[0];
  })();

  const handleCreate = async () => {
    if (!title.trim()) return;

    await onAddTask({
      title: title.trim(),
      list_id: selectedList,
      due_date: dueDate || undefined,
      due_time: dueTime || undefined,
      priority,
      flagged: flagged ? 1 : 0,
      rrule,
      tags,
    });

    // Resetear formulario manteniendo la lista seleccionada
    setTitle('');
    setDueDate(null);
    setDueTime(null);
    setPriority('none');
    setFlagged(false);
    setRRule(null);
    setTags([]);
    setActivePopover(null);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setNewTagInput('');
    setIsTagsInputVisible(false);
  };

  const currentListObj = lists.find((l) => l.id === selectedList) || lists[0];

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
        gap: 10,
        ...createShadow('#000000', { width: 0, height: 4 }, 0.1, 10),
      }}
    >
      {/* 1. Input de Título Principal */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2,
            borderColor: currentListObj?.color || IOS_COLORS.blue,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Nuevo recordatorio..."
          placeholderTextColor={theme.text.tertiary}
          onSubmitEditing={handleCreate}
          returnKeyType="done"
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: '600',
            color: theme.text.primary,
            padding: 0,
          }}
        />

        {title.trim().length > 0 && (
          <Pressable
            onPress={handleCreate}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: IOS_COLORS.blue,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      {/* 2. Barra de Herramientas Flotante (Píldoras Rápidas) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, alignItems: 'center' }}
      >
        {/* Selector de Fecha */}
        <Pressable
          onPress={() => setActivePopover(activePopover === 'date' ? null : 'date')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: dueDate ? (isDark ? 'rgba(0, 122, 255, 0.2)' : '#EFF6FF') : theme.cardSecondary,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: dueDate ? IOS_COLORS.blue : theme.border,
            gap: 6,
          })}
        >
          <Calendar size={13} color={dueDate ? IOS_COLORS.blue : theme.text.secondary} />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: dueDate ? IOS_COLORS.blue : theme.text.secondary,
            }}
          >
            {dueDate === todayStr
              ? 'Hoy'
              : dueDate === tomorrowStr
              ? 'Mañana'
              : dueDate
              ? dueDate
              : 'Fecha'}
          </Text>
        </Pressable>

        {/* Selector de Prioridad */}
        <Pressable
          onPress={() => setActivePopover(activePopover === 'priority' ? null : 'priority')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor:
              priority === 'high'
                ? isDark
                  ? 'rgba(255, 59, 48, 0.2)'
                  : '#FEE2E2'
                : priority === 'medium'
                ? isDark
                  ? 'rgba(255, 149, 0, 0.2)'
                  : '#FEF3C7'
                : priority === 'low'
                ? isDark
                  ? 'rgba(0, 122, 255, 0.2)'
                  : '#DBEAFE'
                : theme.cardSecondary,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            borderWidth: 1,
            borderColor:
              priority === 'high'
                ? IOS_COLORS.red
                : priority === 'medium'
                ? IOS_COLORS.orange
                : priority === 'low'
                ? IOS_COLORS.blue
                : theme.border,
            gap: 4,
          })}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              color:
                priority === 'high'
                  ? IOS_COLORS.red
                  : priority === 'medium'
                  ? IOS_COLORS.orange
                  : priority === 'low'
                  ? IOS_COLORS.blue
                  : theme.text.secondary,
            }}
          >
            {priority === 'high'
              ? 'P1 Alta'
              : priority === 'medium'
              ? 'P5 Media'
              : priority === 'low'
              ? 'P9 Baja'
              : 'Prioridad'}
          </Text>
        </Pressable>

        {/* Toggle Flag (Banderín) */}
        <Pressable
          onPress={() => setFlagged(!flagged)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: flagged
              ? isDark
                ? 'rgba(255, 149, 0, 0.2)'
                : '#FEF3C7'
              : theme.cardSecondary,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: flagged ? IOS_COLORS.orange : theme.border,
            gap: 4,
          })}
        >
          <Flag
            size={13}
            color={flagged ? IOS_COLORS.orange : theme.text.secondary}
            fill={flagged ? IOS_COLORS.orange : 'none'}
          />
        </Pressable>

        {/* Selector de Recurrencia */}
        <Pressable
          onPress={() => setActivePopover(activePopover === 'repeat' ? null : 'repeat')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: rrule ? (isDark ? 'rgba(175, 82, 222, 0.2)' : '#F5F3FF') : theme.cardSecondary,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: rrule ? IOS_COLORS.purple : theme.border,
            gap: 4,
          })}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: rrule ? IOS_COLORS.purple : theme.text.secondary,
            }}
          >
            {rrule ? getHumanReadableRRule(rrule) : 'Repetir'}
          </Text>
        </Pressable>

        {/* Selector de Lista Destino */}
        <Pressable
          onPress={() => setActivePopover(activePopover === 'list' ? null : 'list')}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.cardSecondary,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 6,
          })}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: currentListObj?.color || IOS_COLORS.blue,
            }}
          />
          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.primary }}>
            {currentListObj?.title || 'Lista'}
          </Text>
        </Pressable>

        {/* Tags */}
        <Pressable
          onPress={() => setIsTagsInputVisible(!isTagsInputVisible)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: tags.length > 0 ? (isDark ? 'rgba(50, 173, 230, 0.2)' : '#E0F2FE') : theme.cardSecondary,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: tags.length > 0 ? IOS_COLORS.cyan : theme.border,
            gap: 4,
          })}
        >
          <Tag size={12} color={tags.length > 0 ? IOS_COLORS.cyan : theme.text.secondary} />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: tags.length > 0 ? IOS_COLORS.cyan : theme.text.secondary,
            }}
          >
            {tags.length > 0 ? `${tags.length} tags` : '#Tag'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* 3. Popovers Contextuales Desplegables */}

      {/* Popover Fecha */}
      {activePopover === 'date' && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <Pressable
            onPress={() => {
              setDueDate(todayStr);
              setActivePopover(null);
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: dueDate === todayStr ? IOS_COLORS.blue : theme.cardSecondary,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: dueDate === todayStr ? '#FFFFFF' : theme.text.primary }}>
              Hoy ({todayStr.slice(5)})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setDueDate(tomorrowStr);
              setActivePopover(null);
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: dueDate === tomorrowStr ? IOS_COLORS.blue : theme.cardSecondary,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: dueDate === tomorrowStr ? '#FFFFFF' : theme.text.primary }}>
              Mañana ({tomorrowStr.slice(5)})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setDueDate(weekendStr);
              setActivePopover(null);
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: dueDate === weekendStr ? IOS_COLORS.blue : theme.cardSecondary,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: dueDate === weekendStr ? '#FFFFFF' : theme.text.primary }}>
              Este fin de semana
            </Text>
          </Pressable>

          {dueDate && (
            <Pressable
              onPress={() => {
                setDueDate(null);
                setActivePopover(null);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: theme.cardSecondary,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: IOS_COLORS.red }}>
                Quitar fecha
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Popover Prioridad */}
      {activePopover === 'priority' && (
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          {(['none', 'low', 'medium', 'high'] as Priority[]).map((p) => (
            <Pressable
              key={p}
              onPress={() => {
                setPriority(p);
                setActivePopover(null);
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: priority === p ? (isDark ? '#3A3A3C' : '#E5E5EA') : theme.cardSecondary,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color:
                    p === 'high'
                      ? IOS_COLORS.red
                      : p === 'medium'
                      ? IOS_COLORS.orange
                      : p === 'low'
                      ? IOS_COLORS.blue
                      : theme.text.secondary,
                }}
              >
                {p === 'high' ? 'P1 Alta' : p === 'medium' ? 'P5 Media' : p === 'low' ? 'P9 Baja' : 'Ninguna'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Popover Recurrencia */}
      {activePopover === 'repeat' && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          {RECURRENCE_PRESETS.map((preset) => (
            <Pressable
              key={preset.id}
              onPress={() => {
                setRRule(preset.rrule);
                setActivePopover(null);
              }}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: rrule === preset.rrule ? IOS_COLORS.purple : theme.cardSecondary,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: rrule === preset.rrule ? '#FFFFFF' : theme.text.primary,
                }}
              >
                {preset.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Popover Lista */}
      {activePopover === 'list' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border }}
          contentContainerStyle={{ gap: 6 }}
        >
          {lists.map((l) => (
            <Pressable
              key={l.id}
              onPress={() => {
                setSelectedList(l.id);
                setActivePopover(null);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: selectedList === l.id ? `${l.color || '#007AFF'}25` : theme.cardSecondary,
                borderWidth: selectedList === l.id ? 1 : 0,
                borderColor: l.color || '#007AFF',
                gap: 6,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: l.color || '#007AFF',
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color: selectedList === l.id ? l.color || '#007AFF' : theme.text.primary,
                }}
              >
                {l.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Input de Tags */}
      {isTagsInputVisible && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <TextInput
            value={newTagInput}
            onChangeText={setNewTagInput}
            placeholder="Añadir tag (ej. Facultad)..."
            placeholderTextColor={theme.text.tertiary}
            onSubmitEditing={handleAddTag}
            style={{
              flex: 1,
              fontSize: 12,
              color: theme.text.primary,
              backgroundColor: theme.cardSecondary,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          />
          <Pressable
            onPress={handleAddTag}
            style={{
              backgroundColor: IOS_COLORS.blue,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>Añadir</Text>
          </Pressable>
        </View>
      )}

      {/* Tags Activos */}
      {tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {tags.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTags(tags.filter((tag) => tag !== t))}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? 'rgba(50, 173, 230, 0.15)' : '#E0F2FE',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: IOS_COLORS.cyan }}>
                #{t}
              </Text>
              <Text style={{ fontSize: 10, color: IOS_COLORS.cyan, fontWeight: '900' }}>×</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};
