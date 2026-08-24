/**
 * Adaptador de almacenamiento en memoria / localStorage para Web
 * Se activa automáticamente como fallback si el navegador web bloquea el sistema de archivos OPFS
 * o en entornos de prueba en el navegador.
 */

interface TableStore {
  [tableName: string]: Record<string, any>[];
}

class WebSQLiteFallback {
  private tables: TableStore = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('dashboard_web_db');
        if (saved) {
          this.tables = JSON.parse(saved);
        }
      } catch {}
    }
  }

  private saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('dashboard_web_db', JSON.stringify(this.tables));
      } catch {}
    }
  }

  private ensureTable(table: string) {
    if (!this.tables[table]) {
      this.tables[table] = [];
    }
  }

  async execAsync(sql: string): Promise<void> {
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      const upper = stmt.toUpperCase();
      if (upper.startsWith('CREATE TABLE')) {
        const match = stmt.match(/CREATE TABLE (?:IF NOT EXISTS )?([a-zA-Z0-9_]+)/i);
        if (match && match[1]) {
          this.ensureTable(match[1]);
        }
      } else if (upper.startsWith('ALTER TABLE')) {
        const match = stmt.match(/ALTER TABLE ([a-zA-Z0-9_]+)\s+ADD COLUMN\s+([a-zA-Z0-9_]+)/i);
        if (match && match[1] && match[2]) {
          const tableName = match[1];
          const colName = match[2];
          this.ensureTable(tableName);
          this.tables[tableName].forEach((row) => {
            if (row[colName] === undefined) {
              row[colName] = null;
            }
          });
        }
      } else if (upper.startsWith('DROP TABLE')) {
        const match = stmt.match(/DROP TABLE (?:IF EXISTS )?([a-zA-Z0-9_]+)/i);
        if (match && match[1]) {
          this.tables[match[1]] = [];
        }
      } else if (upper.startsWith('DELETE FROM')) {
        const match = stmt.match(/DELETE FROM ([a-zA-Z0-9_]+)/i);
        if (match && match[1]) {
          this.tables[match[1]] = [];
        }
      } else if (upper.startsWith('INSERT INTO')) {
        await this.runAsync(stmt);
      }
    }
    this.saveToStorage();
  }

  async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    const trimmed = sql.trim();
    let changes = 0;
    const upper = trimmed.toUpperCase();

    if (upper.startsWith('ALTER TABLE')) {
      const match = trimmed.match(/ALTER TABLE ([a-zA-Z0-9_]+)\s+ADD COLUMN\s+([a-zA-Z0-9_]+)/i);
      if (match && match[1] && match[2]) {
        const tableName = match[1];
        const colName = match[2];
        this.ensureTable(tableName);
        this.tables[tableName].forEach((row) => {
          if (row[colName] === undefined) {
            row[colName] = null;
          }
        });
      }
      this.saveToStorage();
      return { lastInsertRowId: 1, changes: 1 };
    }

    if (upper.startsWith('INSERT INTO')) {
      const match = trimmed.match(/INSERT INTO ([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*(.+)/is);
      if (match) {
        const tableName = match[1];
        const columns = match[2].split(',').map((c) => c.trim());
        const valuesRaw = match[3];

        this.ensureTable(tableName);

        // Inserción con placeholders ?
        if (valuesRaw.includes('?')) {
          const row: Record<string, any> = {};
          columns.forEach((col, idx) => {
            row[col] = params[idx] !== undefined ? params[idx] : null;
          });

          if (tableName === 'app_settings') {
            const existingIdx = this.tables[tableName].findIndex((r) => r.key === row.key);
            if (existingIdx >= 0) {
              this.tables[tableName][existingIdx] = row;
            } else {
              this.tables[tableName].push(row);
            }
          } else {
            const existingIdx = row.id ? this.tables[tableName].findIndex((r) => r.id === row.id) : -1;
            if (existingIdx >= 0) {
              this.tables[tableName][existingIdx] = row;
            } else {
              this.tables[tableName].push(row);
            }
          }
          changes = 1;
        } else {
          // Parsear inserción de literales
          const valueTuples = valuesRaw.match(/\(([^)]+)\)/g);
          if (valueTuples) {
            for (const tuple of valueTuples) {
              const cleaned = tuple.slice(1, -1);
              const valList: any[] = [];
              let currentVal = '';
              let inQuote = false;
              let quoteChar = '';

              for (let i = 0; i < cleaned.length; i++) {
                const char = cleaned[i];
                if ((char === "'" || char === '"') && (i === 0 || cleaned[i - 1] !== '\\')) {
                  if (!inQuote) {
                    inQuote = true;
                    quoteChar = char;
                  } else if (char === quoteChar) {
                    inQuote = false;
                  } else {
                    currentVal += char;
                  }
                } else if (char === ',' && !inQuote) {
                  valList.push(currentVal.trim());
                  currentVal = '';
                } else {
                  currentVal += char;
                }
              }
              valList.push(currentVal.trim());

              const row: Record<string, any> = {};
              columns.forEach((col, idx) => {
                let v: any = valList[idx];
                if (v === undefined || v === 'NULL') {
                  v = null;
                } else if (typeof v === 'string' && v.startsWith("'") && v.endsWith("'")) {
                  v = v.slice(1, -1);
                } else if (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '') {
                  v = Number(v);
                }
                row[col] = v;
              });

              if (row.id) {
                const existingIdx = this.tables[tableName].findIndex((r) => r.id === row.id);
                if (existingIdx >= 0) {
                  this.tables[tableName][existingIdx] = row;
                } else {
                  this.tables[tableName].push(row);
                }
              } else {
                this.tables[tableName].push(row);
              }
              changes++;
            }
          }
        }
      }
    } else if (upper.startsWith('UPDATE')) {
      const match = trimmed.match(/UPDATE ([a-zA-Z0-9_]+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/is);
      if (match) {
        const tableName = match[1];
        const setClause = match[2];
        const whereClause = match[3];

        this.ensureTable(tableName);

        const targetId = params[params.length - 1];
        const setParts = setClause.split(',').map((s) => s.trim().split('=')[0].trim());

        const rows = this.tables[tableName];
        for (let i = 0; i < rows.length; i++) {
          if (rows[i].id === targetId || rows[i].key === targetId) {
            setParts.forEach((col, pIdx) => {
              if (col.toUpperCase().includes('COALESCE')) {
                const actualCol = col.replace(/COALESCE\s*\([^,]+,\s*([a-zA-Z0-9_]+)\)/i, '$1').trim();
                rows[i][actualCol] = params[pIdx] !== undefined && params[pIdx] !== null ? params[pIdx] : rows[i][actualCol];
              } else {
                rows[i][col] = params[pIdx];
              }
            });
            changes++;
          }
        }
      }
    } else if (upper.startsWith('DELETE FROM')) {
      const match = trimmed.match(/DELETE FROM ([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?/i);
      if (match) {
        const tableName = match[1];
        this.ensureTable(tableName);
        if (params.length > 0) {
          const targetId = params[0];
          const initialLen = this.tables[tableName].length;
          this.tables[tableName] = this.tables[tableName].filter(
            (r) => r.id !== targetId && r.key !== targetId && r.route_id !== targetId && r.parent_id !== targetId
          );
          changes = initialLen - this.tables[tableName].length;
        } else {
          changes = this.tables[tableName].length;
          this.tables[tableName] = [];
        }
      }
    }

    this.saveToStorage();
    return { lastInsertRowId: 1, changes };
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    // SELECT COUNT(*)
    if (upper.includes('COUNT(*)')) {
      const match = trimmed.match(/FROM ([a-zA-Z0-9_]+)/i);
      const tableName = match ? match[1] : '';
      const count = this.tables[tableName] ? this.tables[tableName].length : 0;
      return [{ count }] as any;
    }

    // SELECT DISTINCT folder FROM notes
    if (upper.includes('DISTINCT FOLDER FROM NOTES')) {
      this.ensureTable('notes');
      const folders = Array.from(new Set(this.tables['notes'].map((n) => n.folder).filter(Boolean)));
      return folders.map((f) => ({ folder: f })) as any;
    }

    // SELECT con JOIN (transacciones o paradas)
    if (upper.includes('JOIN')) {
      if (upper.includes('FROM TRANSACTIONS')) {
        this.ensureTable('transactions');
        this.ensureTable('categories');
        const transactions = this.tables['transactions'] || [];
        const categories = this.tables['categories'] || [];

        let results: any[] = transactions.map((t) => {
          const cat = categories.find((c) => c.id === t.category_id);
          return {
            ...t,
            category_name: cat?.name || 'General',
            category_icon: cat?.icon || 'tag',
            category_color: cat?.color || '#6366F1',
          };
        });

        if (trimmed.includes('WHERE t.transaction_date LIKE ?') && params[0]) {
          const prefix = params[0].replace('%', '');
          results = results.filter((r) => r.transaction_date && r.transaction_date.startsWith(prefix));
        }

        return results as any;
      }

      if (upper.includes('FROM BUS_STOPS')) {
        this.ensureTable('bus_stops');
        this.ensureTable('bus_routes');
        const stops = this.tables['bus_stops'] || [];
        const routes = this.tables['bus_routes'] || [];

        let results: any[] = stops.map((s) => {
          const r = routes.find((rt) => rt.id === s.route_id);
          return {
            ...s,
            line_number: r?.line_number || '',
            route_name: r?.name || '',
            route_color: r?.color || '#6366F1',
            origin: r?.origin || '',
            destination: r?.destination || '',
          };
        });

        if (trimmed.includes('WHERE s.name LIKE ?') && params[0]) {
          const term = params[0].replace(/%/g, '').toLowerCase();
          results = results.filter((s) => s.name && s.name.toLowerCase().includes(term));
        }

        return results as any;
      }
    }

    // SELECT simple
    const match = trimmed.match(/FROM ([a-zA-Z0-9_]+)/i);
    if (match && match[1]) {
      const tableName = match[1];
      this.ensureTable(tableName);
      let items = [...this.tables[tableName]];

      // Filtros WHERE
      if (trimmed.includes('WHERE') && params.length > 0) {
        if (trimmed.includes('list_id = ?')) {
          items = items.filter((r) => r.list_id === params[0]);
        } else if (trimmed.includes('parent_id = ?')) {
          items = items.filter((r) => r.parent_id === params[0]);
        } else if (trimmed.includes('habit_id = ? AND date = ?')) {
          items = items.filter((r) => r.habit_id === params[0] && r.date === params[1]);
        } else if (trimmed.includes('habit_id = ?')) {
          items = items.filter((r) => r.habit_id === params[0]);
        } else if (trimmed.includes('date = ?')) {
          items = items.filter((r) => r.date === params[0]);
        } else if (trimmed.includes('route_id = ? AND direction = ?')) {
          items = items.filter((r) => r.route_id === params[0] && r.direction === params[1]);
        } else if (trimmed.includes('route_id = ? AND day_type = ?')) {
          items = items.filter((r) => r.route_id === params[0] && r.day_type === params[1]);
        } else if (trimmed.includes('id = ?')) {
          items = items.filter((r) => r.id === params[0]);
        } else if (trimmed.includes('key = ?')) {
          items = items.filter((r) => r.key === params[0]);
        } else if (trimmed.includes('icloud_uid = ?')) {
          items = items.filter((r) => r.icloud_uid === params[0]);
        }
      }

      // Ordenamientos
      if (upper.includes('ORDER BY POSITION ASC')) {
        items.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      } else if (upper.includes('ORDER BY CREATED_AT ASC')) {
        items.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
      } else if (upper.includes('ORDER BY DATE DESC')) {
        items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      }

      // Límites
      if (upper.includes('LIMIT ?') && typeof params[params.length - 1] === 'number') {
        const lim = params[params.length - 1];
        items = items.slice(0, lim);
      }

      return items as T[];
    }

    return [];
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    const all = await this.getAllAsync<T>(sql, params);
    return all.length > 0 ? all[0] : null;
  }
}

export const webSqliteFallback = new WebSQLiteFallback();
