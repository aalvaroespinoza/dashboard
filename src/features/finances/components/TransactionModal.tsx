import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Pressable, ScrollView } from 'react-native';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { FinanceCategory, TransactionType, PaymentMethod } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';

interface TransactionModalProps {
  visible: boolean;
  categories: FinanceCategory[];
  onClose: () => void;
  onSave: (transaction: {
    category_id: string;
    type: TransactionType;
    amount: number;
    description: string;
    payment_method: PaymentMethod;
    transaction_date: string;
  }) => Promise<void>;
  isDark?: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  visible,
  categories,
  onClose,
  onSave,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!description.trim()) return;

    const selectedCat = categoryId || (filteredCategories.length > 0 ? filteredCategories[0].id : 'cat-other');

    await onSave({
      category_id: selectedCat,
      type,
      amount: numAmount,
      description: description.trim(),
      payment_method: paymentMethod,
      transaction_date: date,
    });

    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 480,
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text.primary }}>
              Nuevo Movimiento
            </Text>
            <Pressable onPress={onClose}>
              <X size={20} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Toggle Ingreso / Gasto */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: theme.cardSecondary,
              borderRadius: 12,
              padding: 4,
              marginBottom: 16,
            }}
          >
            <Pressable
              onPress={() => setType('expense')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                borderRadius: 9,
                backgroundColor: type === 'expense' ? IOS_COLORS.red : 'transparent',
                gap: 6,
              }}
            >
              <ArrowDownLeft size={15} color={type === 'expense' ? '#FFFFFF' : theme.text.secondary} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: type === 'expense' ? '#FFFFFF' : theme.text.secondary }}>
                Gasto
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setType('income')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                borderRadius: 9,
                backgroundColor: type === 'income' ? IOS_COLORS.green : 'transparent',
                gap: 6,
              }}
            >
              <ArrowUpRight size={15} color={type === 'income' ? '#FFFFFF' : theme.text.secondary} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: type === 'income' ? '#FFFFFF' : theme.text.secondary }}>
                Ingreso
              </Text>
            </Pressable>
          </View>

          {/* Monto */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary, marginBottom: 6 }}>
            Monto ($)
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={theme.text.tertiary}
            keyboardType="numeric"
            style={{
              backgroundColor: theme.cardSecondary,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 10,
              padding: 12,
              fontSize: 18,
              fontWeight: '800',
              color: theme.text.primary,
              marginBottom: 14,
            }}
          />

          {/* Descripción */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary, marginBottom: 6 }}>
            Descripción
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Supermercado, Alquiler, Salario..."
            placeholderTextColor={theme.text.tertiary}
            style={{
              backgroundColor: theme.cardSecondary,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 10,
              padding: 12,
              fontSize: 14,
              color: theme.text.primary,
              marginBottom: 14,
            }}
          />

          {/* Categoría Selector */}
          <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary, marginBottom: 6 }}>
            Categoría
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {filteredCategories.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 8,
                    backgroundColor: categoryId === c.id ? `${c.color}25` : theme.cardSecondary,
                    borderWidth: 1,
                    borderColor: categoryId === c.id ? c.color : theme.border,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: categoryId === c.id ? c.color : theme.text.primary }}>
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Acciones */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.cardSecondary }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text.secondary }}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: IOS_COLORS.blue }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
