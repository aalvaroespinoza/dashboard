import React, { useState, useMemo } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TextInput } from 'react-native';
import { X, Search } from 'lucide-react-native';
import { AppleEmoji } from './AppleEmoji';
import { APPLE_EMOJI_CATEGORIES } from '../../utils/appleEmojiUtils';
import { IOS_COLORS } from '../../styles/theme';
import { createShadow } from '../../styles/shadows';

interface AppleEmojiPickerModalProps {
  visible: boolean;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  title?: string;
  isDark?: boolean;
}

export const AppleEmojiPickerModal: React.FC<AppleEmojiPickerModalProps> = ({
  visible,
  onSelectEmoji,
  onClose,
  title = 'Seleccionar Emoji',
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('frequently_used');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) {
      return APPLE_EMOJI_CATEGORIES;
    }
    const q = search.toLowerCase();
    return APPLE_EMOJI_CATEGORIES.map((cat) => ({
      ...cat,
      emojis: cat.emojis.filter((e) => e.includes(q) || cat.title.toLowerCase().includes(q)),
    })).filter((cat) => cat.emojis.length > 0);
  }, [search]);

  const handleSelect = (emoji: string) => {
    onSelectEmoji(emoji);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: '90%',
            maxWidth: 480,
            backgroundColor: theme.card,
            borderRadius: 24,
            borderWidth: 1,
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.8)',
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E5EA',
            borderLeftColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
            borderRightColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E5EA',
            padding: 20,
            gap: 14,
            ...createShadow('#000000', { width: 0, height: 8 }, 0.3, 16),
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 17, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.4 }}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              style={{
                padding: 6,
                borderRadius: 8,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
              }}
            >
              <X size={16} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Barra de Búsqueda */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.cardSecondary,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 8,
            }}
          >
            <Search size={15} color={theme.text.tertiary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar emoji..."
              placeholderTextColor={theme.text.tertiary}
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: '600',
                color: theme.text.primary,
                padding: 0,
              }}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <X size={14} color={theme.text.tertiary} />
              </Pressable>
            )}
          </View>

          {/* Cuadrícula de Emojis por Categoría */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 340 }}
            contentContainerStyle={{ gap: 16 }}
          >
            {filteredCategories.map((category) => (
              <View key={category.id} style={{ gap: 8 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: theme.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {category.title}
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {category.emojis.map((emoji, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => handleSelect(emoji)}
                      style={({ pressed }) => ({
                        transform: [{ scale: pressed ? 0.88 : 1 }],
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: isDark ? '#242426' : '#F2F2F7',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#E5E5EA',
                      })}
                    >
                      <AppleEmoji emoji={emoji} size={28} />
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
