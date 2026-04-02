-- =============================================================================
-- Sistema de Tareas — Schema Supabase (PostgreSQL)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Tabla principal
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tasks (
  id          UUID           NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT           NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description TEXT,
  status      TEXT           NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo', 'in_progress', 'done')),
  priority    TEXT           NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  -- Estimación de esfuerzo (puntos / horas). Debe ser >= 0 si se proporciona.
  estimate    NUMERIC(10, 2) CHECK (estimate IS NULL OR estimate >= 0),
  -- Referencia al padre; NULL = tarea raíz. ON DELETE CASCADE elimina
  -- toda la rama hija cuando se borra una tarea padre.
  parent_id   UUID           REFERENCES tasks(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id  ON tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority   ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);


-- -----------------------------------------------------------------------------
-- 2. Trigger: actualizar updated_at automáticamente
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks;
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- -----------------------------------------------------------------------------
-- 3. Función RPC: estadísticas globales (todas las tareas, incluyendo subtareas)
--    Llamada desde n8n: POST /rest/v1/rpc/get_task_stats
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_task_stats()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'todo_count',           COUNT(*) FILTER (WHERE status = 'todo'),
    'in_progress_count',    COUNT(*) FILTER (WHERE status = 'in_progress'),
    'done_count',           COUNT(*) FILTER (WHERE status = 'done'),
    'total_estimate',       COALESCE(SUM(estimate), 0),
    'todo_estimate',        COALESCE(SUM(estimate) FILTER (WHERE status = 'todo'), 0),
    'in_progress_estimate', COALESCE(SUM(estimate) FILTER (WHERE status = 'in_progress'), 0)
  ) INTO result
  FROM tasks;
  RETURN result;
END;
$$;


-- -----------------------------------------------------------------------------
-- 4. Función RPC: árbol completo de una tarea (recursivo)
--    Llamada desde n8n: POST /rest/v1/rpc/get_task_tree  { "root_id": "uuid" }
--    Devuelve la lista plana de todos los nodos de la rama ordenados por
--    profundidad; el front construye el árbol con buildTaskTree().
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_task_tree(root_id UUID)
RETURNS TABLE (
  id          UUID,
  title       TEXT,
  description TEXT,
  status      TEXT,
  priority    TEXT,
  estimate    NUMERIC,
  parent_id   UUID,
  created_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ,
  depth       INT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE tree AS (
    -- Nodo raíz
    SELECT t.id, t.title, t.description, t.status, t.priority,
           t.estimate, t.parent_id, t.created_at, t.updated_at, 0 AS depth
    FROM tasks t
    WHERE t.id = root_id

    UNION ALL

    -- Hijos recursivos
    SELECT t.id, t.title, t.description, t.status, t.priority,
           t.estimate, t.parent_id, t.created_at, t.updated_at, tr.depth + 1
    FROM tasks t
    INNER JOIN tree tr ON t.parent_id = tr.id
  )
  SELECT * FROM tree ORDER BY depth, created_at;
END;
$$;


-- -----------------------------------------------------------------------------
-- 5. Función RPC: subtask_count por padre
--    Devuelve el conteo directo de hijos de cada tarea raíz.
--    Usada en el endpoint LIST para mostrar el badge de subtareas en las cards.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_root_tasks_with_counts(
  p_status   TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL,
  p_search   TEXT DEFAULT NULL,
  p_sort     TEXT DEFAULT 'created_at',
  p_order    TEXT DEFAULT 'desc'
)
RETURNS TABLE (
  id             UUID,
  title          TEXT,
  description    TEXT,
  status         TEXT,
  priority       TEXT,
  estimate       NUMERIC,
  parent_id      UUID,
  created_at     TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ,
  subtask_count  BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT
       t.id, t.title, t.description, t.status, t.priority,
       t.estimate, t.parent_id, t.created_at, t.updated_at,
       COUNT(s.id) AS subtask_count
     FROM tasks t
     LEFT JOIN tasks s ON s.parent_id = t.id
     WHERE t.parent_id IS NULL
       AND ($1 IS NULL OR t.status    = $1)
       AND ($2 IS NULL OR t.priority  = $2)
       AND ($3 IS NULL OR t.title ILIKE $3)
     GROUP BY t.id
     ORDER BY t.%I %s',
    CASE WHEN p_sort IN ('created_at','priority','status','title') THEN p_sort ELSE 'created_at' END,
    CASE WHEN p_order = 'asc' THEN 'ASC' ELSE 'DESC' END
  )
  USING p_status, p_priority,
        CASE WHEN p_search IS NOT NULL THEN '%' || p_search || '%' ELSE NULL END;
END;
$$;


-- -----------------------------------------------------------------------------
-- 6. Row Level Security (RLS)
--    Por defecto permitimos todo (ajustar cuando se añada auth).
-- -----------------------------------------------------------------------------

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Política abierta: sustituir por políticas basadas en auth.uid() cuando se
-- implemente autenticación real.
DROP POLICY IF EXISTS "allow_all" ON tasks;
CREATE POLICY "allow_all" ON tasks FOR ALL USING (true) WITH CHECK (true);


-- -----------------------------------------------------------------------------
-- 7. Datos de ejemplo (opcional — comentar en producción)
-- -----------------------------------------------------------------------------

/*
INSERT INTO tasks (title, description, status, priority, estimate) VALUES
  ('Configurar entorno de desarrollo',  'Instalar dependencias y configurar .env', 'done',        'high',   2),
  ('Diseñar base de datos',             'Esquema inicial en Supabase',              'done',        'high',   3),
  ('Implementar API CRUD',              'n8n workflows para cada operación',        'in_progress', 'urgent', 5),
  ('Crear UI de listado de tareas',     'Vista principal con filtros y stats',      'in_progress', 'high',   8),
  ('Implementar vista de detalle',      'Árbol de subtareas, edición inline',       'todo',        'medium', 5),
  ('Escribir tests unitarios',          'Cubrir lógica de negocio',                 'todo',        'medium', 3),
  ('Dockerizar la aplicación',          'Dockerfile + docker-compose',              'todo',        'low',    2),
  ('CI/CD básico',                      'GitHub Actions para build y tests',        'todo',        'low',    3);
*/
