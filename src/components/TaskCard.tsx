import { Link } from 'react-router-dom';
import { ListTree, Clock } from 'lucide-react';
import type { Task } from '../types/task';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/task.utils';

interface Props {
    task: Task;
    onDelete: (id: string) => void;
}

export function TaskCard({ task, onDelete }: Props) {
    return (
        <div className="card p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <Link
                    to={`/tasks/${task.id}`}
                    className="text-sm font-semibold text-gray-100 hover:text-indigo-400 transition-colors line-clamp-2 flex-1"
                >
                    {task.title}
                </Link>
                <div className="flex gap-1 shrink-0">
                    <PriorityBadge priority={task.priority} />
                </div>
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={task.status} />
                {task.estimate != null && (
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {task.estimate} pts
                    </span>
                )}
                {(task.subtask_count ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                        <ListTree className="w-3 h-3" />
                        {task.subtask_count} subtarea{task.subtask_count !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-800">
                <span className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    {formatDate(task.created_at)}
                </span>
                <div className="flex gap-2">
                    <Link to={`/tasks/${task.id}`} className="text-xs text-indigo-400 hover:text-indigo-300">
                        Ver
                    </Link>
                    <Link to={`/tasks/${task.id}?edit=1`} className="text-xs text-yellow-400 hover:text-yellow-300">
                        Editar
                    </Link>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="text-xs text-red-500 hover:text-red-400"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
