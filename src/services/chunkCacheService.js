/**
 * Chunk Cache Service
 * Caches processed document chunks with embeddings to avoid re-processing
 * Migrated to IndexedDB for better capacity and performance
 */

import {
    saveChunksToIndexedDB,
    loadChunksFromIndexedDB,
    deleteChunksFromIndexedDB,
    isIndexedDBAvailable
} from './indexedDBService'

const USE_INDEXEDDB = isIndexedDBAvailable()

if (!USE_INDEXEDDB) {
    console.warn('⚠️ IndexedDB not available for chunk caching, falling back to localStorage')
}

// ===== localStorage FALLBACK =====

const CACHE_KEY_PREFIX = 'chunk-cache-'
const CACHE_VERSION = 1
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getCacheKey(fileId, chunkSize, chunkOverlap) {
    return `${CACHE_KEY_PREFIX}${fileId}_v${CACHE_VERSION}_${chunkSize}_${chunkOverlap}`
}

function getCachedChunksFromLocalStorage(fileId, chunkSize, chunkOverlap) {
    try {
        const cacheKey = getCacheKey(fileId, chunkSize, chunkOverlap)
        const cached = localStorage.getItem(cacheKey)

        if (!cached) {
            return null
        }

        const { chunks, timestamp, version } = JSON.parse(cached)

        if (version !== CACHE_VERSION) {
            localStorage.removeItem(cacheKey)
            return null
        }

        const age = Date.now() - timestamp
        if (age > MAX_CACHE_AGE_MS) {
            localStorage.removeItem(cacheKey)
            return null
        }

        console.log(`[Cache] HIT for ${fileId} (${chunks.length} chunks)`)
        return chunks
    } catch (error) {
        console.error('[Cache] Error reading cache:', error)
        return null
    }
}

function setCachedChunksToLocalStorage(fileId, chunks, chunkSize, chunkOverlap) {
    try {
        const cacheKey = getCacheKey(fileId, chunkSize, chunkOverlap)
        const cacheData = {
            chunks,
            timestamp: Date.now(),
            version: CACHE_VERSION
        }

        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        console.log(`[Cache] Saved ${chunks.length} chunks for ${fileId}`)
    } catch (error) {
        console.error('[Cache] Error saving cache:', error)
    }
}

// ===== PUBLIC API (Auto-selects IndexedDB or localStorage) =====

/**
 * Get cached chunks for a file
 * @param {string} fileId - File identifier
 * @param {number} chunkSize - Chunk size setting
 * @param {number} chunkOverlap - Chunk overlap setting
 * @returns {Promise<Array|null>} - Cached chunks or null if not found
 */
export async function getCachedChunks(fileId, chunkSize = 1000, chunkOverlap = 200) {
    if (USE_INDEXEDDB) {
        return await loadChunksFromIndexedDB(fileId, chunkSize, chunkOverlap)
    } else {
        return getCachedChunksFromLocalStorage(fileId, chunkSize, chunkOverlap)
    }
}

/**
 * Save chunks to cache
 * @param {string} fileId - File identifier
 * @param {Array} chunks - Processed chunks with embeddings
 * @param {number} chunkSize - Chunk size setting
 * @param {number} chunkOverlap - Chunk overlap setting
 * @returns {Promise<void>}
 */
export async function setCachedChunks(fileId, chunks, chunkSize = 1000, chunkOverlap = 200) {
    if (USE_INDEXEDDB) {
        await saveChunksToIndexedDB(fileId, chunks, { chunkSize, overlap: chunkOverlap })
    } else {
        setCachedChunksToLocalStorage(fileId, chunks, chunkSize, chunkOverlap)
    }
}

/**
 * Invalidate cache for a specific file
 * @param {string} fileId - File identifier
 * @returns {Promise<void>}
 */
export async function invalidateCache(fileId) {
    if (USE_INDEXEDDB) {
        await deleteChunksFromIndexedDB(fileId)
    } else {
        try {
            const keysToRemove = []
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith(`${CACHE_KEY_PREFIX}${fileId}_`)) {
                    keysToRemove.push(key)
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key))
            console.log(`[Cache] Invalidated ${keysToRemove.length} cache entries for ${fileId}`)
        } catch (error) {
            console.error('[Cache] Error invalidating cache:', error)
        }
    }
}

/**
 * Clear old cache entries
 * @param {number} maxAgeMs - Maximum age in milliseconds
 * @returns {Promise<number>} - Number of entries cleared
 */
export async function clearOldCache(maxAgeMs = MAX_CACHE_AGE_MS) {
    if (USE_INDEXEDDB) {
        // IndexedDB doesn't need age-based cleanup (we use file-based storage)
        console.log('[Cache] IndexedDB cache cleanup not needed (file-based)')
        return 0
    } else {
        try {
            const keysToRemove = []
            const now = Date.now()

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                    try {
                        const cached = localStorage.getItem(key)
                        if (cached) {
                            const { timestamp } = JSON.parse(cached)
                            const age = now - timestamp
                            if (age > maxAgeMs) {
                                keysToRemove.push(key)
                            }
                        }
                    } catch (parseError) {
                        keysToRemove.push(key)
                    }
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key))
            console.log(`[Cache] Cleared ${keysToRemove.length} old cache entries`)
            return keysToRemove.length
        } catch (error) {
            console.error('[Cache] Error clearing old cache:', error)
            return 0
        }
    }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} - Cache stats
 */
export async function getCacheStats() {
    if (USE_INDEXEDDB) {
        // For IndexedDB, return database stats
        return {
            storage: 'IndexedDB',
            message: 'Using IndexedDB for chunk storage'
        }
    } else {
        try {
            let totalEntries = 0
            let totalSize = 0
            const entries = []

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                    totalEntries++
                    const value = localStorage.getItem(key)
                    if (value) {
                        totalSize += value.length
                        try {
                            const { chunks, timestamp } = JSON.parse(value)
                            entries.push({
                                key,
                                chunkCount: chunks.length,
                                age: Date.now() - timestamp,
                                size: value.length
                            })
                        } catch (e) {
                            // Skip invalid entries
                        }
                    }
                }
            }

            return {
                storage: 'localStorage',
                totalEntries,
                totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                entries
            }
        } catch (error) {
            console.error('[Cache] Error getting stats:', error)
            return { totalEntries: 0, totalSize: 0, totalSizeMB: 0, entries: [] }
        }
    }
}
