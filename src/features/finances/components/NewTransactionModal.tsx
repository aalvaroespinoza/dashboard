import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { X, DollarSign, Tag, CreditCard, Calendar, Repeat } from 'lucide-react-native';
import { FinanceCategory, FinanceAccount, TransactionType, PaymentMethod } from '../../../types';
import { IOSSegmentedControl } from '../../../components/ui/IOSSegmentedControl';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface NewTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tx: {
    category_id: string;
    account_id?: string | null;
    type: TransactionType;
    amount: number;
    description: string;
    payment_method: PaymentMethod;
    transaction_date: string;
    installments?: number;
    installment_current?: number;
    is_recurring?: number;
    recurring_day?: number | null;
    next_due_date?: string | null;
    notes?: string | null;
  }) => Promise<void>;
  categories: FinanceCategory[];
  accounts: FinanceAccount[];
  isDark?: boolean;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  visible,
  onClose,
  onSave,
  categories,
  accounts,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id || null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debit');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  // Cuotas y Recurrencia
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState('3');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState('10');
  const [notes, setNotes] = useState('');

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSave = async () => {
    if (!description.trim() || !amount.trim()) return;
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) return;

    await onSave({
      category_id: categoryId || categories[0]?.id || 'cat-general',
      account_id: accountId,
      type,
      amount: numAmount,
      description: description.trim(),
      payment_method: paymentMethod,
      transaction_date: transactionDate,
      installments: isInstallment ? parseInt(installments, 10) || 1 : 1,
      installment_current: 1,
      is_recurring: isRecurring ? 1 : 0,
      recurring_day: isRecurring ? parseInt(recurringDay, 10) || 1 : null,
      next_due_date: isRecurring ? `${transactionDate.substring(0, 8)}${recurringDay.padStart(2, '0')}` : null,
      notes: notes.trim() || null,
    });

    // Reset
    setAmount('');
    setDescription('');
    setIsInstallment(false);
    setIsRecurring(false);
    setNotes('');
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
            maxWidth: 520,
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
              Nueva Transacción
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

          {/* Tipo: Gasto / Ingreso */}
          <IOSSegmentedControl<TransactionType>
            tabs={[
              { id: 'expense', label: 'Gasto / Egreso' },
              { id: 'income', label: 'Ingreso' },
            ]}
            selectedTab={type}
            onTabChange={(t) => {
              setType(t);
              const firstCat = categories.find((c) => c.type === t);
              if (firstCat) setCategoryId(firstCat.id);
            }}
            isDark={isDark}
          />

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }} contentContainerStyle={{ gap: 14 }}>
            {/* Monto & Descripción */}
            <View style={{ gap: 10 }}>
              <View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>
                  Monto ($ ARS)
                </Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderRadius: 14,
                    fontSize: 22,
                    fontWeight: '900',
                    color: type === 'income' ? '#34C759' : '#FF3B30',
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 4 }}>
                  Concepto / Descripción
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ej: Boleto colectivo, Supermercado, Sueldo..."
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    backgroundColor: theme.cardSecondary,
                    paddingHorizontal: 14,
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

            {/* Cuenta de Origen */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                Cuenta de Origen / Destino
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {accounts.map((acc) => {
                  const isSelected = accountId === acc.id;
                  return (
                    <Pressable
                      key={acc.id}
                      onPress={() => setAccountId(acc.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        backgroundColor: isSelected
                          ? acc.color
                          : isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : '#F2F2F7',
                        borderWidth: 1,
                        borderColor: isSelected ? acc.color : theme.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: isSelected ? '#FFFFFF' : theme.text.primary,
                        }}
                      >
                        {acc.icon} {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Categorías */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                Categoría
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 10,
                        backgroundColor: isSelected
                          ? cat.color
                          : isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : '#F2F2F7',
                        borderWidth: 1,
                        borderColor: isSelected ? cat.color : theme.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: isSelected ? '#FFFFFF' : theme.text.primary,
                        }}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Opciones Avanzadas: Cuotas y Recurrencia */}
            <View style={{ backgroundColor: theme.cardSecondary, padding: 14, borderRadius: 14, gap: 12, borderWidth: 1, borderColor: theme.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.primary }}>
                    Pago en Cuotas
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                    Dividir en cuotas mensuales fijas
                  </Text>
                </View>
                <Switch
                  value={isInstallment}
                  onValueChange={setIsInstallment}
                  trackColor={{ false: theme.border, true: '#FF9500' }}
                />
              </View>

              {isInstallment && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                    Cantidad de cuotas:
                  </Text>
                  <TextInput
                    value={installments}
                    onChangeText={setInstallments}
                    keyboardType="numeric"
                    style={{
                      backgroundColor: theme.card,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      width: 60,
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: '800',
                      color: theme.text.primary,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  />
                </View>
              )}

              <View style={{ height: 1, backgroundColor: theme.border }} />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text.primary }}>
                    Gasto Fijo / Recurrente
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.text.secondary }}>
                    Suscripción, alquiler o servicio mensual
                  </Text>
                </View>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: theme.border, true: '#007AFF' }}
                />
              </View>

              {isRecurring && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                    Día de vencimiento:
                  </Text>
                  <TextInput
                    value={recurringDay}
                    onChangeText={setRecurringDay}
                    keyboardType="numeric"
                    placeholder="1-31"
                    style={{
                      backgroundColor: theme.card,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      width: 60,
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: '800',
                      color: theme.text.primary,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  />
                </View>
              )}
            </View>
          </ScrollView>

          {/* Botón Guardar */}
          <Pressable
            onPress={handleSave}
            style={{
              backgroundColor: type === 'income' ? '#34C759' : '#007AFF',
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '900', color: '#FFFFFF' }}>
              Registrar {type === 'income' ? 'Ingreso' : 'Gasto'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
