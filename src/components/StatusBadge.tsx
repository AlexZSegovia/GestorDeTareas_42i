import type { TaskStatus } from '../types/task';

const CONFIG: Record<TaskStatus, { label: string; classes: string; dot: string }> = {
    todo: { label: 'Pendiente', classes: 'bg-gray-700 text-gray-300', dot: 'bg-gray-400' },
    in_progress: { label: 'En progreso', classes: 'bg-blue-900/60 text-blue-300', dot: 'bg-blue-400' },
    done: { label: 'Completado', classes: 'bg-emerald-900/60 text-emerald-300', dot: 'bg-emerald-400' },
};

interface Props {
    status: TaskStatus;
    size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: Props) {
    const { label, classes, dot } = CONFIG[status];
    const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full ${padding} ${classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {label}
        </span>
    );
}
