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
import { RemindersViewToggle } from './components/RemindersViewToggle';
import { HierarchicalTaskItem } from './components/HierarchicalTaskItem';
import { GritColumnBoard } from './components/GritColumnBoard';
import { QuickTaskToolbar } from './components/QuickTaskToolbar';
import { ReminderDetailSheet } from './components/ReminderDetailSheet';
import { IOS_COLORS } from '../../styles/theme';

export const RemindersScreen: React.FC = () => {
  const { themeMode } = useAppStore();
  const isDark = themeMode === 'dark';
  const theme = isDark ? IOS_COLORS.dark : IOS_COLORS.light;

  const {
    lists,
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
    getFlattenedTasks,
    getGritColumns,
    getSmartCounts,
  } = useTasksStore();

  useEffect(() => {
    loadTasksAndLists();
  }, []);

  // Modales
  const [inspectingTask, setInspectingTask] = useState<TaskItem | null>(null);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState(IOS_COLORS.blue);

  const smartCounts = getSmartCounts();
  const flattenedTasks = getFlattenedTasks();
  const gritColumns = getGritColumns();

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    await addList(newListName.trim(), newListColor);
    setNewListName('');
    setIsAddListModalOpen(false);
  };

  // Subtareas de la tarea en inspección
  const subtasksOfInspecting = inspectingTask
    ? tasks.filter((t) => t.parent_id === inspectingTask.id)
    : [];

  const activeListObj = lists.find((l) => l.id === selectedListId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <View style={{ flex: 1, padding: 24, gap: 16 }}>
        {/* 1. Header General con Buscador y Acción Nueva Lista */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: '900', color: theme.text.primary, letterSpacing: -0.8 }}>
              {activeListObj ? activeListObj.title : 'Recordatorios'}
            </Text>
            <Text style={{ fontSize: 13, color: theme.text.secondary, marginTop: 2 }}>
              {flattenedTasks.filter((t) => !t.is_completed).length} pendientes
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Buscador */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.card,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                width: 220,
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

            {/* Botón + Nueva Lista */}
            <Pressable
              onPress={() => setIsAddListModalOpen(true)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.85 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.card,
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
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
        <SmartListCards
          activeFilter={activeSmartFilter}
          onSelectFilter={setActiveSmartFilter}
          counts={smartCounts}
          isDark={isDark}
        />

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

        {/* 4. Contenido Principal (Lista Virtualizada o Tablero Columnas) */}
        <View style={{ flex: 1 }}>
          {viewMode === 'columns' ? (
            <GritColumnBoard
              columns={gritColumns}
              onToggleComplete={toggleTaskComplete}
              onToggleCollapse={toggleTaskCollapse}
              onAddSubtask={(parentId) => addSubtask(parentId, 'Nueva subtarea')}
              onOpenNewTask={(listId) => {
                // Focus quick toolbar with list
                if (listId) setSelectedListId(listId);
              }}
              onOpenEditTask={(task) => setInspectingTask(task)}
              onToggleFlag={toggleFlag}
              isDark={isDark}
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, padding: 16 }}>
              {flattenedTasks.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 }}>
                  <Inbox size={36} color={theme.text.tertiary} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text.primary }}>
                    No hay recordatorios en esta vista
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.text.secondary }}>
                    Usa la barra rápida inferior para crear tu primer recordatorio.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={flattenedTasks}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews
                  contentContainerStyle={{ paddingBottom: 20 }}
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

        {/* 5. Barra de Acceso Rápido Flotante (Quick Task Toolbar) */}
        <QuickTaskToolbar
          lists={lists}
          activeListId={selectedListId}
          onAddTask={async (t) => {
            await addTask(t);
          }}
          isDark={isDark}
        />
      </View>

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
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              width: 400,
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 16,
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
              placeholder="Nombre de la lista"
              placeholderTextColor={theme.text.tertiary}
              style={{
                backgroundColor: theme.cardSecondary,
                padding: 12,
                borderRadius: 12,
                fontSize: 14,
                fontWeight: '700',
                color: theme.text.primary,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            />

            {/* Selector de Color */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>Color</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[
                  IOS_COLORS.blue,
                  IOS_COLORS.green,
                  IOS_COLORS.red,
                  IOS_COLORS.orange,
                  IOS_COLORS.purple,
                  IOS_COLORS.cyan,
                ].map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setNewListColor(c)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: c,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: newListColor === c ? 3 : 0,
                      borderColor: '#FFFFFF',
                    }}
                  />
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleCreateList}
              style={{
                backgroundColor: IOS_COLORS.blue,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                Crear Lista
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
