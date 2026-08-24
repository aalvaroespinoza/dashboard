import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { Trophy, Sparkles, Flame, Shield, ArrowRight } from 'lucide-react-native';
import { useHabitsStore } from '../stores/useHabitsStore';
import { IOS_COLORS } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface GritLevelUpModalProps {
  isDark?: boolean;
}

export const GritLevelUpModal: React.FC<GritLevelUpModalProps> = ({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const levelUpCelebration = useHabitsStore((state) => state.levelUpCelebration);
  const dismissLevelUpCelebration = useHabitsStore((state) => state.dismissLevelUpCelebration);

  if (!levelUpCelebration) return null;

  return (
    <Modal visible={Boolean(levelUpCelebration)} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            width: '90%',
            maxWidth: 420,
            backgroundColor: theme.card,
            borderRadius: 28,
            borderWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.2)',
            borderBottomColor: 'rgba(255, 255, 255, 0.05)',
            borderLeftColor: 'rgba(255, 255, 255, 0.08)',
            borderRightColor: 'rgba(255, 255, 255, 0.08)',
            padding: 28,
            alignItems: 'center',
            gap: 16,
            ...createShadow('#FF9500', { width: 0, height: 10 }, 0.4, 20),
          }}
        >
          {/* Trofeo & Destellos */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(255, 149, 0, 0.16)',
              borderWidth: 2,
              borderColor: '#FF9500',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}
          >
            <Trophy size={42} color="#FF9500" strokeWidth={2.5} />
          </View>

          {/* Título de Subida de Nivel */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#FF9500" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '900',
                  color: '#FF9500',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                }}
              >
                ¡Level Up!
              </Text>
              <Sparkles size={16} color="#FF9500" />
            </View>

            <Text
              style={{
                fontSize: 26,
                fontWeight: '900',
                color: theme.text.primary,
                letterSpacing: -0.6,
                textAlign: 'center',
              }}
            >
              ¡Has subido de Nivel!
            </Text>
          </View>

          {/* Salto de Nivel */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.cardSecondary,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 16,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text.secondary }}>
              Nv. {levelUpCelebration.oldLevel}
            </Text>

            <ArrowRight size={18} color="#FF9500" />

            <View
              style={{
                backgroundColor: '#FF9500',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFFFFF' }}>
                Nv. {levelUpCelebration.newLevel}
              </Text>
            </View>
          </View>

          {/* Nuevo Rango Desbloqueado */}
          <View style={{ alignItems: 'center', gap: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.secondary }}>
              Nuevo Rango Desbloqueado:
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '900', color: theme.text.primary }}>
              {levelUpCelebration.rankTitle}
            </Text>
          </View>

          {/* Botón Continuar */}
          <Pressable
            onPress={dismissLevelUpCelebration}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              width: '100%',
              backgroundColor: '#FF9500',
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
              marginTop: 6,
            })}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>
              Continuar la Racha 🔥
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
