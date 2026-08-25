import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import {
  Plus,
  Archive,
  Search,
  X,
  Flame,
} from 'lucide-react-native';
import { useHabitsStore } from './stores/useHabitsStore';
import { useAppStore } from '../../store/useAppStore';
import { HabitItem, GritNavigationTab } from '../../types';
import { GritDateScrubber } from './components/GritDateScrubber';
import { GritCategoryHeader } from './components/GritCategoryHeader';
import { GritHabitCard } from './components/GritHabitCard';
import { GritDetailSideSheet } from './components/GritDetailSideSheet';
import { GritFloatingTimerBar } from './components/GritFloatingTimerBar';
import { GritStatsTab } from './components/GritStatsTab';
import { GritSettingsTab } from './components/GritSettingsTab';
import { GritHabitEditorModal } from './components/GritHabitEditorModal';
import { GritPlayerLevelCard } from './components/GritPlayerLevelCard';
import { GritLevelUpModal } from './components/GritLevelUpModal';
import { IOSSegmentedControl, SegmentTab } from '../../components/ui/IOSSegmentedControl';
import { IOS_COLORS, IOS_FONTS } from '../../styles/theme';
import { createShadow } from '../../styles/shadows';

const HABIT_TABS: SegmentTab<GritNavigationTab>[] = [
  { id: 'today', label: 'Hoy' },
  { id: 'stats', label: 'Estadísticas' },
  { id: 'settings', label: 'Ajustes' },
];

export const HabitsScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    currentTab,
    setCurrentTab,
    selectedDate,
    searchQuery,
    setSearchQuery,
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

  const completedTodayCount = habits.filter(
    (h) => logsMap[h.id]?.[selectedDate]?.is_completed === 1
  ).length;

  const tabsWithBadge: SegmentTab<GritNavigationTab>[] = [
    { id: 'today', label: 'Hoy', badge: `${completedTodayCount}/${habits.length}` },
    { id: 'stats', label: 'Estadísticas' },
    { id: 'settings', label: 'Ajustes' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : theme.background, position: 'relative' }}>
      {/* 1. Header Unificado con Segmented Control y Acciones */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          backgroundColor: isDark ? 'rgba(20, 20, 22, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        }}
      >
        {/* Título & Badge de Módulo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: '#FF9500',
              alignItems: 'center',
              justifyContent: 'center',
              ...createShadow('#FF9500', { width: 0, height: 2 }, 0.35, 6),
            }}
          >
            <Flame size={20} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <View>
            <Text
              style={{
                fontSize: 24,
                fontFamily: IOS_FONTS.bold,
                color: theme.text.primary,
                letterSpacing: -0.6,
              }}
            >
              Hábitos & Rutinas
            </Text>
            <Text style={{ fontSize: 12, color: theme.text.secondary, marginTop: 1 }}>
              {showArchived ? 'Hábitos archivados' : `${completedTodayCount} de ${habits.length} completados hoy`}
            </Text>
          </View>
        </View>

        {/* Selector de Pestañas Segmented Control */}
        <View style={{ minWidth: 320 }}>
          <IOSSegmentedControl
            tabs={tabsWithBadge}
            selectedTab={currentTab}
            onTabChange={(tabId) => setCurrentTab(tabId)}
            isDark={isDark}
          />
        </View>

        {/* Acciones: Buscador, Archivados y + Nuevo Hábito */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {currentTab === 'today' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.card,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 6,
                minWidth: 160,
              }}
            >
              <Search size={14} color={theme.text.tertiary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar hábito..."
                placeholderTextColor={theme.text.tertiary}
                style={{ flex: 1, fontSize: 13, color: theme.text.primary, padding: 0 }}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X size={14} color={theme.text.tertiary} />
                </Pressable>
              )}
            </View>
          )}

          {/* Botón Ver Archivados */}
          <Pressable
            onPress={() => setShowArchived(!showArchived)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: showArchived ? 'rgba(255, 149, 0, 0.18)' : theme.card,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: showArchived ? '#FF9500' : theme.border,
              gap: 6,
            }}
          >
            <Archive size={15} color={showArchived ? '#FF9500' : theme.text.secondary} />
            <Text
              style={{
                fontSize: 12,
                fontFamily: IOS_FONTS.semibold,
                color: showArchived ? '#FF9500' : theme.text.secondary,
              }}
            >
              {showArchived ? 'Ver Activos' : 'Archivados'}
            </Text>
          </Pressable>

          {/* Botón Acción Rápida + Nuevo Hábito */}
          <Pressable
            onPress={() => {
              setEditingHabit(null);
              setIsEditorModalOpen(true);
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FF9500',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 12,
              gap: 6,
              ...createShadow('#FF9500', { width: 0, height: 2 }, 0.3, 6),
            })}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={{ fontSize: 13, fontFamily: IOS_FONTS.bold, color: '#FFFFFF' }}>
              Nuevo Hábito
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 2. Área de Contenido Central */}
      <View style={{ flex: 1, position: 'relative' }}>
        {currentTab === 'today' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24, paddingBottom: 90, gap: 18 }}
          >
            {/* Tarjeta de Nivel RPG del Jugador */}
            <GritPlayerLevelCard isDark={isDark} />

            {/* Scrubber de 10 Días */}
            <GritDateScrubber isDark={isDark} />

            {/* Categorías y Tarjetas de Hábitos en Grid Flexible */}
            <View style={{ gap: 24, marginTop: 4 }}>
              {categories.map((category) => {
                const categoryHabits = filteredHabits.filter((h) => h.category_id === category.id);
                if (categoryHabits.length === 0) return null;

                const isCollapsed = collapsedCategories.includes(category.id);
                const completedCount = categoryHabits.filter(
                  (h) => logsMap[h.id]?.[selectedDate]?.is_completed === 1
                ).length;

                return (
                  <View key={category.id} style={{ gap: 12 }}>
                    <GritCategoryHeader
                      category={category}
                      isOpen={!isCollapsed}
                      onToggle={() => toggleCategory(category.id)}
                      completedCount={completedCount}
                      totalCount={categoryHabits.length}
                      isDark={isDark}
                    />

                    {!isCollapsed && (
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 16,
                        }}
                      >
                        {categoryHabits.map((habit) => (
                          <GritHabitCard
                            key={habit.id}
                            habit={habit}
                            logsForHabit={logsMap[habit.id] || {}}
                            recentDates={recentDates}
                            onOpenDetail={openDetailHabit}
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

        {/* Floating Mini Timer Bar si hay cronómetro corriendo */}
        <GritFloatingTimerBar
          onPressHabit={() => {
            const active = useHabitsStore.getState().getActiveRunningTimer();
            if (active) openDetailHabit(active.habit);
          }}
          isDark={isDark}
        />
      </View>

      {/* Slide-out Detail Side Sheet */}
      <GritDetailSideSheet
        habit={selectedDetailHabit}
        onClose={closeDetailHabit}
        isDark={isDark}
      />

      {/* Editor Modal de Hábitos */}
      <GritHabitEditorModal
        visible={isEditorModalOpen || Boolean(editingHabit)}
        initialHabit={editingHabit}
        onClose={() => {
          setIsEditorModalOpen(false);
          setEditingHabit(null);
        }}
        isDark={isDark}
      />

      {/* Modal Celebración Level Up */}
      <GritLevelUpModal isDark={isDark} />
    </View>
  );
};

