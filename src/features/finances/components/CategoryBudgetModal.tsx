/**
 * CategoryBudgetModal.tsx
 * Modal flotante iPadOS para fijar o editar el límite de presupuesto mensual de una categoría.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { Target, X, Check, Trash2, Sparkles, DollarSign } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { IOS_COLORS, IOS_FONTS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface CategoryBudgetModalProps {
  visible: boolean;
  category: {
    id: string;
    name: string;
    color: string;
    iconName?: string;
    budgetLimit?: number | null;
    amountSpent?: number;
  } | null;
  monthLabel: string;
  onClose: () => void;
  onSave: (categoryId: string, limit: number) => Promise<void>;
  onRemoveBudget: (categoryId: string) => Promise<void>;
  isDark?: boolean;
}

const PRESET_AMOUNTS = [30000, 50000, 80000, 100000, 150000, 250000, 400000];

export const CategoryBudgetModal: React.FC<CategoryBudgetModalProps> = ({
  visible,
  category,
  monthLabel,
  onClose,
  onSave,
  onRemoveBudget,
  isDark = true,
}) => {
  const [limitStr, setLimitStr] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  useEffect(() => {
    if (category?.budgetLimit && category.budgetLimit > 0) {
      setLimitStr(String(category.budgetLimit));
    } else {
      setLimitStr('');
    }
  }, [category, visible]);

  if (!category) return null;

  const currentLimit = Number(limitStr.replace(/[^0-9]/g, '')) || 0;
  const spent = category.amountSpent || 0;
  const percentagePreview = currentLimit > 0 ? Math.round((spent / currentLimit) * 100) : 0;
  const remainingPreview = currentLimit > 0 ? currentLimit - spent : 0;

  const handleSave = async () => {
    if (currentLimit <= 0) {
      Alert.alert('Monto inválido', 'Por favor ingresa un monto mayor a 0 para el presupuesto.');
      return;
    }

    try {
      setIsSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await onSave(category.id, currentLimit);
      onClose();
    } catch (e) {
      console.error('Error guardando presupuesto:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsSaving(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      await onRemoveBudget(category.id);
      onClose();
    } catch (e) {
      console.error('Error eliminando presupuesto:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.65)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '92%',
            maxWidth: 420,
            backgroundColor: theme.card,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: 'hidden',
            ...createShadow('#000000', { width: 0, height: 10 }, isDark ? 0.4 : 0.12, 24),
          }}
        >
          {/* Header */}
          <View
            style={{
              padding: 20,
              backgroundColor: theme.cardSecondary,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${category.color || '#007AFF'}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Target size={20} color={category.color || '#007AFF'} />
              </View>
              <View>
                <Text style={{ fontSize: 17, fontFamily: IOS_FONTS.bold, color: theme.text.primary }}>
                  Presupuesto: {category.name}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.regular, color: theme.text.secondary }}>
                  {monthLabel}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <X size={16} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Form Content */}
          <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
            {/* Input de Monto */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.bold, color: theme.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Límite de Gasto Mensual ($ ARS)
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.cardSecondary,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: theme.border,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 24, fontFamily: IOS_FONTS.bold, color: category.color || '#007AFF' }}>
                  $
                </Text>
                <TextInput
                  value={limitStr}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9]/g, '');
                    setLimitStr(clean);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    flex: 1,
                    fontSize: 22,
                    fontFamily: IOS_FONTS.bold,
                    color: theme.text.primary,
                    padding: 0,
                  }}
                  autoFocus
                />
              </View>
            </View>

            {/* Chips de Montos Rápidos */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.semibold, color: theme.text.tertiary }}>
                Sugerencias rápidas:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {PRESET_AMOUNTS.map((amt) => (
                  <Pressable
                    key={amt}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setLimitStr(String(amt));
                    }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.75 : 1,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 12,
                      backgroundColor: currentLimit === amt ? (category.color || '#007AFF') : theme.cardSecondary,
                      borderWidth: 1,
                      borderColor: currentLimit === amt ? (category.color || '#007AFF') : theme.border,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: IOS_FONTS.bold,
                        color: currentLimit === amt ? '#FFFFFF' : theme.text.primary,
                      }}
                    >
                      ${(amt / 1000).toLocaleString('es-AR')}k
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Preview en Vivo */}
            {currentLimit > 0 && (
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontFamily: IOS_FONTS.semibold, color: theme.text.secondary }}>
                    Consumo actual ({monthLabel})
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: IOS_FONTS.bold,
                      color: percentagePreview >= 100 ? '#FF3B30' : percentagePreview >= 75 ? '#FF9500' : '#34C759',
                    }}
                  >
                    {percentagePreview}%
                  </Text>
                </View>

                {/* Barra de progreso de preview */}
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${Math.min(100, percentagePreview)}%`,
                      backgroundColor:
                        percentagePreview >= 100
                          ? '#FF3B30'
                          : percentagePreview >= 75
                          ? '#FF9500'
                          : (category.color || '#34C759'),
                      borderRadius: 4,
                    }}
                  />
                </View>

                <Text style={{ fontSize: 11, fontFamily: IOS_FONTS.regular, color: theme.text.tertiary }}>
                  {remainingPreview >= 0
                    ? `Gastado: $${spent.toLocaleString('es-AR')} • Te quedarán $${remainingPreview.toLocaleString('es-AR')} disponibles.`
                    : `Gastado: $${spent.toLocaleString('es-AR')} • Excedido por $${Math.abs(remainingPreview).toLocaleString('es-AR')}.`}
                </Text>
              </View>
            )}

            {/* Botones de Acción */}
            <View style={{ gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={({ pressed }) => ({
                  opacity: pressed || isSaving ? 0.8 : 1,
                  backgroundColor: category.color || IOS_COLORS.blue,
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                })}
              >
                <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={{ fontSize: 15, fontFamily: IOS_FONTS.bold, color: '#FFFFFF' }}>
                  Guardar Presupuesto
                </Text>
              </Pressable>

              {Boolean(category.budgetLimit && category.budgetLimit > 0) && (
                <Pressable
                  onPress={handleRemove}
                  disabled={isSaving}
                  style={({ pressed }) => ({
                    opacity: pressed || isSaving ? 0.7 : 1,
                    backgroundColor: 'rgba(255, 59, 48, 0.12)',
                    paddingVertical: 12,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 6,
                  })}
                >
                  <Trash2 size={15} color="#FF3B30" />
                  <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: '#FF3B30' }}>
                    Quitar Límite de Presupuesto
                  </Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
