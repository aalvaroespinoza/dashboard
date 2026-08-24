import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { List, Columns, Filter, SlidersHorizontal } from 'lucide-react-native';
import { RemindersViewMode, RemindersGroupBy, Priority } from '../../../types';
import { IOS_COLORS } from '../../../styles/theme';

interface RemindersViewToggleProps {
  viewMode: RemindersViewMode;
  onViewModeChange: (mode: RemindersViewMode) => void;
  groupBy: RemindersGroupBy;
  onGroupByChange: (groupBy: RemindersGroupBy) => void;
  filterPriority: Priority | 'all';
  onFilterPriorityChange: (p: Priority | 'all') => void;
  isDark?: boolean;
}

export const RemindersViewToggle: React.FC<RemindersViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  groupBy,
  onGroupByChange,
  filterPriority,
  onFilterPriorityChange,
  isDark = true,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      {/* 1. Toggle Vista Lista vs Columnas */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.cardSecondary,
          padding: 3,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Pressable
          onPress={() => onViewModeChange('list')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 9,
            backgroundColor: viewMode === 'list' ? (isDark ? '#3A3A3C' : '#FFFFFF') : 'transparent',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: viewMode === 'list' ? 0.08 : 0,
            shadowRadius: 2,
            gap: 6,
          }}
        >
          <List size={14} color={viewMode === 'list' ? theme.text.primary : theme.text.secondary} />
          <Text
            style={{
              fontSize: 12,
              fontWeight: viewMode === 'list' ? '800' : '600',
              color: viewMode === 'list' ? theme.text.primary : theme.text.secondary,
            }}
          >
            Lista
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onViewModeChange('columns')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 9,
            backgroundColor: viewMode === 'columns' ? (isDark ? '#3A3A3C' : '#FFFFFF') : 'transparent',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: viewMode === 'columns' ? 0.08 : 0,
            shadowRadius: 2,
            gap: 6,
          }}
        >
          <Columns size={14} color={viewMode === 'columns' ? theme.text.primary : theme.text.secondary} />
          <Text
            style={{
              fontSize: 12,
              fontWeight: viewMode === 'columns' ? '800' : '600',
              color: viewMode === 'columns' ? theme.text.primary : theme.text.secondary,
            }}
          >
            Columnas (Grit)
          </Text>
        </Pressable>
      </View>

      {/* 2. Agrupación y Filtros (Solo visible o expandido en Columnas) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {viewMode === 'columns' && (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: theme.cardSecondary,
              padding: 3,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            {(
              [
                { id: 'list', label: 'Listas' },
                { id: 'date', label: 'Fechas' },
                { id: 'priority', label: 'Prioridad' },
              ] as { id: RemindersGroupBy; label: string }[]
            ).map((g) => (
              <Pressable
                key={g.id}
                onPress={() => onGroupByChange(g.id)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 7,
                  backgroundColor: groupBy === g.id ? (isDark ? '#3A3A3C' : '#FFFFFF') : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: groupBy === g.id ? '800' : '600',
                    color: groupBy === g.id ? theme.text.primary : theme.text.secondary,
                  }}
                >
                  {g.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Filtro rápido por Prioridad */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: theme.cardSecondary,
            padding: 3,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          {(
            [
              { id: 'all', label: 'Todas' },
              { id: 'high', label: 'P1', color: IOS_COLORS.red },
              { id: 'medium', label: 'P5', color: IOS_COLORS.orange },
              { id: 'low', label: 'P9', color: IOS_COLORS.blue },
            ] as { id: Priority | 'all'; label: string; color?: string }[]
          ).map((p) => (
            <Pressable
              key={p.id}
              onPress={() => onFilterPriorityChange(p.id)}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 7,
                backgroundColor: filterPriority === p.id ? (isDark ? '#3A3A3C' : '#FFFFFF') : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: filterPriority === p.id ? '900' : '600',
                  color: filterPriority === p.id ? (p.color || theme.text.primary) : theme.text.secondary,
                }}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};
