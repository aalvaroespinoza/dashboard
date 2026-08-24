import type { Coordinates, BusStopLocation } from '../types';

/**
 * Coordenadas y paradas centralizadas del sistema (AppHorarios).
 */
export const LOCATIONS: Record<string, Coordinates | null> = {
  home: null, // Pendiente de configuración
  despenaderosBusStop: { lat: -31.8153, lng: -64.2894 }, // Parada Despeñaderos Ruta 36
  cordobaBusStop: { lat: -31.4422, lng: -64.1938 },       // Terminal de Ómnibus Córdoba
  ministry: { lat: -31.4422, lng: -64.1938 },             // Parada Ministerio / UTN Córdoba
  utn: null,
};

export const BUS_STOPS: BusStopLocation[] = [
  {
    id: 'stop-despenaderos',
    name: 'Parada Despeñaderos (Ruta 36 / Garita Central)',
    coordinates: { lat: -31.8153, lng: -64.2894 },
  },
  {
    id: 'stop-cordoba-terminal',
    name: 'Terminal de Ómnibus Córdoba (T1 / T2)',
    coordinates: { lat: -31.4422, lng: -64.1938 },
  },
  {
    id: 'stop-cordoba-ministerio',
    name: 'Parada Ministerio / UTN Córdoba',
    coordinates: { lat: -31.4422, lng: -64.1938 },
  },
];
