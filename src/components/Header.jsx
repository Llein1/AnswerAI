import { Sparkles, Trash2 } from 'lucide-react'

export default function Header({ onClearChat, messageCount }) {
    return (
        <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary-500 to-accent-600 p-2 rounded-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                            AnswerAI
                        </h1>
                        <p className="text-sm text-gray-400">RAG-Powered Document Assistant</p>
                    </div>
                </div>

                {messageCount > 0 && (
                    <button
                        onClick={onClearChat}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Chat
                    </button>
                )}
            </div>
        </header>
    )
}
