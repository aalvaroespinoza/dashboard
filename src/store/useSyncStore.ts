import { create } from 'zustand';
import { credentialsStore } from '../services/caldav/credentialsStore';
import { syncEngine, SyncResult } from '../services/caldav/syncEngine';
import { useTasksStore } from './useTasksStore';
import { useCalendarStore } from './useCalendarStore';

interface SyncState {
  appleId: string;
  serverUrl: string;
  hasCredentials: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  lastResult: SyncResult | null;
  syncLogs: string[];

  loadCredentials: () => Promise<void>;
  saveCredentials: (appleId: string, appPassword: string, serverUrl?: string) => Promise<void>;
  clearCredentials: () => Promise<void>;
  triggerSync: () => Promise<SyncResult>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  appleId: '',
  serverUrl: 'https://caldav.icloud.com',
  hasCredentials: false,
  isSyncing: false,
  lastSyncedAt: null,
  lastResult: null,
  syncLogs: [],

  loadCredentials: async () => {
    try {
      const { appleId, appPassword, caldavUrl } = await credentialsStore.getCredentials();
      set({
        appleId: appleId || '',
        serverUrl: caldavUrl || 'https://caldav.icloud.com',
        hasCredentials: !!(appleId && appPassword),
      });
    } catch {
      set({ hasCredentials: false });
    }
  },

  saveCredentials: async (appleId, appPassword, serverUrl = 'https://caldav.icloud.com') => {
    await credentialsStore.saveCredentials(appleId, appPassword, serverUrl);
    set({
      appleId,
      serverUrl,
      hasCredentials: true,
      syncLogs: [`Credenciales de Apple ID (${appleId}) guardadas correctamente.`],
    });
  },

  clearCredentials: async () => {
    await credentialsStore.clearCredentials();
    set({
      appleId: '',
      hasCredentials: false,
      lastSyncedAt: null,
      lastResult: null,
      syncLogs: ['Credenciales eliminadas.'],
    });
  },

  triggerSync: async () => {
    set({ isSyncing: true });
    const nowStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    try {
      const result = await syncEngine.runFullSync();
      const logs = [...get().syncLogs];

      if (result.success) {
        logs.unshift(
          `[${nowStr}] Sincronización exitosa: ${result.tasksPulled} tareas descargadas, ${result.tasksPushed} enviadas | ${result.eventsPulled} eventos descargados, ${result.eventsPushed} enviados.`
        );
      } else {
        logs.unshift(`[${nowStr}] Falló la sincronización: ${result.errors.join(' | ')}`);
      }

      set({
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        lastResult: result,
        syncLogs: logs.slice(0, 30),
      });

      // Recargar datos en los stores de tareas y calendario
      await Promise.all([
        useTasksStore.getState().loadTasksAndLists(),
        useCalendarStore.getState().loadEvents(),
      ]);

      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Error desconocido';
      set({
        isSyncing: false,
        syncLogs: [`[${nowStr}] Error crítico: ${errorMsg}`, ...get().syncLogs].slice(0, 30),
      });
      return {
        success: false,
        tasksPulled: 0,
        tasksPushed: 0,
        eventsPulled: 0,
        eventsPushed: 0,
        errors: [errorMsg],
      };
    }
  },
}));
