// ─── Enums ─────────────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// ─── Core entity ───────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  /** Estimación de esfuerzo (puntos / horas / lo que decida el equipo) */
  estimate: number | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  /** Subtareas anidadas (población en cliente o via RPC) */
  subtasks?: Task[];
  /** Conteo plano devuelto por list endpoint */
  subtask_count?: number;
}

// ─── Payloads ──────────────────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimate?: number | null;
  parent_id?: string | null;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

// ─── Stats ─────────────────────────────────────────────────────────────────────

export interface TaskStats {
  todo_count: number;
  in_progress_count: number;
  done_count: number;
  total_estimate: number;
  todo_estimate: number;
  in_progress_estimate: number;
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  stats: TaskStats;
}

// ─── Filter params ─────────────────────────────────────────────────────────────

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  sort?: 'created_at' | 'priority' | 'status' | 'title';
  order?: 'asc' | 'desc';
}
