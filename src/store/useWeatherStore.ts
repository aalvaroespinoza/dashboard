/**
 * useWeatherStore.ts
 * Store global de Zustand para Clima con persistencia de ciudades en SQLite/settingsRepo.
 * Permite tener Despeñaderos por defecto, agregar nuevas ciudades dinámicamente y consultar Open-Meteo.
 */

import { create } from 'zustand';
import {
  WeatherLocation,
  LiveWeatherData,
  DEFAULT_LOCATION,
  weatherService,
} from '../services/weatherService';
import { settingsRepo } from '../db/repositories/settingsRepo';

interface WeatherStoreState {
  locations: WeatherLocation[];
  selectedLocationId: string;
  weatherData: LiveWeatherData | null;
  isLoading: boolean;
  searchQuery: string;
  searchResults: WeatherLocation[];
  isSearching: boolean;

  // Acciones
  loadWeatherStore: () => Promise<void>;
  selectLocation: (locationId: string) => Promise<void>;
  addLocation: (location: WeatherLocation) => Promise<void>;
  removeLocation: (locationId: string) => Promise<void>;
  searchCities: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  refreshWeather: () => Promise<void>;
}

export const useWeatherStore = create<WeatherStoreState>((set, get) => ({
  locations: [DEFAULT_LOCATION],
  selectedLocationId: DEFAULT_LOCATION.id,
  weatherData: null,
  isLoading: false,
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  loadWeatherStore: async () => {
    try {
      set({ isLoading: true });
      const savedLocationsJson = await settingsRepo.get('weather_locations', '');
      let locs: WeatherLocation[] = [DEFAULT_LOCATION];

      if (savedLocationsJson) {
        try {
          const parsed = JSON.parse(savedLocationsJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            locs = parsed;
          }
        } catch {
          locs = [DEFAULT_LOCATION];
        }
      }

      // Asegurar que Despeñaderos siempre esté presente
      if (!locs.some((l) => l.id === DEFAULT_LOCATION.id || l.name.includes('Despeñaderos'))) {
        locs.unshift(DEFAULT_LOCATION);
      }

      const savedSelectedId = await settingsRepo.get('weather_selected_id', DEFAULT_LOCATION.id);
      const selectedLoc = locs.find((l) => l.id === savedSelectedId) || locs[0] || DEFAULT_LOCATION;

      set({
        locations: locs,
        selectedLocationId: selectedLoc.id,
      });

      // Obtener el clima en vivo de Open-Meteo
      const live = await weatherService.getLiveWeather(selectedLoc);
      set({ weatherData: live, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectLocation: async (locationId: string) => {
    const loc = get().locations.find((l) => l.id === locationId);
    if (!loc) return;

    set({ selectedLocationId: locationId, isLoading: true });
    await settingsRepo.set('weather_selected_id', locationId);

    const live = await weatherService.getLiveWeather(loc);
    set({ weatherData: live, isLoading: false });
  },

  addLocation: async (location: WeatherLocation) => {
    const currentLocs = get().locations;
    if (currentLocs.some((l) => l.id === location.id || (Math.abs(l.lat - location.lat) < 0.01 && Math.abs(l.lon - location.lon) < 0.01))) {
      // Ya existe, solo seleccionarla
      await get().selectLocation(location.id);
      return;
    }

    const updated = [...currentLocs, location];
    set({ locations: updated });
    await settingsRepo.set('weather_locations', JSON.stringify(updated));
    await get().selectLocation(location.id);
  },

  removeLocation: async (locationId: string) => {
    if (locationId === DEFAULT_LOCATION.id) {
      // No permitir eliminar la ubicación por defecto
      return;
    }

    const updated = get().locations.filter((l) => l.id !== locationId);
    const nextSelectedId = get().selectedLocationId === locationId ? DEFAULT_LOCATION.id : get().selectedLocationId;

    set({ locations: updated, selectedLocationId: nextSelectedId });
    await settingsRepo.set('weather_locations', JSON.stringify(updated));
    await get().selectLocation(nextSelectedId);
  },

  searchCities: async (query: string) => {
    set({ searchQuery: query });
    if (!query || query.trim().length < 2) {
      set({ searchResults: [], isSearching: false });
      return;
    }

    set({ isSearching: true });
    const results = await weatherService.searchCities(query);
    set({ searchResults: results, isSearching: false });
  },

  clearSearchResults: () => {
    set({ searchQuery: '', searchResults: [], isSearching: false });
  },

  refreshWeather: async () => {
    const loc = get().locations.find((l) => l.id === get().selectedLocationId) || DEFAULT_LOCATION;
    set({ isLoading: true });
    const live = await weatherService.getLiveWeather(loc);
    set({ weatherData: live, isLoading: false });
  },
}));
