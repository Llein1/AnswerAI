/**
 * File Storage Service
 * Manages persistence of uploaded PDF files in localStorage
 */

const FILES_STORAGE_KEY = 'answerai_files'

/**
 * Convert ArrayBuffer to Base64 string
 * @param {ArrayBuffer} buffer - ArrayBuffer to convert
 * @returns {string} Base64 string
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

/**
 * Convert Base64 string to ArrayBuffer
 * @param {string} base64 - Base64 string
 * @returns {ArrayBuffer} ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
}

/**
 * Load all files from localStorage
 * @returns {Array} Array of file objects
 */
export function loadFiles() {
    try {
        const filesJson = localStorage.getItem(FILES_STORAGE_KEY)
        if (!filesJson) return []

        const files = JSON.parse(filesJson)

        // Convert base64 data back to ArrayBuffer for each file
        const filesWithArrayBuffer = files.map(file => {
            if (file.dataBase64) {
                return {
                    ...file,
                    data: base64ToArrayBuffer(file.dataBase64)
                }
            }
            return file
        })

        return Array.isArray(filesWithArrayBuffer) ? filesWithArrayBuffer : []
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

        // Convert ArrayBuffer to base64 for storage
        const fileToSave = { ...fileData }
        if (fileData.data instanceof ArrayBuffer) {
            fileToSave.dataBase64 = arrayBufferToBase64(fileData.data)
            delete fileToSave.data // Remove ArrayBuffer from object before saving
        }

        // Check if file already exists (by ID)
        const existingIndex = files.findIndex(f => f.id === fileData.id)

        if (existingIndex >= 0) {
            // Update existing file
            const updatedFile = { ...files[existingIndex], ...fileToSave }
            // Keep base64 data from fileToSave if present
            files[existingIndex] = updatedFile
        } else {
            // Add new file
            files.push(fileToSave)
        }

        // Create storage object without ArrayBuffer
        const filesToStore = files.map(f => {
            const { data, ...rest } = f
            return rest
        })

        localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(filesToStore))
        console.log(`File saved: ${fileData.name} (${fileData.id})`)
        return true
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded! Consider clearing old files.')
            alert('Depolama limiti doldu. Yeni dosya yüklemek için bazı dosyaları silin.')
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
