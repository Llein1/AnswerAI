import { createEmbedding, generateResponse } from './geminiService'
import { getCachedChunks, setCachedChunks } from './chunkCacheService'

// In-memory vector store
let documentChunks = []

/**
 * Split text into chunks for processing
 * @param {string} text - Text to split
 * @param {number} chunkSize - Size of each chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {string[]} - Array of text chunks
 */
function splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
    const chunks = []
    let startIndex = 0

    while (startIndex < text.length) {
        const endIndex = Math.min(startIndex + chunkSize, text.length)
        const chunk = text.slice(startIndex, endIndex)

        if (chunk.trim().length > 0) {
            chunks.push(chunk.trim())
        }

        startIndex += chunkSize - overlap
    }

    return chunks
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i]
        normA += vecA[i] * vecA[i]
        normB += vecB[i] * vecB[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Process a document and add to vector store
 * @param {string} text - Document text
 * @param {string} fileId - File identifier
 * @param {string} fileName - File name
 * @param {Array} pages - Array of page objects with pageNumber and text
 */
export async function processDocument(text, fileId, fileName, pages = []) {
    try {
        // Check cache first
        const cachedChunks = getCachedChunks(fileId, 1000, 200)
        if (cachedChunks && cachedChunks.length > 0) {
            console.log(`✅ Using cached chunks for ${fileName} (${cachedChunks.length} chunks)`)
            // Replace existing chunks from this file
            documentChunks = documentChunks.filter(chunk => chunk.fileId !== fileId)
            documentChunks.push(...cachedChunks)
            return cachedChunks.length
        }

        // Split into chunks
        const chunks = splitTextIntoChunks(text)

        console.log(`📄 Processing ${chunks.length} chunks from ${fileName}`)

        // Helper function to find which page(s) a chunk belongs to
        const findChunkPages = (chunkText) => {
            if (!pages || pages.length === 0) return null

            const pageNumbers = []
            for (const page of pages) {
                if (text.includes(page.text) && chunkText.includes(page.text.substring(0, 50))) {
                    pageNumbers.push(page.pageNumber)
                }
            }

            // If we can't determine exact pages, estimate based on position
            if (pageNumbers.length === 0) {
                const chunkPosition = text.indexOf(chunkText)
                if (chunkPosition !== -1) {
                    let currentPos = 0
                    for (const page of pages) {
                        const pageLength = page.text.length
                        if (chunkPosition >= currentPos && chunkPosition < currentPos + pageLength) {
                            return [page.pageNumber]
                        }
                        currentPos += pageLength + 2 // +2 for \n\n separator
                    }
                }
            }

            return pageNumbers.length > 0 ? pageNumbers : null
        }

        // Create embeddings for each chunk
        const processedChunks = []

        for (let i = 0; i < chunks.length; i++) {
            try {
                console.log(`⚙️ Creating embedding for chunk ${i + 1}/${chunks.length}`)
                const embedding = await createEmbedding(chunks[i])

                const pageNumbers = findChunkPages(chunks[i])

                processedChunks.push({
                    id: `${fileId}_chunk_${i}`,
                    fileId,
                    fileName,
                    text: chunks[i],
                    embedding,
                    chunkIndex: i,
                    pageNumbers: pageNumbers  // Array of page numbers this chunk appears in
                })

                // Small delay to avoid rate limiting
                if (i < chunks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                }
            } catch (error) {
                console.error(`Failed to process chunk ${i}:`, error)
            }
        }

        // Add to vector store (replace existing chunks from this file)
        documentChunks = documentChunks.filter(chunk => chunk.fileId !== fileId)
        documentChunks.push(...processedChunks)

        // Cache the processed chunks
        setCachedChunks(fileId, processedChunks, 1000, 200)

        console.log(`✅ Processed ${processedChunks.length} chunks with embeddings`)

        return processedChunks.length
    } catch (error) {
        console.error('Document processing error:', error)
        throw new Error(`Failed to process document: ${error.message}`)
    }
}

/**
 * Retrieve relevant context for a query using semantic similarity
 * @param {string} query - User query
 * @param {string[]} activeFileIds - IDs of active files
 * @param {number} topK - Number of chunks to retrieve
 * @returns {Promise<Object>} - Retrieved context and sources
 */
export async function retrieveContext(query, activeFileIds, minSimilarity = 0.4) {
    try {
        // Filter chunks from active files only
        const activeChunks = documentChunks.filter(chunk =>
            activeFileIds.includes(chunk.fileId)
        )

        if (activeChunks.length === 0) {
            throw new Error('No processed chunks available from active files')
        }

        console.log(`🔍 Searching ${activeChunks.length} chunks for: "${query}"`)

        // Create embedding for query
        const queryEmbedding = await createEmbedding(query)

        // Calculate semantic similarity for each chunk
        const scoredChunks = activeChunks.map(chunk => ({
            ...chunk,
            similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
        }))

        // Sort by similarity
        const sortedChunks = scoredChunks.sort((a, b) => b.similarity - a.similarity)

        // Smart selection: Take sources above threshold, min 1, max 5
        let relevantChunks = sortedChunks.filter(c => c.similarity >= minSimilarity)

        // If nothing meets threshold, take the best one
        if (relevantChunks.length === 0) {
            relevantChunks = [sortedChunks[0]]
        }

        // Limit to max 5 to avoid overwhelming context
        const topChunks = relevantChunks.slice(0, 5)

        console.log(`📊 Selected ${topChunks.length} relevant chunks (threshold: ${minSimilarity})`)
        console.log('📊 Similarity scores:', topChunks.map(c => c.similarity.toFixed(3)))

        // Group chunks by document for better organization
        const chunksByDocument = {}
        topChunks.forEach(chunk => {
            if (!chunksByDocument[chunk.fileName]) {
                chunksByDocument[chunk.fileName] = []
            }
            chunksByDocument[chunk.fileName].push(chunk)
        })

        // Build context with document grouping
        const contextParts = []
        Object.entries(chunksByDocument).forEach(([fileName, chunks]) => {
            contextParts.push(`\n=== DOCUMENT: ${fileName} ===`)
            chunks.forEach((chunk, i) => {
                const pages = chunk.pageNumbers && chunk.pageNumbers.length > 0
                    ? ` (Pages: ${chunk.pageNumbers.join(', ')})`
                    : ''
                contextParts.push(`[Excerpt ${i + 1}${pages}]`)
                contextParts.push(chunk.text)
                contextParts.push('') // blank line between excerpts
            })
        })

        const context = contextParts.join('\n')

        return {
            context,
            sources: topChunks.map(chunk => ({
                fileName: chunk.fileName,
                similarity: chunk.similarity,
                chunkIndex: chunk.chunkIndex,
                pageNumbers: chunk.pageNumbers  // Add page numbers to sources
            }))
        }
    } catch (error) {
        console.error('Context retrieval error:', error)
        throw new Error(`Failed to retrieve context: ${error.message}`)
    }
}

/**
 * Complete RAG pipeline: retrieve context and generate response
 * @param {string} question - User question
 * @param {Array} activeFiles - Array of active file objects
 * @returns {Promise<string>} - Generated answer
 */
export async function generateRAGResponse(question, activeFiles) {
    try {
        console.log(`💬 Generating RAG response for: "${question}"`)
        console.log(`📁 Active files: ${activeFiles.map(f => f.name).join(', ')}`)

        // Process any files that haven't been processed yet
        for (const file of activeFiles) {
            const existingChunks = documentChunks.filter(chunk => chunk.fileId === file.id)

            // Check if file needs (re)processing
            const needsProcessing = existingChunks.length === 0 ||
                !existingChunks[0].embedding // Old chunks without embeddings

            if (needsProcessing) {
                if (existingChunks.length > 0) {
                    console.log(`🔄 Re-processing ${file.name} to add embeddings...`)
                } else {
                    console.log(`📄 Processing file: ${file.name}`)
                }
                await processDocument(file.text, file.id, file.name, file.pages)
            } else {
                console.log(`✓ File already processed: ${file.name} (${existingChunks.length} chunks with embeddings)`)
            }
        }

        // Get active file IDs
        const activeFileIds = activeFiles.map(f => f.id)

        // Retrieve relevant context using semantic embedding search
        const { context, sources } = await retrieveContext(question, activeFileIds)

        console.log(`✅ Retrieved ${sources.length} relevant chunks`)

        // Prepare document metadata for comparison-aware prompting
        const documentMetadata = {
            activeFileCount: activeFiles.length,
            fileNames: activeFiles.map(f => f.name),
            totalChunks: sources.length
        }

        // Generate response using Gemini with document metadata
        console.log('🤖 Generating AI response...')
        const response = await generateResponse(question, context, documentMetadata)

        console.log('✅ Response generated successfully')

        return {
            response,
            sources
        }
    } catch (error) {
        console.error('RAG pipeline error:', error)
        throw new Error(`Failed to generate answer: ${error.message}`)
    }
}

/**
 * Clear all processed documents (useful for cleanup)
 */
export function clearVectorStore() {
    documentChunks = []
    console.log('🗑️ Document store cleared')
}
