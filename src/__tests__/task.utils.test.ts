import { describe, it, expect } from 'vitest';
import {
  buildTaskTree,
  flattenTree,
  computeStats,
  computeProgress,
  formatDate,
} from '../utils/task.utils';
import type { Task } from '../types/task';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id:          'task-1',
    title:       'Test task',
    description: null,
    status:      'todo',
    priority:    'medium',
    estimate:    null,
    parent_id:   null,
    created_at:  '2025-01-01T00:00:00Z',
    updated_at:  '2025-01-01T00:00:00Z',
    subtasks:    [],
    ...overrides,
  };
}

// ─── buildTaskTree ─────────────────────────────────────────────────────────────

describe('buildTaskTree', () => {
  it('returns empty array for empty input', () => {
    expect(buildTaskTree([])).toEqual([]);
  });

  it('returns root tasks when there are no subtasks', () => {
    const tasks = [
      makeTask({ id: 'a', parent_id: null }),
      makeTask({ id: 'b', parent_id: null }),
    ];
    const tree = buildTaskTree(tasks);
    expect(tree).toHaveLength(2);
    expect(tree.map((t) => t.id)).toEqual(expect.arrayContaining(['a', 'b']));
  });

  it('nests children under their parent', () => {
    const tasks = [
      makeTask({ id: 'root',  parent_id: null }),
      makeTask({ id: 'child', parent_id: 'root' }),
    ];
    const [root] = buildTaskTree(tasks);
    expect(root.subtasks).toHaveLength(1);
    expect(root.subtasks![0].id).toBe('child');
  });

  it('supports multiple levels of nesting', () => {
    const tasks = [
      makeTask({ id: 'L1',  parent_id: null }),
      makeTask({ id: 'L2',  parent_id: 'L1' }),
      makeTask({ id: 'L3',  parent_id: 'L2' }),
    ];
    const [root] = buildTaskTree(tasks);
    expect(root.subtasks![0].subtasks![0].id).toBe('L3');
  });

  it('ignores orphan tasks (parent not in the list)', () => {
    const tasks = [
      makeTask({ id: 'orphan', parent_id: 'non-existent' }),
    ];
    const roots = buildTaskTree(tasks);
    // orphan becomes a root
    expect(roots).toHaveLength(1);
    expect(roots[0].id).toBe('orphan');
  });
});

// ─── flattenTree ───────────────────────────────────────────────────────────────

describe('flattenTree', () => {
  it('returns just the root when no subtasks', () => {
    const task = makeTask({ id: 'root', subtasks: [] });
    expect(flattenTree(task).map((t) => t.id)).toEqual(['root']);
  });

  it('returns all descendants in a flat list', () => {
    const task = makeTask({
      id: 'root',
      subtasks: [
        makeTask({ id: 'c1', subtasks: [makeTask({ id: 'gc1' })] }),
        makeTask({ id: 'c2' }),
      ],
    });
    const ids = flattenTree(task).map((t) => t.id);
    expect(ids).toEqual(expect.arrayContaining(['root', 'c1', 'c2', 'gc1']));
    expect(ids).toHaveLength(4);
  });
});

// ─── computeStats ─────────────────────────────────────────────────────────────

describe('computeStats', () => {
  it('returns zero stats for empty list', () => {
    const stats = computeStats([]);
    expect(stats.todo_count).toBe(0);
    expect(stats.total_estimate).toBe(0);
  });

  it('counts tasks by status correctly', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo' }),
      makeTask({ id: '2', status: 'todo' }),
      makeTask({ id: '3', status: 'in_progress' }),
      makeTask({ id: '4', status: 'done' }),
    ];
    const stats = computeStats(tasks);
    expect(stats.todo_count).toBe(2);
    expect(stats.in_progress_count).toBe(1);
    expect(stats.done_count).toBe(1);
  });

  it('sums estimates correctly grouped by status', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo',        estimate: 3 }),
      makeTask({ id: '2', status: 'todo',        estimate: 2 }),
      makeTask({ id: '3', status: 'in_progress', estimate: 5 }),
      makeTask({ id: '4', status: 'done',        estimate: 1 }),
    ];
    const stats = computeStats(tasks);
    expect(stats.total_estimate).toBe(11);
    expect(stats.todo_estimate).toBe(5);
    expect(stats.in_progress_estimate).toBe(5);
  });

  it('handles null estimates as 0', () => {
    const tasks = [makeTask({ id: '1', status: 'todo', estimate: null })];
    const stats = computeStats(tasks);
    expect(stats.total_estimate).toBe(0);
    expect(stats.todo_estimate).toBe(0);
  });
});

// ─── computeProgress ──────────────────────────────────────────────────────────

describe('computeProgress', () => {
  it('returns 0 for a todo task with no subtasks', () => {
    expect(computeProgress(makeTask({ status: 'todo' }))).toBe(0);
  });

  it('returns 100 for a done task with no subtasks', () => {
    expect(computeProgress(makeTask({ status: 'done' }))).toBe(100);
  });

  it('calculates partial progress across subtasks', () => {
    const task = makeTask({
      id: 'root',
      status: 'in_progress',
      subtasks: [
        makeTask({ id: 'c1', status: 'done' }),
        makeTask({ id: 'c2', status: 'done' }),
        makeTask({ id: 'c3', status: 'todo' }),
        makeTask({ id: 'c4', status: 'todo' }),
      ],
    });
    // root(in_progress) + 2 done + 2 todo = 5; done = root? NO
    // flattenTree includes root. root is in_progress → not done
    // in_progress: root, c3, c4 = not done; c1, c2 = done → 2/5 = 40%
    expect(computeProgress(task)).toBe(40);
  });

  it('counts nested subtasks recursively', () => {
    const task = makeTask({
      id: 'root',
      status: 'done',
      subtasks: [
        makeTask({
          id: 'c1',
          status: 'done',
          subtasks: [makeTask({ id: 'gc1', status: 'done' })],
        }),
      ],
    });
    // root + c1 + gc1 = 3 tasks, all done → 100%
    expect(computeProgress(task)).toBe(100);
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a valid ISO date as dd/mm/yyyy', () => {
    expect(formatDate('2025-03-15T10:00:00Z')).toMatch(/15\/03\/2025/);
  });

  it('returns the original string for invalid dates', () => {
    expect(formatDate('invalid-date')).toBe('invalid-date');
  });
});
