import { create } from 'zustand';
import {
  TaskItem,
  TaskList,
  Priority,
  RemindersViewMode,
  RemindersGroupBy,
  SmartListFilter,
} from '../types';
import { tasksRepo } from '../db/repositories/tasksRepo';
import { listsRepo } from '../db/repositories/listsRepo';

export interface GritColumnData {
  id: string;
  title: string;
  color?: string;
  tasks: TaskItem[];
}

interface TasksState {
  lists: TaskList[];
  tasks: TaskItem[];
  selectedListId: string | null;
  activeSmartFilter: SmartListFilter;
  viewMode: RemindersViewMode;
  groupBy: RemindersGroupBy;
  collapsedTaskIds: string[];
  isLoading: boolean;
  filterPriority: Priority | 'all';
  searchFilter: string;

  // Acciones de Carga y Navegación
  loadTasksAndLists: () => Promise<void>;
  setSelectedListId: (listId: string | null) => void;
  setActiveSmartFilter: (filter: SmartListFilter) => void;
  setViewMode: (mode: RemindersViewMode) => void;
  setGroupBy: (groupBy: RemindersGroupBy) => void;
  setFilterPriority: (priority: Priority | 'all') => void;
  setSearchFilter: (text: string) => void;

  // Acciones de Tareas
  addTask: (data: {
    title: string;
    list_id: string;
    parent_id?: string | null;
    notes?: string;
    due_date?: string;
    due_time?: string;
    priority?: Priority;
    flagged?: number;
    rrule?: string | null;
    tags?: string[];
  }) => Promise<TaskItem>;

  addSubtask: (parentId: string, title: string) => Promise<TaskItem | null>;
  indentTask: (taskId: string) => Promise<void>;
  outdentTask: (taskId: string) => Promise<void>;
  toggleTaskCollapse: (taskId: string) => void;
  toggleFlag: (taskId: string) => Promise<void>;

  updateTask: (id: string, updates: Partial<TaskItem>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  updatePositions: (items: { id: string; position: number; list_id?: string; parent_id?: string | null }[]) => Promise<void>;

  // Acciones de Listas
  addList: (title: string, color?: string, icon?: string) => Promise<TaskList>;
  updateList: (id: string, updates: Partial<TaskList>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;

  // Selectores Derivados en Memoria (0ms Lag)
  getFlattenedTasks: () => TaskItem[];
  getGritColumns: () => GritColumnData[];
  getSmartCounts: () => {
    today: number;
    scheduled: number;
    all: number;
    flagged: number;
    completed: number;
  };
}

export const useTasksStore = create<TasksState>((set, get) => ({
  lists: [],
  tasks: [],
  selectedListId: null,
  activeSmartFilter: 'all',
  viewMode: 'columns',
  groupBy: 'list',
  collapsedTaskIds: [],
  isLoading: false,
  filterPriority: 'all',
  searchFilter: '',

  loadTasksAndLists: async () => {
    set({ isLoading: true });
    try {
      const [lists, tasks] = await Promise.all([listsRepo.getAll(), tasksRepo.getAll()]);
      set({ lists, tasks, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setSelectedListId: (listId) => {
    set({
      selectedListId: listId,
      activeSmartFilter: listId ? 'custom' : 'all',
    });
  },

  setActiveSmartFilter: (filter) => {
    set({
      activeSmartFilter: filter,
      selectedListId: null,
    });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setGroupBy: (groupBy) => set({ groupBy }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setSearchFilter: (text) => set({ searchFilter: text }),

  toggleTaskCollapse: (taskId) => {
    set((state) => {
      const isCollapsed = state.collapsedTaskIds.includes(taskId);
      return {
        collapsedTaskIds: isCollapsed
          ? state.collapsedTaskIds.filter((id) => id !== taskId)
          : [...state.collapsedTaskIds, taskId],
      };
    });
  },

  toggleFlag: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const nextFlagged = task.flagged ? 0 : 1;
    await tasksRepo.update(taskId, { flagged: nextFlagged });
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, flagged: nextFlagged } : t)),
    }));
  },

  addTask: async (data) => {
    const listId = data.list_id || get().lists[0]?.id || 'list-default';
    const newTask: Omit<TaskItem, 'created_at' | 'updated_at'> = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      list_id: listId,
      parent_id: data.parent_id || null,
      title: data.title.trim(),
      notes: data.notes?.trim() || null,
      due_date: data.due_date || null,
      due_time: data.due_time || null,
      is_completed: 0,
      completed_at: null,
      priority: data.priority || 'none',
      flagged: data.flagged ?? 0,
      rrule: data.rrule || null,
      tags: data.tags || [],
      position: get().tasks.length,
      sync_status: 'pending_insert',
    };

    const created = await tasksRepo.create(newTask);
    set((state) => ({ tasks: [created, ...state.tasks] }));
    return created;
  },

  addSubtask: async (parentId, title) => {
    const parentTask = get().tasks.find((t) => t.id === parentId);
    if (!parentTask) return null;

    const newSubtask: Omit<TaskItem, 'created_at' | 'updated_at'> = {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      list_id: parentTask.list_id,
      parent_id: parentId,
      title: title.trim(),
      notes: null,
      due_date: parentTask.due_date || null,
      due_time: null,
      is_completed: 0,
      completed_at: null,
      priority: 'none',
      flagged: 0,
      rrule: null,
      tags: [],
      position: get().tasks.filter((t) => t.parent_id === parentId).length,
      sync_status: 'pending_insert',
    };

    const created = await tasksRepo.create(newSubtask);
    set((state) => ({
      tasks: [...state.tasks, created],
      collapsedTaskIds: state.collapsedTaskIds.filter((id) => id !== parentId), // auto-expand parent
    }));
    return created;
  },

  indentTask: async (taskId) => {
    const tasks = get().tasks;
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex <= 0) return;

    const currentTask = tasks[taskIndex];
    // Find previous sibling
    const previousTask = tasks[taskIndex - 1];
    if (!previousTask || previousTask.id === currentTask.id) return;

    await tasksRepo.update(taskId, { parent_id: previousTask.id });
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, parent_id: previousTask.id } : t)),
    }));
  },

  outdentTask: async (taskId) => {
    const currentTask = get().tasks.find((t) => t.id === taskId);
    if (!currentTask || !currentTask.parent_id) return;

    const parentTask = get().tasks.find((t) => t.id === currentTask.parent_id);
    const newParentId = parentTask?.parent_id || null;

    await tasksRepo.update(taskId, { parent_id: newParentId });
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, parent_id: newParentId } : t)),
    }));
  },

  updateTask: async (id, updates) => {
    await tasksRepo.update(id, {
      ...updates,
      sync_status: 'pending_update',
    });
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, sync_status: 'pending_update' } : t
      ),
    }));
  },

  deleteTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task?.icloud_href) {
      await tasksRepo.update(id, { sync_status: 'pending_delete' });
    } else {
      await tasksRepo.delete(id);
    }
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id && t.parent_id !== id),
    }));
  },

  toggleTaskComplete: async (id) => {
    const result = await tasksRepo.toggleComplete(id);
    const completedVal = result.completed ? 1 : 0;
    const now = new Date().toISOString();

    set((state) => {
      let updatedTasks = state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              is_completed: completedVal,
              completed_at: completedVal === 1 ? now : null,
              sync_status: 'pending_update' as const,
            }
          : t
      );

      if (result.nextTaskCreated) {
        updatedTasks = [result.nextTaskCreated, ...updatedTasks];
      }

      return { tasks: updatedTasks };
    });
  },

  updatePositions: async (items) => {
    await tasksRepo.updatePositions(items);
    set((state) => {
      const positionMap = new Map(items.map((i) => [i.id, i.position]));
      const listMap = new Map(items.filter((i) => i.list_id).map((i) => [i.id, i.list_id!]));
      const parentMap = new Map(items.filter((i) => i.parent_id !== undefined).map((i) => [i.id, i.parent_id]));

      return {
        tasks: state.tasks.map((t) => {
          const newPos = positionMap.get(t.id);
          const newList = listMap.get(t.id);
          const newParent = parentMap.get(t.id);
          if (newPos !== undefined || newList !== undefined || newParent !== undefined) {
            return {
              ...t,
              position: newPos !== undefined ? newPos : t.position,
              list_id: newList !== undefined ? newList : t.list_id,
              parent_id: newParent !== undefined ? newParent : t.parent_id,
            };
          }
          return t;
        }),
      };
    });
  },

  addList: async (title, color = '#007AFF', icon = 'list') => {
    const newList: Omit<TaskList, 'created_at' | 'updated_at'> = {
      id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: title.trim(),
      color,
      icon,
      position: get().lists.length,
    };
    const created = await listsRepo.create(newList);
    set((state) => ({ lists: [...state.lists, created] }));
    return created;
  },

  updateList: async (id, updates) => {
    await listsRepo.update(id, updates);
    set((state) => ({
      lists: state.lists.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  },

  deleteList: async (id) => {
    await listsRepo.delete(id);
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== id),
      tasks: state.tasks.filter((t) => t.list_id !== id),
    }));
  },

  // ─── Selectores Memoizados ───────────────────────────────────────────────────

  getSmartCounts: () => {
    const tasks = get().tasks;
    const todayStr = new Date().toISOString().split('T')[0];

    const today = tasks.filter((t) => !t.is_completed && t.due_date === todayStr).length;
    const scheduled = tasks.filter((t) => !t.is_completed && Boolean(t.due_date)).length;
    const all = tasks.filter((t) => !t.is_completed).length;
    const flagged = tasks.filter((t) => !t.is_completed && Boolean(t.flagged)).length;
    const completed = tasks.filter((t) => Boolean(t.is_completed)).length;

    return { today, scheduled, all, flagged, completed };
  },

  getFlattenedTasks: () => {
    const { tasks, selectedListId, activeSmartFilter, collapsedTaskIds, filterPriority, searchFilter } = get();
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Filtrar tareas base según filtro inteligente o lista activa
    let filtered = tasks;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    if (selectedListId) {
      filtered = filtered.filter((t) => t.list_id === selectedListId);
    } else {
      switch (activeSmartFilter) {
        case 'today':
          filtered = filtered.filter((t) => t.due_date === todayStr);
          break;
        case 'scheduled':
          filtered = filtered.filter((t) => Boolean(t.due_date));
          break;
        case 'flagged':
          filtered = filtered.filter((t) => Boolean(t.flagged));
          break;
        case 'completed':
          filtered = filtered.filter((t) => Boolean(t.is_completed));
          break;
        case 'all':
        default:
          break;
      }
    }

    // 2. Construir mapa de padres a hijos
    const childrenMap = new Map<string, TaskItem[]>();
    const rootTasks: TaskItem[] = [];

    tasks.forEach((t) => {
      if (t.parent_id) {
        const arr = childrenMap.get(t.parent_id) || [];
        arr.push(t);
        childrenMap.set(t.parent_id, arr);
      }
    });

    filtered.forEach((t) => {
      if (!t.parent_id || !tasks.some((p) => p.id === t.parent_id)) {
        rootTasks.push(t);
      }
    });

    // Ordenar raíces
    rootTasks.sort((a, b) => {
      if (a.is_completed !== b.is_completed) return a.is_completed - b.is_completed;
      return a.position - b.position;
    });

    // 3. Aplanar árbol linealmente con level y conteo de subtareas
    const flattened: TaskItem[] = [];

    function traverse(item: TaskItem, level: number) {
      const children = childrenMap.get(item.id) || [];
      const isCollapsed = collapsedTaskIds.includes(item.id);
      const subtasksCount = children.length;
      const completedSubtasks = children.filter((c) => c.is_completed).length;

      flattened.push({
        ...item,
        level,
        has_subtasks: subtasksCount > 0,
        subtasks_count: subtasksCount,
        subtasks_completed_count: completedSubtasks,
        is_collapsed: isCollapsed,
      });

      if (!isCollapsed && children.length > 0) {
        children.sort((a, b) => {
          if (a.is_completed !== b.is_completed) return a.is_completed - b.is_completed;
          return a.position - b.position;
        });
        children.forEach((child) => traverse(child, level + 1));
      }
    }

    rootTasks.forEach((root) => traverse(root, 0));
    return flattened;
  },

  getGritColumns: () => {
    const { lists, tasks, groupBy, filterPriority, searchFilter } = get();
    const todayStr = new Date().toISOString().split('T')[0];

    let filtered = tasks;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      filtered = filtered.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (filterPriority !== 'all') {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    if (groupBy === 'list') {
      return lists.map((list) => ({
        id: list.id,
        title: list.title,
        color: list.color || '#007AFF',
        tasks: filtered.filter((t) => t.list_id === list.id && !t.parent_id),
      }));
    }

    if (groupBy === 'priority') {
      return [
        {
          id: 'p-high',
          title: 'P1 · Prioridad Alta',
          color: '#FF3B30',
          tasks: filtered.filter((t) => t.priority === 'high' && !t.parent_id),
        },
        {
          id: 'p-med',
          title: 'P5 · Prioridad Media',
          color: '#FF9500',
          tasks: filtered.filter((t) => t.priority === 'medium' && !t.parent_id),
        },
        {
          id: 'p-low',
          title: 'P9 · Prioridad Baja',
          color: '#007AFF',
          tasks: filtered.filter((t) => t.priority === 'low' && !t.parent_id),
        },
        {
          id: 'p-none',
          title: 'Sin Prioridad',
          color: '#8E8E93',
          tasks: filtered.filter((t) => (!t.priority || t.priority === 'none') && !t.parent_id),
        },
      ];
    }

    // Group by Date
    return [
      {
        id: 'date-overdue',
        title: 'Vencidas',
        color: '#FF3B30',
        tasks: filtered.filter((t) => !t.is_completed && t.due_date && t.due_date < todayStr && !t.parent_id),
      },
      {
        id: 'date-today',
        title: 'Hoy',
        color: '#007AFF',
        tasks: filtered.filter((t) => t.due_date === todayStr && !t.parent_id),
      },
      {
        id: 'date-future',
        title: 'Próximamente',
        color: '#AF52DE',
        tasks: filtered.filter((t) => t.due_date && t.due_date > todayStr && !t.parent_id),
      },
      {
        id: 'date-nodate',
        title: 'Sin Fecha',
        color: '#8E8E93',
        tasks: filtered.filter((t) => !t.due_date && !t.parent_id),
      },
    ];
  },
}));
