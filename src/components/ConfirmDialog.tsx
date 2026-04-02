import { X } from 'lucide-react';

interface Props {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div className="card w-full max-w-sm p-6">
                <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center shrink-0">
                        <X className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-100 text-sm">Confirmar eliminación</h3>
                        <p className="text-xs text-gray-400 mt-1">{message}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-danger">Eliminar</button>
                </div>
            </div>
        </div>
    );
}
