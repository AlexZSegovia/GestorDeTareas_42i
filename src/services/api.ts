import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  PaginatedResponse,
  TaskFilters,
} from '../types/task';

// ─── Endpoints n8n (1 workflow por operación) ────────────────────────────────
const LIST_URL =
  (import.meta.env.VITE_N8N_LIST_URL as string) ??
  'https://crowzion1.app.n8n.cloud/webhook/tasks';

const CREATE_URL =
  (import.meta.env.VITE_N8N_CREATE_URL as string) ??
  'https://crowzion1.app.n8n.cloud/webhook/createtasks';

const DETAIL_URL =
  (import.meta.env.VITE_N8N_DETAIL_URL as string) ??
  'https://crowzion1.app.n8n.cloud/webhook/46dd464f-3607-4ce1-88b3-9e181b1361e1/getidtasks/:id';

const UPDATE_URL =
  (import.meta.env.VITE_N8N_UPDATE_URL as string) ??
  'https://crowzion1.app.n8n.cloud/webhook/e4178ba7-1381-41ac-8b89-dd04e06ee75f/tasks/:id/update';

const DELETE_URL =
  (import.meta.env.VITE_N8N_DELETE_URL as string) ??
  'https://crowzion1.app.n8n.cloud/webhook/6e8969d3-d1ed-4da5-a1f4-3c74ae26304f/deletetasks/:id/delete';

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });

  const raw = await res.text();
  const parseJson = () => {
    if (!raw || !raw.trim()) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };
  const body = parseJson();

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    message = body?.message ?? message;
    throw new Error(message);
  }

  // DELETE puede responder 204 sin cuerpo
  if (res.status === 204) return undefined as T;
  if (body === null) {
    throw new Error('Respuesta vacia del webhook. Revisa el nodo Respond en n8n.');
  }
  return body as T;
}

function withId(urlTemplate: string, id: string): string {
  return urlTemplate.replace(':id', encodeURIComponent(id));
}

function withQuery(baseUrl: string, params: URLSearchParams): string {
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

// ─── API ───────────────────────────────────────────────────────────────────────

export const api = {
  /** Listar tareas raíz con stats globales */
  listTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    if (filters.search)   params.set('search',   filters.search);
    if (filters.status)   params.set('status',   filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.sort)     params.set('sort',     filters.sort);
    if (filters.order)    params.set('order',    filters.order ?? 'desc');
    return request<PaginatedResponse<Task>>(withQuery(LIST_URL, params));
  },

  /** Obtener una tarea con su árbol completo de subtareas */
  getTask(id: string): Promise<Task> {
    return request<Task>(withId(DETAIL_URL, id));
  },

  /** Crear una tarea (raíz o subtarea) */
  createTask(payload: CreateTaskPayload): Promise<Task> {
    return request<Task>(CREATE_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Actualizar campos de una tarea */
  updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    return request<Task>(withId(UPDATE_URL, id), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Eliminar una tarea (y sus subtareas en cascada) */
  deleteTask(id: string): Promise<void> {
    return request<void>(withId(DELETE_URL, id), {
      method: 'POST',
    });
  },
};
