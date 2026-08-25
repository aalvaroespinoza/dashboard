import React from 'react';
import { View, Text } from 'react-native';
import { Shield, Zap, Sparkles, Flame, Brain, Dumbbell, Target } from 'lucide-react-native';
import { useHabitsStore } from '../stores/useHabitsStore';
import { SpecularCard } from '../../../components/common/SpecularCard';
import { IOS_COLORS } from '../../../styles/theme';

interface GritPlayerLevelCardProps {
  isDark?: boolean;
}

export const GritPlayerLevelCard: React.FC<GritPlayerLevelCardProps> = ({ isDark = true }) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const rpgProfile = useHabitsStore((state) => state.rpgProfile);

  const level = rpgProfile.level || 1;
  const currentExp = rpgProfile.current_exp || 0;
  const nextExp = rpgProfile.next_level_exp || 100;
  const progressPct = Math.min(Math.round((currentExp / nextExp) * 100), 100);

  return (
    <SpecularCard isDark={isDark} padding={16} style={{ marginBottom: 14 }}>
      {/* Header: Nivel & Rango RPG */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Badge de Nivel */}
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: '#FF9500',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#FF9500',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900' }}>
              {level}
            </Text>
          </View>

          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text.secondary, textTransform: 'uppercase' }}>
                Nivel de Jugador
              </Text>
              <Sparkles size={11} color="#FF9500" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.4 }}>
              {rpgProfile.rank_title}
            </Text>
          </View>
        </View>

        {/* EXP Acumulada */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text.primary }}>
            {currentExp} <Text style={{ fontSize: 10, color: theme.text.secondary }}>/ {nextExp} EXP</Text>
          </Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#FF9500' }}>
            {progressPct}% completado
          </Text>
        </View>
      </View>

      {/* Barra de EXP Brillante */}
      <View
        style={{
          height: 8,
          backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${progressPct}%`,
            backgroundColor: '#FF9500',
            borderRadius: 4,
          }}
        />
      </View>

      {/* Mini Gauges de Atributos RPG (STR / INT / FOC) */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {/* Fuerza (Cuerpo / Salud - Apple System Pink) */}
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? 'rgba(255, 55, 95, 0.12)' : 'rgba(255, 45, 85, 0.08)',
            paddingVertical: 8,
            paddingHorizontal: 8,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 55, 95, 0.25)' : 'rgba(255, 45, 85, 0.2)',
          }}
        >
          <Dumbbell size={14} color={isDark ? '#FF375F' : '#FF2D55'} />
          <View>
            <Text style={{ fontSize: 9, fontFamily: 'SF-Pro-Display-Bold', color: isDark ? '#FF375F' : '#FF2D55', textTransform: 'uppercase' }}>
              Fuerza
            </Text>
            <Text style={{ fontSize: 11, fontFamily: 'SF-Pro-Display-Bold', color: theme.text.primary }}>
              {rpgProfile.strength_exp} pts
            </Text>
          </View>
        </View>

        {/* Inteligencia (Mente / Estudio - Apple System Purple) */}
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? 'rgba(191, 90, 242, 0.12)' : 'rgba(175, 82, 222, 0.08)',
            paddingVertical: 8,
            paddingHorizontal: 8,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(191, 90, 242, 0.25)' : 'rgba(175, 82, 222, 0.2)',
          }}
        >
          <Brain size={14} color={isDark ? '#BF5AF2' : '#AF52DE'} />
          <View>
            <Text style={{ fontSize: 9, fontFamily: 'SF-Pro-Display-Bold', color: isDark ? '#BF5AF2' : '#AF52DE', textTransform: 'uppercase' }}>
              Inteligencia
            </Text>
            <Text style={{ fontSize: 11, fontFamily: 'SF-Pro-Display-Bold', color: theme.text.primary }}>
              {rpgProfile.intelligence_exp} pts
            </Text>
          </View>
        </View>

        {/* Enfoque (Productividad / Foco - Apple System Teal) */}
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? 'rgba(64, 200, 224, 0.12)' : 'rgba(48, 176, 199, 0.08)',
            paddingVertical: 8,
            paddingHorizontal: 8,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(64, 200, 224, 0.25)' : 'rgba(48, 176, 199, 0.2)',
          }}
        >
          <Target size={14} color={isDark ? '#40C8E0' : '#30B0C7'} />
          <View>
            <Text style={{ fontSize: 9, fontFamily: 'SF-Pro-Display-Bold', color: isDark ? '#40C8E0' : '#30B0C7', textTransform: 'uppercase' }}>
              Enfoque
            </Text>
            <Text style={{ fontSize: 11, fontFamily: 'SF-Pro-Display-Bold', color: theme.text.primary }}>
              {rpgProfile.focus_exp} pts
            </Text>
          </View>
        </View>
      </View>
    </SpecularCard>
  );
};
