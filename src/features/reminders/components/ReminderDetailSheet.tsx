import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import {
  X,
  Calendar,
  Clock,
  Flag,
  Tag,
  Repeat,
  Folder,
  Trash2,
  Plus,
  CheckCircle2,
  CornerDownRight,
} from 'lucide-react-native';
import { TaskItem, TaskList, Priority } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';
import { RECURRENCE_PRESETS, getHumanReadableRRule } from '../../../services/recurrenceService';
import { createShadow } from '../../../styles/shadows';

interface ReminderDetailSheetProps {
  visible: boolean;
  task: TaskItem | null;
  lists: TaskList[];
  subtasks?: TaskItem[];
  onClose: () => void;
  onSave: (updates: Partial<TaskItem>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onAddSubtask?: (parentId: string, title: string) => Promise<void>;
  onToggleSubtask?: (id: string) => Promise<void>;
  isDark?: boolean;
}

export const ReminderDetailSheet: React.FC<ReminderDetailSheetProps> = ({
  visible,
  task,
  lists,
  subtasks = [],
  onClose,
  onSave,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [hasDate, setHasDate] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [hasTime, setHasTime] = useState(false);
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [flagged, setFlagged] = useState(false);
  const [rrule, setRRule] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setNotes(task.notes || '');
      setHasDate(Boolean(task.due_date));
      setDueDate(task.due_date || new Date().toISOString().split('T')[0]);
      setHasTime(Boolean(task.due_time));
      setDueTime(task.due_time || '09:00');
      setPriority(task.priority || 'none');
      setFlagged(Boolean(task.flagged));
      setRRule(task.rrule || null);
      setSelectedListId(task.list_id);
      setTags(task.tags || []);
    }
  }, [task]);

  const handleSave = async () => {
    if (!title.trim()) return;

    await onSave({
      title: title.trim(),
      notes: notes.trim() || null,
      due_date: hasDate ? dueDate : null,
      due_time: hasTime && hasDate ? dueTime : null,
      priority,
      flagged: flagged ? 1 : 0,
      rrule,
      list_id: selectedListId,
      tags,
    });
    onClose();
  };

  const handleCreateSubtask = async () => {
    if (!task || !newSubtaskTitle.trim()) return;
    await onAddSubtask?.(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setNewTagInput('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: '90%',
            maxWidth: 580,
            maxHeight: '90%',
            backgroundColor: theme.card,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            ...createShadow('#000000', { width: 0, height: 6 }, 0.2, 16),
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable onPress={onClose}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text.secondary }}>
                Cancelar
              </Text>
            </Pressable>

            <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text.primary }}>
              Detalles
            </Text>

            <Pressable onPress={handleSave}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: IOS_COLORS.blue }}>
                Listo
              </Text>
            </Pressable>
          </View>

          {/* Body Scroll */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: 16 }}>
            {/* 1. Título y Notas (Estilo Agrupado iOS) */}
            <View
              style={{
                backgroundColor: theme.cardSecondary,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 8,
              }}
            >
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Título"
                placeholderTextColor={theme.text.tertiary}
                style={{ fontSize: 16, fontWeight: '700', color: theme.text.primary, padding: 0 }}
              />
              <View style={{ height: 1, backgroundColor: theme.border }} />
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Notas"
                placeholderTextColor={theme.text.tertiary}
                multiline
                numberOfLines={3}
                style={{ fontSize: 13, color: theme.text.primary, minHeight: 60, padding: 0 }}
              />
            </View>

            {/* 2. Fecha y Hora */}
            <View
              style={{
                backgroundColor: theme.cardSecondary,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 12,
              }}
            >
              {/* Fecha Toggle */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: '#FF3B30', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={15} color="#FFFFFF" />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>Fecha</Text>
                </View>
                <Switch value={hasDate} onValueChange={setHasDate} trackColor={{ false: theme.border, true: IOS_COLORS.green }} thumbColor="#FFFFFF" />
              </View>

              {hasDate && (
                <TextInput
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    padding: 10,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: '700',
                    color: theme.text.primary,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                />
              )}

              {/* Hora Toggle */}
              {hasDate && (
                <>
                  <View style={{ height: 1, backgroundColor: theme.border }} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: IOS_COLORS.blue, alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={15} color="#FFFFFF" />
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>Hora</Text>
                    </View>
                    <Switch value={hasTime} onValueChange={setHasTime} trackColor={{ false: theme.border, true: IOS_COLORS.blue }} thumbColor="#FFFFFF" />
                  </View>

                  {hasTime && (
                    <TextInput
                      value={dueTime}
                      onChangeText={setDueTime}
                      placeholder="HH:mm (ej. 14:30)"
                      placeholderTextColor={theme.text.tertiary}
                      style={{
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        padding: 10,
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: '700',
                        color: theme.text.primary,
                        borderWidth: 1,
                        borderColor: theme.border,
                      }}
                    />
                  )}
                </>
              )}
            </View>

            {/* 3. Recurrencia */}
            <View
              style={{
                backgroundColor: theme.cardSecondary,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: IOS_COLORS.purple, alignItems: 'center', justifyContent: 'center' }}>
                  <Repeat size={15} color="#FFFFFF" />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>Repetición</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {RECURRENCE_PRESETS.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setRRule(p.rrule)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: rrule === p.rrule ? IOS_COLORS.purple : (isDark ? '#1C1C1E' : '#FFFFFF'),
                      borderWidth: 1,
                      borderColor: rrule === p.rrule ? IOS_COLORS.purple : theme.border,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: rrule === p.rrule ? '#FFFFFF' : theme.text.primary }}>
                      {p.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* 4. Prioridad y Flag */}
            <View
              style={{
                backgroundColor: theme.cardSecondary,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>Prioridad</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['none', 'low', 'medium', 'high'] as Priority[]).map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setPriority(p)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 7,
                        backgroundColor: priority === p ? (isDark ? '#3A3A3C' : '#FFFFFF') : 'transparent',
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
                        {p === 'high' ? 'P1' : p === 'medium' ? 'P5' : p === 'low' ? 'P9' : 'None'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: theme.border }} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: IOS_COLORS.orange, alignItems: 'center', justifyContent: 'center' }}>
                    <Flag size={15} color="#FFFFFF" fill="#FFFFFF" />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>Con marca (Flag)</Text>
                </View>
                <Switch value={flagged} onValueChange={setFlagged} trackColor={{ false: theme.border, true: IOS_COLORS.orange }} thumbColor="#FFFFFF" />
              </View>
            </View>

            {/* 5. Subtareas */}
            {task && (
              <View
                style={{
                  backgroundColor: theme.cardSecondary,
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                    Subtareas ({subtasks.filter((s) => s.is_completed).length}/{subtasks.length})
                  </Text>
                </View>

                {subtasks.map((sub) => (
                  <Pressable
                    key={sub.id}
                    onPress={() => onToggleSubtask?.(sub.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                      padding: 8,
                      borderRadius: 8,
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        borderWidth: 1.5,
                        borderColor: sub.is_completed ? IOS_COLORS.blue : theme.text.tertiary,
                        backgroundColor: sub.is_completed ? IOS_COLORS.blue : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {sub.is_completed ? <CheckCircle2 size={12} color="#FFFFFF" /> : null}
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: sub.is_completed ? theme.text.tertiary : theme.text.primary,
                        textDecorationLine: sub.is_completed ? 'line-through' : 'none',
                        flex: 1,
                      }}
                    >
                      {sub.title}
                    </Text>
                  </Pressable>
                ))}

                {/* Añadir subtarea */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <CornerDownRight size={14} color={theme.text.tertiary} />
                  <TextInput
                    value={newSubtaskTitle}
                    onChangeText={setNewSubtaskTitle}
                    placeholder="Añadir subtarea..."
                    placeholderTextColor={theme.text.tertiary}
                    onSubmitEditing={handleCreateSubtask}
                    style={{
                      flex: 1,
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      fontSize: 12,
                      color: theme.text.primary,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  />
                  {newSubtaskTitle.trim().length > 0 && (
                    <Pressable
                      onPress={handleCreateSubtask}
                      style={{
                        backgroundColor: IOS_COLORS.blue,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>Añadir</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}

            {/* 6. Lista Destino */}
            <View
              style={{
                backgroundColor: theme.cardSecondary,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 10,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>Lista</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {lists.map((l) => (
                  <Pressable
                    key={l.id}
                    onPress={() => setSelectedListId(l.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: selectedListId === l.id ? `${l.color || '#007AFF'}25` : (isDark ? '#1C1C1E' : '#FFFFFF'),
                      borderWidth: 1,
                      borderColor: selectedListId === l.id ? l.color || '#007AFF' : theme.border,
                      gap: 6,
                    }}
                  >
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: l.color || '#007AFF' }} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: selectedListId === l.id ? l.color || '#007AFF' : theme.text.primary }}>
                      {l.title}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* 7. Botón Eliminar Recordatorio */}
            {task && onDelete && (
              <Pressable
                onPress={async () => {
                  await onDelete(task.id);
                  onClose();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 59, 48, 0.15)',
                  gap: 6,
                }}
              >
                <Trash2 size={16} color={IOS_COLORS.red} />
                <Text style={{ fontSize: 14, fontWeight: '800', color: IOS_COLORS.red }}>
                  Eliminar recordatorio
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
