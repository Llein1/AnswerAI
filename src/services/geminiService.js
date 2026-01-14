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
        throw new Error('Gemini API anahtarı yapılandırılmamış. Lütfen .env dosyasında VITE_GEMINI_API_KEY ayarını kontrol edin')
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
        throw new Error('Gemini API anahtarı yapılandırılmamış. Lütfen .env dosyasında VITE_GEMINI_API_KEY ayarını kontrol edin')
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
            throw new Error('Geçersiz API anahtarı. Lütfen VITE_GEMINI_API_KEY değerini kontrol edin')
        }

        if (error.message?.includes('quota') || error.message?.includes('429')) {
            throw new Error('API kotası aşıldı. Lütfen daha sonra tekrar deneyin')
        }

        if (error.message?.includes('404')) {
            throw new Error('Model bulunamadı. Lütfen API anahtarınızın Gemini modellerine erişimi olduğunu doğrulayın (https://aistudio.google.com/apikey)')
        }

        throw new Error(`Cevap oluşturulamadı: ${error.message}`)
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

    let basePrompt = `Sen, sağlanan belge bağlamına dayalı olarak soruları cevaplayan yardımcı bir yapay zeka asistanısın.`

    // Add comparison-specific instructions for multi-document queries
    if (isComparisonQuery && activeFileCount > 1) {
        basePrompt += `\n\n🔍 KARŞILAŞTIRMA MODU AKTİF:
Kullanıcı birden fazla belgeyi karşılaştırmak/zıtlaştırmak istiyor: ${fileNames.join(', ')}.

Karşılaştırma sorularını cevaplarken:
- Hangi bilginin hangi belgeden geldiğini açıkça belirt
- Benzerlikleri VE farklılıkları vurgula
- Kaynaklara atıfta bulunurken belge adlarını kullan
- Sadece ayrı özetler değil, karşılaştırmalı bir analiz sun
- Bir belge bir konuda daha fazla detaya sahipse, bunu açıkça belirt`
    }

    return `${basePrompt}

BELGELERDEN BAĞLAM:
${context}

KULLANICI SORUSU:
${question}

TALİMATLAR:
- Soruyu YALNIZCA yukarıdaki bağlamda sağlanan bilgilere dayanarak cevapla
- Cevap bağlamda bulunamazsa, "Bu bilgi sağlanan belgelerde bulunamadı" de
- Açık ve kapsamlı ol
- Mümkün olduğunda belirli alıntılar veya referanslar kullan
- Soru net değilse, açıklama iste
- Cevabı Türkçe olarak ver

CEVAP:`
}
