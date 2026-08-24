import type { Company } from '../types';

/**
 * Base de datos estática de empresas operadoras activas.
 * Únicamente las empresas utilizadas por el usuario (Canelo, Intercórdoba, Lumasa).
 */
export const companies: Record<string, Company> = {
  canelo: {
    id: 'canelo',
    name: 'Transporte Canelo',
    shortName: 'Canelo',
    color: '#0071e3', // Azul para Canelo
  },
  intercordoba: {
    id: 'intercordoba',
    name: 'Intercórdoba',
    shortName: 'Intercórdoba',
    color: '#34c759', // Verde para Intercórdoba
  },
  lumasa: {
    id: 'lumasa',
    name: 'Lumasa',
    shortName: 'Lumasa',
    color: '#ff9500', // Naranja para Lumasa
  },
};

export const COMPANIES_LIST: Company[] = Object.values(companies);
