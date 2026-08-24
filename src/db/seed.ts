import { SQLiteDatabase } from 'expo-sqlite';
import { seedBusDatabase } from '../services/busService';

export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  const checkLists = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM lists');
  if (checkLists && checkLists.count > 0) {
    return; // Ya fue sembrada la base de datos
  }

  const now = new Date().toISOString();
  const todayStr = now.split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // 1. Listas iniciales (Grit style)
  await db.execAsync(`
    INSERT INTO lists (id, title, color, icon, position, created_at, updated_at) VALUES
    ('list-inbox', 'Bandeja de Entrada', '#6366F1', 'inbox', 0, '${now}', '${now}'),
    ('list-work', 'Trabajo & Proyectos', '#3B82F6', 'briefcase', 1, '${now}', '${now}'),
    ('list-personal', 'Personal & Hábitos', '#10B981', 'user', 2, '${now}', '${now}'),
    ('list-ideas', 'Ideas & Lecturas', '#F59E0B', 'lightbulb', 3, '${now}', '${now}');

    INSERT INTO tasks (id, list_id, title, notes, due_date, due_time, is_completed, priority, tags, position, sync_status, created_at, updated_at) VALUES
    ('task-1', 'list-inbox', 'Revisar métricas semanales de rendimiento', 'Analizar panel de control y generar reporte', '${todayStr}', '18:00', 0, 'high', '["Urgente", "Tablet"]', 0, 'synced', '${now}', '${now}'),
    ('task-2', 'list-inbox', 'Actualizar dependencias y base SQLite', 'Verificar índices y tiempos de respuesta', '${todayStr}', '20:30', 0, 'medium', '["Dev"]', 1, 'synced', '${now}', '${now}'),
    ('task-3', 'list-work', 'Diseñar arquitectura del cliente CalDAV', 'Integración con RFC 4791 para iCloud', '${tomorrow}', '10:00', 0, 'high', '["iCloud", "CalDAV"]', 0, 'synced', '${now}', '${now}'),
    ('task-4', 'list-work', 'Completar documentación de la API offline', 'Detallar esquemas de tablas y sincronización', '${tomorrow}', '15:00', 0, 'low', '["Docs"]', 1, 'synced', '${now}', '${now}'),
    ('task-5', 'list-personal', 'Comprar provisiones y verduras', 'Ir a la feria local temprano', '${todayStr}', '09:00', 1, 'medium', '["Hogar"]', 0, 'synced', '${now}', '${now}'),
    ('task-6', 'list-ideas', 'Leer libro sobre diseño de interfaces en pantallas grandes', 'Capítulos 3 y 4 sobre layouts adaptativos', NULL, NULL, 0, 'none', '["Lectura", "UI/UX"]', 0, 'synced', '${now}', '${now}');

    -- 2. Eventos de calendario iniciales
    INSERT INTO calendar_events (id, title, description, location, start_date, end_date, is_all_day, color, calendar_name, sync_status, created_at, updated_at) VALUES
    ('evt-1', 'Reunión de Planificación Q3', 'Revisión de objetivos y lanzamientos estratégicos', 'Sala Virtual', '${todayStr}T11:00:00', '${todayStr}T12:30:00', 0, '#6366F1', 'Trabajo', 'synced', '${now}', '${now}'),
    ('evt-2', 'Entrenamiento físico', 'Rutina de fuerza y cardio', 'Gimnasio Central', '${todayStr}T19:00:00', '${todayStr}T20:15:00', 0, '#10B981', 'Personal', 'synced', '${now}', '${now}'),
    ('evt-3', 'Revisión de Arquitectura Mobile', 'Sincronización bidireccional y SQLite local', 'Google Meet', '${tomorrow}T16:00:00', '${tomorrow}T17:30:00', 0, '#3B82F6', 'Trabajo', 'synced', '${now}', '${now}');

    -- 3. Categorías de finanzas
    INSERT INTO categories (id, name, type, icon, color, budget_limit) VALUES
    ('cat-salary', 'Salario / Honorarios', 'income', 'briefcase', '#10B981', NULL),
    ('cat-invest', 'Rendimientos / Inversiones', 'income', 'trending-up', '#06B6D4', NULL),
    ('cat-freelance', 'Proyectos Freelance', 'income', 'code', '#8B5CF6', NULL),
    ('cat-rent', 'Alquiler & Expensas', 'expense', 'home', '#EF4444', 350000),
    ('cat-food', 'Supermercado & Alimentos', 'expense', 'shopping-cart', '#F59E0B', 180000),
    ('cat-services', 'Servicios & Suscripciones', 'expense', 'zap', '#6366F1', 45000),
    ('cat-transport', 'Transporte & Colectivo', 'expense', 'bus', '#EC4899', 30000),
    ('cat-leisure', 'Salidas & Ocio', 'expense', 'coffee', '#14B8A6', 60000);

    -- Transacciones iniciales
    INSERT INTO transactions (id, category_id, type, amount, description, payment_method, transaction_date, created_at) VALUES
    ('tx-1', 'cat-salary', 'income', 850000, 'Cobro de honorarios mensuales', 'transfer', '${todayStr}', '${now}'),
    ('tx-2', 'cat-food', 'expense', 34500, 'Compra semanal en supermercado', 'debit', '${todayStr}', '${now}'),
    ('tx-3', 'cat-services', 'expense', 9800, 'Suscripción de streaming y nube', 'credit', '${todayStr}', '${now}'),
    ('tx-4', 'cat-transport', 'expense', 3200, 'Carga de tarjeta de transporte', 'transfer', '${todayStr}', '${now}'),
    ('tx-5', 'cat-rent', 'expense', 280000, 'Pago mensual de alquiler', 'transfer', '${todayStr}', '${now}'),
    ('tx-6', 'cat-leisure', 'expense', 14200, 'Cena con amigos', 'credit', '${todayStr}', '${now}');

    -- 4. Notas en Markdown
    INSERT INTO notes (id, title, content, folder, tags, is_pinned, is_favorite, created_at, updated_at) VALUES
    ('note-1', 'Bienvenido al Dashboard Tablet', '# Dashboard Tablet Nativo\n\nEsta aplicación está optimizada para pantallas grandes y funcionamiento **100% local** con SQLite y soporte CalDAV.\n\n### Características:\n- **Grit Reminders:** Tableros con columnas dinámicas.\n- **Calendario:** Vistas Mes, Semana y Agenda sincronizadas con iCloud.\n- **Finanzas:** Control de gastos, presupuestos y balances.\n- **Notas Markdown:** Editor en vivo con organización por carpetas.\n- **Colectivos:** Consultas offline de recorridos y horarios.\n\n> *\"La simplicidad es el requisito previo para la fiabilidad.\"*', 'General', '["Bienvenida", "Guía"]', 1, 1, '${now}', '${now}'),
    ('note-2', 'Ideas de Arquitectura y Rendimiento', '## Optimizaciones para Tablet\n\n1. Uso de consultas indexadas en SQLite.\n2. Stores independientes con Zustand para evitar re-renderizados.\n3. Renderizado perezoso de listas extensas.\n4. Soporte offline prioritario con sincronización asíncrona.', 'Proyectos', '["Arquitectura", "Mobile"]', 0, 1, '${now}', '${now}');

    -- Ajustes iniciales
    INSERT INTO app_settings (key, value) VALUES
    ('theme_mode', 'dark'),
    ('caldav_server', 'https://caldav.icloud.com'),
    ('sidebar_collapsed', 'false');
  `);

  // 5. Sembrar datos migrados de AppHorarios en las tablas de colectivos
  await seedBusDatabase(db);
}
