import { create } from 'zustand';
import {
  TaskItem,
  TaskList,
  ListSection,
  Priority,
  RemindersViewMode,
  RemindersGroupBy,
  SmartListFilter,
} from '../types';
import { tasksRepo } from '../db/repositories/tasksRepo';
import { listsRepo } from '../db/repositories/listsRepo';
import { sectionsRepo } from '../db/repositories/sectionsRepo';
import { linkPreviewService } from '../services/linkPreviewService';

export interface GritColumnData {
  id: string;
  title: string;
  color?: string;
  tasks: TaskItem[];
}

export interface SectionGroupedTasks {
  section: ListSection | null;
  tasks: TaskItem[];
}

interface TasksState {
  lists: TaskList[];
  sections: Record<string, ListSection[]>; // [listId] -> sections
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
  loadSectionsForList: (listId: string) => Promise<void>;
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
    section_id?: string | null;
    parent_id?: string | null;
    notes?: string;
    url?: string | null;
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

  // Acciones de Listas & Secciones
  addList: (title: string, color?: string, icon?: string) => Promise<TaskList>;
  updateList: (id: string, updates: Partial<TaskList>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;

  addSection: (listId: string, name: string) => Promise<ListSection>;
  updateSection: (id: string, name: string) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;

  // Selectores Derivados en Memoria (0ms Lag)
  getFlattenedTasks: () => TaskItem[];
  getTasksGroupedBySection: (listId: string) => SectionGroupedTasks[];
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
  sections: {},
  tasks: [],
  selectedListId: null,
  activeSmartFilter: 'all',
  viewMode: 'list',
  groupBy: 'list',
  collapsedTaskIds: [],
  isLoading: false,
  filterPriority: 'all',
  searchFilter: '',

  loadTasksAndLists: async () => {
    set({ isLoading: true });
    try {
      const [lists, tasks] = await Promise.all([listsRepo.getAll(), tasksRepo.getAll()]);
      
      // Cargar secciones de todas las listas
      const sectionsMap: Record<string, ListSection[]> = {};
      await Promise.all(
        lists.map(async (l) => {
          const secs = await sectionsRepo.getByListId(l.id);
          sectionsMap[l.id] = secs;
        })
      );

      set({ lists, sections: sectionsMap, tasks, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadSectionsForList: async (listId: string) => {
    const secs = await sectionsRepo.getByListId(listId);
    set((state) => ({
      sections: {
        ...state.sections,
        [listId]: secs,
      },
    }));
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
    const listId = data.list_id || get().lists[0]?.id || 'list-reminders';
    const detectedUrl = data.url || linkPreviewService.extractUrl(data.title) || linkPreviewService.extractUrl(data.notes || '');

    let linkPreview = null;
    if (detectedUrl) {
      linkPreview = await linkPreviewService.getOrFetchPreview(detectedUrl);
    }

    const newTask: Omit<TaskItem, 'created_at' | 'updated_at'> = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      list_id: listId,
      section_id: data.section_id || null,
      parent_id: data.parent_id || null,
      title: data.title.trim(),
      notes: data.notes?.trim() || null,
      url: detectedUrl,
      link_preview: linkPreview,
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

    const detectedUrl = linkPreviewService.extractUrl(title);
    let linkPreview = null;
    if (detectedUrl) {
      linkPreview = await linkPreviewService.getOrFetchPreview(detectedUrl);
    }

    const newSubtask: Omit<TaskItem, 'created_at' | 'updated_at'> = {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      list_id: parentTask.list_id,
      section_id: parentTask.section_id || null,
      parent_id: parentId,
      title: title.trim(),
      notes: null,
      url: detectedUrl,
      link_preview: linkPreview,
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
      collapsedTaskIds: state.collapsedTaskIds.filter((id) => id !== parentId),
    }));
    return created;
  },

  indentTask: async (taskId) => {
    const tasks = get().tasks;
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex <= 0) return;

    const currentTask = tasks[taskIndex];
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
    await tasksRepo.update(id, updates);
    
    // Si se actualizó el título o url, refrescar la preview
    let linkPreview = undefined;
    if (updates.title || updates.url) {
      const url = updates.url || linkPreviewService.extractUrl(updates.title || '');
      if (url) {
        linkPreview = await linkPreviewService.getOrFetchPreview(url);
      }
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
              ...(linkPreview !== undefined ? { link_preview: linkPreview } : {}),
            }
          : t
      ),
    }));
  },

  deleteTask: async (id) => {
    await tasksRepo.delete(id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id && t.parent_id !== id),
    }));
  },

  toggleTaskComplete: async (id) => {
    const { task, recurringCreated } = await tasksRepo.toggleComplete(id);
    set((state) => {
      let updatedTasks = state.tasks.map((t) => (t.id === id ? task : t));
      if (recurringCreated) {
        updatedTasks = [recurringCreated, ...updatedTasks];
      }
      return { tasks: updatedTasks };
    });
  },

  updatePositions: async (items) => {
    set((state) => {
      const taskMap = new Map(state.tasks.map((t) => [t.id, t]));
      items.forEach((item) => {
        const t = taskMap.get(item.id);
        if (t) {
          t.position = item.position;
          if (item.list_id) t.list_id = item.list_id;
          if (item.parent_id !== undefined) t.parent_id = item.parent_id;
        }
      });
      return { tasks: Array.from(taskMap.values()) };
    });

    for (const item of items) {
      await tasksRepo.update(item.id, {
        position: item.position,
        ...(item.list_id ? { list_id: item.list_id } : {}),
        ...(item.parent_id !== undefined ? { parent_id: item.parent_id } : {}),
      });
    }
  },

  addList: async (title, color = '#007AFF', icon = 'list') => {
    const newList = await listsRepo.create({
      id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      color,
      icon,
      position: get().lists.length,
    });
    set((state) => ({ lists: [...state.lists, newList] }));
    return newList;
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
      selectedListId: state.selectedListId === id ? null : state.selectedListId,
    }));
  },

  addSection: async (listId, name) => {
    const newSection = await sectionsRepo.createSection({
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      list_id: listId,
      name,
      position: (get().sections[listId] || []).length,
    });
    set((state) => ({
      sections: {
        ...state.sections,
        [listId]: [...(state.sections[listId] || []), newSection],
      },
    }));
    return newSection;
  },

  updateSection: async (id, name) => {
    await sectionsRepo.updateSection(id, name);
    set((state) => {
      const copy = { ...state.sections };
      for (const listId in copy) {
        copy[listId] = copy[listId].map((s) => (s.id === id ? { ...s, name } : s));
      }
      return { sections: copy };
    });
  },

  deleteSection: async (id) => {
    await sectionsRepo.deleteSection(id);
    set((state) => {
      const copy = { ...state.sections };
      for (const listId in copy) {
        copy[listId] = copy[listId].filter((s) => s.id !== id);
      }
      return {
        sections: copy,
        tasks: state.tasks.map((t) => (t.section_id === id ? { ...t, section_id: null } : t)),
      };
    });
  },

  getSmartCounts: () => {
    const tasks = get().tasks;
    const todayStr = '2026-08-24';

    let today = 0;
    let scheduled = 0;
    let all = 0;
    let flagged = 0;
    let completed = 0;

    tasks.forEach((t) => {
      if (t.is_completed) {
        completed++;
      } else {
        all++;
        if (t.due_date && t.due_date <= todayStr) {
          today++;
        }
        if (t.due_date && t.due_date > todayStr) {
          scheduled++;
        }
        if (t.flagged) {
          flagged++;
        }
      }
    });

    return { today, scheduled, all, flagged, completed };
  },

  getFlattenedTasks: () => {
    const {
      tasks,
      selectedListId,
      activeSmartFilter,
      filterPriority,
      searchFilter,
      collapsedTaskIds,
    } = get();
    const todayStr = '2026-08-24';

    // 1. Filtrado Base
    let filtered = tasks;

    if (searchFilter.trim().length > 0) {
      const query = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.notes?.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    } else if (activeSmartFilter === 'custom' && selectedListId) {
      filtered = filtered.filter((t) => t.list_id === selectedListId);
    } else if (activeSmartFilter === 'today') {
      filtered = filtered.filter((t) => !t.is_completed && t.due_date && t.due_date <= todayStr);
    } else if (activeSmartFilter === 'scheduled') {
      filtered = filtered.filter((t) => !t.is_completed && t.due_date && t.due_date > todayStr);
    } else if (activeSmartFilter === 'flagged') {
      filtered = filtered.filter((t) => !t.is_completed && t.flagged);
    } else if (activeSmartFilter === 'completed') {
      filtered = filtered.filter((t) => t.is_completed);
    } else {
      // 'all'
      filtered = filtered.filter((t) => !t.is_completed);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    // 2. Construcción de Jerarquía de Subtareas en Memoria
    const rootTasks: TaskItem[] = [];
    const childrenMap = new Map<string, TaskItem[]>();

    filtered.forEach((task) => {
      if (!task.parent_id) {
        rootTasks.push(task);
      } else {
        const siblings = childrenMap.get(task.parent_id) || [];
        siblings.push(task);
        childrenMap.set(task.parent_id, siblings);
      }
    });

    const flatList: TaskItem[] = [];

    const traverse = (task: TaskItem, level: number) => {
      const children = childrenMap.get(task.id) || [];
      const isCollapsed = collapsedTaskIds.includes(task.id);
      const subtasksCompleted = children.filter((c) => c.is_completed).length;

      flatList.push({
        ...task,
        level,
        has_subtasks: children.length > 0,
        subtasks_count: children.length,
        subtasks_completed_count: subtasksCompleted,
        is_collapsed: isCollapsed,
      });

      if (!isCollapsed && children.length > 0) {
        children.forEach((child) => traverse(child, level + 1));
      }
    };

    rootTasks.forEach((root) => traverse(root, 0));
    return flatList;
  },

  getTasksGroupedBySection: (listId: string) => {
    const flattened = get().getFlattenedTasks().filter((t) => t.list_id === listId);
    const listSections = get().sections[listId] || [];

    const grouped: SectionGroupedTasks[] = [];

    // Secciones definidas
    listSections.forEach((sec) => {
      const secTasks = flattened.filter((t) => t.section_id === sec.id);
      grouped.push({
        section: sec,
        tasks: secTasks,
      });
    });

    // Tareas sin sección
    const unsectionedTasks = flattened.filter((t) => !t.section_id);
    if (unsectionedTasks.length > 0 || listSections.length === 0) {
      grouped.push({
        section: null,
        tasks: unsectionedTasks,
      });
    }

    return grouped;
  },

  getGritColumns: () => {
    const { tasks, lists, groupBy, filterPriority, searchFilter } = get();
    const todayStr = '2026-08-24';

    let baseTasks = tasks.filter((t) => !t.is_completed);

    if (searchFilter.trim().length > 0) {
      const q = searchFilter.toLowerCase();
      baseTasks = baseTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (filterPriority !== 'all') {
      baseTasks = baseTasks.filter((t) => t.priority === filterPriority);
    }

    if (groupBy === 'list') {
      return lists.map((l) => ({
        id: l.id,
        title: l.title,
        color: l.color,
        tasks: baseTasks.filter((t) => t.list_id === l.id && !t.parent_id),
      }));
    }

    if (groupBy === 'priority') {
      return [
        { id: 'high', title: 'Alta Prioridad (!!!)', color: '#FF3B30', tasks: baseTasks.filter((t) => t.priority === 'high') },
        { id: 'medium', title: 'Media Prioridad (!!)', color: '#FF9500', tasks: baseTasks.filter((t) => t.priority === 'medium') },
        { id: 'low', title: 'Baja Prioridad (!)', color: '#007AFF', tasks: baseTasks.filter((t) => t.priority === 'low') },
        { id: 'none', title: 'Sin Prioridad', color: '#8E8E93', tasks: baseTasks.filter((t) => t.priority === 'none') },
      ];
    }

    // groupBy === 'date'
    return [
      { id: 'today', title: 'Para Hoy', color: '#007AFF', tasks: baseTasks.filter((t) => t.due_date && t.due_date <= todayStr) },
      { id: 'tomorrow', title: 'Mañana', color: '#34C759', tasks: baseTasks.filter((t) => t.due_date === '2026-08-25') },
      { id: 'later', title: 'Próximamente', color: '#AF52DE', tasks: baseTasks.filter((t) => t.due_date && t.due_date > '2026-08-25') },
      { id: 'nodate', title: 'Sin Fecha', color: '#8E8E93', tasks: baseTasks.filter((t) => !t.due_date) },
    ];
  },
}));
