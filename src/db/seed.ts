import { SQLiteDatabase } from 'expo-sqlite';
import { seedBusDatabase } from '../services/busService';

export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  const checkLists = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM lists');
  if (checkLists && checkLists.count > 0) {
    return; // Ya fue sembrada la base de datos
  }

  const now = new Date().toISOString();
  const todayStr = '2026-08-24';
  const tomorrowStr = '2026-08-25';

  // 1. Listas iniciales (Estilo Apple Reminders iOS)
  await db.execAsync(`
    INSERT INTO lists (id, title, color, icon, position, created_at, updated_at) VALUES
    ('list-reminders', 'Recordatorios', '#007AFF', 'list', 0, '${now}', '${now}'),
    ('list-utn', 'Trabajo / UTN', '#FF9500', 'graduation-cap', 1, '${now}', '${now}'),
    ('list-personal', 'Personal', '#34C759', 'user', 2, '${now}', '${now}'),
    ('list-shopping', 'Compras', '#AF52DE', 'shopping-cart', 3, '${now}', '${now}');

    -- Secciones iniciales dentro de las listas
    INSERT INTO list_sections (id, list_id, name, position, created_at) VALUES
    ('sec-utn-1', 'list-utn', 'Universidad UTN', 0, '${now}'),
    ('sec-utn-2', 'list-utn', 'Proyectos & Código', 1, '${now}'),
    ('sec-utn-3', 'list-utn', 'Otros', 2, '${now}'),
    ('sec-per-1', 'list-personal', 'Salud & Bienestar', 0, '${now}'),
    ('sec-per-2', 'list-personal', 'Hogar', 1, '${now}');

    -- Link Preview precargada
    INSERT INTO link_previews (url, title, description, image_url, domain, created_at) VALUES
    ('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Tutorial: Arquitectura React Native a 60 FPS', 'youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'youtube.com', '${now}'),
    ('https://docs.expo.dev', 'Expo Documentation v57', 'A framework for React applications that run natively on Android, iOS, and the web.', 'https://docs.expo.dev/static/images/og.png', 'docs.expo.dev', '${now}');

    -- Tareas iniciales con subtareas, URLs y secciones
    INSERT INTO tasks (id, list_id, section_id, parent_id, title, notes, url, due_date, due_time, is_completed, priority, priority_num, flagged, tags, position, sync_status, created_at, updated_at) VALUES
    ('task-1', 'list-utn', 'sec-utn-1', NULL, 'Preparar entrega de Sistemas Distribuidos', 'Revisar consigna del laboratorio y subir a campus', NULL, '${todayStr}', '18:00', 0, 'high', 1, 1, '["Universidad", "UTN"]', 0, 'synced', '${now}', '${now}'),
    ('task-1-sub1', 'list-utn', 'sec-utn-1', 'task-1', 'Implementar algoritmo de consenso Raft', 'Ver notas de la clase 4', NULL, '${todayStr}', '15:00', 0, 'medium', 5, 0, '["UTN"]', 0, 'synced', '${now}', '${now}'),
    ('task-1-sub2', 'list-utn', 'sec-utn-1', 'task-1', 'Redactar informe técnico en PDF', 'Incluir diagramas de arquitectura', NULL, '${todayStr}', '17:30', 0, 'low', 9, 0, '["UTN"]', 1, 'synced', '${now}', '${now}'),
    
    ('task-2', 'list-utn', 'sec-utn-2', NULL, 'Estudiar tutorial de Reanimated v3 https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Ver video sobre shared values y gestos', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '${todayStr}', '20:30', 0, 'medium', 5, 0, '["Dev", "Video"]', 1, 'synced', '${now}', '${now}'),
    ('task-3', 'list-personal', 'sec-per-1', NULL, 'Comprar suplementos y vitaminas', 'Pasar por la farmacia central', NULL, '${todayStr}', '10:00', 0, 'medium', 5, 1, '["Salud"]', 0, 'synced', '${now}', '${now}'),
    ('task-4', 'list-personal', 'sec-per-1', NULL, 'Chequeo médico de rutina', 'Dr. Martínez a las 17:00 hs', NULL, '${tomorrowStr}', '17:00', 0, 'high', 1, 0, '["Salud"]', 1, 'synced', '${now}', '${now}'),
    ('task-5', 'list-reminders', NULL, NULL, 'Revisar documentación de Expo https://docs.expo.dev', 'Leer guía de migración', 'https://docs.expo.dev', '${todayStr}', '12:00', 1, 'none', 0, 0, '["Dev"]', 0, 'synced', '${now}', '${now}');

    -- 2. Eventos de calendario iniciales
    INSERT INTO calendar_events (id, title, description, location, start_date, end_date, is_all_day, color, calendar_name, sync_status, created_at, updated_at) VALUES
    ('evt-1', 'Clase de Sistemas Operativos (UTN)', 'Aula 304 - Campus Virtual', 'Córdoba', '${todayStr}T14:30:00', '${todayStr}T18:00:00', 0, '#FF9500', 'Universidad', 'synced', '${now}', '${now}'),
    ('evt-2', 'Entrenamiento físico', 'Rutina en Despeñaderos', 'Gimnasio', '${todayStr}T19:00:00', '${todayStr}T20:15:00', 0, '#34C759', 'Personal', 'synced', '${now}', '${now}');

    -- 3. Categorías de finanzas
    INSERT INTO categories (id, name, type, icon, color, budget_limit) VALUES
    ('cat-salary', 'Salario / Honorarios', 'income', 'briefcase', '#34C759', NULL),
    ('cat-food', 'Supermercado & Alimentos', 'expense', 'shopping-cart', '#FF9500', 180000),
    ('cat-services', 'Servicios & Suscripciones', 'expense', 'zap', '#007AFF', 45000),
    ('cat-transport', 'Transporte & Colectivo', 'expense', 'bus', '#FF2D55', 30000),
    ('cat-rent', 'Alquiler & Expensas', 'expense', 'home', '#FF3B30', 350000);

    INSERT INTO transactions (id, category_id, type, amount, description, payment_method, transaction_date, created_at) VALUES
    ('tx-1', 'cat-salary', 'income', 850000, 'Cobro de honorarios mensuales', 'transfer', '${todayStr}', '${now}'),
    ('tx-2', 'cat-food', 'expense', 34500, 'Compra semanal en supermercado', 'debit', '${todayStr}', '${now}'),
    ('tx-3', 'cat-services', 'expense', 9800, 'Suscripción de streaming y nube', 'credit', '${todayStr}', '${now}');

    -- 4. Notas en Markdown
    INSERT INTO notes (id, title, content, folder, tags, is_pinned, is_favorite, created_at, updated_at) VALUES
    ('note-1', 'Bienvenido a MiHub', '# MiHub Tablet\n\nPanel integrado con arquitectura offline SQLite.', 'General', '["Bienvenida"]', 1, 1, '${now}', '${now}');

    -- Ajustes iniciales
    INSERT INTO app_settings (key, value) VALUES
    ('theme_mode', 'dark'),
    ('caldav_server', 'https://caldav.icloud.com'),
    ('sidebar_collapsed', 'false');
  `);

  // 5. Sembrar datos migrados de AppHorarios en las tablas de colectivos
  await seedBusDatabase(db);
}
