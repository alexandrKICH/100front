"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, PhoneOff, Video } from "lucide-react"

interface Contact {
  id: string
  login: string
  name: string
  avatar: string
  isOnline: boolean
}

interface CallNotificationProps {
  isVisible: boolean
  caller: Contact
  type: "voice" | "video"
  onAccept: () => void
  onDecline: () => void
}

export function CallNotification({ isVisible, caller, type, onAccept, onDecline }: CallNotificationProps) {
  const [isRinging, setIsRinging] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsRinging(true)

      // Воспроизводим звук звонка (если браузер позволяет)
      const audio = new Audio("/placeholder.svg?height=1&width=1")
      audio.loop = true
      audio.play().catch(() => {
        console.log("Cannot play ringtone - user interaction required")
      })

      // Автоматически отклоняем через 30 секунд
      const timeout = setTimeout(() => {
        onDecline()
      }, 30000)

      return () => {
        clearTimeout(timeout)
        audio.pause()
        setIsRinging(false)
      }
    }
  }, [isVisible, onDecline])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-white text-center max-w-sm w-full mx-4">
        <div className="mb-6">
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full ${isRinging ? "animate-pulse" : ""}`}>
            <Avatar className="w-24 h-24 border-4 border-white/20">
              <AvatarImage src={caller.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-2xl">
                {caller.login.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <h2 className="text-xl font-bold mb-1">@{caller.login}</h2>
          <p className="text-white/70 mb-2">{caller.name}</p>

          <div className="flex items-center justify-center gap-2 mb-4">
            {type === "video" ? (
              <Video className="h-5 w-5 text-blue-400" />
            ) : (
              <Phone className="h-5 w-5 text-green-400" />
            )}
            <span className="text-sm">{type === "video" ? "Видеозвонок" : "Голосовой звонок"}</span>
          </div>

          <div className="text-sm text-white/50 animate-pulse">Входящий звонок...</div>
        </div>

        <div className="flex items-center justify-center gap-8">
          <Button
            size="icon"
            onClick={onDecline}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

          <Button
            size="icon"
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white animate-bounce"
          >
            <Phone className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-4 text-xs text-white/50">Звонок автоматически завершится через 30 секунд</div>
      </div>
    </div>
  )
}
