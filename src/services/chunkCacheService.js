/**
 * Chunk Cache Service
 * Caches processed document chunks with embeddings to avoid re-processing
 */

const CACHE_KEY_PREFIX = 'chunk-cache-'
const CACHE_VERSION = 1
const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Generate cache key based on file ID and chunk settings
 * @param {string} fileId - File identifier
 * @param {number} chunkSize - Chunk size setting
 * @param {number} chunkOverlap - Chunk overlap setting
 * @returns {string} - Cache key
 */
function getCacheKey(fileId, chunkSize, chunkOverlap) {
    return `${CACHE_KEY_PREFIX}${fileId}_v${CACHE_VERSION}_${chunkSize}_${chunkOverlap}`
}

/**
 * Get cached chunks for a file
 * @param {string} fileId - File identifier
 * @param {number} chunkSize - Chunk size setting (default: 1000)
 * @param {number} chunkOverlap - Chunk overlap setting (default: 200)
 * @returns {Array|null} - Cached chunks or null if not found/expired
 */
export function getCachedChunks(fileId, chunkSize = 1000, chunkOverlap = 200) {
    try {
        const cacheKey = getCacheKey(fileId, chunkSize, chunkOverlap)
        const cached = localStorage.getItem(cacheKey)

        if (!cached) {
            return null
        }

        const { chunks, timestamp, version } = JSON.parse(cached)

        // Check version
        if (version !== CACHE_VERSION) {
            console.log(`[Cache] Version mismatch for ${fileId}, invalidating`)
            localStorage.removeItem(cacheKey)
            return null
        }

        // Check age
        const age = Date.now() - timestamp
        if (age > MAX_CACHE_AGE_MS) {
            console.log(`[Cache] Expired cache for ${fileId} (${Math.round(age / (24 * 60 * 60 * 1000))} days old)`)
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

/**
 * Save chunks to cache
 * @param {string} fileId - File identifier
 * @param {Array} chunks - Processed chunks with embeddings
 * @param {number} chunkSize - Chunk size setting (default: 1000)
 * @param {number} chunkOverlap - Chunk overlap setting (default: 200)
 */
export function setCachedChunks(fileId, chunks, chunkSize = 1000, chunkOverlap = 200) {
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
        // If localStorage is full, try to clear old cache
        if (error.name === 'QuotaExceededError') {
            console.log('[Cache] Storage full, clearing old cache...')
            clearOldCache(MAX_CACHE_AGE_MS / 2) // Clear cache older than 3.5 days
            // Try again
            try {
                const cacheKey = getCacheKey(fileId, chunkSize, chunkOverlap)
                const cacheData = {
                    chunks,
                    timestamp: Date.now(),
                    version: CACHE_VERSION
                }
                localStorage.setItem(cacheKey, JSON.stringify(cacheData))
                console.log(`[Cache] Saved ${chunks.length} chunks for ${fileId} after cleanup`)
            } catch (retryError) {
                console.error('[Cache] Failed to save cache after cleanup:', retryError)
            }
        }
    }
}

/**
 * Invalidate cache for a specific file
 * @param {string} fileId - File identifier
 */
export function invalidateCache(fileId) {
    try {
        // Remove all cache entries for this file (all chunk size variations)
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

/**
 * Clear cache older than specified age
 * @param {number} maxAgeMs - Maximum age in milliseconds
 */
export function clearOldCache(maxAgeMs = MAX_CACHE_AGE_MS) {
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
                    // Invalid cache entry, remove it
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

/**
 * Get cache statistics
 * @returns {Object} - Cache stats
 */
export function getCacheStats() {
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
