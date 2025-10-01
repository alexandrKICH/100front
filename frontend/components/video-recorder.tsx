"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Square, Play, Pause, Trash2, Send, Camera } from "lucide-react"

interface VideoRecorderProps {
  onSave: (videoBlob: Blob) => void
  onCancel: () => void
}

export function VideoRecorder({ onSave, onCancel }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const liveVideoRef = useRef<HTMLVideoElement | null>(null)
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Запускаем камеру при монтировании
    startCamera()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      setStream(mediaStream)

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = mediaStream
        liveVideoRef.current.play().catch(console.error)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setError("Нет доступа к камере или микрофону")
    }
  }

  const startRecording = async () => {
    if (!stream) {
      setError("Камера не доступна")
      return
    }

    try {
      setError(null)

      // Проверяем поддержку разных форматов
      const options = [
        { mimeType: "video/webm;codecs=vp9,opus" },
        { mimeType: "video/webm;codecs=vp8,opus" },
        { mimeType: "video/webm" },
        { mimeType: "video/mp4" },
      ]

      let selectedOptions = { mimeType: "video/webm" }
      for (const option of options) {
        if (MediaRecorder.isTypeSupported(option.mimeType)) {
          selectedOptions = option
          break
        }
      }

      const mediaRecorder = new MediaRecorder(stream, selectedOptions)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedOptions.mimeType })
        setVideoBlob(blob)

        // Создаем URL для воспроизведения
        if (videoUrl) {
          URL.revokeObjectURL(videoUrl)
        }
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        setError("Ошибка записи видео")
        setIsRecording(false)
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setRecordingTime(0)

      // Запускаем таймер
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      setError("Ошибка начала записи")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const playRecording = async () => {
    if (videoUrl && playbackVideoRef.current) {
      try {
        if (isPlaying) {
          playbackVideoRef.current.pause()
          setIsPlaying(false)
        } else {
          playbackVideoRef.current.currentTime = 0
          await playbackVideoRef.current.play()
          setIsPlaying(true)
        }
      } catch (error) {
        console.error("Error playing video:", error)
        setError("Ошибка воспроизведения")
      }
    }
  }

  const deleteRecording = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setVideoBlob(null)
    setVideoUrl(null)
    setRecordingTime(0)
    setIsPlaying(false)
    setError(null)

    // Возвращаемся к режиму камеры
    startCamera()
  }

  const saveRecording = () => {
    if (videoBlob) {
      onSave(videoBlob)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold text-white mb-4 text-center">
          {videoBlob ? "Просмотр записи" : "Видеосообщение"}
        </h3>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          {/* Видео превью */}
          <div className="relative w-full max-w-sm aspect-video bg-black rounded-lg overflow-hidden">
            {!videoBlob ? (
              // Живое видео с камеры
              <video
                ref={liveVideoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                onError={() => setError("Ошибка камеры")}
              />
            ) : (
              // Записанное видео
              <video
                ref={playbackVideoRef}
                src={videoUrl || undefined}
                className="w-full h-full object-cover"
                controls={false}
                playsInline
                onEnded={() => setIsPlaying(false)}
                onError={() => setError("Ошибка воспроизведения")}
              />
            )}

            {/* Индикатор записи */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/80 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">REC</span>
              </div>
            )}

            {/* Таймер */}
            <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full">
              <span className="text-white text-sm font-mono">{formatTime(recordingTime)}</span>
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="flex items-center gap-4">
            {!videoBlob ? (
              // Кнопки записи
              <>
                <Button size="lg" variant="ghost" onClick={onCancel} className="text-white hover:bg-white/20">
                  Отмена
                </Button>

                <Button
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-16 h-16 rounded-full ${
                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={!!error || !stream}
                >
                  {isRecording ? <Square className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                </Button>
              </>
            ) : (
              // Кнопки воспроизведения и сохранения
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={deleteRecording}
                  className="text-white hover:bg-white/20"
                  title="Удалить"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={playRecording}
                  className="text-white hover:bg-white/20"
                  title="Воспроизвести"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                <Button
                  size="icon"
                  onClick={saveRecording}
                  className="bg-green-500 hover:bg-green-600"
                  title="Отправить"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-white/60 text-sm">
            {videoBlob
              ? "Нажмите кнопку воспроизведения для просмотра"
              : isRecording
                ? "Нажмите квадрат для остановки записи"
                : "Нажмите кнопку камеры для начала записи"}
          </p>
        </div>
      </div>
    </div>
  )
}
