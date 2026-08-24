import { create } from 'zustand';
import { BusRouteItem, BusStopItem, BusScheduleItem, DayType } from '../types';
import { busRepo } from '../db/repositories/busRepo';
import { settingsRepo } from '../db/repositories/settingsRepo';
import { Direction } from '../services/busService';

interface BusStoreState {
  // Estado principal
  routes: BusRouteItem[];
  selectedRouteId: string | null;
  originStop: string;
  destinationStop: string;
  selectedDirection: 'outbound' | 'inbound';
  selectedDayType: DayType;
  favoriteRouteIds: string[];

  // Paradas y horarios
  stops: BusStopItem[];
  schedules: BusScheduleItem[];
  searchQuery: string;
  searchResults: { stop: BusStopItem; route: BusRouteItem }[];
  isLoading: boolean;

  // Acciones
  loadRoutesAndPreferences: () => Promise<void>;
  loadRoutes: () => Promise<void>;
  selectRoute: (routeId: string | null) => Promise<void>;
  setOriginStop: (origin: string) => Promise<void>;
  setDestinationStop: (dest: string) => Promise<void>;
  setDirection: (direction: 'outbound' | 'inbound') => Promise<void>;
  setDayType: (dayType: DayType) => Promise<void>;
  toggleFavoriteRoute: (routeId: string) => Promise<void>;
  isRouteFavorite: (routeId: string) => boolean;
  setSearchQuery: (query: string) => Promise<void>;
}

const SETTING_ROUTE = 'bus_pref_selected_route';
const SETTING_ORIGIN = 'bus_pref_origin_stop';
const SETTING_DEST = 'bus_pref_dest_stop';
const SETTING_DIR = 'bus_pref_direction';
const SETTING_DAY_TYPE = 'bus_pref_day_type';
const SETTING_FAVORITES = 'bus_pref_favorites';

export const useBusStore = create<BusStoreState>((set, get) => ({
  routes: [],
  selectedRouteId: 'canelo',
  originStop: 'Despeñaderos',
  destinationStop: 'Córdoba',
  selectedDirection: 'outbound',
  selectedDayType: 'weekday',
  favoriteRouteIds: ['canelo', 'lumasa'],
  stops: [],
  schedules: [],
  searchQuery: '',
  searchResults: [],
  isLoading: false,

  loadRoutesAndPreferences: async () => {
    set({ isLoading: true });
    try {
      // 1. Cargar rutas de la base SQLite
      const routes = await busRepo.getAllRoutes();

      // 2. Cargar preferencias persistidas del usuario
      const [
        savedRoute,
        savedOrigin,
        savedDest,
        savedDir,
        savedDayType,
        savedFavsJson,
      ] = await Promise.all([
        settingsRepo.get(SETTING_ROUTE, 'canelo'),
        settingsRepo.get(SETTING_ORIGIN, 'Despeñaderos'),
        settingsRepo.get(SETTING_DEST, 'Córdoba'),
        settingsRepo.get(SETTING_DIR, 'outbound'),
        settingsRepo.get(SETTING_DAY_TYPE, 'weekday'),
        settingsRepo.get(SETTING_FAVORITES, '["canelo","lumasa"]'),
      ]);

      let favs: string[] = ['canelo', 'lumasa'];
      try {
        favs = JSON.parse(savedFavsJson);
      } catch {
        favs = ['canelo', 'lumasa'];
      }

      const activeRouteId = routes.some((r) => r.id === savedRoute)
        ? savedRoute
        : routes.length > 0
        ? routes[0].id
        : null;

      const direction = (savedDir === 'inbound' ? 'inbound' : 'outbound') as 'outbound' | 'inbound';
      const dayType = (['weekday', 'saturday', 'sunday_holiday'].includes(savedDayType)
        ? savedDayType
        : 'weekday') as DayType;

      set({
        routes,
        selectedRouteId: activeRouteId,
        originStop: savedOrigin || 'Despeñaderos',
        destinationStop: savedDest || 'Córdoba',
        selectedDirection: direction,
        selectedDayType: dayType,
        favoriteRouteIds: favs,
      });

      // 3. Cargar paradas y horarios asociados a la ruta activa
      if (activeRouteId) {
        const [stops, schedules] = await Promise.all([
          busRepo.getStopsByRoute(activeRouteId, direction),
          busRepo.getSchedulesByRoute(activeRouteId, dayType),
        ]);
        set({ stops, schedules, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  loadRoutes: async () => {
    await get().loadRoutesAndPreferences();
  },

  selectRoute: async (routeId: string | null) => {
    set({ selectedRouteId: routeId, isLoading: true });
    try {
      if (routeId) {
        await settingsRepo.set(SETTING_ROUTE, routeId);
        const [stops, schedules] = await Promise.all([
          busRepo.getStopsByRoute(routeId, get().selectedDirection),
          busRepo.getSchedulesByRoute(routeId, get().selectedDayType),
        ]);
        set({ stops, schedules, isLoading: false });
      } else {
        set({ stops: [], schedules: [], isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setOriginStop: async (origin: string) => {
    set({ originStop: origin });
    await settingsRepo.set(SETTING_ORIGIN, origin);
  },

  setDestinationStop: async (dest: string) => {
    set({ destinationStop: dest });
    await settingsRepo.set(SETTING_DEST, dest);
  },

  setDirection: async (direction: 'outbound' | 'inbound') => {
    set({ selectedDirection: direction });
    await settingsRepo.set(SETTING_DIR, direction);
    const routeId = get().selectedRouteId;
    if (routeId) {
      const stops = await busRepo.getStopsByRoute(routeId, direction);
      set({ stops });
    }
  },

  setDayType: async (dayType: DayType) => {
    set({ selectedDayType: dayType });
    await settingsRepo.set(SETTING_DAY_TYPE, dayType);
    const routeId = get().selectedRouteId;
    if (routeId) {
      const schedules = await busRepo.getSchedulesByRoute(routeId, dayType);
      set({ schedules });
    }
  },

  toggleFavoriteRoute: async (routeId: string) => {
    const current = get().favoriteRouteIds;
    const exists = current.includes(routeId);
    const nextFavs = exists ? current.filter((id) => id !== routeId) : [...current, routeId];
    set({ favoriteRouteIds: nextFavs });
    await settingsRepo.set(SETTING_FAVORITES, JSON.stringify(nextFavs));
  },

  isRouteFavorite: (routeId: string) => {
    return get().favoriteRouteIds.includes(routeId);
  },

  setSearchQuery: async (query: string) => {
    set({ searchQuery: query });
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    const results = await busRepo.searchStops(query.trim());
    set({ searchResults: results });
  },
}));
