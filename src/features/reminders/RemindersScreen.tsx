import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Search,
  Plus,
  X,
  List as ListIcon,
  Columns,
  FolderPlus,
  Inbox,
  CheckCircle2,
  Folder,
  Layers,
  ChevronLeft,
} from 'lucide-react-native';
import Animated, {
  FadeInUp,
  FadeOutDown,
  LinearTransition,
} from 'react-native-reanimated';
import { useTasksStore } from '../../store/useTasksStore';
import { useAppStore } from '../../store/useAppStore';
import { TaskItem, TaskList } from '../../types';
import { SmartListCards } from './components/SmartListCards';
import { MasterListView } from './components/MasterListView';
import { RemindersViewToggle } from './components/RemindersViewToggle';
import { HierarchicalTaskItem } from './components/HierarchicalTaskItem';
import { ReminderSectionHeader } from './components/ReminderSectionHeader';
import { GritColumnBoard } from './components/GritColumnBoard';
import { CreateReminderModal } from './components/CreateReminderModal';
import { ReminderDetailSheet } from './components/ReminderDetailSheet';
import { ListIconRenderer } from '../../components/ui/ListIconRenderer';
import { IOS_COLORS, IOS_FONTS } from '../../styles/theme';
import { createShadow } from '../../styles/shadows';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

export const RemindersScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const { isLandscape, contentPadding } = useResponsiveLayout();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    lists,
    sections,
    tasks,
    selectedListId,
    activeSmartFilter,
    viewMode,
    groupBy,
    filterPriority,
    searchFilter,
    loadTasksAndLists,
    setSelectedListId,
    setActiveSmartFilter,
    setViewMode,
    setGroupBy,
    setFilterPriority,
    setSearchFilter,
    toggleTaskCollapse,
    toggleFlag,
    addTask,
    addSubtask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addList,
    addSection,
    getFlattenedTasks,
    getTasksGroupedBySection,
    getGritColumns,
    getSmartCounts,
  } = useTasksStore();

  useEffect(() => {
    loadTasksAndLists();
  }, []);

  // Modales
  const [inspectingTask, setInspectingTask] = useState<TaskItem | null>(null);
  const [isCreateReminderModalOpen, setIsCreateReminderModalOpen] = useState(false);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState(IOS_COLORS.blue);
  const [newListIcon, setNewListIcon] = useState('list');

  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [targetSectionForNewTask, setTargetSectionForNewTask] = useState<string | null>(null);

  const smartCounts = getSmartCounts();
  const flattenedTasks = getFlattenedTasks();
  const gritColumns = getGritColumns();

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    const created = await addList(newListName.trim(), newListColor, newListIcon);
    setNewListName('');
    setNewListIcon('list');
    setIsAddListModalOpen(false);
    setSelectedListId(created.id);
  };

  const handleCreateSection = async () => {
    if (!selectedListId || !newSectionName.trim()) return;
    await addSection(selectedListId, newSectionName.trim());
    setNewSectionName('');
    setIsAddSectionModalOpen(false);
  };

  // Subtareas de la tarea en inspección
  const subtasksOfInspecting = inspectingTask
    ? tasks.filter((t) => t.parent_id === inspectingTask.id)
    : [];

  const activeListObj = lists.find((l) => l.id === selectedListId);

  // Determinar si mostramos la lista agrupada por secciones
  const groupedSections = selectedListId ? getTasksGroupedBySection(selectedListId) : [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000000' : theme.background,
      }}
    >
      <View style={{ flex: 1, padding: contentPadding, gap: 16 }}>
        {/* 1. Header General con Buscador y Acción Nueva Lista */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {selectedListId && (
              <Pressable
                onPress={() => setSelectedListId(null)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={20} color={theme.text.primary} />
              </Pressable>
            )}

            {activeListObj && (
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: activeListObj.color || IOS_COLORS.blue,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ListIconRenderer icon={activeListObj.icon} size={18} color="#FFFFFF" />
              </View>
            )}

            <View>
              <Text style={{ fontSize: isLandscape ? 28 : 22, fontFamily: IOS_FONTS.bold, color: theme.text.primary, letterSpacing: -0.8 }}>
                {activeListObj
                  ? activeListObj.title
                  : activeSmartFilter === 'today'
                  ? 'Hoy'
                  : activeSmartFilter === 'scheduled'
                  ? 'Programados'
                  : activeSmartFilter === 'flagged'
                  ? 'Con marca'
                  : activeSmartFilter === 'completed'
                  ? 'Completados'
                  : 'Recordatorios'}
              </Text>
              <Text style={{ fontSize: 13, color: theme.text.secondary, marginTop: 2 }}>
                {flattenedTasks.filter((t) => !t.is_completed).length} pendientes
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Buscador Flexible */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? '#2C2C2E' : theme.border,
                minWidth: 130,
                maxWidth: 220,
                flex: 1,
                gap: 8,
              }}
            >
              <Search size={15} color={theme.text.tertiary} />
              <TextInput
                value={searchFilter}
                onChangeText={setSearchFilter}
                placeholder="Buscar recordatorios..."
                placeholderTextColor={theme.text.tertiary}
                style={{ flex: 1, fontSize: 13, color: theme.text.primary, padding: 0 }}
              />
              {searchFilter.length > 0 && (
                <Pressable onPress={() => setSearchFilter('')}>
                  <X size={14} color={theme.text.tertiary} />
                </Pressable>
              )}
            </View>

            {/* Botón + Nueva Sección (si hay lista seleccionada) */}
            {selectedListId && (
              <Pressable
                onPress={() => setIsAddSectionModalOpen(true)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#2C2C2E' : theme.border,
                  gap: 6,
                })}
              >
                <Layers size={15} color={IOS_COLORS.blue} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.primary }}>
                  Nueva sección
                </Text>
              </Pressable>
            )}

            {/* Botón + Nueva Lista */}
            <Pressable
              onPress={() => setIsAddListModalOpen(true)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? '#2C2C2E' : theme.border,
                gap: 6,
              })}
            >
              <FolderPlus size={15} color={IOS_COLORS.blue} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.primary }}>
                Nueva lista
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 2. Tarjetas Inteligentes de Apple Reminders (Hoy, Programados, Todos, Con Marca, Completados) */}
        {!selectedListId && (
          <SmartListCards
            activeFilter={activeSmartFilter}
            onSelectFilter={setActiveSmartFilter}
            counts={smartCounts}
            isDark={isDark}
          />
        )}

        {/* 3. Toggle de Vistas Duales (Lista vs Columnas Grit) y Filtros */}
        <RemindersViewToggle
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          filterPriority={filterPriority}
          onFilterPriorityChange={setFilterPriority}
          isDark={isDark}
        />

        {/* 4. Contenido Principal */}
        <View style={{ flex: 1 }}>
          {viewMode === 'columns' ? (
            <GritColumnBoard
              columns={gritColumns}
              onToggleComplete={toggleTaskComplete}
              onToggleCollapse={toggleTaskCollapse}
              onAddSubtask={(parentId) => addSubtask(parentId, 'Nueva subtarea')}
              onOpenNewTask={(listId) => {
                if (listId) setSelectedListId(listId);
              }}
              onOpenEditTask={(task) => setInspectingTask(task)}
              onToggleFlag={toggleFlag}
              isDark={isDark}
            />
          ) : !selectedListId && activeSmartFilter === 'all' && searchFilter.length === 0 ? (
            // Vista Master (Mis Listas & Tags)
            <MasterListView
              lists={lists}
              tasks={tasks}
              onSelectList={(id) => setSelectedListId(id)}
              onOpenNewList={() => setIsAddListModalOpen(true)}
              onSelectTag={(tag) => setSearchFilter(tag)}
              onToggleTaskComplete={toggleTaskComplete}
              onPressTask={(t) => setInspectingTask(t)}
              onDeleteTask={deleteTask}
              onToggleTaskFlag={toggleFlag}
              onAddQuickTaskInList={(listId) => {
                setSelectedListId(listId);
                setIsCreateReminderModalOpen(true);
              }}
              isDark={isDark}
            />
          ) : (
            // Vista Lista Detalle (con secciones si hay lista seleccionada)
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? '#141416' : theme.card,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: isDark ? '#242426' : theme.border,
                padding: 16,
              }}
            >
              {flattenedTasks.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 }}>
                  <Inbox size={36} color={theme.text.tertiary} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text.primary }}>
                    No hay recordatorios en esta vista
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.text.secondary }}>
                    Toca el botón + flotante para crear un nuevo recordatorio.
                  </Text>
                </View>
              ) : selectedListId && groupedSections.length > 0 ? (
                // Lista agrupada por secciones
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                  {groupedSections.map((group, gIdx) => {
                    const secTasks = group.tasks;
                    const compCount = secTasks.filter((t) => t.is_completed).length;

                    return (
                      <View key={group.section?.id || `unsec-${gIdx}`} style={{ marginBottom: 12 }}>
                        {group.section && (
                          <ReminderSectionHeader
                            section={group.section}
                            listId={selectedListId}
                            tasksCount={secTasks.length}
                            completedCount={compCount}
                            onAddTaskInSection={(secId?: string | null) => {
                              setTargetSectionForNewTask(secId || null);
                              setIsCreateReminderModalOpen(true);
                            }}
                            isDark={isDark}
                          />
                        )}

                        {secTasks.map((item) => {
                          const listObj = lists.find((l) => l.id === item.list_id);
                          return (
                            <Animated.View
                              key={item.id}
                              entering={FadeInUp.springify().damping(18).stiffness(180)}
                              exiting={FadeOutDown.duration(120)}
                              layout={LinearTransition.springify().damping(20).stiffness(160)}
                            >
                              <HierarchicalTaskItem
                                task={item}
                                listColor={listObj?.color || IOS_COLORS.blue}
                                onToggleComplete={toggleTaskComplete}
                                onToggleCollapse={toggleTaskCollapse}
                                onAddSubtask={(parentId) => addSubtask(parentId, 'Nueva subtarea')}
                                onPress={(t) => setInspectingTask(t)}
                                onDelete={deleteTask}
                                onToggleFlag={toggleFlag}
                                isDark={isDark}
                              />
                            </Animated.View>
                          );
                        })}
                      </View>
                    );
                  })}
                </ScrollView>
              ) : (
                // Lista plana de tareas
                <FlatList
                  data={flattenedTasks}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews
                  contentContainerStyle={{ paddingBottom: 24 }}
                  renderItem={({ item }) => {
                    const listObj = lists.find((l) => l.id === item.list_id);

                    return (
                      <Animated.View
                        entering={FadeInUp.springify().damping(18).stiffness(180)}
                        exiting={FadeOutDown.duration(120)}
                        layout={LinearTransition.springify().damping(20).stiffness(160)}
                      >
                        <HierarchicalTaskItem
                          task={item}
                          listColor={listObj?.color || IOS_COLORS.blue}
                          onToggleComplete={toggleTaskComplete}
                          onToggleCollapse={toggleTaskCollapse}
                          onAddSubtask={(parentId) => addSubtask(parentId, 'Nueva subtarea')}
                          onPress={(t) => setInspectingTask(t)}
                          onDelete={deleteTask}
                          onToggleFlag={toggleFlag}
                          isDark={isDark}
                        />
                      </Animated.View>
                    );
                  }}
                />
              )}
            </View>
          )}
        </View>

        {/* FAB Flotante Circular iPadOS */}
        <Pressable
          onPress={() => setIsCreateReminderModalOpen(true)}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.92 : 1 }],
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: '#007AFF',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            ...createShadow('#007AFF', { width: 0, height: 4 }, 0.4, 10),
          })}
        >
          <Plus size={26} color="#FFFFFF" strokeWidth={2.6} />
        </Pressable>
      </View>

      {/* Modal Flotante de Creación de Recordatorios */}
      <CreateReminderModal
        visible={isCreateReminderModalOpen}
        onClose={() => {
          setIsCreateReminderModalOpen(false);
          setTargetSectionForNewTask(null);
        }}
        lists={lists}
        sections={sections}
        defaultListId={selectedListId}
        defaultSectionId={targetSectionForNewTask}
        defaultDueDate={activeSmartFilter === 'today' ? new Date().toISOString().split('T')[0] : null}
        defaultFlagged={activeSmartFilter === 'flagged'}
        onAddTask={async (t) => {
          await addTask({
            ...t,
            section_id: t.section_id || targetSectionForNewTask,
          });
          setTargetSectionForNewTask(null);
        }}
        isDark={isDark}
      />

      {/* Modal Inspector Detallado de Tarea */}
      <ReminderDetailSheet
        visible={Boolean(inspectingTask)}
        task={inspectingTask}
        lists={lists}
        subtasks={subtasksOfInspecting}
        onClose={() => setInspectingTask(null)}
        onSave={async (updates) => {
          if (inspectingTask) {
            await updateTask(inspectingTask.id, updates);
          }
        }}
        onDelete={async (id) => {
          await deleteTask(id);
        }}
        onAddSubtask={async (parentId, title) => {
          await addSubtask(parentId, title);
        }}
        onToggleSubtask={async (id) => {
          await toggleTaskComplete(id);
        }}
        isDark={isDark}
      />

      {/* Modal Crear Nueva Lista */}
      <Modal visible={isAddListModalOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <View
            style={{
              width: '90%',
              maxWidth: 420,
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 16,
              ...createShadow('#000000', { width: 0, height: 6 }, 0.25, 16),
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary }}>
                Nueva Lista
              </Text>
              <Pressable onPress={() => setIsAddListModalOpen(false)}>
                <X size={18} color={theme.text.secondary} />
              </Pressable>
            </View>

            <TextInput
              value={newListName}
              onChangeText={setNewListName}
              placeholder="Nombre de la lista (ej. Universidad)"
              placeholderTextColor={theme.text.tertiary}
              style={{
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 14,
                fontSize: 15,
                fontWeight: '700',
                color: theme.text.primary,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />

            {/* Selector de Color */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                Color Temático
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                {[
                  isDark ? '#0A84FF' : '#007AFF', // Blue
                  isDark ? '#FF453A' : '#FF3B30', // Red
                  isDark ? '#30D158' : '#34C759', // Green
                  isDark ? '#FF9F0A' : '#FF9500', // Orange
                  isDark ? '#FFD60A' : '#FFCC00', // Yellow
                  isDark ? '#BF5AF2' : '#AF52DE', // Purple
                  isDark ? '#FF375F' : '#FF2D55', // Pink
                  isDark ? '#40C8E0' : '#30B0C7', // Teal
                  isDark ? '#5E5CE6' : '#5856D6', // Indigo
                  isDark ? '#63E6E2' : '#00C7BE', // Mint
                  isDark ? '#64D2FF' : '#32ADE6', // Cyan
                ].map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setNewListColor(c)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: c,
                      borderWidth: newListColor === c ? 3 : 0,
                      borderColor: '#FFFFFF',
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Selector de Ícono / Emoji */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>
                Ícono o Emoji
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {[
                  'list',
                  'graduation-cap',
                  'user',
                  'shopping-cart',
                  'briefcase',
                  'book',
                  'bookmark',
                  'heart',
                  'star',
                  'home',
                  'code',
                  'dumbbell',
                  'sparkles',
                  'coffee',
                  'car',
                  '🎓',
                  '🛒',
                  '💼',
                  '🏠',
                  '🏋️',
                  '⭐',
                  '🎯',
                  '💡',
                  '🍕',
                ].map((ic) => {
                  const isSelected = newListIcon === ic;
                  return (
                    <Pressable
                      key={ic}
                      onPress={() => setNewListIcon(ic)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        backgroundColor: isSelected
                          ? newListColor
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : '#F2F2F7',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? '#FFFFFF' : theme.border,
                      }}
                    >
                      <ListIconRenderer
                        icon={ic}
                        size={18}
                        color={isSelected ? '#FFFFFF' : theme.text.primary}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={handleCreateList}
              style={{
                backgroundColor: newListColor,
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>
                Crear Lista
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Crear Nueva Sección */}
      <Modal visible={isAddSectionModalOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <View
            style={{
              width: '90%',
              maxWidth: 420,
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 16,
              ...createShadow('#000000', { width: 0, height: 6 }, 0.25, 16),
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text.primary }}>
                Nueva Sección en {activeListObj?.title}
              </Text>
              <Pressable onPress={() => setIsAddSectionModalOpen(false)}>
                <X size={18} color={theme.text.secondary} />
              </Pressable>
            </View>

            <TextInput
              value={newSectionName}
              onChangeText={setNewSectionName}
              placeholder="Nombre (ej. Salud, Trabajo, Otros)"
              placeholderTextColor={theme.text.tertiary}
              style={{
                backgroundColor: theme.cardSecondary,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 14,
                fontSize: 15,
                fontWeight: '700',
                color: theme.text.primary,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />

            <Pressable
              onPress={handleCreateSection}
              style={{
                backgroundColor: activeListObj?.color || IOS_COLORS.blue,
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>
                Guardar Sección
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
