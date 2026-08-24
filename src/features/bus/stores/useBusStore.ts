import { create } from 'zustand';
import type {
  ScenarioId,
  DayOfWeek,
  Direction,
  NextBusResult,
  ResolvedBusService,
} from '../types';
import {
  determineScenario,
  dateToSchoolDay,
} from '../engine/scenario-engine';
import {
  getNextBuses,
  getScheduleForDay,
  getCurrentTimeString,
} from '../engine/schedule.service';
import { settingsRepo } from '../../../db/repositories/settingsRepo';

interface BusStoreState {
  // Estado del motor y filtros
  activeScenario: ScenarioId | string;
  isAutoScenarioMode: boolean;
  selectedCompany: string | null;
  filterType: 'all' | 'ida' | 'vuelta';
  favorites: string[];
  selectedDay: DayOfWeek;
  tuesdayHasArquitectura: boolean;
  sleepsInCordoba: boolean;

  // Paradas de viaje
  originStop: string;
  destinationStop: string;

  // Datos calculados
  nextBuses: NextBusResult[];
  allDayServices: { ida: ResolvedBusService[]; vuelta: ResolvedBusService[] };
  isLoading: boolean;

  // Acciones
  loadSavedPreferences: () => Promise<void>;
  setScenario: (scenarioId: ScenarioId | string) => Promise<void>;
  toggleAutoMode: () => Promise<void>;
  setCompanyFilter: (companyId: string | null) => Promise<void>;
  setFilterType: (filter: 'all' | 'ida' | 'vuelta') => Promise<void>;
  toggleFavorite: (companyId: string) => Promise<void>;
  isFavorite: (companyId: string) => boolean;
  setSelectedDay: (day: DayOfWeek) => void;
  setTuesdayHasArquitectura: (val: boolean) => Promise<void>;
  setSleepsInCordoba: (val: boolean) => Promise<void>;
  evaluateAutoScenario: () => void;
  refreshCalculations: () => void;
}

const SETTING_SCENARIO = 'bus_active_scenario';
const SETTING_AUTO_MODE = 'bus_auto_scenario_mode';
const SETTING_COMPANY = 'bus_selected_company';
const SETTING_FILTER = 'bus_filter_type';
const SETTING_FAVORITES = 'bus_favorites';
const SETTING_ARQ = 'bus_tuesday_arquitectura';
const SETTING_SLEEP_CBA = 'bus_sleep_cordoba';

export const useBusStore = create<BusStoreState>((set, get) => ({
  activeScenario: 'cursado-regular',
  isAutoScenarioMode: true,
  selectedCompany: null,
  filterType: 'all',
  favorites: ['canelo', 'lumasa'],
  selectedDay: dateToSchoolDay(new Date()),
  tuesdayHasArquitectura: true,
  sleepsInCordoba: false,
  originStop: 'Despeñaderos',
  destinationStop: 'Córdoba (UTN)',
  nextBuses: [],
  allDayServices: { ida: [], vuelta: [] },
  isLoading: false,

  evaluateAutoScenario: () => {
    if (!get().isAutoScenarioMode) return;
    const now = new Date();
    const autoScenario = determineScenario({
      tuesdayHasArquitectura: get().tuesdayHasArquitectura,
      referenceDate: now,
    });
    set({
      activeScenario: autoScenario,
      selectedDay: dateToSchoolDay(now),
    });
    get().refreshCalculations();
  },

  refreshCalculations: () => {
    const { selectedDay, selectedCompany, filterType } = get();
    const currentTime = getCurrentTimeString();
    const dir: Direction | undefined = filterType === 'all' ? undefined : filterType;

    const next = getNextBuses({
      direction: dir,
      day: selectedDay,
      currentTime,
      companyId: selectedCompany || undefined,
      limit: 6,
    });

    const allDay = getScheduleForDay(selectedDay);

    set({ nextBuses: next, allDayServices: allDay });
  },

  loadSavedPreferences: async () => {
    set({ isLoading: true });
    try {
      const [
        savedScenario,
        savedAutoMode,
        savedCompany,
        savedFilter,
        savedFavsJson,
        savedArq,
        savedSleep,
      ] = await Promise.all([
        settingsRepo.get(SETTING_SCENARIO, 'cursado-regular'),
        settingsRepo.get(SETTING_AUTO_MODE, 'true'),
        settingsRepo.get(SETTING_COMPANY, ''),
        settingsRepo.get(SETTING_FILTER, 'all'),
        settingsRepo.get(SETTING_FAVORITES, '["canelo","lumasa"]'),
        settingsRepo.get(SETTING_ARQ, 'true'),
        settingsRepo.get(SETTING_SLEEP_CBA, 'false'),
      ]);

      let favs: string[] = ['canelo', 'lumasa'];
      try {
        favs = JSON.parse(savedFavsJson);
      } catch {
        favs = ['canelo', 'lumasa'];
      }

      const isAuto = savedAutoMode === 'true';
      const tuesdayArq = savedArq === 'true';

      set({
        activeScenario: savedScenario,
        isAutoScenarioMode: isAuto,
        selectedCompany: savedCompany || null,
        filterType: (['all', 'ida', 'vuelta'].includes(savedFilter) ? savedFilter : 'all') as 'all' | 'ida' | 'vuelta',
        favorites: favs,
        tuesdayHasArquitectura: tuesdayArq,
        sleepsInCordoba: savedSleep === 'true',
        isLoading: false,
      });

      if (isAuto) {
        get().evaluateAutoScenario();
      } else {
        get().refreshCalculations();
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setScenario: async (scenarioId) => {
    set({ activeScenario: scenarioId, isAutoScenarioMode: false });
    await settingsRepo.set(SETTING_SCENARIO, scenarioId);
    await settingsRepo.set(SETTING_AUTO_MODE, 'false');
    get().refreshCalculations();
  },

  toggleAutoMode: async () => {
    const nextAuto = !get().isAutoScenarioMode;
    set({ isAutoScenarioMode: nextAuto });
    await settingsRepo.set(SETTING_AUTO_MODE, nextAuto ? 'true' : 'false');
    if (nextAuto) {
      get().evaluateAutoScenario();
    }
  },

  setCompanyFilter: async (companyId) => {
    set({ selectedCompany: companyId });
    await settingsRepo.set(SETTING_COMPANY, companyId || '');
    get().refreshCalculations();
  },

  setFilterType: async (filter) => {
    set({ filterType: filter });
    await settingsRepo.set(SETTING_FILTER, filter);
    get().refreshCalculations();
  },

  toggleFavorite: async (companyId) => {
    const current = get().favorites;
    const exists = current.includes(companyId);
    const nextFavs = exists ? current.filter((id) => id !== companyId) : [...current, companyId];
    set({ favorites: nextFavs });
    await settingsRepo.set(SETTING_FAVORITES, JSON.stringify(nextFavs));
  },

  isFavorite: (companyId) => {
    return get().favorites.includes(companyId);
  },

  setSelectedDay: (day) => {
    set({ selectedDay: day });
    get().refreshCalculations();
  },

  setTuesdayHasArquitectura: async (val) => {
    set({ tuesdayHasArquitectura: val });
    await settingsRepo.set(SETTING_ARQ, val ? 'true' : 'false');
    if (get().isAutoScenarioMode) {
      get().evaluateAutoScenario();
    }
  },

  setSleepsInCordoba: async (val) => {
    set({ sleepsInCordoba: val });
    await settingsRepo.set(SETTING_SLEEP_CBA, val ? 'true' : 'false');
    get().refreshCalculations();
  },
}));
