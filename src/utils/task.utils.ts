/**
 * Utilidades de lógica de negocio para tareas.
 * Estas funciones son puras (sin efectos laterales) para facilitar los tests.
 */

import type { Task, TaskStats } from '../types/task';

// ─── Árbol ─────────────────────────────────────────────────────────────────────

/**
 * Construye el árbol jerárquico a partir de una lista plana de tareas.
 * Las tareas sin parent_id son raíces.
 */
export function buildTaskTree(tasks: Task[]): Task[] {
  const map = new Map<string, Task & { subtasks: Task[] }>();

  // Primera pasada: indexar con array subtasks vacío
  for (const t of tasks) {
    map.set(t.id, { ...t, subtasks: [] });
  }

  const roots: Task[] = [];

  // Segunda pasada: enlazar hijos
  for (const [, t] of map) {
    if (t.parent_id && map.has(t.parent_id)) {
      map.get(t.parent_id)!.subtasks!.push(t);
    } else {
      roots.push(t);
    }
  }

  return roots;
}

/**
 * Obtiene todos los descendientes (incluyendo la tarea raíz) de forma recursiva.
 */
export function flattenTree(task: Task): Task[] {
  const result: Task[] = [task];
  for (const sub of task.subtasks ?? []) {
    result.push(...flattenTree(sub));
  }
  return result;
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Calcula las estadísticas de un conjunto de tareas (lista plana).
 * Considera toda la jerarquía si se les pasa en plano.
 */
export function computeStats(tasks: Task[]): TaskStats {
  let todo_count = 0;
  let in_progress_count = 0;
  let done_count = 0;
  let total_estimate = 0;
  let todo_estimate = 0;
  let in_progress_estimate = 0;

  for (const t of tasks) {
    const est = t.estimate ?? 0;
    total_estimate += est;

    if (t.status === 'todo') {
      todo_count++;
      todo_estimate += est;
    } else if (t.status === 'in_progress') {
      in_progress_count++;
      in_progress_estimate += est;
    } else {
      done_count++;
    }
  }

  return {
    todo_count,
    in_progress_count,
    done_count,
    total_estimate,
    todo_estimate,
    in_progress_estimate,
  };
}

/**
 * Calcula el progreso (0-100) de una tarea considerando sus subtareas
 * recursivamente. Si no hay subtareas, se basa en su propio estado.
 */
export function computeProgress(task: Task): number {
  const all = flattenTree(task);
  if (all.length === 0) return 0;
  const done = all.filter((t) => t.status === 'done').length;
  return Math.round((done / all.length) * 100);
}

// ─── Formato ───────────────────────────────────────────────────────────────────

/** Formatea una fecha ISO como "dd/mm/yyyy" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
