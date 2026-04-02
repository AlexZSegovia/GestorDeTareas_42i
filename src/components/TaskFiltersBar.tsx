import { Search, SlidersHorizontal } from 'lucide-react';
import type { TaskFilters, TaskPriority, TaskStatus } from '../types/task';

interface Props {
    filters: TaskFilters;
    onChange: (f: TaskFilters) => void;
}

const STATUSES: { value: TaskStatus | ''; label: string }[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'todo', label: 'Pendiente' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'done', label: 'Completado' },
];

const PRIORITIES: { value: TaskPriority | ''; label: string }[] = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'urgent', label: 'Urgente' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Media' },
    { value: 'low', label: 'Baja' },
];

const SORTS: { value: string; label: string }[] = [
    { value: 'created_at', label: 'Fecha creación' },
    { value: 'priority', label: 'Prioridad' },
    { value: 'status', label: 'Estado' },
    { value: 'title', label: 'Título' },
];

export function TaskFiltersBar({ filters, onChange }: Props) {
    const update = (partial: Partial<TaskFilters>) =>
        onChange({ ...filters, ...partial });

    return (
        <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar tarea..."
                    value={filters.search ?? ''}
                    onChange={(e) => update({ search: e.target.value })}
                    className="input pl-9"
                />
            </div>

            {/* Status */}
            <select
                value={filters.status ?? ''}
                onChange={(e) => update({ status: e.target.value as TaskStatus | '' })}
                className="input sm:w-48"
            >
                {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>

            {/* Priority */}
            <select
                value={filters.priority ?? ''}
                onChange={(e) => update({ priority: e.target.value as TaskPriority | '' })}
                className="input sm:w-44"
            >
                {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                ))}
            </select>

            {/* Sort */}
            <div className="flex gap-1">
                <select
                    value={filters.sort ?? 'created_at'}
                    onChange={(e) => update({ sort: e.target.value as TaskFilters['sort'] })}
                    className="input sm:w-40"
                >
                    {SORTS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                <button
                    title="Invertir orden"
                    onClick={() => update({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
                    className="btn-secondary px-3"
                >
                    <SlidersHorizontal className={`w-4 h-4 transition-transform ${filters.order === 'asc' ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
}
