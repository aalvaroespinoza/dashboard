import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Calendar, Clock, Inbox, Flag, CheckCircle2 } from 'lucide-react-native';
import { SmartListFilter } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';
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
      color: IOS_COLORS.blue,
      bgColor: isDark ? 'rgba(0, 122, 255, 0.2)' : '#DBEAFE',
    },
    {
      id: 'scheduled',
      label: 'Programados',
      count: counts.scheduled,
      icon: Clock,
      color: IOS_COLORS.red,
      bgColor: isDark ? 'rgba(255, 59, 48, 0.2)' : '#FEE2E2',
    },
    {
      id: 'all',
      label: 'Todos',
      count: counts.all,
      icon: Inbox,
      color: isDark ? '#A1A1AA' : '#4B5563',
      bgColor: isDark ? 'rgba(161, 161, 170, 0.2)' : '#F3F4F6',
    },
    {
      id: 'flagged',
      label: 'Con marca',
      count: counts.flagged,
      icon: Flag,
      color: IOS_COLORS.orange,
      bgColor: isDark ? 'rgba(255, 149, 0, 0.2)' : '#FEF3C7',
    },
    {
      id: 'completed',
      label: 'Completados',
      count: counts.completed,
      icon: CheckCircle2,
      color: IOS_COLORS.green,
      bgColor: isDark ? 'rgba(52, 199, 89, 0.2)' : '#ECFDF5',
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
            {/* Top row: Icono circular + Contador */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: card.bgColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={16} color={card.color} />
              </View>

              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '900',
                  color: theme.text.primary,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {card.count}
              </Text>
            </View>

            {/* Label */}
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: isSelected ? card.color : theme.text.secondary,
                marginTop: 6,
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
