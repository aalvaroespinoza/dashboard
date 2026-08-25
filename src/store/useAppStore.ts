import { create } from 'zustand';
import { ActiveModule } from '../types';
import { settingsRepo } from '../db/repositories/settingsRepo';

interface AppState {
  themeMode: 'dark' | 'light';
  isSidebarCollapsed: boolean;
  activeModule: ActiveModule;
  searchQuery: string;
  isInitialLoading: boolean;

  // Perfil del Usuario
  userName: string;
  userAvatar: string;
  userTitle: string;

  setThemeMode: (mode: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActiveModule: (module: ActiveModule) => void;
  setSearchQuery: (query: string) => void;
  updateProfile: (profile: { userName?: string; userAvatar?: string; userTitle?: string }) => Promise<void>;
  initApp: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  themeMode: 'light', // Estilo iOS HIG por defecto
  isSidebarCollapsed: false,
  activeModule: 'dashboard',
  searchQuery: '',
  isInitialLoading: true,

  userName: 'Álvaro',
  userAvatar: '👨‍💻',
  userTitle: 'Product Designer & Dev',

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

  updateProfile: async ({ userName, userAvatar, userTitle }) => {
    const updates: Partial<AppState> = {};
    if (userName !== undefined) {
      updates.userName = userName;
      await settingsRepo.set('user_name', userName);
    }
    if (userAvatar !== undefined) {
      updates.userAvatar = userAvatar;
      await settingsRepo.set('user_avatar', userAvatar);
    }
    if (userTitle !== undefined) {
      updates.userTitle = userTitle;
      await settingsRepo.set('user_title', userTitle);
    }
    set(updates);
  },

  initApp: async () => {
    try {
      const savedTheme = await settingsRepo.get('theme_mode', 'light');
      const savedSidebar = await settingsRepo.get('sidebar_collapsed', 'false');
      const savedName = await settingsRepo.get('user_name', 'Álvaro');
      const savedAvatar = await settingsRepo.get('user_avatar', '👨‍💻');
      const savedTitle = await settingsRepo.get('user_title', 'Product Designer & Dev');

      set({
        themeMode: savedTheme === 'dark' ? 'dark' : 'light',
        isSidebarCollapsed: savedSidebar === 'true',
        userName: savedName,
        userAvatar: savedAvatar,
        userTitle: savedTitle,
        isInitialLoading: false,
      });
    } catch {
      set({ isInitialLoading: false });
    }
  },
}));
