/**
 * SmartListCards.tsx
 * Tarjetas Inteligentes de Apple Reminders (Hoy, Programados, Todos, Con Marca, Completados)
 * con paleta adaptativa Apple HIG y Tinted Pills a 15% de opacidad.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Calendar, Clock, Inbox, Flag, CheckCircle2 } from 'lucide-react-native';
import { SmartListFilter } from '../../../types';
import { IOS_COLORS, IOS_FONTS, APPLE_ACCENT } from '../../../styles/theme';
import { createShadow } from '../../../styles/shadows';

interface SmartListCardsProps {
  activeFilter: SmartListFilter;
  onSelectFilter: (filter: SmartListFilter) => void;
  counts: {
    today: number;
    scheduled: number;
    all: number;
    flagged: number;
    completed: number;
  };
  isDark?: boolean;
}

export const SmartListCards: React.FC<SmartListCardsProps> = ({
  activeFilter,
  onSelectFilter,
  counts,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const CARDS: {
    id: SmartListFilter;
    label: string;
    count: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }[] = [
    {
      id: 'today',
      label: 'Hoy',
      count: counts.today,
      icon: Calendar,
      color: isDark ? APPLE_ACCENT.blue.dark : APPLE_ACCENT.blue.light,
      bgColor: isDark ? 'rgba(10, 132, 255, 0.15)' : 'rgba(0, 122, 255, 0.12)',
    },
    {
      id: 'scheduled',
      label: 'Programados',
      count: counts.scheduled,
      icon: Clock,
      color: isDark ? APPLE_ACCENT.red.dark : APPLE_ACCENT.red.light,
      bgColor: isDark ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 59, 48, 0.12)',
    },
    {
      id: 'all',
      label: 'Todos',
      count: counts.all,
      icon: Inbox,
      color: isDark ? APPLE_ACCENT.indigo.dark : APPLE_ACCENT.indigo.light,
      bgColor: isDark ? 'rgba(94, 92, 230, 0.15)' : 'rgba(88, 86, 214, 0.12)',
    },
    {
      id: 'flagged',
      label: 'Con marca',
      count: counts.flagged,
      icon: Flag,
      color: isDark ? APPLE_ACCENT.orange.dark : APPLE_ACCENT.orange.light,
      bgColor: isDark ? 'rgba(255, 159, 10, 0.15)' : 'rgba(255, 149, 0, 0.12)',
    },
    {
      id: 'completed',
      label: 'Completados',
      count: counts.completed,
      icon: CheckCircle2,
      color: isDark ? APPLE_ACCENT.green.dark : APPLE_ACCENT.green.light,
      bgColor: isDark ? 'rgba(48, 209, 88, 0.15)' : 'rgba(52, 199, 89, 0.12)',
    },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {CARDS.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <Pressable
            key={card.id}
            onPress={() => onSelectFilter(card.id)}
            style={({ pressed }) => ({
              flex: 1,
              opacity: pressed ? 0.85 : 1,
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 12,
              borderWidth: 1.5,
              borderColor: isSelected ? card.color : theme.border,
              justifyContent: 'space-between',
              minHeight: 74,
              ...createShadow('#000000', { width: 0, height: 1 }, 0.03, 3),
            })}
          >
            {/* Top: Icono con fondo circular translúcido + Contador */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: card.bgColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={18} color={card.color} strokeWidth={2.2} />
              </View>

              <Text
                style={{
                  fontSize: 22,
                  fontFamily: IOS_FONTS.bold,
                  color: isSelected ? card.color : theme.text.primary,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {card.count}
              </Text>
            </View>

            {/* Bottom: Etiqueta */}
            <Text
              style={{
                fontSize: 13,
                fontFamily: IOS_FONTS.bold,
                color: isSelected ? card.color : theme.text.secondary,
                marginTop: 8,
              }}
            >
              {card.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
