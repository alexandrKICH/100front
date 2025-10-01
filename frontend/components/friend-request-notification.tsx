"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, X, Check } from "lucide-react"

interface FriendRequest {
  id: string
  fromUser: {
    id: string
    login: string
    name: string
    avatar: string
  }
  message: string
  timestamp: number
}

interface FriendRequestNotificationProps {
  requests: FriendRequest[]
  onAccept: (requestId: string, fromUser: any) => void
  onDecline: (requestId: string) => void
  onClose: () => void
}

export function FriendRequestNotification({ requests, onAccept, onDecline, onClose }: FriendRequestNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (requests.length === 0) return null

  const currentRequest = requests[currentIndex]

  const handleAccept = () => {
    onAccept(currentRequest.id, currentRequest.fromUser)

    // Переходим к следующему запросу или закрываем
    if (currentIndex < requests.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onClose()
    }
  }

  const handleDecline = () => {
    onDecline(currentRequest.id)

    // Переходим к следующему запросу или закрываем
    if (currentIndex < requests.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-400" />
            Запрос дружбы
            {requests.length > 1 && (
              <span className="text-sm text-white/70">
                ({currentIndex + 1} из {requests.length})
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {currentRequest.fromUser.name} хочет добавить вас в друзья
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentRequest.fromUser.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg">
                {currentRequest.fromUser.login.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="font-bold text-lg">{currentRequest.fromUser.name}</h3>
              <p className="text-white/70">@{currentRequest.fromUser.login}</p>
              <p className="text-sm text-white/60 mt-1">{new Date(currentRequest.timestamp).toLocaleString()}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-white/90">{currentRequest.message}</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
            >
              <X className="h-4 w-4 mr-2" />
              Отклонить
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Check className="h-4 w-4 mr-2" />
              Принять
            </Button>
          </div>

          {requests.length > 1 && (
            <div className="flex justify-center gap-2">
              {requests.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-blue-400" : "bg-white/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
