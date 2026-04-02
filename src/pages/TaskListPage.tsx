import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import type { Task, TaskFilters, TaskStats, CreateTaskPayload } from '../types/task';
import { StatsPanel } from '../components/StatsPanel';
import { TaskCard } from '../components/TaskCard';
import { TaskFiltersBar } from '../components/TaskFiltersBar';
import { TaskForm } from '../components/TaskForm';
import { ConfirmDialog } from '../components/ConfirmDialog';

const EMPTY_STATS: TaskStats = {
    todo_count: 0, in_progress_count: 0, done_count: 0,
    total_estimate: 0, todo_estimate: 0, in_progress_estimate: 0,
};

export function TaskListPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<TaskStats>(EMPTY_STATS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<TaskFilters>({ sort: 'created_at', order: 'desc' });
    const [showForm, setShowForm] = useState(false);

    // Confirm delete
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const confirmingTask = tasks.find((t) => t.id === deleteId);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.listTasks(filters);
            setTasks(res.data);
            setStats(res.stats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar las tareas');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async (payload: CreateTaskPayload) => {
        await api.createTask(payload);
        await load();
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await api.deleteTask(deleteId);
        setDeleteId(null);
        await load();
    };

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Top Bar */}
            <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-100">Sistema de Tareas</h1>
                        <p className="text-xs text-gray-500">Gestión del equipo de desarrollo</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={load} disabled={loading} className="btn-secondary px-3">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5">
                            <Plus className="w-4 h-4" /> Nueva tarea
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
                {/* Stats */}
                <StatsPanel stats={stats} />

                {/* Filters */}
                <TaskFiltersBar filters={filters} onChange={setFilters} />

                {/* Error */}
                {error && (
                    <div className="card p-4 border-red-800 bg-red-900/20 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {/* Tasks grid */}
                {loading && !tasks.length ? (
                    <div className="text-center py-20 text-gray-600">Cargando...</div>
                ) : !tasks.length ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-sm mb-3">No hay tareas que coincidan con los filtros.</p>
                        <button onClick={() => setShowForm(true)} className="btn-primary">
                            Crear primera tarea
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tasks.map((t) => (
                            <TaskCard key={t.id} task={t} onDelete={setDeleteId} />
                        ))}
                    </div>
                )}

                {/* Footer count */}
                {tasks.length > 0 && (
                    <p className="text-xs text-gray-600 text-center">
                        Mostrando {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}
                    </p>
                )}
            </main>

            {/* Modals */}
            {showForm && (
                <TaskForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
            )}
            {deleteId && confirmingTask && (
                <ConfirmDialog
                    message={`¿Eliminar "${confirmingTask.title}" y todas sus subtareas?`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    );
}
