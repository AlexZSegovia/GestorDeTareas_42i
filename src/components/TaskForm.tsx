import { useState } from 'react';
import { X } from 'lucide-react';
import type { Task, CreateTaskPayload, TaskStatus, TaskPriority } from '../types/task';

interface Props {
    /** Si se pasa, es modo edición */
    task?: Task;
    /** parent_id fijo al crear subtarea */
    parentId?: string;
    onSubmit: (payload: CreateTaskPayload) => Promise<void>;
    onClose: () => void;
}

const STATUSES: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'Pendiente' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'done', label: 'Completado' },
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' },
];

export function TaskForm({ task, parentId, onSubmit, onClose }: Props) {
    const [title, setTitle] = useState(task?.title ?? '');
    const [description, setDescription] = useState(task?.description ?? '');
    const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo');
    const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
    const [estimate, setEstimate] = useState<string>(task?.estimate != null ? String(task.estimate) : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError('El título es obligatorio.'); return; }

        const estimateVal = estimate.trim() !== '' ? Number(estimate) : null;
        if (estimateVal !== null && (isNaN(estimateVal) || estimateVal < 0)) {
            setError('La estimación debe ser un número no negativo.');
            return;
        }

        const isEdit = Boolean(task);
        const ok = window.confirm(
            isEdit
                ? '¿Confirmas guardar los cambios de esta tarea?'
                : '¿Confirmas crear esta tarea?'
        );
        if (!ok) return;

        setLoading(true);
        setError(null);
        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim() || null,
                status,
                priority,
                estimate: estimateVal,
                parent_id: task?.parent_id ?? parentId ?? null,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const isEdit = Boolean(task);

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="card w-full max-w-lg p-6 relative">
                {/* Close */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-semibold text-gray-100 mb-5">
                    {isEdit ? 'Editar tarea' : parentId ? 'Nueva subtarea' : 'Nueva tarea'}
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Title */}
                    <div>
                        <label className="label">Título *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input"
                            placeholder="Ej. Implementar autenticación"
                            maxLength={200}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input min-h-[80px] resize-y"
                            placeholder="Describe la tarea..."
                            rows={3}
                        />
                    </div>

                    {/* Row: Status + Priority */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">Estado</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="input">
                                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Prioridad</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="input">
                                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Estimate */}
                    <div>
                        <label className="label">Estimación (puntos, opcional)</label>
                        <input
                            type="number"
                            value={estimate}
                            onChange={(e) => setEstimate(e.target.value)}
                            className="input"
                            placeholder="Ej. 3"
                            min={0}
                            step="0.5"
                        />
                    </div>

                    {/* Error */}
                    {error && <p className="text-sm text-red-400">{error}</p>}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
