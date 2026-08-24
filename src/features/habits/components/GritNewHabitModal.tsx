import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Plus, Sparkles, Zap } from 'lucide-react-native';
import { HabitCategory, HabitType } from '../../../types';
import { useHabitsStore } from '../stores/useHabitsStore';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface GritNewHabitModalProps {
  visible: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const GritNewHabitModal: React.FC<GritNewHabitModalProps> = ({
  visible,
  onClose,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { categories, createHabit } = useHabitsStore();

  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('⭐');
  const [type, setType] = useState<HabitType>('check');
  const [targetValue, setTargetValue] = useState('1');
  const [targetUnit, setTargetUnit] = useState('veces');
  const [frequency, setFrequency] = useState('Cada día');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || 'cat-body');
  const [points, setPoints] = useState('20');

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];
  const habitColor = selectedCategory?.color || '#FF9500';

  const handleCreate = async () => {
    if (!title.trim()) return;

    await createHabit({
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category_id: selectedCategoryId || categories[0]?.id || 'cat-body',
      title: title.trim(),
      type,
      target_value: parseFloat(targetValue) || 1,
      target_unit: targetUnit.trim() || 'min',
      frequency: frequency.trim() || 'Cada día',
      color: habitColor,
      icon: emoji.trim() || '⭐',
      points: parseInt(points, 10) || 20,
      streak_count: 0,
    });

    setTitle('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View
          style={{
            width: '90%',
            maxWidth: 500,
            backgroundColor: theme.card,
            borderRadius: 28,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 16,
            ...createShadow('#000000', { width: 0, height: 6 }, 0.25, 16),
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary }}>
              Crear Nuevo Hábito
            </Text>
            <Pressable onPress={onClose}>
              <X size={18} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Emoji + Nombre */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              value={emoji}
              onChangeText={setEmoji}
              maxLength={2}
              style={{
                width: 52,
                height: 52,
                fontSize: 26,
                textAlign: 'center',
                backgroundColor: theme.cardSecondary,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Nombre del hábito (ej. Yoga 15 min)"
              placeholderTextColor={theme.text.tertiary}
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: '700',
                color: theme.text.primary,
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />
          </View>

          {/* Categoría */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
              Categoría Grit
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {categories.map((c) => {
                const isSelected = selectedCategoryId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedCategoryId(c.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                      backgroundColor: isSelected ? `${c.color}25` : theme.cardSecondary,
                      borderWidth: 1.5,
                      borderColor: isSelected ? c.color : theme.border,
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{c.emoji}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: isSelected ? c.color : theme.text.primary }}>
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Tipo de Hábito */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
              Tipo de Seguimiento
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { id: 'check', label: '✓ Simple Check' },
                { id: 'timer', label: '⏱️ Cronómetro' },
                { id: 'counter', label: '🔢 Contador' },
              ].map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setType(t.id as HabitType)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: type === t.id ? '#FF9500' : theme.cardSecondary,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '800',
                      color: type === t.id ? '#FFFFFF' : theme.text.primary,
                    }}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Meta y Puntos */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
                Meta
              </Text>
              <TextInput
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="numeric"
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: theme.text.primary,
                  backgroundColor: theme.cardSecondary,
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
                Unidad
              </Text>
              <TextInput
                value={targetUnit}
                onChangeText={setTargetUnit}
                placeholder="min / km / L"
                placeholderTextColor={theme.text.tertiary}
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: theme.text.primary,
                  backgroundColor: theme.cardSecondary,
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
                Puntos
              </Text>
              <TextInput
                value={points}
                onChangeText={setPoints}
                keyboardType="numeric"
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: theme.text.primary,
                  backgroundColor: theme.cardSecondary,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              />
            </View>
          </View>

          {/* Frecuencia */}
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
              Frecuencia
            </Text>
            <TextInput
              value={frequency}
              onChangeText={setFrequency}
              placeholder="Cada día / Entre semana / 3 veces por semana"
              placeholderTextColor={theme.text.tertiary}
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: theme.text.primary,
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />
          </View>

          {/* Botón Crear */}
          <Pressable
            onPress={handleCreate}
            style={{
              backgroundColor: '#FF9500',
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
              marginTop: 6,
              ...createShadow('#FF9500', { width: 0, height: 4 }, 0.3, 8),
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>
              Crear Hábito
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
