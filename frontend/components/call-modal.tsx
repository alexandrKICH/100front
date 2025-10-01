"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Phone } from "lucide-react"

interface Contact {
  id: string
  login: string
  name: string
  avatar: string
  isOnline: boolean
}

interface User {
  id: string
  login: string
  name: string
  avatar: string
  status: string
  isOnline: boolean
}

interface CallModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact
  type: "voice" | "video"
  currentUser: User
  isIncoming?: boolean
  onAccept?: () => void
  onDecline?: () => void
}

export function CallModal({
  isOpen,
  onClose,
  contact,
  type,
  currentUser,
  isIncoming = false,
  onAccept,
  onDecline,
}: CallModalProps) {
  const [callStatus, setCallStatus] = useState<"calling" | "ringing" | "connected" | "ended">(
    isIncoming ? "ringing" : "calling",
  )
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [hasPermissions, setHasPermissions] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    if (isOpen && !isIncoming) {
      // Для исходящих звонков - проверяем разрешения и начинаем звонок
      checkPermissionsAndStartCall()
    }

    return () => {
      cleanup()
    }
  }, [isOpen, type])

  const checkPermissionsAndStartCall = async () => {
    try {
      // Запрашиваем разрешения
      const constraints = {
        audio: true,
        video: type === "video",
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      setHasPermissions(true)

      if (type === "video" && localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Симулируем отправку звонка и ожидание ответа
      simulateOutgoingCall()
    } catch (error: any) {
      console.error("Permission denied or error:", error)
      alert(
        `Не удалось получить доступ к ${type === "video" ? "камере и микрофону" : "микрофону"}. Проверьте разрешения в браузере.`,
      )
      onClose()
    }
  }

  const simulateOutgoingCall = () => {
    // Симулируем время ожидания ответа (5-15 секунд)
    const waitTime = 5000 + Math.random() * 10000

    const timeout = setTimeout(() => {
      // Симулируем принятие звонка
      if (Math.random() > 0.3) {
        // 70% шанс что ответят
        handleCallAccepted()
      } else {
        // Не ответили
        setCallStatus("ended")
        setTimeout(() => onClose(), 2000)
      }
    }, waitTime)

    // Если пользователь завершит звонок до ответа
    return () => clearTimeout(timeout)
  }

  const handleCallAccepted = () => {
    setCallStatus("connected")
    startCallTimer()

    if (type === "video") {
      // Симулируем видео собеседника
      simulateRemoteVideo()
    }
  }

  const handleIncomingAccept = () => {
    if (onAccept) {
      onAccept()
    }
    checkPermissionsAndStartCall()
    setCallStatus("connected")
    startCallTimer()
  }

  const handleIncomingDecline = () => {
    if (onDecline) {
      onDecline()
    }
    setCallStatus("ended")
    setTimeout(() => onClose(), 1000)
  }

  const startCallTimer = () => {
    intervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
  }

  const simulateRemoteVideo = () => {
    // В реальном приложении здесь был бы поток от собеседника
    if (remoteVideoRef.current) {
      // Создаем canvas для симуляции видео
      const canvas = document.createElement("canvas")
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Рисуем простую анимацию
        let frame = 0
        const animate = () => {
          ctx.fillStyle = `hsl(${frame % 360}, 50%, 50%)`
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = "white"
          ctx.font = "48px Arial"
          ctx.textAlign = "center"
          ctx.fillText(contact.name, canvas.width / 2, canvas.height / 2)
          frame++
          if (callStatus === "connected") {
            requestAnimationFrame(animate)
          }
        }
        animate()

        const stream = canvas.captureStream(30)
        remoteVideoRef.current.srcObject = stream
      }
    }
  }

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEndCall = () => {
    setCallStatus("ended")
    cleanup()
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = isMuted // Инвертируем, так как мы переключаем состояние
      })
    }
  }

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff)
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff // Инвертируем, так как мы переключаем состояние
      })
    }
  }

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
  }

  const getStatusText = () => {
    switch (callStatus) {
      case "calling":
        return "Звонок..."
      case "ringing":
        return "Входящий звонок"
      case "connected":
        return formatDuration(callDuration)
      case "ended":
        return "Звонок завершен"
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 backdrop-blur-sm border-white/20 text-white max-w-md p-0 overflow-hidden">
        <DialogDescription className="sr-only">
          {type === "video" ? "Видеозвонок" : "Голосовой звонок"} с {contact.name}
        </DialogDescription>
        <div className="relative h-[600px] flex flex-col">
          {/* Video Area */}
          {type === "video" && callStatus === "connected" && hasPermissions && (
            <div className="flex-1 relative bg-gray-900">
              {/* Remote Video */}
              <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />

              {/* Local Video */}
              <div className="absolute top-4 right-4 w-24 h-32 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
                <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              </div>
            </div>
          )}

          {/* Voice Call or Video Call Info */}
          {(type === "voice" || callStatus !== "connected" || !hasPermissions) && (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <Avatar className="w-32 h-32 mb-6 border-4 border-white/20">
                <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-4xl">
                  {contact.login.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-2xl font-bold mb-2">@{contact.login}</h2>
              <p className="text-white/70 mb-4">{contact.name}</p>

              <div className="text-center">
                {callStatus === "calling" && (
                  <>
                    <div className="w-4 h-4 bg-white rounded-full animate-pulse mx-auto mb-2" />
                    <p className="text-white/70">{getStatusText()}</p>
                  </>
                )}

                {callStatus === "ringing" && (
                  <>
                    <div className="w-8 h-8 bg-green-500 rounded-full animate-bounce mx-auto mb-2 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-green-400 text-lg font-bold">{getStatusText()}</p>
                  </>
                )}

                {callStatus === "connected" && <p className="text-green-400 font-mono text-lg">{getStatusText()}</p>}

                {callStatus === "ended" && <p className="text-red-400">{getStatusText()}</p>}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="p-6 bg-black/50 backdrop-blur-sm">
            {isIncoming && callStatus === "ringing" ? (
              // Входящий звонок - кнопки принять/отклонить
              <div className="flex items-center justify-center gap-8">
                <Button
                  size="icon"
                  onClick={handleIncomingDecline}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>

                <Button
                  size="icon"
                  onClick={handleIncomingAccept}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <Phone className="h-6 w-6" />
                </Button>
              </div>
            ) : (
              // Обычные контролы звонка
              <div className="flex items-center justify-center gap-4">
                {/* Mute */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full ${
                    isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
                  } text-white`}
                  disabled={!hasPermissions}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                {/* Video Toggle (only for video calls) */}
                {type === "video" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full ${
                      isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
                    } text-white`}
                    disabled={!hasPermissions}
                  >
                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  </Button>
                )}

                {/* Speaker (only for voice calls) */}
                {type === "voice" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleSpeaker}
                    className={`w-12 h-12 rounded-full ${
                      isSpeakerOn ? "bg-blue-500 hover:bg-blue-600" : "bg-white/20 hover:bg-white/30"
                    } text-white`}
                  >
                    {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  </Button>
                )}

                {/* End Call */}
                <Button
                  size="icon"
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
