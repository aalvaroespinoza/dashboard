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
  Plus,
  Sparkles,
  Zap,
  Clock,
  Calendar,
  Bell,
  Heart,
  Check,
  Flame,
} from 'lucide-react-native';
import { HabitCategory, HabitItem, HabitType } from '../../../types';
import { useHabitsStore } from '../stores/useHabitsStore';
import { GritNewCategoryModal, GRIT_COLOR_PALETTE } from './GritNewCategoryModal';
import { AppleEmoji } from '../../../components/ui/AppleEmoji';
import { AppleEmojiPickerModal } from '../../../components/ui/AppleEmojiPickerModal';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

export const HABIT_EMOJI_GROUPS = [
  {
    title: 'Mente & Foco',
    emojis: ['🎯', '📚', '💻', '🧠', '✍️', '⚡', '🔬', '💡'],
  },
  {
    title: 'Salud & Deporte',
    emojis: ['🚴‍♂️', '🏃‍♂️', '🧘‍♂️', '🧖‍♂️', '💪', '🏊‍♂️', '🥗', '🍎'],
  },
  {
    title: 'Rutinas & Bienestar',
    emojis: ['🌿', '💧', '🧹', '🚿', '🌅', '🌙', '🪥', '📖'],
  },
  {
    title: 'Social & Vínculos',
    emojis: ['🧡', '🍕', '💑', '☕', '🎸', '🐶', '🍿', '🎉'],
  },
];

const DAYS_MAP = [
  { index: 1, label: 'L' },
  { index: 2, label: 'M' },
  { index: 3, label: 'X' },
  { index: 4, label: 'J' },
  { index: 5, label: 'V' },
  { index: 6, label: 'S' },
  { index: 0, label: 'D' },
];

const TIMER_PRESETS = [15, 30, 45, 60, 90, 120];
const COUNTER_UNITS = ['min', 'litros', 'km', 'páginas', 'vasos', 'repeticiones', 'veces'];
const POINTS_PRESETS = [10, 15, 20, 30, 35, 50];

interface GritHabitEditorModalProps {
  visible: boolean;
  initialHabit?: HabitItem | null;
  onClose: () => void;
  isDark?: boolean;
}

export const GritHabitEditorModal: React.FC<GritHabitEditorModalProps> = ({
  visible,
  initialHabit,
  onClose,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { categories, createHabit, updateHabit } = useHabitsStore();

  const isEditing = Boolean(initialHabit);

  // Form State
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [color, setColor] = useState(GRIT_COLOR_PALETTE[0]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || 'cat-body');
  const [type, setType] = useState<HabitType>('timer');
  const [targetValue, setTargetValue] = useState('30');
  const [targetUnit, setTargetUnit] = useState('min');
  const [frequency, setFrequency] = useState('Cada día');
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:30');
  const [points, setPoints] = useState(20);
  const [motivation, setMotivation] = useState('');

  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Load habit when editing or reset when creating
  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setEmoji(initialHabit.icon || '🎯');
      setColor(initialHabit.color || GRIT_COLOR_PALETTE[0]);
      setSelectedCategoryId(initialHabit.category_id || categories[0]?.id || 'cat-body');
      setType(initialHabit.type);
      setTargetValue(initialHabit.target_value.toString());
      setTargetUnit(initialHabit.target_unit || 'min');
      setFrequency(initialHabit.frequency || 'Cada día');
      setActiveDays(initialHabit.days_of_week || [0, 1, 2, 3, 4, 5, 6]);
      setHasReminder(Boolean(initialHabit.reminder_time));
      setReminderTime(initialHabit.reminder_time || '08:30');
      setPoints(initialHabit.points || 20);
      setMotivation(initialHabit.motivation || '');
    } else {
      setTitle('');
      setEmoji('🎯');
      setColor(GRIT_COLOR_PALETTE[0]);
      setSelectedCategoryId(categories[0]?.id || 'cat-body');
      setType('timer');
      setTargetValue('30');
      setTargetUnit('min');
      setFrequency('Cada día');
      setActiveDays([0, 1, 2, 3, 4, 5, 6]);
      setHasReminder(false);
      setReminderTime('08:30');
      setPoints(20);
      setMotivation('');
    }
  }, [initialHabit, visible]);

  const toggleDay = (dayIdx: number) => {
    if (activeDays.includes(dayIdx)) {
      if (activeDays.length > 1) {
        setActiveDays(activeDays.filter((d) => d !== dayIdx));
      }
    } else {
      setActiveDays([...activeDays, dayIdx]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    const parsedTarget = parseFloat(targetValue) || 1;
    const finalFreq =
      activeDays.length === 7
        ? 'Cada día'
        : activeDays.length === 5 && !activeDays.includes(0) && !activeDays.includes(6)
        ? 'Entre semana'
        : `${activeDays.length} días por semana`;

    if (isEditing && initialHabit) {
      await updateHabit(initialHabit.id, {
        title: title.trim(),
        icon: emoji,
        color,
        category_id: selectedCategoryId,
        type,
        target_value: parsedTarget,
        target_unit: type === 'timer' ? 'min' : targetUnit.trim() || 'veces',
        frequency: finalFreq,
        days_of_week: activeDays,
        reminder_time: hasReminder ? reminderTime : null,
        points,
        motivation: motivation.trim() || null,
      });
    } else {
      await createHabit({
        id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        category_id: selectedCategoryId,
        title: title.trim(),
        type,
        target_value: parsedTarget,
        target_unit: type === 'timer' ? 'min' : targetUnit.trim() || 'veces',
        frequency: finalFreq,
        color,
        icon: emoji,
        points,
        streak_count: 0,
        days_of_week: activeDays,
        reminder_time: hasReminder ? reminderTime : null,
        motivation: motivation.trim() || null,
        is_archived: 0,
      });
    }

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <View
          style={{
            width: '95%',
            maxWidth: 620,
            maxHeight: '90%',
            backgroundColor: theme.card,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            ...createShadow('#000000', { width: 0, height: 8 }, 0.35, 24),
          }}
        >
          {/* 1. Header Fijo */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 22,
              paddingVertical: 18,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}
          >
            <View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.4 }}>
                {isEditing ? 'Editar Hábito' : 'Nuevo Hábito Grit'}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                Configuración avanzada y gamificación
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* 2. Formulario Scrolleable (Grouped Inset) */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 22, gap: 20 }}
          >
            {/* SECCIÓN 1: Identidad & Visual */}
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                1. Identidad & Estilo
              </Text>

              {/* Nombre y Emoji */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  onPress={() => setIsEmojiPickerOpen(true)}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    backgroundColor: `${color}25`,
                    borderWidth: 2,
                    borderColor: color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppleEmoji emoji={emoji} size={30} />
                </Pressable>

                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Nombre del hábito (ej. Meditación matutina)"
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    fontWeight: '700',
                    color: theme.text.primary,
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                />
              </View>

              {/* Selector de Emojis Agrupados */}
              <View style={{ backgroundColor: theme.cardSecondary, borderRadius: 16, padding: 12, gap: 8, borderWidth: 1, borderColor: theme.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                    Elige un icono temático:
                  </Text>
                  <Pressable
                    onPress={() => setIsEmojiPickerOpen(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 149, 0, 0.16)',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 8,
                      gap: 4,
                    }}
                  >
                    <Sparkles size={11} color="#FF9500" />
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#FF9500' }}>
                      Más Emojis
                    </Text>
                  </Pressable>
                </View>
                {HABIT_EMOJI_GROUPS.map((grp) => (
                  <View key={grp.title} style={{ gap: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: theme.text.tertiary }}>
                      {grp.title}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                      {grp.emojis.map((em) => (
                        <Pressable
                          key={em}
                          onPress={() => setEmoji(em)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: emoji === em ? `${color}40` : 'transparent',
                            borderWidth: emoji === em ? 2 : 0,
                            borderColor: color,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <AppleEmoji emoji={em} size={20} />
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ))}
              </View>

              {/* Paleta de 12 Colores Grit */}
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                  Color oficial Grit:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {GRIT_COLOR_PALETTE.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setColor(c)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: c,
                        borderWidth: color === c ? 3.5 : 0,
                        borderColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* Selector de Categoría */}
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                    Categoría:
                  </Text>
                  <Pressable
                    onPress={() => setIsNewCategoryModalOpen(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={12} color="#FF9500" />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#FF9500' }}>
                      Nueva Categoría
                    </Text>
                  </Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => setSelectedCategoryId(cat.id)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 12,
                          backgroundColor: isSelected ? `${cat.color}25` : theme.cardSecondary,
                          borderWidth: 1.5,
                          borderColor: isSelected ? cat.color : theme.border,
                          gap: 6,
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: isSelected ? cat.color : theme.text.primary }}>
                          {cat.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* SECCIÓN 2: Tipo & Meta */}
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                2. Tipo de Seguimiento & Meta
              </Text>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'timer', label: '⏱️ Cronómetro' },
                  { id: 'counter', label: '🔢 Contador' },
                  { id: 'check', label: '✓ Simple Check' },
                ].map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => {
                      setType(t.id as HabitType);
                      if (t.id === 'timer') {
                        setTargetUnit('min');
                      }
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      backgroundColor: type === t.id ? color : theme.cardSecondary,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: type === t.id ? color : theme.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '900',
                        color: type === t.id ? '#FFFFFF' : theme.text.primary,
                      }}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Ajuste de Meta según tipo */}
              {type === 'timer' && (
                <View style={{ gap: 8, backgroundColor: theme.cardSecondary, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                    Meta diaria en minutos:
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {TIMER_PRESETS.map((mins) => (
                      <Pressable
                        key={mins}
                        onPress={() => setTargetValue(mins.toString())}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 10,
                          backgroundColor: targetValue === mins.toString() ? color : theme.card,
                          borderWidth: 1,
                          borderColor: targetValue === mins.toString() ? color : theme.border,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '800', color: targetValue === mins.toString() ? '#FFFFFF' : theme.text.primary }}>
                          {mins} min
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              {type === 'counter' && (
                <View style={{ gap: 10, backgroundColor: theme.cardSecondary, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                        Cantidad objetivo:
                      </Text>
                      <TextInput
                        value={targetValue}
                        onChangeText={setTargetValue}
                        keyboardType="numeric"
                        style={{
                          fontSize: 15,
                          fontWeight: '700',
                          color: theme.text.primary,
                          backgroundColor: theme.card,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: theme.border,
                        }}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                        Unidad personalizada:
                      </Text>
                      <TextInput
                        value={targetUnit}
                        onChangeText={setTargetUnit}
                        style={{
                          fontSize: 15,
                          fontWeight: '700',
                          color: theme.text.primary,
                          backgroundColor: theme.card,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: theme.border,
                        }}
                      />
                    </View>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {COUNTER_UNITS.map((u) => (
                      <Pressable
                        key={u}
                        onPress={() => setTargetUnit(u)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 8,
                          backgroundColor: targetUnit === u ? `${color}25` : theme.card,
                          borderWidth: 1,
                          borderColor: targetUnit === u ? color : theme.border,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: targetUnit === u ? color : theme.text.secondary }}>
                          {u}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* SECCIÓN 3: Días de la Semana */}
            <View style={{ gap: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                3. Días Activos de la Semana
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
                {DAYS_MAP.map((d) => {
                  const isDayActive = activeDays.includes(d.index);
                  return (
                    <Pressable
                      key={d.index}
                      onPress={() => toggleDay(d.index)}
                      style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: isDayActive ? color : theme.cardSecondary,
                        borderWidth: 1.5,
                        borderColor: isDayActive ? color : theme.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '900',
                          color: isDayActive ? '#FFFFFF' : theme.text.secondary,
                        }}
                      >
                        {d.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Atajos Rápidos */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => setActiveDays([0, 1, 2, 3, 4, 5, 6])}
                  style={{
                    backgroundColor: activeDays.length === 7 ? `${color}25` : theme.cardSecondary,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: activeDays.length === 7 ? color : theme.border,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: activeDays.length === 7 ? color : theme.text.secondary }}>
                    Todos los días
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setActiveDays([1, 2, 3, 4, 5])}
                  style={{
                    backgroundColor: activeDays.length === 5 && !activeDays.includes(0) && !activeDays.includes(6) ? `${color}25` : theme.cardSecondary,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: activeDays.length === 5 && !activeDays.includes(0) && !activeDays.includes(6) ? color : theme.border,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                    Entre semana (L-V)
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setActiveDays([6, 0])}
                  style={{
                    backgroundColor: activeDays.length === 2 && activeDays.includes(6) && activeDays.includes(0) ? `${color}25` : theme.cardSecondary,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                    Fines de semana
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* SECCIÓN 4: Recordatorios & Notificaciones */}
            <View style={{ gap: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                4. Recordatorio Diario
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: theme.cardSecondary,
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Bell size={18} color={hasReminder ? '#FF9500' : theme.text.secondary} />
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary }}>
                      Alarma Local
                    </Text>
                    <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                      Notificación en el horario elegido
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {hasReminder && (
                    <TextInput
                      value={reminderTime}
                      onChangeText={setReminderTime}
                      placeholder="08:30"
                      placeholderTextColor={theme.text.tertiary}
                      style={{
                        fontSize: 14,
                        fontWeight: '800',
                        color: theme.text.primary,
                        backgroundColor: theme.card,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: theme.border,
                        width: 70,
                        textAlign: 'center',
                      }}
                    />
                  )}
                  <Switch
                    value={hasReminder}
                    onValueChange={setHasReminder}
                    trackColor={{ false: theme.border, true: '#34C759' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            </View>

            {/* SECCIÓN 5: Puntos & Motivación */}
            <View style={{ gap: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                5. Gamificación & Propósito
              </Text>

              {/* Puntos */}
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                  Puntos de Energía Ganados:
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {POINTS_PRESETS.map((pts) => (
                    <Pressable
                      key={pts}
                      onPress={() => setPoints(pts)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 10,
                        backgroundColor: points === pts ? '#FF9500' : theme.cardSecondary,
                        borderWidth: 1,
                        borderColor: points === pts ? '#FF9500' : theme.border,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: points === pts ? '#FFFFFF' : theme.text.primary,
                        }}
                      >
                        +{pts}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Motivación */}
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                  ¿Por qué quiero construir este hábito? (Opcional):
                </Text>
                <TextInput
                  value={motivation}
                  onChangeText={setMotivation}
                  placeholder="Escribe tu motivo principal para mantener la constancia..."
                  placeholderTextColor={theme.text.tertiary}
                  multiline
                  numberOfLines={2}
                  style={{
                    fontSize: 13,
                    color: theme.text.primary,
                    backgroundColor: theme.cardSecondary,
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                    minHeight: 50,
                  }}
                />
              </View>
            </View>
          </ScrollView>

          {/* 3. Footer Fijo con Botón Guardar */}
          <View
            style={{
              padding: 18,
              borderTopWidth: 1,
              borderTopColor: theme.border,
              backgroundColor: theme.card,
            }}
          >
            <Pressable
              onPress={handleSave}
              style={{
                backgroundColor: color,
                paddingVertical: 14,
                borderRadius: 18,
                alignItems: 'center',
                ...createShadow(color, { width: 0, height: 4 }, 0.35, 10),
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#FFFFFF' }}>
                {isEditing ? 'Guardar Cambios' : 'Crear Hábito'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Modal para Crear Categoría en Línea */}
      <GritNewCategoryModal
        visible={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onCategoryCreated={(catId) => setSelectedCategoryId(catId)}
        isDark={isDark}
      />

      {/* Modal para Seleccionar Cualquier Emoji Apple */}
      <AppleEmojiPickerModal
        visible={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onSelectEmoji={(selected) => setEmoji(selected)}
        isDark={isDark}
      />
    </Modal>
  );
};
