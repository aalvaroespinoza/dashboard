import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Repeat, Calendar, CreditCard } from 'lucide-react-native';
import { FinanceTransaction } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';
import { AppleEmoji } from '../../../components/ui/AppleEmoji';

interface RecurringPaymentItemProps {
  item: FinanceTransaction;
  onPress?: () => void;
  isDark?: boolean;
}

const RecurringPaymentItemComponent: React.FC<RecurringPaymentItemProps> = ({
  item,
  onPress,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const isInstallment = item.installments && item.installments > 1;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        backgroundColor: theme.cardSecondary,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: isInstallment
              ? 'rgba(255, 149, 0, 0.15)'
              : 'rgba(0, 122, 255, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isInstallment ? (
            <CreditCard size={18} color="#FF9500" />
          ) : (
            <Repeat size={18} color="#007AFF" />
          )}
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '800', color: theme.text.primary, flex: 1 }}>
              {item.description}
            </Text>
            {isInstallment && (
              <View
                style={{
                  backgroundColor: 'rgba(255, 149, 0, 0.15)',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '900', color: '#FF9500' }}>
                  Cuota {item.installment_current || 1}/{item.installments}
                </Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {item.account_name && (
              <Text style={{ fontSize: 11, color: theme.text.secondary, fontWeight: '600' }}>
                Cuenta: {item.account_name}
              </Text>
            )}
            {item.next_due_date && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Calendar size={11} color={theme.text.tertiary} />
                <Text style={{ fontSize: 11, color: theme.text.secondary, fontWeight: '600' }}>
                  Vence: {item.next_due_date}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: '900',
          color: item.type === 'income' ? '#34C759' : theme.text.primary,
          fontVariant: ['tabular-nums'],
        }}
      >
        ${item.amount.toLocaleString('es-AR')}
      </Text>
    </Pressable>
  );
};

export const RecurringPaymentItem = React.memo(RecurringPaymentItemComponent);
