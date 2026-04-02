import { Clock, ListTree, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { TaskStats } from '../types/task';

interface Props {
    stats: TaskStats;
}

export function StatsPanel({ stats }: Props) {
    const cards = [
        {
            icon: <Clock className="w-5 h-5 text-gray-400" />,
            label: 'Pendientes',
            value: stats.todo_count,
            sub: stats.todo_estimate > 0 ? `~${stats.todo_estimate} pts` : undefined,
            accent: 'border-gray-700',
        },
        {
            icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
            label: 'En progreso',
            value: stats.in_progress_count,
            sub: stats.in_progress_estimate > 0 ? `~${stats.in_progress_estimate} pts` : undefined,
            accent: 'border-blue-700/50',
        },
        {
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
            label: 'Completadas',
            value: stats.done_count,
            sub: undefined,
            accent: 'border-emerald-700/50',
        },
        {
            icon: <ListTree className="w-5 h-5 text-indigo-400" />,
            label: 'Estimación total',
            value: stats.total_estimate,
            sub: 'puntos',
            accent: 'border-indigo-700/50',
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cards.map((c) => (
                <div key={c.label} className={`card p-4 border-l-2 ${c.accent}`}>
                    <div className="flex items-center gap-2 mb-1">
                        {c.icon}
                        <span className="text-xs text-gray-500">{c.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-100">{c.value}</p>
                    {c.sub && <p className="text-xs text-gray-500 mt-0.5">{c.sub}</p>}
                </div>
            ))}
        </div>
    );
}
