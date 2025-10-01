"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Paperclip, Upload, ImageIcon, Music, Video } from "lucide-react"
import { fileService } from "@/lib/database"

interface FileUploadProps {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (file: { name: string; url: string; size: number; type: string }) => void
  currentUserId: string
}

export function FileUpload({ isOpen, onClose, onFileSelect, currentUserId }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    // Проверяем размер файла (максимум 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("Файл слишком большой. Максимальный размер: 50MB")
      return
    }

    setIsUploading(true)

    try {
      const fileUrl = await fileService.uploadFile(file, currentUserId)

      onFileSelect({
        name: file.name,
        url: fileUrl,
        size: file.size,
        type: file.type,
      })

      onClose()
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Ошибка загрузки файла")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-8 w-8" />
    if (type.startsWith("video/")) return <Video className="h-8 w-8" />
    if (type.startsWith("audio/")) return <Music className="h-8 w-8" />
    return <ImageIcon className="h-8 w-8" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Отправить файл
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Выберите файл для отправки (до 50MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-purple-500 bg-purple-500/10" : "border-white/20 hover:border-white/40"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl">📁</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Перетащите файл сюда</h3>
                <p className="text-white/70 text-sm mb-4">или нажмите кнопку ниже</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Загрузка...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Выбрать файл
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="text-xs text-white/50 text-center">
            Поддерживаются все типы файлов. Максимальный размер: 50MB
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept="*/*"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
