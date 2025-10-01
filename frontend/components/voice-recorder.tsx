"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, Trash2, Send } from "lucide-react"

interface VoiceRecorderProps {
  onSave: (audioBlob: Blob) => void
  onCancel: () => void
}

export function VoiceRecorder({ onSave, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      // Проверяем поддержку разных форматов
      const options = [
        { mimeType: "audio/webm;codecs=opus" },
        { mimeType: "audio/webm" },
        { mimeType: "audio/mp4" },
        { mimeType: "audio/ogg;codecs=opus" },
        { mimeType: "audio/wav" },
      ]

      let selectedOptions = { mimeType: "audio/webm" }
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
        setAudioBlob(blob)

        // Создаем URL для воспроизведения
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl)
        }
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        // Останавливаем все треки
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        setError("Ошибка записи аудио")
        setIsRecording(false)
      }

      mediaRecorder.start(100) // Записываем данные каждые 100мс
      setIsRecording(true)
      setRecordingTime(0)

      // Запускаем таймер
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setError("Нет доступа к микрофону")
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
    if (audioUrl && audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          audioRef.current.currentTime = 0
          await audioRef.current.play()
          setIsPlaying(true)
        }
      } catch (error) {
        console.error("Error playing audio:", error)
        setError("Ошибка воспроизведения")
      }
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setIsPlaying(false)
    setError(null)
  }

  const saveRecording = () => {
    if (audioBlob) {
      onSave(audioBlob)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4 text-center">
          {audioBlob ? "Прослушать запись" : "Голосовое сообщение"}
        </h3>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          {/* Индикатор времени */}
          <div className="text-2xl font-mono text-white">{formatTime(recordingTime)}</div>

          {/* Визуальный индикатор записи */}
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm">Идет запись...</span>
            </div>
          )}

          {/* Кнопки управления */}
          <div className="flex items-center gap-4">
            {!audioBlob ? (
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
                  disabled={!!error}
                >
                  {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
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

          {/* Скрытый аудио элемент для воспроизведения */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onError={() => setError("Ошибка воспроизведения")}
              preload="none"
            />
          )}
        </div>

        <div className="text-center mt-4">
          <p className="text-white/60 text-sm">
            {audioBlob ? "Нажмите кнопку воспроизведения для прослушивания" : "Нажмите и удерживайте кнопку для записи"}
          </p>
        </div>
      </div>
    </div>
  )
}
