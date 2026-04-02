import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Pencil, Trash2, Plus, Clock, RefreshCw, Home,
} from 'lucide-react';
import { api } from '../services/api';
import type { Task, CreateTaskPayload, TaskStatus } from '../types/task';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { SubtaskTree } from '../components/SubtaskTree';
import { TaskForm } from '../components/TaskForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { computeProgress, formatDate } from '../utils/task.utils';

export function TaskDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showEditForm, setShowEditForm] = useState(false);
    const [showAddSubtask, setShowAddSubtask] = useState(false);
    const [showDeleteSelf, setShowDeleteSelf] = useState(false);
    const [deleteSubId, setDeleteSubId] = useState<string | null>(null);
    const [statusSaving, setStatusSaving] = useState(false);

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const t = await api.getTask(id);
            setTask(t);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar la tarea');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    // Permite abrir edición directa con /tasks/:id?edit=1
    useEffect(() => {
        if (searchParams.get('edit') === '1') {
            setShowEditForm(true);
        }
    }, [searchParams]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleEdit = async (_t: Task, payload: CreateTaskPayload) => {
        await api.updateTask(id!, payload);
        await load();
    };

    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (!task) return;
        if (!window.confirm('¿Confirmas cambiar el estado de esta tarea?')) return;
        setStatusSaving(true);
        try {
            await api.updateTask(task.id, {
                title: task.title,
                description: task.description,
                status: newStatus,
                priority: task.priority,
                estimate: task.estimate,
                parent_id: task.parent_id,
            });
            await load();
        } finally {
            setStatusSaving(false);
        }
    };

    const handleAddSubtask = async (_parentId: string, payload: CreateTaskPayload) => {
        await api.createTask(payload);
        await load();
    };

    const handleEditSubtask = async (sub: Task, payload: CreateTaskPayload) => {
        await api.updateTask(sub.id, payload);
        await load();
    };

    const handleDeleteSubtask = async () => {
        if (!deleteSubId) return;
        await api.deleteTask(deleteSubId);
        setDeleteSubId(null);
        await load();
    };

    const handleDeleteSelf = async () => {
        if (!task) return;
        await api.deleteTask(task.id);
        navigate('/');
    };

    const handleBack = () => {
        if (!task?.parent_id) {
            navigate('/');
            return;
        }

        const from = (location.state as { from?: string } | null)?.from;
        const currentPath = `${location.pathname}${location.search}`;
        if (from && from !== currentPath) {
            navigate(from);
            return;
        }

        if (typeof window !== 'undefined' && window.history.length > 1) {
            navigate(-1);
            return;
        }

        if (task?.parent_id) {
            navigate(`/tasks/${task.parent_id}`);
            return;
        }

        navigate('/');
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading && !task) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">
                Cargando...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
                <p className="text-red-400">{error}</p>
                <Link to="/" className="btn-secondary">Volver al listado</Link>
            </div>
        );
    }

    if (!task) return null;

    const progress = computeProgress(task);
    const totalSubtasks = countAll(task) - 1; // excluir la propia tarea

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 relative">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-300" aria-label="Volver">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-gray-500">Sistema de Tareas</span>
                    <span className="text-gray-700">/</span>
                    <span className="text-sm text-gray-300 truncate max-w-xs">{task.title}</span>

                    <Link
                        to="/"
                        className="absolute left-1/2 -translate-x-1/2 text-gray-500 hover:text-indigo-400 transition-colors"
                        aria-label="Ir al inicio"
                        title="Inicio"
                    >
                        <Home className="w-5 h-5" />
                    </Link>

                    <div className="ml-auto flex gap-2">
                        <button onClick={load} disabled={loading} className="btn-secondary px-3">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => setShowEditForm(true)} className="btn-secondary flex items-center gap-1.5">
                            <Pencil className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button onClick={() => setShowDeleteSelf(true)} className="btn-danger flex items-center gap-1.5">
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">

                {/* Task header */}
                <div className="card p-6 flex flex-col gap-4">
                    <div className="flex items-start gap-3 flex-wrap">
                        <h1 className="text-xl font-bold text-gray-100 flex-1">{task.title}</h1>
                        <PriorityBadge priority={task.priority} size="md" />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowEditForm(true)}
                            className="btn-secondary flex items-center gap-1.5 text-xs py-1.5"
                        >
                            <Pencil className="w-3.5 h-3.5" /> Editar esta tarea
                        </button>
                        <button
                            onClick={() => setShowDeleteSelf(true)}
                            className="btn-danger flex items-center gap-1.5 text-xs py-1.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar esta tarea
                        </button>
                    </div>

                    {task.description && (
                        <p className="text-sm text-gray-400 leading-relaxed">{task.description}</p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-2 border-t border-gray-800">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Creada: {formatDate(task.created_at)}
                        </span>
                        {task.updated_at !== task.created_at && (
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Actualizada: {formatDate(task.updated_at)}
                            </span>
                        )}
                        {task.estimate != null && (
                            <span className="text-indigo-400 font-medium">
                                Estimación: {task.estimate} pts
                            </span>
                        )}
                        {task.parent_id && (
                            <Link
                                to={`/tasks/${task.parent_id}`}
                                state={{ from: `${location.pathname}${location.search}` }}
                                className="text-xs text-gray-600 hover:text-gray-400"
                            >
                                ← Tarea padre
                            </Link>
                        )}
                    </div>

                    {/* Status selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">Estado:</span>
                        <div className="flex gap-2">
                            {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((s) => (
                                <button
                                    key={s}
                                    disabled={statusSaving}
                                    onClick={() => handleStatusChange(s)}
                                    className={`transition-opacity ${task.status === s ? 'opacity-100 ring-2 ring-indigo-500 rounded-full' : 'opacity-40 hover:opacity-70'}`}
                                >
                                    <StatusBadge status={s} size="md" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Progress */}
                {totalSubtasks > 0 && (
                    <div className="card p-4 flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Progreso total ({totalSubtasks} subtarea{totalSubtasks !== 1 ? 's' : ''})</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Subtasks */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-300">Subtareas</h2>
                        <button
                            onClick={() => setShowAddSubtask(true)}
                            className="btn-secondary flex items-center gap-1.5 text-xs py-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" /> Subtarea
                        </button>
                    </div>
                    <SubtaskTree
                        subtasks={task.subtasks ?? []}
                        fromPath={`${location.pathname}${location.search}`}
                        onAddSubtask={handleAddSubtask}
                        onEdit={handleEditSubtask}
                        onDelete={setDeleteSubId}
                    />
                </div>
            </main>

            {/* Modals */}
            {showEditForm && (
                <TaskForm
                    task={task}
                    onSubmit={(payload) => handleEdit(task, payload)}
                    onClose={() => setShowEditForm(false)}
                />
            )}
            {showAddSubtask && (
                <TaskForm parentId={task.id} onSubmit={(p) => handleAddSubtask(task.id, p)} onClose={() => setShowAddSubtask(false)} />
            )}
            {showDeleteSelf && (
                <ConfirmDialog
                    message={`¿Eliminar "${task.title}" y todas sus subtareas? Esta acción no se puede deshacer.`}
                    onConfirm={handleDeleteSelf}
                    onCancel={() => setShowDeleteSelf(false)}
                />
            )}
            {deleteSubId && (
                <ConfirmDialog
                    message="¿Eliminar esta subtarea y todas sus subtareas anidadas?"
                    onConfirm={handleDeleteSubtask}
                    onCancel={() => setDeleteSubId(null)}
                />
            )}
        </div>
    );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function countAll(task: Task): number {
    return 1 + (task.subtasks ?? []).reduce((acc, s) => acc + countAll(s), 0);
}
