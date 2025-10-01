"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

interface Contact {
  id: string
  login: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
}

interface ChatFolder {
  id: string
  name: string
  userId: string
  chatIds: string[]
  createdAt: Date
}

interface ChatListProps {
  selectedChat: string | null
  onChatSelect: (chatId: string) => void
  contacts: Contact[]
  user: any
  lastMessages: Record<string, { text: string; time: Date; type: string }>
  unreadCounts: Record<string, number>
  onUserProfile: (contact: Contact) => void
  folders: ChatFolder[]
  selectedFolder: ChatFolder | null
  onSelectFolder: (folder: ChatFolder | null) => void
}

export function ChatList({
  selectedChat,
  onChatSelect,
  contacts,
  user,
  lastMessages,
  unreadCounts,
  onUserProfile,
  folders,
  selectedFolder,
  onSelectFolder,
}: ChatListProps) {

  const formatTime = (time: Date | string) => {
    const now = new Date()
    const timeDate = time instanceof Date ? time : new Date(time)
    
    if (isNaN(timeDate.getTime())) {
      return "сейчас"
    }
    
    const diff = now.getTime() - timeDate.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "сейчас"
    if (minutes < 60) return `${minutes}м`
    if (hours < 24) return `${hours}ч`
    if (days < 7) return `${days}д`
    return timeDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  }

  const formatLastMessage = (message: { text: string; type: string }) => {
    if (message.type === "image") return "📷 Фото"
    if (message.type === "video") return "🎥 Видео"
    if (message.type === "audio") return "🎵 Аудио"
    if (message.type === "file") return "📎 Файл"
    return message.text || "Начните общение..."
  }

  // Individual chats from contacts
  const individualChats = contacts.map((contact) => {
    const lastMsg = lastMessages[contact.id]
    return {
      id: contact.id,
      name: contact.name,
      avatar: contact.avatar,
      lastMessage: lastMsg ? formatLastMessage(lastMsg) : "Начните общение...",
      time: lastMsg ? formatTime(lastMsg.time) : "сейчас",
      unread: unreadCounts[contact.id] || 0,
      online: contact.isOnline,
      contact: contact,
      type: "individual" as const,
    }
  })

  const allChats = [...individualChats]
  
  // Фильтруем чаты по выбранной папке
  const filteredChats = selectedFolder 
    ? allChats.filter((chat) => selectedFolder.chatIds.includes(chat.id))
    : allChats

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full pb-16 md:pb-0">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">Чаты</h1>
          <Badge variant="secondary" className="bg-gray-100 text-gray-900">
            {filteredChats.length}
          </Badge>
        </div>
        
        {/* Horizontal Folder Tabs */}
        <div className="overflow-x-auto scrollbar-hide px-2 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => onSelectFolder(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !selectedFolder
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              Все ({contacts.length})
            </button>
            {folders && folders.length > 0 && folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => onSelectFolder(folder)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedFolder?.id === folder.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {folder.name} ({folder.chatIds.length})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 && (
          <div className="p-4 text-center text-gray-400">
            <p>Нет чатов</p>
          </div>
        )}

        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`group relative p-4 cursor-pointer transition-all hover:bg-gray-50 ${
              selectedChat === chat.id ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center gap-3" onClick={() => onChatSelect(chat.id)}>
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-white bg-blue-500">
                    {chat.contact?.login.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {chat.online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-400">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons - hidden on mobile, visible on hover on desktop */}
            <div className="hidden md:flex absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 text-gray-700 hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation()
                  onUserProfile(chat.contact)
                }}
                title="Профиль пользователя"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
