/**
 * CreateReminderModal.tsx
 * Modal Flotante iPadOS de Creación de Recordatorios.
 *
 * Características:
 * 1. Diseñado ergonómicamente para tablet con KeyboardAvoidingView en la mitad superior.
 * 2. Auto-enfoque en el título para escritura inmediata.
 * 3. Selector visual de listas y secciones destino.
 * 4. Píldoras de fecha rápida (Hoy, Mañana, Fin de semana) y prioridades (P1, P5, P9).
 * 5. Banderines y etiquetas (#tags).
 * 6. Persistencia instantánea en SQLite y Zustand con animación spring.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Calendar,
  Clock,
  Flag,
  Tag,
  Folder,
  Plus,
  Check,
  AlignLeft,
  ChevronDown,
} from 'lucide-react-native';
import { Priority, TaskList, ListSection } from '../../../types';
import { IOS_COLORS, IOS_FONTS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { ListIconRenderer } from '../../../components/ui/ListIconRenderer';
import { IOSDateTimePicker } from '../../../components/ui/IOSDateTimePicker';

interface CreateReminderModalProps {
  visible: boolean;
  onClose: () => void;
  lists: TaskList[];
  sections?: Record<string, ListSection[]> | ListSection[];
  defaultListId?: string | null;
  defaultSectionId?: string | null;
  defaultDueDate?: string | null;
  defaultPriority?: Priority;
  defaultFlagged?: boolean;
  onAddTask: (task: {
    title: string;
    list_id: string;
    section_id?: string | null;
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

export const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  visible,
  onClose,
  lists,
  sections,
  defaultListId,
  defaultSectionId,
  defaultDueDate,
  defaultPriority = 'none',
  defaultFlagged = false,
  onAddTask,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('none');
  const [flagged, setFlagged] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isTagsInputVisible, setIsTagsInputVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Inicializar estado cuando se abre el modal
  useEffect(() => {
    if (visible) {
      setTitle('');
      setNotes('');
      const targetList = defaultListId || lists[0]?.id || '';
      setSelectedListId(targetList);
      setSelectedSectionId(defaultSectionId || null);
      setDueDate(defaultDueDate || null);
      setDueTime(null);
      setPriority(defaultPriority);
      setFlagged(defaultFlagged);
      setTags([]);
      setNewTagInput('');
      setIsTagsInputVisible(false);
      setIsSubmitting(false);
    }
  }, [visible, defaultListId, defaultSectionId, defaultDueDate, defaultPriority, defaultFlagged, lists]);

  const activeListObj = lists.find((l) => l.id === selectedListId) || lists[0];
  const listSections: ListSection[] = React.useMemo(() => {
    if (!sections) return [];
    if (Array.isArray(sections)) {
      return sections.filter((s) => s.list_id === selectedListId);
    }
    return sections[selectedListId] || [];
  }, [sections, selectedListId]);

  const handleCreate = async () => {
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        list_id: selectedListId || lists[0]?.id || 'list-default',
        section_id: selectedSectionId,
        due_date: dueDate || undefined,
        due_time: dueTime || undefined,
        priority,
        flagged: flagged ? 1 : 0,
        tags: tags.length > 0 ? tags : undefined,
      });
      onClose();
    } catch (e) {
      console.error('Error al crear recordatorio:', e);
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.65)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: '92%',
            maxWidth: 540,
            maxHeight: '88%',
            backgroundColor: theme.card,
            borderRadius: 24,
            padding: 22,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 16,
            ...createShadow('#000000', { width: 0, height: 8 }, isDark ? 0.35 : 0.08, 20),
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: activeListObj?.color || IOS_COLORS.blue,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ListIconRenderer icon={activeListObj?.icon} size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={{ fontSize: 18, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  Nuevo Recordatorio
                </Text>
                <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                  Guardar en {activeListObj?.title || 'Lista'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.border,
              })}
            >
              <X size={17} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Formulario con Scroll */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingBottom: 6 }}
          >
            {/* Input de Título */}
            <View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Título del recordatorio..."
                placeholderTextColor={theme.text.tertiary}
                autoFocus
                onSubmitEditing={handleCreate}
                returnKeyType="done"
                style={{
                  backgroundColor: theme.cardSecondary,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 14,
                  fontSize: 16,
                  fontFamily: IOS_FONTS.semibold,
                  color: theme.text.primary,
                  borderWidth: 1,
                  borderColor: title.trim().length > 0 ? (activeListObj?.color || '#007AFF') : theme.border,
                }}
              />
            </View>

            {/* Input de Notas / Descripción */}
            <View>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Notas o descripción adicional (opcional)..."
                placeholderTextColor={theme.text.tertiary}
                multiline
                numberOfLines={2}
                style={{
                  backgroundColor: theme.cardSecondary,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  fontSize: 13,
                  fontFamily: IOS_FONTS.regular,
                  color: theme.text.primary,
                  borderWidth: 1,
                  borderColor: theme.border,
                  minHeight: 56,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            {/* 1. Selector de Lista Destino */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Lista Destino
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {lists.map((l) => {
                  const isSelected = selectedListId === l.id;
                  return (
                    <Pressable
                      key={l.id}
                      onPress={() => {
                        setSelectedListId(l.id);
                        setSelectedSectionId(null);
                      }}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.8 : 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 10,
                        backgroundColor: isSelected ? `${l.color || '#007AFF'}22` : theme.cardSecondary,
                        borderWidth: 1.5,
                        borderColor: isSelected ? (l.color || '#007AFF') : theme.border,
                        gap: 6,
                      })}
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
                          fontSize: 12,
                          fontFamily: isSelected ? IOS_FONTS.bold : IOS_FONTS.semibold,
                          color: isSelected ? (l.color || '#007AFF') : theme.text.primary,
                        }}
                      >
                        {l.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Selector de Sección si la lista tiene secciones */}
            {listSections.length > 0 && (
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Sección
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  <Pressable
                    onPress={() => setSelectedSectionId(null)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                      backgroundColor: selectedSectionId === null ? (isDark ? '#3A3A3C' : '#E5E5EA') : theme.cardSecondary,
                      borderWidth: 1,
                      borderColor: selectedSectionId === null ? theme.border : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                      Sin sección
                    </Text>
                  </Pressable>
                  {listSections.map((sec) => {
                    const isSelected = selectedSectionId === sec.id;
                    return (
                      <Pressable
                        key={sec.id}
                        onPress={() => setSelectedSectionId(sec.id)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 8,
                          backgroundColor: isSelected ? 'rgba(0, 122, 255, 0.2)' : theme.cardSecondary,
                          borderWidth: 1,
                          borderColor: isSelected ? '#007AFF' : theme.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: isSelected ? IOS_FONTS.bold : IOS_FONTS.semibold,
                            color: isSelected ? '#007AFF' : theme.text.secondary,
                          }}
                        >
                          {sec.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* 2. Selector de Fecha y Hora estilo Apple Reminders */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Vencimiento
              </Text>
              <IOSDateTimePicker
                hasDate={Boolean(dueDate)}
                onToggleDate={(enabled) => {
                  if (!enabled) {
                    setDueDate(null);
                  } else if (!dueDate) {
                    setDueDate(todayStr);
                  }
                }}
                dueDate={dueDate}
                onChangeDate={(d) => setDueDate(d)}
                hasTime={Boolean(dueTime)}
                onToggleTime={(enabled) => {
                  if (!enabled) {
                    setDueTime(null);
                  } else if (!dueTime) {
                    setDueTime('09:00');
                  }
                }}
                dueTime={dueTime}
                onChangeTime={(t) => setDueTime(t)}
                accentColor={activeListObj?.color || '#007AFF'}
                isDark={isDark}
              />
            </View>

            {/* 3. Prioridad & Banderín */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Prioridad & Marca
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                {(['none', 'low', 'medium', 'high'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  const color =
                    p === 'high'
                      ? (isDark ? '#FF453A' : '#FF3B30')
                      : p === 'medium'
                      ? (isDark ? '#FF9F0A' : '#FF9500')
                      : p === 'low'
                      ? (isDark ? '#0A84FF' : '#007AFF')
                      : theme.text.secondary;
                  const label =
                    p === 'high' ? 'P1 Alta' : p === 'medium' ? 'P5 Media' : p === 'low' ? 'P9 Baja' : 'Ninguna';

                  return (
                    <Pressable
                      key={p}
                      onPress={() => setPriority(p)}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: 7,
                        borderRadius: 9,
                        backgroundColor: isSelected ? `${color}25` : theme.cardSecondary,
                        borderWidth: 1,
                        borderColor: isSelected ? color : theme.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: isSelected ? IOS_FONTS.bold : IOS_FONTS.semibold,
                          color: isSelected ? color : theme.text.secondary,
                        }}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}

                {/* Banderín (Flag) */}
                <Pressable
                  onPress={() => setFlagged(!flagged)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 9,
                    backgroundColor: flagged ? 'rgba(255, 149, 0, 0.2)' : theme.cardSecondary,
                    borderWidth: 1,
                    borderColor: flagged ? '#FF9500' : theme.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Flag
                    size={14}
                    color={flagged ? '#FF9500' : theme.text.secondary}
                    fill={flagged ? '#FF9500' : 'none'}
                  />
                </Pressable>
              </View>
            </View>

            {/* 4. Tags */}
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Etiquetas
                </Text>
                <Pressable onPress={() => setIsTagsInputVisible(!isTagsInputVisible)}>
                  <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: '#007AFF' }}>
                    {isTagsInputVisible ? 'Ocultar' : '+ Añadir Tag'}
                  </Text>
                </Pressable>
              </View>

              {isTagsInputVisible && (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TextInput
                    value={newTagInput}
                    onChangeText={setNewTagInput}
                    placeholder="Ej. Facultad, Urgente..."
                    placeholderTextColor={theme.text.tertiary}
                    onSubmitEditing={handleAddTag}
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontFamily: IOS_FONTS.regular,
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
                      backgroundColor: '#007AFF',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.bold, color: '#FFFFFF' }}>
                      Añadir
                    </Text>
                  </Pressable>
                </View>
              )}

              {tags.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {tags.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setTags(tags.filter((tag) => tag !== t))}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(50, 173, 230, 0.15)',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        gap: 4,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontFamily: IOS_FONTS.bold, color: '#32ADE6' }}>
                        #{t}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#32ADE6', fontWeight: '900' }}>×</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer: Botones de Acción */}
          <View style={{ flexDirection: 'row', gap: 10, paddingTop: 4 }}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                flex: 1,
                minHeight: 46,
                backgroundColor: theme.cardSecondary,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.border,
              })}
            >
              <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              onPress={handleCreate}
              disabled={!title.trim() || isSubmitting}
              style={({ pressed }) => ({
                opacity: pressed || !title.trim() ? 0.7 : 1,
                flex: 2,
                minHeight: 46,
                backgroundColor: title.trim() ? (activeListObj?.color || '#007AFF') : '#8E8E93',
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
              })}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={{ fontSize: 14, fontFamily: IOS_FONTS.bold, color: '#FFFFFF' }}>
                    Crear Recordatorio
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
