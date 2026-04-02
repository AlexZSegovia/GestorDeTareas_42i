import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Task, CreateTaskPayload } from '../types/task';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { TaskForm } from './TaskForm';

interface NodeProps {
    task: Task;
    depth: number;
    fromPath: string;
    onAddSubtask: (parentId: string, payload: CreateTaskPayload) => Promise<void>;
    onEdit: (task: Task, payload: CreateTaskPayload) => Promise<void>;
    onDelete: (id: string) => void;
}

function SubtaskNode({ task, depth, fromPath, onAddSubtask, onEdit, onDelete }: NodeProps) {
    const [expanded, setExpanded] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const hasChildren = (task.subtasks?.length ?? 0) > 0;

    return (
        <div className={`${depth > 0 ? 'ml-6 border-l border-gray-800 pl-4' : ''}`}>
            <div className="flex items-center gap-2 py-2 group">
                {/* Expand toggle */}
                <button
                    onClick={() => setExpanded((v) => !v)}
                    className={`text-gray-600 hover:text-gray-400 shrink-0 ${!hasChildren ? 'invisible' : ''}`}
                >
                    {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {/* Main row */}
                <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
                    <Link
                        to={`/tasks/${task.id}`}
                        state={{ from: fromPath }}
                        className="text-sm text-gray-200 hover:text-indigo-400 truncate max-w-[220px]"
                    >
                        {task.title}
                    </Link>
                    <Link
                        to={`/tasks/${task.id}?edit=1`}
                        state={{ from: fromPath }}
                        className="text-xs text-yellow-400 hover:text-yellow-300"
                    >
                        Editar
                    </Link>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                    >
                        Eliminar
                    </button>
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    {task.estimate != null && (
                        <span className="text-xs text-gray-600">{task.estimate} pts</span>
                    )}
                </div>

                {/* Actions (visible on hover) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        title="Añadir subtarea"
                        onClick={() => setShowAddForm(true)}
                        className="p-1 text-gray-500 hover:text-indigo-400"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                        title="Editar"
                        onClick={() => setShowEditForm(true)}
                        className="p-1 text-gray-500 hover:text-yellow-400"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        title="Eliminar"
                        onClick={() => onDelete(task.id)}
                        className="p-1 text-gray-500 hover:text-red-400"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Children */}
            {expanded && hasChildren && (
                <div>
                    {task.subtasks!.map((sub) => (
                        <SubtaskNode
                            key={sub.id}
                            task={sub}
                            depth={depth + 1}
                            fromPath={fromPath}
                            onAddSubtask={onAddSubtask}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}

            {/* Forms */}
            {showAddForm && (
                <TaskForm
                    parentId={task.id}
                    onSubmit={(payload) => onAddSubtask(task.id, payload)}
                    onClose={() => setShowAddForm(false)}
                />
            )}
            {showEditForm && (
                <TaskForm
                    task={task}
                    onSubmit={(payload) => onEdit(task, payload)}
                    onClose={() => setShowEditForm(false)}
                />
            )}
        </div>
    );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface TreeProps {
    subtasks: Task[];
    fromPath: string;
    onAddSubtask: (parentId: string, payload: CreateTaskPayload) => Promise<void>;
    onEdit: (task: Task, payload: CreateTaskPayload) => Promise<void>;
    onDelete: (id: string) => void;
}

export function SubtaskTree({ subtasks, fromPath, onAddSubtask, onEdit, onDelete }: TreeProps) {
    if (!subtasks.length) {
        return (
            <p className="text-sm text-gray-600 py-4 text-center">
                Sin subtareas. Usa el botón <span className="text-indigo-400">+ Subtarea</span> para añadir una.
            </p>
        );
    }

    return (
        <div>
            {subtasks.map((task) => (
                <SubtaskNode
                    key={task.id}
                    task={task}
                    depth={0}
                    fromPath={fromPath}
                    onAddSubtask={onAddSubtask}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
