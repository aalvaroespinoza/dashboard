import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Plus, Sparkles } from 'lucide-react-native';
import { useHabitsStore } from '../stores/useHabitsStore';
import { AppleEmoji } from '../../../components/ui/AppleEmoji';
import { AppleEmojiPickerModal } from '../../../components/ui/AppleEmojiPickerModal';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

export const GRIT_COLOR_PALETTE = [
  '#34C759', // Verde Esmeralda
  '#30D158', // Verde Menta
  '#007AFF', // Azul Eléctrico
  '#32ADE6', // Cian / Celeste
  '#5856D6', // Índigo
  '#AF52DE', // Púrpura
  '#FF2D55', // Rosa / Magenta
  '#FF3B30', // Rojo Coral
  '#FF9500', // Naranja
  '#FFCC00', // Amarillo Ámbar
  '#A2845E', // Marrón Tierra
  '#8E8E93', // Gris Grafito
];

export const CATEGORY_EMOJIS = ['🌿', '💧', '🧡', '🎯', '🧠', '⚡', '🌙', '🏃‍♂️', '📚', '🎨', '💼', '🧘‍♂️'];

interface GritNewCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoryCreated?: (categoryId: string) => void;
  isDark?: boolean;
}

export const GritNewCategoryModal: React.FC<GritNewCategoryModalProps> = ({
  visible,
  onClose,
  onCategoryCreated,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const { createCategory } = useHabitsStore();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌿');
  const [color, setColor] = useState(GRIT_COLOR_PALETTE[0]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    const created = await createCategory(name.trim(), emoji, color);
    setName('');
    if (onCategoryCreated) {
      onCategoryCreated(created.id);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View
          style={{
            width: '90%',
            maxWidth: 440,
            backgroundColor: theme.card,
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 18,
            ...createShadow('#000000', { width: 0, height: 6 }, 0.25, 16),
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary }}>
              Nueva Categoría Grit
            </Text>
            <Pressable onPress={onClose}>
              <X size={18} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Emoji + Nombre */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => setIsEmojiPickerOpen(true)}
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                backgroundColor: `${color}25`,
                borderWidth: 1.5,
                borderColor: color,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppleEmoji emoji={emoji} size={28} />
            </Pressable>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nombre (ej. Mente y Lectura)"
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

          {/* Selector de Emoji */}
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                Elige un Emoji
              </Text>
              <Pressable
                onPress={() => setIsEmojiPickerOpen(true)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Sparkles size={11} color="#FF9500" />
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#FF9500' }}>
                  Más Emojis
                </Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CATEGORY_EMOJIS.map((em) => (
                <Pressable
                  key={em}
                  onPress={() => setEmoji(em)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: emoji === em ? `${color}30` : theme.cardSecondary,
                    borderWidth: emoji === em ? 2 : 1,
                    borderColor: emoji === em ? color : theme.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppleEmoji emoji={em} size={20} />
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Selector de Color */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
              Color Temático
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {GRIT_COLOR_PALETTE.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: c,
                    borderWidth: color === c ? 2.5 : 0,
                    borderColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              ))}
            </View>
          </View>

          {/* Botón Crear */}
          <Pressable
            onPress={handleCreate}
            style={{
              backgroundColor: color,
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
              ...createShadow(color, { width: 0, height: 4 }, 0.3, 8),
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>
              Crear Categoría
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Selector Universal de Emojis de Apple */}
      <AppleEmojiPickerModal
        visible={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onSelectEmoji={(selected) => setEmoji(selected)}
        isDark={isDark}
      />
    </Modal>
  );
};
