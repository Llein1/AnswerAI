import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

// Initialize with API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
    console.error('VITE_GEMINI_API_KEY is not set in environment variables')
}

// Initialize LangChain's Google GenAI client
let chatModel = null

if (API_KEY) {
    try {
        chatModel = new ChatGoogleGenerativeAI({
            apiKey: API_KEY,
            modelName: 'gemini-2.5-flash', // Updated to latest Gemini 2.5 Flash
            temperature: 0.7,
            maxOutputTokens: 2048,
        })
        console.log('✅ ChatGoogleGenerativeAI initialized with gemini-2.5-flash')
    } catch (error) {
        console.error('Failed to initialize ChatGoogleGenerativeAI:', error)
    }
}

/**
 * Generate embeddings for text using Gemini
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
export async function createEmbedding(text) {
    if (!API_KEY) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env file')
    }

    try {
        // Use LangChain's embeddings model
        const { GoogleGenerativeAIEmbeddings } = await import('@langchain/google-genai')

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: API_KEY,
            modelName: 'text-embedding-004', // Latest embedding model
        })

        const embedding = await embeddings.embedQuery(text)
        return embedding
    } catch (error) {
        console.error('Embedding error:', error)
        throw new Error(`Failed to create embedding: ${error.message}`)
    }
}

/**
 * Generate a response using LangChain's Google GenAI
 * @param {string} prompt - The prompt to send
 * @param {string} context - Context from retrieved documents
 * @param {Object} documentMetadata - Metadata about active documents
 * @returns {Promise<string>} - Generated response
 */
export async function generateResponse(prompt, context, documentMetadata = {}) {
    if (!chatModel) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env file')
    }

    try {
        const fullPrompt = buildRAGPrompt(context, prompt, documentMetadata)

        console.log('🤖 Calling LangChain ChatGoogleGenerativeAI...')

        // Use LangChain's invoke method
        const response = await chatModel.invoke(fullPrompt)

        console.log('✅ Response received from Gemini')

        // Extract text from LangChain response
        return response.content
    } catch (error) {
        console.error('Generation error:', error)

        if (error.message?.includes('API key') || error.message?.includes('401')) {
            throw new Error('Invalid API key. Please check your VITE_GEMINI_API_KEY')
        }

        if (error.message?.includes('quota') || error.message?.includes('429')) {
            throw new Error('API quota exceeded. Please try again later')
        }

        if (error.message?.includes('404')) {
            throw new Error('Model not found. Please verify your API key has access to Gemini models at https://aistudio.google.com/apikey')
        }

        throw new Error(`Failed to generate response: ${error.message}`)
    }
}

/**
 * Build a RAG-optimized prompt
 * @param {string} context - Retrieved context
 * @param {string} question - User question
 * @param {Object} documentMetadata - Metadata about documents
 * @returns {string} - Formatted prompt
 */
function buildRAGPrompt(context, question, documentMetadata = {}) {
    const { activeFileCount = 1, fileNames = [] } = documentMetadata

    // Detect comparison queries
    const comparisonKeywords = /compare|difference|contrast|versus|vs\.|which.*better|which.*more|both.*mention|similarities|distinctions/i
    const isComparisonQuery = comparisonKeywords.test(question)

    let basePrompt = `You are a helpful AI assistant that answers questions based on the provided document context.`

    // Add comparison-specific instructions for multi-document queries
    if (isComparisonQuery && activeFileCount > 1) {
        basePrompt += `\n\n🔍 COMPARISON MODE ACTIVE:
The user is asking to compare/contrast multiple documents: ${fileNames.join(', ')}.

When answering comparison questions:
- Explicitly state which information comes from which document
- Highlight similarities AND differences
- Use document names when referencing sources
- Provide a comparative analysis, not just separate summaries
- If one document has more detail on a topic, say so explicitly`
    }

    return `${basePrompt}

CONTEXT FROM DOCUMENTS:
${context}

USER QUESTION:
${question}

INSTRUCTIONS:
- Answer the question based ONLY on the information provided in the context above
- If the answer cannot be found in the context, say "I cannot find this information in the provided documents"
- Be concise but comprehensive
- Use specific quotes or references when possible
- If the question is unclear, ask for clarification

ANSWER:`
}
