import type { TaskPriority } from '../types/task';

const CONFIG: Record<TaskPriority, { label: string; classes: string }> = {
    low: { label: 'Baja', classes: 'bg-slate-700 text-slate-300' },
    medium: { label: 'Media', classes: 'bg-yellow-900/60 text-yellow-300' },
    high: { label: 'Alta', classes: 'bg-orange-900/60 text-orange-300' },
    urgent: { label: 'Urgente', classes: 'bg-red-900/60 text-red-300 font-semibold' },
};

interface Props {
    priority: TaskPriority;
    size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'sm' }: Props) {
    const { label, classes } = CONFIG[priority];
    const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
    return (
        <span className={`inline-flex items-center rounded-full ${padding} ${classes}`}>
            {label}
        </span>
    );
}
