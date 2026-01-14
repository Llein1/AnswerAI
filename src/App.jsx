import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import FileList from './components/FileList'
import ChatInterface from './components/ChatInterface'
import ChatInput from './components/ChatInput'
import ConversationList from './components/ConversationList'
import { extractTextFromPDF } from './services/pdfService'
import { generateRAGResponse } from './services/ragService'
import * as ConvStorage from './services/conversationStorage'
import * as FileStorage from './services/fileStorage'

function App() {
    const [files, setFiles] = useState([])
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Conversation management
    const [conversations, setConversations] = useState([])
    const [activeConversationId, setActiveConversationId] = useState(null)

    // Load conversations and files on mount
    useEffect(() => {
        // Load files first
        const savedFiles = FileStorage.loadFiles()
        setFiles(savedFiles)
        console.log(`Loaded ${savedFiles.length} files from storage`)

        // Load conversations
        const convs = ConvStorage.getConversationsInOrder()
        setConversations(convs)

        const activeId = ConvStorage.getActiveConversationId()
        if (activeId) {
            loadConversation(activeId)
        } else if (convs.length > 0) {
            loadConversation(convs[0].id)
        } else {
            // Create first conversation
            handleNewConversation()
        }
    }, [])

    // Auto-save current conversation when messages change
    useEffect(() => {
        if (activeConversationId && messages.length > 0) {
            const conversation = {
                id: activeConversationId,
                title: ConvStorage.loadConversation(activeConversationId)?.title || 'New Conversation',
                createdAt: ConvStorage.loadConversation(activeConversationId)?.createdAt || Date.now(),
                updatedAt: Date.now(),
                messages: messages,
                activeFileIds: files.filter(f => f.active).map(f => f.id)
            }
            ConvStorage.saveConversation(conversation)

            // Refresh conversation list
            setConversations(ConvStorage.getConversationsInOrder())
        }
    }, [messages, activeConversationId, files])

    const handleFileUpload = async (file) => {
        try {
            setError(null)
            const { text, pageCount, pages } = await extractTextFromPDF(file)

            const newFile = {
                id: Date.now().toString(),
                name: file.name,
                size: file.size,
                text: text,
                pageCount: pageCount,
                pages: pages,  // Add pages metadata
                active: true,
                uploadedAt: new Date().toISOString()
            }

            // Save to localStorage
            const saved = FileStorage.saveFile(newFile)
            if (saved) {
                setFiles(prev => [...prev, newFile])
            } else {
                throw new Error('Failed to save file to storage')
            }
        } catch (err) {
            setError(err.message)
            console.error('File upload error:', err)
        }
    }

    const handleFileDelete = (fileId) => {
        FileStorage.deleteFile(fileId)
        setFiles(prev => prev.filter(f => f.id !== fileId))
    }

    const handleFileToggle = (fileId) => {
        const updatedFiles = files.map(f =>
            f.id === fileId ? { ...f, active: !f.active } : f
        )

        // Update localStorage
        const toggledFile = updatedFiles.find(f => f.id === fileId)
        if (toggledFile) {
            FileStorage.updateFileActiveState(fileId, toggledFile.active)
        }

        setFiles(updatedFiles)
    }

    const handleSendMessage = async (message) => {
        if (!message.trim() || isLoading) return

        const activeFiles = files.filter(f => f.active)
        if (activeFiles.length === 0) {
            setError('Please upload and activate at least one file to start chatting.')
            return
        }

        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)
        setError(null)

        try {
            // Generate AI response using RAG
            const { response, sources } = await generateRAGResponse(message, activeFiles)

            const aiMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                sources: sources,  // Add sources to message
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])
        } catch (err) {
            setError(err.message)
            console.error('Chat error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClearChat = () => {
        setMessages([])
        setError(null)
    }

    // Conversation handlers
    const handleNewConversation = () => {
        const newConv = ConvStorage.createNewConversation()
        setActiveConversationId(newConv.id)
        setMessages([])
        setError(null)
        setConversations(ConvStorage.getConversationsInOrder())
        console.log('Created new conversation:', newConv.id)
    }

    const loadConversation = (id) => {
        const conv = ConvStorage.loadConversation(id)
        if (conv) {
            setActiveConversationId(id)
            setMessages(conv.messages || [])
            ConvStorage.setActiveConversationId(id)
            console.log('Loaded conversation:', id)
        }
    }

    const handleDeleteConversation = (id) => {
        ConvStorage.deleteConversation(id)
        const remainingConvs = ConvStorage.getConversationsInOrder()
        setConversations(remainingConvs)

        // If deleting active conversation, switch to another or create new
        if (id === activeConversationId) {
            if (remainingConvs.length > 0) {
                loadConversation(remainingConvs[0].id)
            } else {
                handleNewConversation()
            }
        }
    }

    return (
        <Layout>
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
                <Header onClearChat={handleClearChat} messageCount={messages.length} />
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg border border-slate-700"
                >
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {sidebarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* Sidebar - Conversations & Files */}
                <div className={`w-80 bg-slate-800/50 border-r border-slate-700 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 z-40' : '-translate-x-full fixed'
                    }`}>
                    {/* Conversation List - Top Half */}
                    <div className="h-1/2 border-b border-slate-700 flex flex-col overflow-hidden">
                        <ConversationList
                            conversations={conversations}
                            activeId={activeConversationId}
                            onSelect={loadConversation}
                            onDelete={handleDeleteConversation}
                            onNew={handleNewConversation}
                        />
                    </div>

                    {/* File Management - Bottom Half */}
                    <div className="h-1/2 flex flex-col overflow-hidden">
                        <FileUpload onFileUpload={handleFileUpload} />
                        <FileList
                            files={files}
                            onDelete={handleFileDelete}
                            onToggle={handleFileToggle}
                        />
                    </div>
                </div>

                {/* Backdrop for mobile */}
                {sidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-black/50 z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Scrollable Chat Interface */}
                    <div className="flex-1 overflow-y-auto">
                        <ChatInterface
                            messages={messages}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>

                    {/* Sticky Chat Input */}
                    <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700">
                        <ChatInput
                            onSendMessage={handleSendMessage}
                            disabled={isLoading || files.filter(f => f.active).length === 0}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default App
