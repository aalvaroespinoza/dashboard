import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { AccountType, FinanceAccount } from '../../../types';
import { IOSSegmentedControl } from '../../../components/ui/IOSSegmentedControl';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { AppleEmojiPickerModal } from '../../../components/ui/AppleEmojiPickerModal';
import { AppleEmoji } from '../../../components/ui/AppleEmoji';

interface NewAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (acc: {
    name: string;
    type: AccountType;
    color: string;
    icon: string;
    initial_balance: number;
  }) => Promise<void>;
  isDark?: boolean;
}

const ACCOUNT_COLORS = [
  '#007AFF', // Azul
  '#34C759', // Verde
  '#32ADE6', // Celeste
  '#FF9500', // Naranja
  '#5856D6', // Púrpura
  '#FF2D55', // Rosa
  '#FFCC00', // Ámbar
  '#8E8E93', // Gris
];

export const NewAccountModal: React.FC<NewAccountModalProps> = ({
  visible,
  onClose,
  onSave,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('debit');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [icon, setIcon] = useState('💳');
  const [initialBalance, setInitialBalance] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    const balance = parseFloat(initialBalance.replace(',', '.')) || 0;

    await onSave({
      name: name.trim(),
      type,
      color,
      icon,
      initial_balance: balance,
    });

    setName('');
    setInitialBalance('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
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
            width: '90%',
            maxWidth: 440,
            backgroundColor: theme.card,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 24,
            gap: 16,
            ...createShadow('#000000', { width: 0, height: 8 }, 0.3, 16),
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.4 }}>
              Nueva Cuenta / Billetera
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

          {/* Tipo de Cuenta */}
          <IOSSegmentedControl<AccountType>
            tabs={[
              { id: 'debit', label: 'Débito' },
              { id: 'cash', label: 'Efectivo' },
              { id: 'savings', label: 'Billetera' },
              { id: 'credit', label: 'Crédito' },
            ]}
            selectedTab={type}
            onTabChange={setType}
            isDark={isDark}
          />

          {/* Nombre & Icono */}
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Pressable
              onPress={() => setIsEmojiPickerOpen(true)}
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                backgroundColor: theme.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <AppleEmoji emoji={icon} size={26} />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>
                Nombre de la Cuenta
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ej: Mercado Pago, Galicia..."
                placeholderTextColor={theme.text.tertiary}
                style={{
                  backgroundColor: theme.cardSecondary,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: '700',
                  color: theme.text.primary,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              />
            </View>
          </View>

          {/* Saldo Inicial */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>
              Saldo Inicial ($ ARS)
            </Text>
            <TextInput
              value={initialBalance}
              onChangeText={setInitialBalance}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor={theme.text.tertiary}
              style={{
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: '800',
                color: theme.text.primary,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />
          </View>

          {/* Selector de Color */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
              Color Distintivo
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {ACCOUNT_COLORS.map((c) => {
                const isSelected = color === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: c,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: '#FFFFFF',
                    }}
                  >
                    {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Botón Crear */}
          <Pressable
            onPress={handleSave}
            style={{
              backgroundColor: color,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
              marginTop: 6,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '900', color: '#FFFFFF' }}>
              Crear Cuenta
            </Text>
          </Pressable>
        </View>
      </View>

      <AppleEmojiPickerModal
        visible={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onSelectEmoji={(em) => {
          setIcon(em);
          setIsEmojiPickerOpen(false);
        }}
        isDark={isDark}
      />
    </Modal>
  );
};
