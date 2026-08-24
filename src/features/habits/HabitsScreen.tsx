import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  Plus,
  Archive,
} from 'lucide-react-native';
import { useHabitsStore } from './stores/useHabitsStore';
import { useAppStore } from '../../store/useAppStore';
import { HabitItem } from '../../types';
import { GritSidebar } from './components/GritSidebar';
import { GritDateScrubber } from './components/GritDateScrubber';
import { GritCategoryHeader } from './components/GritCategoryHeader';
import { GritHabitCard } from './components/GritHabitCard';
import { GritDetailSideSheet } from './components/GritDetailSideSheet';
import { GritFloatingTimerBar } from './components/GritFloatingTimerBar';
import { GritStatsTab } from './components/GritStatsTab';
import { GritSettingsTab } from './components/GritSettingsTab';
import { GritHabitEditorModal } from './components/GritHabitEditorModal';
import { IOS_COLORS } from '../../styles/theme';

export const HabitsScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    currentTab,
    selectedDate,
    searchQuery,
    selectedDetailHabit,
    editingHabit,
    openDetailHabit,
    closeDetailHabit,
    setEditingHabit,
    categories,
    habits,
    logsMap,
    recentDates,
    loadHabitsData,
  } = useHabitsStore();

  useEffect(() => {
    loadHabitsData();
  }, []);

  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // Filtrado de hábitos activos vs archivados y búsqueda
  const filteredHabits = habits.filter((h) => {
    if (!showArchived && h.is_archived) return false;
    if (showArchived && !h.is_archived) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.title.toLowerCase().includes(q) ||
      h.frequency.toLowerCase().includes(q) ||
      (h.target_unit && h.target_unit.toLowerCase().includes(q))
    );
  });

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.background, position: 'relative' }}>
      {/* 1. Barra Lateral Fija (~270px) */}
      <GritSidebar
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setIsEditorModalOpen(true);
        }}
        isDark={isDark}
      />

      {/* 2. Panel Central Dinámico */}
      <View style={{ flex: 1, position: 'relative' }}>
        {currentTab === 'today' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24, paddingBottom: 90, gap: 16 }}
          >
            {/* Header: Título "Hoy" y Fecha */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <View>
                <Text style={{ fontSize: 32, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.8 }}>
                  {showArchived ? 'Hábitos Archivados' : 'Hoy'}
                </Text>
                <Text style={{ fontSize: 13, color: theme.text.secondary, marginTop: 2 }}>
                  Lunes, 24 de agosto de 2026
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {/* Botón Ver Archivados */}
                <Pressable
                  onPress={() => setShowArchived(!showArchived)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: showArchived ? 'rgba(255, 149, 0, 0.2)' : theme.card,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: showArchived ? '#FF9500' : theme.border,
                    gap: 6,
                  }}
                >
                  <Archive size={16} color={showArchived ? '#FF9500' : theme.text.secondary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: showArchived ? '#FF9500' : theme.text.secondary }}>
                    {showArchived ? 'Ver Activos' : 'Archivados'}
                  </Text>
                </Pressable>

                {/* Botón Acción Rápida + */}
                <Pressable
                  onPress={() => {
                    setEditingHabit(null);
                    setIsEditorModalOpen(true);
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Plus size={20} color="#FF9500" strokeWidth={2.5} />
                </Pressable>
              </View>
            </View>

            {/* Scrubber / Timeline Horizontal de 10 días */}
            {!showArchived && <GritDateScrubber isDark={isDark} />}

            {/* Categorías Colapsables & Grid de 2 Columnas */}
            <View style={{ gap: 14 }}>
              {categories.map((cat) => {
                const catHabits = filteredHabits.filter((h) => h.category_id === cat.id);
                if (catHabits.length === 0) return null;

                const isCollapsed = collapsedCategories.includes(cat.id);
                const completedCount = catHabits.filter(
                  (h) => logsMap[h.id]?.[selectedDate]?.is_completed
                ).length;

                return (
                  <View key={cat.id} style={{ gap: 8 }}>
                    {/* Header de Categoría */}
                    <GritCategoryHeader
                      category={cat}
                      isOpen={!isCollapsed}
                      onToggle={() => toggleCategory(cat.id)}
                      completedCount={completedCount}
                      totalCount={catHabits.length}
                      isDark={isDark}
                    />

                    {/* Grid Responsive de 2 Columnas de Tarjetas */}
                    {!isCollapsed && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        {catHabits.map((habit) => (
                          <GritHabitCard
                            key={habit.id}
                            habit={habit}
                            logsForHabit={logsMap[habit.id] || {}}
                            recentDates={recentDates}
                            onOpenDetail={(h) => openDetailHabit(h)}
                            isDark={isDark}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {currentTab === 'stats' && <GritStatsTab isDark={isDark} />}

        {currentTab === 'settings' && <GritSettingsTab isDark={isDark} />}

        {/* 3. Mini Reproductor Flotante Inferior */}
        <GritFloatingTimerBar
          onPressHabit={() => {
            const running = useHabitsStore.getState().getActiveRunningTimer();
            if (running) {
              openDetailHabit(running.habit);
            }
          }}
          isDark={isDark}
        />

        {/* 4. Side Sheet Animado de Detalle de Hábito */}
        {selectedDetailHabit && (
          <GritDetailSideSheet
            habit={selectedDetailHabit}
            onClose={closeDetailHabit}
            isDark={isDark}
          />
        )}
      </View>

      {/* Modal Creador / Editor Completo de Hábitos */}
      <GritHabitEditorModal
        visible={isEditorModalOpen || Boolean(editingHabit)}
        initialHabit={editingHabit}
        onClose={() => {
          setIsEditorModalOpen(false);
          setEditingHabit(null);
        }}
        isDark={isDark}
      />
    </View>
  );
};
