/**
 * DayTimelineView.tsx
 * Vista Día del Calendario: timeline vertical 00:00–23:59
 * con eventos posicionados absolutamente por hora de inicio/fin.
 */
import React, { useRef, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { UnifiedCalendarItem } from '../../../types';
import { IOS_COLORS, IOS_FONTS } from '../../../styles/theme';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { TimeBlockItem } from './TimeBlockItem';

interface DayTimelineViewProps {
  date: string; // 'YYYY-MM-DD'
  items: UnifiedCalendarItem[];
  onPressItem?: (item: UnifiedCalendarItem) => void;
  isDark?: boolean;
  slotHeight?: number; // px por hora, default 64
}

/** Detectar solapamientos y asignar columnas */
function assignColumns(items: UnifiedCalendarItem[]): Array<UnifiedCalendarItem & { col: number; totalCols: number }> {
  const timed = items.filter((i) => i.start_time && !i.is_all_day);
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toEnd = (i: UnifiedCalendarItem) => {
    if (i.end_time) return toMin(i.end_time);
    return toMin(i.start_time!) + 60;
  };

  // Ordenar por hora de inicio
  timed.sort((a, b) => toMin(a.start_time!) - toMin(b.start_time!));

  // Asignar columnas con algoritmo greedy
  const cols: number[][] = []; // cols[colIndex] = [endMinuteOfLastEvent]
  const result: Array<UnifiedCalendarItem & { col: number; totalCols: number }> = [];

  for (const item of timed) {
    const start = toMin(item.start_time!);
    const end = toEnd(item);
    let assignedCol = -1;
    for (let c = 0; c < cols.length; c++) {
      if (cols[c][cols[c].length - 1] <= start) {
        assignedCol = c;
        cols[c].push(end);
        break;
      }
    }
    if (assignedCol === -1) {
      assignedCol = cols.length;
      cols.push([end]);
    }
    result.push({ ...item, col: assignedCol, totalCols: 0 });
  }

  // Calcular totalCols en grupos solapados
  for (let i = 0; i < result.length; i++) {
    const iStart = toMin(result[i].start_time!);
    const iEnd = toEnd(result[i]);
    let maxCol = result[i].col;
    for (let j = 0; j < result.length; j++) {
      if (j === i) continue;
      const jStart = toMin(result[j].start_time!);
      const jEnd = toEnd(result[j]);
      if (iStart < jEnd && iEnd > jStart) {
        maxCol = Math.max(maxCol, result[j].col);
      }
    }
    result[i] = { ...result[i], totalCols: maxCol + 1 };
  }

  return result;
}

export const DayTimelineView: React.FC<DayTimelineViewProps> = ({
  date,
  items,
  onPressItem,
  isDark = true,
  slotHeight = 64,
}) => {
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;
  const scrollRef = useRef<ScrollView>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const totalHeight = 24 * slotHeight;

  // Separar all-day de timed
  const allDayItems = items.filter((i) => i.is_all_day);
  const timedItems = useMemo(() => assignColumns(items), [items]);

  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const minuteToY = (min: number) => (min / 60) * slotHeight;
  const durationMin = (item: UnifiedCalendarItem) => {
    if (!item.start_time) return 60;
    const s = toMin(item.start_time);
    const e = item.end_time ? toMin(item.end_time) : s + 60;
    return Math.max(30, e - s);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Banda de eventos de todo el día */}
      {allDayItems.length > 0 && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.text.tertiary, textTransform: 'uppercase', marginBottom: 4 }}>
            Todo el día
          </Text>
          {allDayItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onPressItem?.(item)}
              style={{
                backgroundColor: `${item.color}25`,
                borderLeftWidth: 3,
                borderLeftColor: item.color,
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.primary }}>
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Timeline Principal */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ position: 'relative', height: totalHeight + 40, paddingLeft: 56 }}>
          {/* Líneas de horas */}
          {hours.map((h) => (
            <View
              key={h}
              style={{
                position: 'absolute',
                top: h * slotHeight,
                left: 0,
                right: 0,
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}
            >
              {/* Etiqueta de hora */}
              <View style={{ width: 48, alignItems: 'flex-end', paddingRight: 8, marginTop: -8 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: IOS_FONTS.mono,
                    color: theme.text.quaternary || theme.text.tertiary,
                  }}
                >
                  {h === 0 ? '' : `${h.toString().padStart(2, '0')}:00`}
                </Text>
              </View>
              {/* Línea horizontal */}
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.06)',
                  marginTop: 0,
                }}
              />
            </View>
          ))}

          {/* Línea de hora actual */}
          <CurrentTimeIndicator
            hourHeight={slotHeight}
            isDark={isDark}
          />

          {/* Eventos posicionados absolutamente */}
          {timedItems.map((item) => {
            const startMin = toMin(item.start_time!);
            const durMin = durationMin(item);
            const top = minuteToY(startMin);
            const height = Math.max(44, minuteToY(durMin));
            const colWidth = `${(100 / item.totalCols) - 1}%` as any;
            const leftOffset = `${(item.col / item.totalCols) * 100}%` as any;

            return (
              <View
                key={item.id}
                style={{
                  position: 'absolute',
                  top,
                  left: leftOffset,
                  width: colWidth,
                  height,
                  paddingHorizontal: 2,
                }}
              >
                <TimeBlockItem
                  item={item}
                  onPress={onPressItem}
                  isCompact={height < 60}
                  isDark={isDark}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
