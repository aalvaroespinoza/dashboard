/**
 * weatherService.ts
 * Servicio de Clima en Tiempo Real con Open-Meteo (100% Gratuito, sin API Key, soporte global).
 * Compatible con iOS, Android, Huawei HarmonyOS y Web.
 */

export interface WeatherLocation {
  id: string;
  name: string;
  country?: string;
  admin1?: string; // Provincia/Estado (ej. Córdoba)
  lat: number;
  lon: number;
  isDefault?: boolean;
}

export interface HourlyForecastItem {
  time: string;
  hourLabel: string;
  temp: number;
  pop: number; // Probabilidad de precipitación %
  code: number;
}

export interface DailyForecastItem {
  date: string;
  dayLabel: string;
  condition: string;
  code: number;
  min: number;
  max: number;
}

export interface LiveWeatherData {
  locationId: string;
  locationName: string;
  temperature: number;
  condition: string;
  code: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  windSpeed: number;
  isDay: boolean;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  lastUpdated: string;
}

// Ubicación por defecto: Despeñaderos, Córdoba, Argentina
export const DEFAULT_LOCATION: WeatherLocation = {
  id: 'despenaderos-cba',
  name: 'Despeñaderos, Córdoba',
  admin1: 'Córdoba',
  country: 'Argentina',
  lat: -31.8157,
  lon: -64.2917,
  isDefault: true,
};

/**
 * Mapeo de códigos meteorológicos WMO a descripciones en español
 */
export function getWeatherConditionInfo(code: number, isDay: boolean = true) {
  switch (code) {
    case 0:
      return { condition: 'Despejado', iconName: isDay ? 'Sun' : 'Moon', emoji: isDay ? '☀️' : '🌙' };
    case 1:
      return { condition: 'Mayormente despejado', iconName: isDay ? 'Sun' : 'Moon', emoji: isDay ? '🌤️' : '🌙' };
    case 2:
      return { condition: 'Parcialmente nublado', iconName: 'CloudSun', emoji: '⛅' };
    case 3:
      return { condition: 'Nublado', iconName: 'Cloud', emoji: '☁️' };
    case 45:
    case 48:
      return { condition: 'Niebla', iconName: 'CloudFog', emoji: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Llovizna', iconName: 'CloudDrizzle', emoji: '🌦️' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Lluvia', iconName: 'CloudRain', emoji: '🌧️' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Nieve', iconName: 'Snowflake', emoji: '❄️' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Chubascos', iconName: 'CloudRain', emoji: '🌦️' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Tormenta eléctrica', iconName: 'CloudLightning', emoji: '⛈️' };
    default:
      return { condition: 'Despejado', iconName: 'Sun', emoji: '☀️' };
  }
}

export const weatherService = {
  /**
   * Obtiene el pronóstico en tiempo real para una ubicación geográfica
   */
  async getLiveWeather(location: WeatherLocation): Promise<LiveWeatherData> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Open-Meteo responded with status: ${response.status}`);
      }

      const data = await response.json();

      const current = data.current || {};
      const currentCode = current.weather_code ?? 0;
      const isDay = Boolean(current.is_day ?? 1);
      const conditionInfo = getWeatherConditionInfo(currentCode, isDay);

      const daily = data.daily || {};
      const tempMax = Math.round(daily.temperature_2m_max?.[0] ?? current.temperature_2m ?? 22);
      const tempMin = Math.round(daily.temperature_2m_min?.[0] ?? current.temperature_2m ?? 8);

      // Procesar 24 Horas
      const hourly = data.hourly || {};
      const hourlyItems: HourlyForecastItem[] = [];
      const currentHourIndex = new Date().getHours();

      if (hourly.time && Array.isArray(hourly.time)) {
        for (let i = currentHourIndex; i < currentHourIndex + 24 && i < hourly.time.length; i++) {
          const rawTime = hourly.time[i];
          const hourNum = new Date(rawTime).getHours();
          const hourLabel = i === currentHourIndex ? 'Ahora' : `${String(hourNum).padStart(2, '0')}:00`;
          hourlyItems.push({
            time: rawTime,
            hourLabel,
            temp: Math.round(hourly.temperature_2m?.[i] ?? 18),
            pop: hourly.precipitation_probability?.[i] ?? 0,
            code: hourly.weather_code?.[i] ?? 0,
          });
        }
      }

      // Procesar 7 Días
      const dailyItems: DailyForecastItem[] = [];
      const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

      if (daily.time && Array.isArray(daily.time)) {
        for (let i = 0; i < daily.time.length && i < 7; i++) {
          const dateStr = daily.time[i];
          const d = new Date(dateStr + 'T12:00:00');
          const dayLabel = i === 0 ? 'Hoy' : dayNamesShort[d.getDay()];
          const dayCode = daily.weather_code?.[i] ?? 0;
          const dayCondition = getWeatherConditionInfo(dayCode, true).condition;

          dailyItems.push({
            date: dateStr,
            dayLabel,
            condition: dayCondition,
            code: dayCode,
            min: Math.round(daily.temperature_2m_min?.[i] ?? 10),
            max: Math.round(daily.temperature_2m_max?.[i] ?? 22),
          });
        }
      }

      return {
        locationId: location.id,
        locationName: location.name,
        temperature: Math.round(current.temperature_2m ?? 18),
        condition: conditionInfo.condition,
        code: currentCode,
        tempMax,
        tempMin,
        humidity: Math.round(current.relative_humidity_2m ?? 48),
        windSpeed: Math.round(current.wind_speed_10m ?? 12),
        isDay,
        hourly: hourlyItems,
        daily: dailyItems,
        lastUpdated: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch (err) {
      console.warn('Fallo al consultar Open-Meteo, usando fallback local para Despeñaderos:', err);
      // Fallback elegante offline
      return {
        locationId: location.id,
        locationName: location.name,
        temperature: 18,
        condition: 'Despejado',
        code: 0,
        tempMax: 22,
        tempMin: 8,
        humidity: 48,
        windSpeed: 12,
        isDay: true,
        hourly: [
          { time: 'now', hourLabel: 'Ahora', temp: 18, pop: 0, code: 0 },
          { time: '14:00', hourLabel: '14:00', temp: 20, pop: 0, code: 0 },
          { time: '15:00', hourLabel: '15:00', temp: 22, pop: 0, code: 0 },
          { time: '16:00', hourLabel: '16:00', temp: 21, pop: 5, code: 2 },
          { time: '17:00', hourLabel: '17:00', temp: 19, pop: 10, code: 2 },
          { time: '18:00', hourLabel: '18:00', temp: 17, pop: 10, code: 2 },
        ],
        daily: [
          { date: '2026-08-25', dayLabel: 'Hoy', condition: 'Despejado', code: 0, min: 8, max: 22 },
          { date: '2026-08-26', dayLabel: 'Mié', condition: 'Soleado', code: 0, min: 9, max: 24 },
          { date: '2026-08-27', dayLabel: 'Jue', condition: 'Parcialmente nublado', code: 2, min: 11, max: 25 },
          { date: '2026-08-28', dayLabel: 'Vie', condition: 'Chubascos aislados', code: 80, min: 12, max: 21 },
          { date: '2026-08-29', dayLabel: 'Sáb', condition: 'Despejado', code: 0, min: 7, max: 19 },
          { date: '2026-08-30', dayLabel: 'Dom', condition: 'Soleado', code: 0, min: 8, max: 22 },
          { date: '2026-08-31', dayLabel: 'Lun', condition: 'Despejado', code: 0, min: 10, max: 24 },
        ],
        lastUpdated: 'Offline',
      };
    }
  },

  /**
   * Busca ciudades en tiempo real usando el Geocoding API de Open-Meteo
   */
  async searchCities(query: string): Promise<WeatherLocation[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const q = encodeURIComponent(query.trim());
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=6&language=es&format=json`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.results || !Array.isArray(data.results)) return [];

      return data.results.map((r: any) => {
        const parts = [r.name];
        if (r.admin1 && r.admin1 !== r.name) parts.push(r.admin1);
        if (r.country) parts.push(r.country);
        const nameFormatted = parts.join(', ');

        return {
          id: `city-${r.id || `${r.latitude}_${r.longitude}`}`,
          name: nameFormatted,
          admin1: r.admin1,
          country: r.country,
          lat: r.latitude,
          lon: r.longitude,
        };
      });
    } catch {
      return [];
    }
  },
};
