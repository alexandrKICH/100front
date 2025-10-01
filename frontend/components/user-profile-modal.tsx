"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, UserMinus, UserPlus } from "lucide-react"

interface Contact {
  id: string
  login: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
}

interface User {
  id: string
  login: string
  name: string
  avatar: string
  status: string
  isOnline: boolean
}

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: Contact
  currentUser: User
  isContact: boolean
  onAddContact: (user: Contact) => void
  onRemoveContact: (userId: string) => void
  onStartChat: (userId: string) => void
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  currentUser,
  isContact,
  onAddContact,
  onRemoveContact,
  onStartChat,
}: UserProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAddContact = async () => {
    setIsLoading(true)
    try {
      await onAddContact(user)
    } catch (error) {
      console.error("Error adding contact:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveContact = async () => {
    setIsLoading(true)
    try {
      await onRemoveContact(user.id)
    } catch (error) {
      console.error("Error removing contact:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return "давно"

    const now = new Date()
    const diff = now.getTime() - lastSeen.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "только что"
    if (minutes < 60) return `${minutes} мин. назад`
    if (hours < 24) return `${hours} ч. назад`
    if (days < 7) return `${days} дн. назад`
    return lastSeen.toLocaleDateString("ru-RU")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900 max-w-md border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Профиль</DialogTitle>
          <DialogDescription className="text-gray-600">
            Информация о пользователе {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Avatar and Info */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-blue-500 text-white text-xl">
                  {user.login.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Online status */}
              {user.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold">{user.login}</h2>
              <p className="text-sm text-gray-500">
                {user.isOnline ? "Онлайн" : `был(а) ${formatLastSeen(user.lastSeen)}`}
              </p>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {/* Communication button */}
            <Button
              onClick={() => onStartChat(user.id)}
              variant="outline"
              className="w-full bg-blue-500 text-white hover:bg-blue-600 border-0"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Написать сообщение
            </Button>

            {/* Contact management */}
            {isContact ? (
              <Button
                onClick={handleRemoveContact}
                disabled={isLoading}
                variant="ghost"
                className="w-full text-red-500 hover:bg-red-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin mr-2" />
                ) : (
                  <UserMinus className="h-4 w-4 mr-2" />
                )}
                Удалить из контактов
              </Button>
            ) : (
              <Button
                onClick={handleAddContact}
                disabled={isLoading}
                variant="outline"
                className="w-full bg-blue-500 text-white hover:bg-blue-600 border-0"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Добавить в контакты
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
