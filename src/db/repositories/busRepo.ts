import { getDatabase } from '../database';
import { BusRouteItem, BusStopItem, BusScheduleItem, DayType } from '../../types';

export const busRepo = {
  async getAllRoutes(): Promise<BusRouteItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BusRouteItem>('SELECT * FROM bus_routes ORDER BY line_number ASC');
    return rows;
  },

  async getRouteById(id: string): Promise<BusRouteItem | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<BusRouteItem>('SELECT * FROM bus_routes WHERE id = ?', [id]);
    return row || null;
  },

  async getStopsByRoute(routeId: string, direction: 'outbound' | 'inbound' = 'outbound'): Promise<BusStopItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BusStopItem>(
      'SELECT * FROM bus_stops WHERE route_id = ? AND direction = ? ORDER BY sequence_order ASC',
      [routeId, direction]
    );
    return rows;
  },

  async getSchedulesByRoute(routeId: string, dayType: DayType = 'weekday'): Promise<BusScheduleItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BusScheduleItem>(
      'SELECT * FROM bus_schedules WHERE route_id = ? AND day_type = ? ORDER BY departure_time ASC',
      [routeId, dayType]
    );
    return rows;
  },

  async searchStops(query: string): Promise<{ stop: BusStopItem; route: BusRouteItem }[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT s.*, r.line_number, r.name as route_name, r.color as route_color, r.origin, r.destination
       FROM bus_stops s
       JOIN bus_routes r ON s.route_id = r.id
       WHERE s.name LIKE ?
       ORDER BY r.line_number ASC, s.sequence_order ASC`,
      [`%${query}%`]
    );

    return rows.map(r => ({
      stop: {
        id: r.id,
        route_id: r.route_id,
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        sequence_order: r.sequence_order,
        direction: r.direction,
      },
      route: {
        id: r.route_id,
        line_number: r.line_number,
        name: r.route_name,
        description: r.description,
        color: r.route_color,
        origin: r.origin,
        destination: r.destination,
      },
    }));
  },
};
