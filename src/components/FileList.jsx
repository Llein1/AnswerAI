import { useState } from 'react'
import { FileText, Trash2, Eye, EyeOff } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

export default function FileList({ files, onDelete, onToggle }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [fileToDelete, setFileToDelete] = useState(null)

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    if (files.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz dosya yüklenmedi</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Dosyalar ({files.length})
            </h3>
            <div className="space-y-2">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={`
              p-3 rounded-lg border transition-all animate-slideIn
              ${file.active
                                ? 'bg-slate-700/50 border-primary-500/50'
                                : 'bg-slate-800/30 border-slate-700'
                            }
            `}
                    >
                        <div className="flex items-start gap-2">
                            <FileText className={`w-5 h-5 flex-shrink-0 mt-0.5 ${file.active ? 'text-primary-400' : 'text-gray-500'}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${file.active ? 'text-gray-200' : 'text-gray-400'}`}>
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatFileSize(file.size)}
                                    {file.pageCount && ` · ${file.pageCount} sayfa`}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onToggle(file.id)}
                                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                                    title={file.active ? 'Pasifleştir' : 'Aktifleştir'}
                                >
                                    {file.active ? (
                                        <Eye className="w-4 h-4 text-primary-400" />
                                    ) : (
                                        <EyeOff className="w-4 h-4 text-gray-500" />
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setFileToDelete(file.id)
                                        setDeleteDialogOpen(true)
                                    }}
                                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                    title="Dosyayı sil"
                                >
                                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                title="Dosyayı Sil"
                message="Bu dosyayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                onConfirm={() => {
                    if (fileToDelete) {
                        onDelete(fileToDelete)
                    }
                    setDeleteDialogOpen(false)
                    setFileToDelete(null)
                }}
                onCancel={() => {
                    setDeleteDialogOpen(false)
                    setFileToDelete(null)
                }}
            />
        </div>
    )
}
