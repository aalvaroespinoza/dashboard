import { create } from 'zustand';
import { ActiveModule } from '../types';
import { settingsRepo } from '../db/repositories/settingsRepo';

interface AppState {
  themeMode: 'dark' | 'light';
  isSidebarCollapsed: boolean;
  activeModule: ActiveModule;
  searchQuery: string;
  isInitialLoading: boolean;

  setThemeMode: (mode: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActiveModule: (module: ActiveModule) => void;
  setSearchQuery: (query: string) => void;
  initApp: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  themeMode: 'light', // Estilo iOS HIG por defecto
  isSidebarCollapsed: false,
  activeModule: 'dashboard',
  searchQuery: '',
  isInitialLoading: true,

  setThemeMode: async (mode) => {
    set({ themeMode: mode });
    await settingsRepo.set('theme_mode', mode);
  },

  toggleTheme: async () => {
    const nextMode = get().themeMode === 'dark' ? 'light' : 'dark';
    set({ themeMode: nextMode });
    await settingsRepo.set('theme_mode', nextMode);
  },

  setSidebarCollapsed: async (collapsed) => {
    set({ isSidebarCollapsed: collapsed });
    await settingsRepo.set('sidebar_collapsed', String(collapsed));
  },

  toggleSidebar: async () => {
    const next = !get().isSidebarCollapsed;
    set({ isSidebarCollapsed: next });
    await settingsRepo.set('sidebar_collapsed', String(next));
  },

  setActiveModule: (module) => set({ activeModule: module }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  initApp: async () => {
    try {
      const savedTheme = await settingsRepo.get('theme_mode', 'dark');
      const savedSidebar = await settingsRepo.get('sidebar_collapsed', 'false');
      set({
        themeMode: savedTheme === 'light' ? 'light' : 'dark',
        isSidebarCollapsed: savedSidebar === 'true',
        isInitialLoading: false,
      });
    } catch {
      set({ isInitialLoading: false });
    }
  },
}));
