/**
 * File Storage Service
 * Manages persistence of uploaded PDF files in localStorage
 */

const FILES_STORAGE_KEY = 'answerai_files'

/**
 * Load all files from localStorage
 * @returns {Array} Array of file objects
 */
export function loadFiles() {
    try {
        const filesJson = localStorage.getItem(FILES_STORAGE_KEY)
        if (!filesJson) return []

        const files = JSON.parse(filesJson)
        return Array.isArray(files) ? files : []
    } catch (error) {
        console.error('Error loading files from localStorage:', error)
        return []
    }
}

/**
 * Save a file to localStorage
 * @param {Object} fileData - File object with metadata and content
 * @returns {boolean} Success status
 */
export function saveFile(fileData) {
    try {
        const files = loadFiles()

        // Check if file already exists (by ID)
        const existingIndex = files.findIndex(f => f.id === fileData.id)

        if (existingIndex >= 0) {
            // Update existing file
            files[existingIndex] = fileData
        } else {
            // Add new file
            files.push(fileData)
        }

        localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files))
        console.log(`File saved: ${fileData.name} (${fileData.id})`)
        return true
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded! Consider clearing old files.')
            alert('Storage limit reached. Please delete some files to upload new ones.')
        } else {
            console.error('Error saving file to localStorage:', error)
        }
        return false
    }
}

/**
 * Delete a file from localStorage
 * @param {string} fileId - ID of file to delete
 * @returns {boolean} Success status
 */
export function deleteFile(fileId) {
    try {
        const files = loadFiles()
        const filteredFiles = files.filter(f => f.id !== fileId)

        localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(filteredFiles))
        console.log(`File deleted: ${fileId}`)
        return true
    } catch (error) {
        console.error('Error deleting file from localStorage:', error)
        return false
    }
}

/**
 * Update the active state of a file
 * @param {string} fileId - ID of file to update
 * @param {boolean} active - New active state
 * @returns {boolean} Success status
 */
export function updateFileActiveState(fileId, active) {
    try {
        const files = loadFiles()
        const fileIndex = files.findIndex(f => f.id === fileId)

        if (fileIndex >= 0) {
            files[fileIndex].active = active
            localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files))
            console.log(`File ${fileId} active state updated to: ${active}`)
            return true
        }

        return false
    } catch (error) {
        console.error('Error updating file active state:', error)
        return false
    }
}

/**
 * Clear all files from localStorage
 * @returns {boolean} Success status
 */
export function clearAllFiles() {
    try {
        localStorage.removeItem(FILES_STORAGE_KEY)
        console.log('All files cleared from storage')
        return true
    } catch (error) {
        console.error('Error clearing files:', error)
        return false
    }
}

/**
 * Get storage usage info
 * @returns {Object} Storage info with file count and estimated size
 */
export function getStorageInfo() {
    try {
        const files = loadFiles()
        const filesJson = localStorage.getItem(FILES_STORAGE_KEY) || '[]'
        const sizeInBytes = new Blob([filesJson]).size
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2)

        return {
            fileCount: files.length,
            sizeInBytes: sizeInBytes,
            sizeInMB: sizeInMB,
            files: files.map(f => ({
                id: f.id,
                name: f.name,
                size: f.size,
                active: f.active
            }))
        }
    } catch (error) {
        console.error('Error getting storage info:', error)
        return {
            fileCount: 0,
            sizeInBytes: 0,
            sizeInMB: '0.00',
            files: []
        }
    }
}
