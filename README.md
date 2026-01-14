# AnswerAI - Advanced RAG Chatbot 🤖

A modern, feature-rich RAG (Retrieval-Augmented Generation) chatbot with conversation memory, file persistence, and multi-document comparison capabilities. Built with React, Gemini AI, and modern web technologies.

![AnswerAI Demo](https://img.shields.io/badge/status-production%20ready-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-orange)

## ✨ Features

### 📄 Document Management
- **PDF Upload**: Drag & drop or click to upload PDF files (max 10MB)
- **Multi-File Support**: Upload and manage multiple PDFs simultaneously
- **File Persistence**: Uploaded files persist across page refreshes (localStorage)
- **Active/Inactive Toggle**: Control which documents are used for Q&A
- **File Metadata**: View page count, file size, and upload date

### 💬 Conversation Features
- **Conversation Memory**: All chats automatically saved to localStorage
- **Persistent History**: Conversations survive page refreshes
- **Auto-Title Generation**: First message becomes conversation title
- **Quick Switching**: Jump between saved conversations instantly
- **Delete Protection**: Custom confirmation dialogs prevent accidental deletions

### 🔍 Advanced RAG Capabilities
- **Semantic Search**: Vector similarity search using Gemini embeddings
- **Multi-Document QA**: Ask questions across multiple PDFs
- **Document Comparison**: Smart detection of comparison queries
  - "What are the differences between these documents?"
  - "Which document discusses X in more detail?"
  - "Do both documents mention Y?"
- **Source Attribution**: See which document and page each answer came from
- **Relevance Scoring**: Dynamic source selection based on similarity threshold

### 🎨 Modern UX
- **Sticky Header**: Navigation always accessible at top
- **Sticky Input**: Chat input always visible at bottom
- **Independent Scrolling**: Separate scroll areas for conversations and files
- **Markdown Rendering**: Rich text formatting in AI responses
- **Copy to Clipboard**: One-click copy for AI responses
- **Dark Theme**: Beautiful dark UI with glassmorphism effects
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AnswerAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

## 📖 Usage

### Basic Chat
1. **Upload PDFs**: Click the upload area or drag & drop PDF files
2. **Activate Files**: Ensure files are active (eye icon should be visible)
3. **Ask Questions**: Type your question and press Enter
4. **View Sources**: Click on source references to see which pages were used

### Multi-Document Comparison
1. **Upload 2+ PDFs** and activate them
2. **Ask comparison questions**:
   - "Compare these two documents"
   - "What are the main differences?"
   - "Which document has more information about X?"
3. **Get comparative analysis** with explicit document attribution

### Conversation Management
- **New Chat**: Click "New Chat" button to start fresh
- **Switch Chats**: Click any conversation in the sidebar to load it
- **Delete Chat**: Hover over conversation and click trash icon (with confirmation)

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS |
| **PDF Processing** | PDF.js (Mozilla) |
| **AI/LLM** | Google Gemini 2.5 Flash |
| **Embeddings** | Gemini text-embedding-004 |
| **RAG Pipeline** | Custom vector similarity search |
| **State Management** | React Hooks + localStorage |
| **Icons** | Lucide React |
| **Markdown** | React Markdown + remark-gfm |

## 📁 Project Structure

```
AnswerAI/
├── src/
│   ├── components/
│   │   ├── Layout.jsx              # App layout container
│   │   ├── Header.jsx              # Sticky header with controls
│   │   ├── FileUpload.jsx          # PDF upload interface
│   │   ├── FileList.jsx            # File management list
│   │   ├── ChatInterface.jsx       # Message display area
│   │   ├── ChatInput.jsx           # Chat input with auto-resize
│   │   ├── ConversationList.jsx    # Saved conversations sidebar
│   │   ├── ConfirmDialog.jsx       # Custom confirmation modal
│   │   ├── CopyButton.jsx          # Copy-to-clipboard button
│   │   └── SourceReferences.jsx    # Source citation display
│   ├── services/
│   │   ├── pdfService.js           # PDF text extraction
│   │   ├── geminiService.js        # Gemini API integration
│   │   ├── ragService.js           # RAG pipeline & vector search
│   │   ├── conversationStorage.js  # Conversation persistence
│   │   └── fileStorage.js          # File persistence
│   ├── App.jsx                     # Main application
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── .env.example                    # Environment template
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🔧 Configuration

### RAG Parameters

**Chunk Size** (default: 1000 characters, 200 overlap)
```javascript
// src/services/ragService.js
splitTextIntoChunks(text, chunkSize = 1000, overlap = 200)
```

**Similarity Threshold** (default: 0.4)
```javascript
// src/services/ragService.js
retrieveContext(query, activeFileIds, minSimilarity = 0.4)
```

**File Size Limit** (default: 10MB)
```javascript
// src/services/pdfService.js
const maxSize = 10 * 1024 * 1024
```

### Storage Limits

- **localStorage** is used for both conversations and files
- Typical limit: ~5-10MB per domain
- For very large PDFs, consider upgrading to IndexedDB

## 🧪 Testing

The app has been tested with:
- ✅ Single and multiple PDF uploads
- ✅ Conversation persistence across refreshes
- ✅ File persistence across refreshes
- ✅ Multi-document comparison queries
- ✅ Sticky UI elements during scrolling
- ✅ Delete confirmations for conversations and files

## 🐛 Troubleshooting

### "API key not configured" error
- Verify `.env` file exists in project root
- Check `VITE_` prefix is included
- Restart dev server after adding key

### PDF upload fails
- Ensure file is valid PDF (not scanned image)
- Check file size is under 10MB
- Try different PDF file

### Slow response times
- Check internet connection
- Gemini API may have rate limits
- Reduce number of active files

### Files/conversations lost
- Check browser's localStorage is enabled
- Verify you're using the same browser
- Check browser console for quota errors

## 📝 Development Phases

- ✅ **Phase 1**: Basic RAG pipeline
- ✅ **Phase 2**: PDF processing & vector search
- ✅ **Phase 3**: UX improvements (Markdown, copy button, source refs)
- ✅ **Phase 4**: Advanced features (Current)
  - Conversation memory
  - File persistence
  - Layout improvements (sticky header/input)
  - Multi-document comparison

## 🎯 Roadmap

- [ ] Document preview with PDF.js viewer
- [ ] Advanced search within conversations
- [ ] Light/dark theme toggle
- [ ] Export conversations to markdown
- [ ] Multi-language support

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! This is an educational project showcasing modern RAG implementation.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language models
- Mozilla PDF.js for PDF processing
- React and Vite communities
- Tailwind CSS for rapid UI development

---

**Built with ❤️ using React, Gemini AI, and modern web technologies**

*For questions or support, please open an issue on GitHub*
