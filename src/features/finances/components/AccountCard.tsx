import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FinanceAccount } from '../../../types';
import { IOS_COLORS, IOS_FONTS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';
import { AppleEmoji } from '../../../components/ui/AppleEmoji';

interface AccountCardProps {
  account: FinanceAccount;
  isSelected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  isDark?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  isSelected,
  onPress,
  onLongPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const balance = account.current_balance ?? account.initial_balance ?? 0;
  const isNegative = balance < 0;

  const typeLabels: Record<string, string> = {
    cash: 'Efectivo',
    debit: 'Débito',
    credit: 'Crédito',
    savings: 'Billetera',
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.97 : 1 }],
        opacity: pressed ? 0.85 : 1,
        width: 190,
        backgroundColor: isSelected
          ? isDark
            ? 'rgba(0, 122, 255, 0.18)'
            : 'rgba(0, 122, 255, 0.12)'
          : theme.card,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1.5,
        borderColor: isSelected
          ? account.color || '#007AFF'
          : isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : '#E5E5EA',
        borderLeftWidth: 4,
        borderLeftColor: account.color || '#007AFF',
        gap: 12,
        ...createShadow('#000000', { width: 0, height: 4 }, isDark ? 0.2 : 0.04, 8),
      })}
    >
      {/* Top: Icono + Badge Tipo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppleEmoji emoji={account.icon || '💳'} size={20} />
        </View>

        <View
          style={{
            backgroundColor: `${account.color}20`,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '800', color: account.color || '#007AFF', textTransform: 'uppercase' }}>
            {typeLabels[account.type] || account.type}
          </Text>
        </View>
      </View>

      {/* Medio & Abajo: Nombre y Saldo */}
      <View style={{ gap: 2 }}>
        <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
          {account.name}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 20,
            fontFamily: IOS_FONTS.roundedHeavy,
            color: isNegative ? '#FF3B30' : theme.text.primary,
            letterSpacing: -0.5,
            fontVariant: ['tabular-nums'],
          }}
        >
          ${balance.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </Text>
      </View>
    </Pressable>
  );
};
