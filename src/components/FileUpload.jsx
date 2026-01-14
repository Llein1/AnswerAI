import { Upload, FileUp } from 'lucide-react'
import { useState } from 'react'

export default function FileUpload({ onFileUpload }) {
    const [isDragging, setIsDragging] = useState(false)
    const [uploading, setUploading] = useState(false)

    const validateFile = (file) => {
        const maxSize = 10 * 1024 * 1024 // 10MB

        if (file.type !== 'application/pdf') {
            throw new Error('Only PDF files are supported')
        }

        if (file.size > maxSize) {
            throw new Error('File size must be less than 10MB')
        }

        return true
    }

    const handleFile = async (file) => {
        try {
            setUploading(true)
            validateFile(file)
            await onFileUpload(file)
        } catch (error) {
            alert(error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleFileInput = (e) => {
        const file = e.target.files[0]
        if (file) handleFile(file)
    }

    return (
        <div className="p-4 border-b border-slate-700">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
          ${isDragging
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                    }
        `}
            >
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                />

                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                        {uploading ? (
                            <>
                                <FileUp className="w-8 h-8 text-primary-400 animate-pulse" />
                                <p className="text-sm text-gray-300">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <Upload className={`w-8 h-8 ${isDragging ? 'text-primary-400' : 'text-gray-400'}`} />
                                <p className="text-sm text-gray-300">
                                    <span className="text-primary-400 font-medium">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PDF files only (max 10MB)</p>
                            </>
                        )}
                    </div>
                </label>
            </div>
        </div>
    )
}
