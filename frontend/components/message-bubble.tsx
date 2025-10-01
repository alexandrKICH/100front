"use client"

import { useState, useRef } from "react"
import { Play, Pause, Download, Eye, Volume2, AlertCircle } from "lucide-react"

interface MessageBubbleProps {
  message: {
    id: string
    text?: string
    audio?: string
    video?: string
    image?: string
    file?: { name: string; url: string; size: number; type: string }
    timestamp: Date
    isOwn: boolean
    sender: string
    senderAvatar?: string
    senderLogin?: string
  }
  showAvatar?: boolean
}

export function MessageBubble({ message, showAvatar = true }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const isValidMediaUrl = (url: string) => {
    if (!url) return false
    // Проверяем, что это валидный URL
    try {
      new URL(url)
      return true
    } catch {
      // Проверяем base64 или blob
      return url.startsWith("data:") || url.startsWith("blob:")
    }
  }

  const handleAudioPlay = async () => {
    if (!audioRef.current) return

    try {
      // Если аудио еще не загружено, пытаемся загрузить
      if (!audioLoaded && message.audio) {
        if (!isValidMediaUrl(message.audio)) {
          console.error("❌ Invalid audio URL:", message.audio)
          setAudioError(true)
          return
        }
        audioRef.current.src = message.audio

        // Добавляем обработчики событий
        audioRef.current.onloadedmetadata = () => {
          setDuration(audioRef.current?.duration || 0)
          setAudioLoaded(true)
          setAudioError(false)
        }

        audioRef.current.ontimeupdate = () => {
          setCurrentTime(audioRef.current?.currentTime || 0)
        }

        audioRef.current.onended = () => {
          setIsPlaying(false)
        }

        audioRef.current.onerror = () => {
          console.error("❌ Audio playback failed")
          setAudioError(true)
          setIsPlaying(false)
        }

        // Загружаем метаданные
        audioRef.current.load()
      }

      // Воспроизводим или ставим на паузу
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.warn("Audio playback error:", error)
      setAudioError(true)
      setIsPlaying(false)
    }
  }

  const handleVideoPlay = async () => {
    if (!videoRef.current || !message.video) return

    try {
      if (!isValidMediaUrl(message.video)) {
        setVideoError(true)
        return
      }

      if (videoRef.current.paused) {
        await videoRef.current.play()
        setVideoError(false)
      } else {
        videoRef.current.pause()
      }
    } catch (error) {
      console.error("Video playback error:", error)
      setVideoError(true)
    }
  }

  const handleDownload = (url: string, filename: string) => {
    try {
      if (!isValidMediaUrl(url)) {
        console.warn("Invalid URL for download:", url)
        return
      }

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download error:", error)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️"
    if (type.startsWith("video/")) return "🎥"
    if (type.startsWith("audio/")) return "🎵"
    if (type.includes("pdf")) return "📄"
    if (type.includes("word")) return "📝"
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊"
    if (type.includes("zip") || type.includes("rar")) return "📦"
    return "📎"
  }

  const formatTimestamp = (timestamp: Date | string) => {
    try {
      const now = new Date()
      const messageDate = timestamp instanceof Date ? timestamp : new Date(timestamp)

      if (isNaN(messageDate.getTime())) {
        return "00:00"
      }

      const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return messageDate.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        })
      } else if (diffInHours < 48) {
        return `Вчера ${messageDate.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      } else {
        return messageDate.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      }
    } catch (error) {
      console.error("Timestamp formatting error:", error)
      return "00:00"
    }
  }

  return (
    <div className={`flex gap-3 mb-4 animate-slide-in-left ${message.isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {showAvatar && !message.isOwn && (
        <div className="flex-shrink-0">
          <img
            src={message.senderAvatar || "/placeholder.svg?height=32&width=32"}
            alt={message.sender}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=32&width=32"
            }}
          />
        </div>
      )}

      <div className={`max-w-xs lg:max-w-md ${message.isOwn ? "ml-auto" : "mr-auto"}`}>
        {!message.isOwn && showAvatar && (
          <div className="text-xs text-white/60 mb-1 px-1">{message.senderLogin || message.sender}</div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 transition-all-smooth shadow-lg ${
            message.isOwn
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
              : "bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-bl-md border border-white/10"
          }`}
        >
          {/* Текстовое сообщение */}
          {message.text && <div className="break-words">{message.text}</div>}

          {/* Изображение */}
          {message.image && (
            <div className="relative">
              {!imageError && isValidMediaUrl(message.image) ? (
                <>
                  <img
                    src={message.image || "/placeholder.svg"}
                    alt="Изображение"
                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowImageModal(true)}
                    style={{ maxHeight: "300px", objectFit: "cover" }}
                    onError={() => setImageError(true)}
                  />
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-sm">Изображение недоступно</span>
                </div>
              )}
            </div>
          )}

          {/* Голосовое сообщение */}
          {message.audio && (
            <div className="flex items-center gap-3 min-w-[200px]">
              <button
                onClick={handleAudioPlay}
                className="flex-shrink-0 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all-smooth hover:scale-110"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 opacity-60" />
                  <div className="text-sm opacity-80">{audioError ? "Демо аудио" : "Голосовое сообщение"}</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/60 transition-all duration-100"
                      style={{
                        width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <div className="text-xs opacity-60 min-w-[35px]">
                    {duration > 0 ? `${formatTime(currentTime)} / ${formatTime(duration)}` : "0:00"}
                  </div>
                </div>
              </div>

              {/* Аудио элемент без src - загружается только при клике */}
              <audio ref={audioRef} preload="none" />
            </div>
          )}

          {/* Видеосообщение */}
          {message.video && (
            <div className="relative">
              {!videoError && isValidMediaUrl(message.video) ? (
                <>
                  <video
                    ref={videoRef}
                    src={message.video}
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: "300px" }}
                    controls
                    preload="none"
                    onError={() => setVideoError(true)}
                  />
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-sm">Видео недоступно</span>
                </div>
              )}
            </div>
          )}

          {/* Файл */}
          {message.file && (
            <div className="flex items-center gap-3 p-2 bg-white/10 rounded-lg">
              <div className="text-2xl">{getFileIcon(message.file.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{message.file.name}</div>
                <div className="text-sm opacity-60">{formatFileSize(message.file.size)}</div>
              </div>
              {isValidMediaUrl(message.file.url) && (
                <button
                  onClick={() => handleDownload(message.file!.url, message.file!.name)}
                  className="flex-shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className={`text-xs text-white/50 mt-1 px-1 ${message.isOwn ? "text-right" : "text-left"}`}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>

      {/* Модальное окно для просмотра изображения */}
      {showImageModal && message.image && !imageError && isValidMediaUrl(message.image) && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={message.image || "/placeholder.svg"}
              alt="Изображение"
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={() => {
                setImageError(true)
                setShowImageModal(false)
              }}
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              ✕
            </button>
            <button
              onClick={() => handleDownload(message.image!, "image.jpg")}
              className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
