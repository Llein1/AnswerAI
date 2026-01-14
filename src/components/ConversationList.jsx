import { useState } from 'react'
import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

export default function ConversationList({
    conversations,
    activeId,
    onSelect,
    onDelete,
    onNew
}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [conversationToDelete, setConversationToDelete] = useState(null)

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header with New Chat button */}
            <div className="p-4 border-b border-slate-700">
                <button
                    onClick={onNew}
                    className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">New Chat</span>
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Start a new chat to begin</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`group relative rounded-lg p-3 cursor-pointer transition-all ${activeId === conv.id
                                        ? 'bg-primary-600/20 border border-primary-500/50'
                                        : 'hover:bg-slate-700/50 border border-transparent'
                                    }`}
                                onClick={() => onSelect(conv.id)}
                            >
                                <div className="flex items-start gap-2">
                                    <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${activeId === conv.id ? 'text-primary-400' : 'text-gray-500'
                                        }`} />

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${activeId === conv.id ? 'text-gray-200' : 'text-gray-300'
                                            }`}>
                                            {conv.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-gray-500">
                                                {formatDate(conv.updatedAt)}
                                            </p>
                                            <span className="text-xs text-gray-600">•</span>
                                            <p className="text-xs text-gray-500">
                                                {conv.messages.length} msg{conv.messages.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setConversationToDelete(conv.id)
                                            setDeleteDialogOpen(true)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
                                        title="Delete conversation"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer info */}
            <div className="p-3 border-t border-slate-700">
                <p className="text-xs text-gray-500 text-center">
                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                title="Delete Conversation"
                message="Are you sure you want to delete this conversation? This action cannot be undone."
                onConfirm={() => {
                    if (conversationToDelete) {
                        onDelete(conversationToDelete)
                    }
                    setDeleteDialogOpen(false)
                    setConversationToDelete(null)
                }}
                onCancel={() => {
                    setDeleteDialogOpen(false)
                    setConversationToDelete(null)
                }}
            />
        </div>
    )
}
