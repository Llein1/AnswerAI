import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import FileList from './components/FileList'
import ChatInterface from './components/ChatInterface'
import ChatInput from './components/ChatInput'
import ConversationList from './components/ConversationList'
import ConfirmDialog from './components/ConfirmDialog'
// Lazy load viewers to reduce initial bundle size
const PDFViewer = lazy(() => import('./components/PDFViewer'))
const DOCXViewer = lazy(() => import('./components/DOCXViewer'))
import SearchResults from './components/SearchResults'
import { ChevronDown } from 'lucide-react'
import { processFile } from './services/fileProcessingService'
import { generateRAGResponse } from './services/ragService'
import * as ConvStorage from './services/conversationStorage'
import * as FileStorage from './services/fileStorage'
import { searchConversations, debounce, invalidateSearchCache } from './services/searchService'

function App() {
    const [files, setFiles] = useState([])
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Conversation management
    const [conversations, setConversations] = useState([])
    const [activeConversationId, setActiveConversationId] = useState(null)
    const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false)

    // PDF Preview state
    const [previewFile, setPreviewFile] = useState(null)
    const [previewPage, setPreviewPage] = useState(1)

    // Scroll to bottom state and ref
    const chatScrollRef = useRef(null)
    const [showScrollButton, setShowScrollButton] = useState(false)

    // Search state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedResultIndex, setSelectedResultIndex] = useState(0)
    const searchContainerRef = useRef(null)
    const [searchFilters, setSearchFilters] = useState({
        dateRange: 'all',
        customDateFrom: null,
        customDateTo: null,
        conversationIds: [],
        messageType: 'all'
    })

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
                title: ConvStorage.loadConversation(activeConversationId)?.title || 'Yeni Sohbet',
                createdAt: ConvStorage.loadConversation(activeConversationId)?.createdAt || Date.now(),
                updatedAt: Date.now(),
                messages: messages,
                activeFileIds: files.filter(f => f.active).map(f => f.id)
            }
            ConvStorage.saveConversation(conversation)

            // Invalidate search cache when conversations change
            invalidateSearchCache()

            // Refresh conversation list
            setConversations(ConvStorage.getConversationsInOrder())
        }
    }, [messages, activeConversationId, files])

    const handleFileUpload = async (file) => {
        try {
            setError(null)

            // Process file using unified service (supports PDF, TXT, MD, DOCX)
            const { text, metadata } = await processFile(file)

            // Read file as ArrayBuffer for preview (primarily for PDFs)
            const arrayBuffer = await file.arrayBuffer()

            const newFile = {
                id: Date.now().toString(),
                name: file.name,
                size: file.size,
                type: metadata.type, // Store file type (pdf, txt, md, docx)
                text: text,
                pageCount: metadata.pageCount || null, // PDF specific
                pages: metadata.pages || null,  // PDF specific
                data: arrayBuffer,  // Binary data for preview
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
            setError('Sohbete başlamak için lütfen en az bir dosya yükleyin ve aktifleştirin.')
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
        setClearChatDialogOpen(true)
    }

    const confirmClearChat = () => {
        if (activeConversationId) {
            // Delete the current conversation from storage
            ConvStorage.deleteConversation(activeConversationId)

            // Create a new empty conversation
            const newConv = ConvStorage.createNewConversation()
            setActiveConversationId(newConv.id)
            setMessages([])
            setError(null)
            setConversations(ConvStorage.getConversationsInOrder())
        }
        setClearChatDialogOpen(false)
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

        // Invalidate search cache when conversations are deleted
        invalidateSearchCache()

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

    // Preview handlers
    const handlePreviewFile = (fileId, page = 1) => {
        const file = files.find(f => f.id === fileId)
        if (file && file.data) {
            setPreviewFile(file)
            setPreviewPage(page)
        }
    }

    const handleClosePreview = () => {
        setPreviewFile(null)
        setPreviewPage(1)
    }

    const handlePageClick = (fileName, pageNumber) => {
        const file = files.find(f => f.name === fileName)
        if (file) {
            handlePreviewFile(file.id, pageNumber)
        }
    }

    const handleRenameConversation = (id, newTitle) => {
        if (!newTitle.trim()) return

        const conv = ConvStorage.loadConversation(id)
        if (conv) {
            const updatedConv = {
                ...conv,
                title: newTitle.trim(),
                updatedAt: Date.now()
            }
            ConvStorage.saveConversation(updatedConv)
            setConversations(ConvStorage.getConversationsInOrder())
        }
    }

    // Search handlers
    const handleSearch = debounce((query) => {
        if (!query || !query.trim()) {
            setSearchResults([])
            setSearchQuery('')
            return
        }

        setSearchQuery(query)
        const results = searchConversations(query, searchFilters)
        setSearchResults(results)
        setSelectedResultIndex(0)
    }, 300)


    const handleClearSearch = () => {
        setSearchQuery('')
        setSearchResults([])
        setSelectedResultIndex(0)
    }

    // Close dropdown only (keep query text) - for click outside
    const handleCloseSearchResults = () => {
        setSearchResults([])
        setSelectedResultIndex(0)
    }

    // Filter handlers
    const handleFilterChange = (newFilters) => {
        setSearchFilters(newFilters)
        // Re-run search with new filters if query exists
        if (searchQuery) {
            const results = searchConversations(searchQuery, newFilters)
            setSearchResults(results)
            setSelectedResultIndex(0)
        }
    }

    const handleClearFilters = () => {
        const defaultFilters = {
            dateRange: 'all',
            customDateFrom: null,
            customDateTo: null,
            conversationIds: [],
            messageType: 'all'
        }
        setSearchFilters(defaultFilters)
        // Re-run search with cleared filters
        if (searchQuery) {
            const results = searchConversations(searchQuery, defaultFilters)
            setSearchResults(results)
            setSelectedResultIndex(0)
        }
    }

    const handleSelectSearchResult = (result) => {
        // Switch to the conversation containing the result
        if (result.conversationId !== activeConversationId) {
            loadConversation(result.conversationId)
        }

        // Wait for conversation to load, then scroll to message
        setTimeout(() => {
            const messageElements = document.querySelectorAll('[data-message-index]')
            const targetElement = Array.from(messageElements).find(
                el => parseInt(el.getAttribute('data-message-index')) === result.messageIndex
            )

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                // Add temporary highlight
                targetElement.classList.add('bg-primary-500/20', 'ring-2', 'ring-primary-500/50')
                setTimeout(() => {
                    targetElement.classList.remove('bg-primary-500/20', 'ring-2', 'ring-primary-500/50')
                }, 2000)
            }
        }, 100)

        // Keep search open so user can navigate to other results
    }

    // Keyboard navigation for search results
    useEffect(() => {
        if (searchResults.length === 0) return

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedResultIndex(prev =>
                    prev < searchResults.length - 1 ? prev + 1 : prev
                )
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedResultIndex(prev => prev > 0 ? prev - 1 : 0)
            } else if (e.key === 'Enter' && searchResults[selectedResultIndex]) {
                e.preventDefault()
                handleSelectSearchResult(searchResults[selectedResultIndex])
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [searchResults, selectedResultIndex])

    // Click outside to close search results
    useEffect(() => {
        if (searchResults.length === 0) return

        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                handleCloseSearchResults()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [searchResults.length])

    // Scroll to bottom handler
    const scrollToBottom = () => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTo({
                top: chatScrollRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }

    // Chat scroll listener - show/hide scroll button
    const handleChatScroll = (e) => {
        if (!e.target) return
        const { scrollTop, scrollHeight, clientHeight } = e.target
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200
        setShowScrollButton(!isNearBottom)
    }

    // Auto-scroll to bottom when new message arrives
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom()
        }
    }, [messages.length])

    return (
        <Layout>
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
                <div className="relative" ref={searchContainerRef}>
                    <Header
                        onClearChat={handleClearChat}
                        messageCount={messages.length}
                        onSearch={handleSearch}
                        onClearSearch={handleClearSearch}
                        searchResultCount={searchResults.length}
                        searchFilters={searchFilters}
                        conversations={conversations}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />

                    {/* Search Results Dropdown */}
                    {searchQuery && searchResults.length > 0 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-full max-w-2xl px-6">
                            <SearchResults
                                results={searchResults}
                                query={searchQuery}
                                onSelectResult={handleSelectSearchResult}
                                selectedIndex={selectedResultIndex}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex h-0 overflow-hidden relative">
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
                    <div className="h-1/2 border-b border-slate-700 flex flex-col">
                        <ConversationList
                            conversations={conversations}
                            activeId={activeConversationId}
                            onSelect={loadConversation}
                            onDelete={handleDeleteConversation}
                            onNew={handleNewConversation}
                            onRename={handleRenameConversation}
                        />
                    </div>

                    {/* File Management - Bottom Half */}
                    <div className="h-1/2 flex flex-col">
                        <FileUpload onFileUpload={handleFileUpload} />
                        <FileList
                            files={files}
                            onDelete={handleFileDelete}
                            onToggle={handleFileToggle}
                            onPreview={handlePreviewFile}
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
                <div className={`flex-1 flex flex-col relative ${previewFile ? 'lg:pr-96' : ''}`}>
                    {/* Scrollable Chat Interface */}
                    <div
                        ref={chatScrollRef}
                        onScroll={handleChatScroll}
                        className="flex-1 overflow-y-auto pb-24"
                    >
                        <ChatInterface
                            messages={messages}
                            isLoading={isLoading}
                            error={error}
                            onPageClick={handlePageClick}
                        />
                    </div>

                    {/* Scroll to Bottom Button */}
                    {showScrollButton && (
                        <button
                            onClick={scrollToBottom}
                            className="fixed bottom-28 right-8 p-3 bg-gradient-to-br from-primary-500 to-accent-600 
                                       hover:from-primary-600 hover:to-accent-700 rounded-full shadow-lg 
                                       transition-all z-30 hover:scale-110"
                            title="En alta git"
                        >
                            <ChevronDown className="w-6 h-6 text-white" />
                        </button>
                    )}
                </div>

                {/* Document Preview Panel (PDF or DOCX) */}
                {previewFile && (
                    <div className="absolute right-0 top-0 bottom-0 w-96 overflow-hidden flex flex-col hidden lg:flex">
                        <ErrorBoundary fallback={
                            <div className="flex items-center justify-center h-full bg-slate-900/95 p-6 text-center">
                                <div>
                                    <p className="text-gray-300 mb-4">Görüntüleme hatası</p>
                                    <button
                                        onClick={handleClosePreview}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg"
                                    >
                                        Kapat
                                    </button>
                                </div>
                            </div>
                        }>
                            <Suspense fallback={
                                <div className="flex items-center justify-center h-full bg-slate-900/95">
                                    <div className="text-gray-400">Görüntüleyici yükleniyor...</div>
                                </div>
                            }>
                                {previewFile.type === 'pdf' ? (
                                    <PDFViewer
                                        fileData={previewFile.data}
                                        fileName={previewFile.name}
                                        initialPage={previewPage}
                                        onClose={handleClosePreview}
                                    />
                                ) : previewFile.type === 'docx' ? (
                                    <DOCXViewer
                                        fileData={previewFile.data}
                                        fileName={previewFile.name}
                                        onClose={handleClosePreview}
                                    />
                                ) : null}
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                )}

                {/* Mobile Preview Modal */}
                {previewFile && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-slate-900">
                        <ErrorBoundary>
                            <Suspense fallback={
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-gray-400">Görüntüleyici yükleniyor...</div>
                                </div>
                            }>
                                {previewFile.type === 'pdf' ? (
                                    <PDFViewer
                                        fileData={previewFile.data}
                                        fileName={previewFile.name}
                                        initialPage={previewPage}
                                        onClose={handleClosePreview}
                                    />
                                ) : previewFile.type === 'docx' ? (
                                    <DOCXViewer
                                        fileData={previewFile.data}
                                        fileName={previewFile.name}
                                        onClose={handleClosePreview}
                                    />
                                ) : null}
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                )}
            </div>

            {/* Fixed Text Input - Always at Screen Bottom */}
            <div className="fixed bottom-0 left-0 md:left-80 right-0 bg-slate-900/95 backdrop-blur-sm 
                            border-t border-slate-700 z-20">
                <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={isLoading || files.filter(f => f.active).length === 0}
                />
            </div>

            {/* Clear Chat Confirmation Dialog */}
            <ConfirmDialog
                isOpen={clearChatDialogOpen}
                title="Sohbeti Temizle"
                message="Bu sohbetteki tüm mesajları silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                onConfirm={confirmClearChat}
                onCancel={() => setClearChatDialogOpen(false)}
            />
        </Layout>
    )
}

export default App
