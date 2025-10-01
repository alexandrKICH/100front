"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  MoreVertical,
  Search,
  Archive,
  Pin,
  BlocksIcon as Block,
  Delete,
  Info,
  Star,
  Copy,
  Bell,
  BellOff,
  PinOff,
  StarOff,
  ArchiveRestore,
} from "lucide-react"
import { useState, useEffect } from "react"

interface ChatMenuProps {
  chatId: string
  chatType: "individual" | "group" | "sobutylnik"
  chatName?: string
  onAction: (action: string, data?: any) => void
}

export function ChatMenu({ chatId, chatType, chatName, onAction }: ChatMenuProps) {
  const [isPinned, setIsPinned] = useState(false)
  const [isStarred, setIsStarred] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isArchived, setIsArchived] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)

  // Загружаем состояние чата из localStorage
  useEffect(() => {
    const chatSettings = JSON.parse(localStorage.getItem(`chat_settings_${chatId}`) || "{}")
    setIsPinned(chatSettings.pinned || false)
    setIsStarred(chatSettings.starred || false)
    setIsMuted(chatSettings.muted || false)
    setIsArchived(chatSettings.archived || false)
    setIsBlocked(chatSettings.blocked || false)
  }, [chatId])

  const updateChatSettings = (key: string, value: boolean) => {
    const chatSettings = JSON.parse(localStorage.getItem(`chat_settings_${chatId}`) || "{}")
    chatSettings[key] = value
    localStorage.setItem(`chat_settings_${chatId}`, JSON.stringify(chatSettings))
  }

  const handlePinToggle = () => {
    const newPinned = !isPinned
    setIsPinned(newPinned)
    updateChatSettings("pinned", newPinned)

    // Обновляем список закрепленных чатов
    const pinnedChats = JSON.parse(localStorage.getItem("pinned_chats") || "[]")
    if (newPinned) {
      if (!pinnedChats.includes(chatId)) {
        pinnedChats.push(chatId)
      }
    } else {
      const index = pinnedChats.indexOf(chatId)
      if (index > -1) {
        pinnedChats.splice(index, 1)
      }
    }
    localStorage.setItem("pinned_chats", JSON.stringify(pinnedChats))

    onAction("pin", { pinned: newPinned })
  }

  const handleStarToggle = () => {
    const newStarred = !isStarred
    setIsStarred(newStarred)
    updateChatSettings("starred", newStarred)

    // Обновляем список избранных чатов
    const starredChats = JSON.parse(localStorage.getItem("starred_chats") || "[]")
    if (newStarred) {
      if (!starredChats.includes(chatId)) {
        starredChats.push(chatId)
      }
    } else {
      const index = starredChats.indexOf(chatId)
      if (index > -1) {
        starredChats.splice(index, 1)
      }
    }
    localStorage.setItem("starred_chats", JSON.stringify(starredChats))

    onAction("star", { starred: newStarred })
  }

  const handleMuteToggle = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    updateChatSettings("muted", newMuted)

    // Устанавливаем время отключения уведомлений (24 часа)
    if (newMuted) {
      const muteUntil = new Date()
      muteUntil.setHours(muteUntil.getHours() + 24)
      updateChatSettings("muteUntil", muteUntil.getTime())
    } else {
      updateChatSettings("muteUntil", null)
    }

    onAction("mute", { muted: newMuted })
  }

  const handleArchiveToggle = () => {
    const newArchived = !isArchived
    setIsArchived(newArchived)
    updateChatSettings("archived", newArchived)

    // Обновляем список архивированных чатов
    const archivedChats = JSON.parse(localStorage.getItem("archived_chats") || "[]")
    if (newArchived) {
      if (!archivedChats.includes(chatId)) {
        archivedChats.push(chatId)
      }
    } else {
      const index = archivedChats.indexOf(chatId)
      if (index > -1) {
        archivedChats.splice(index, 1)
      }
    }
    localStorage.setItem("archived_chats", JSON.stringify(archivedChats))

    onAction("archive", { archived: newArchived })
  }

  const handleBlockToggle = () => {
    const newBlocked = !isBlocked
    setIsBlocked(newBlocked)
    updateChatSettings("blocked", newBlocked)

    // Обновляем список заблокированных пользователей
    const blockedUsers = JSON.parse(localStorage.getItem("blocked_users") || "[]")
    if (newBlocked) {
      if (!blockedUsers.includes(chatId)) {
        blockedUsers.push(chatId)
      }
    } else {
      const index = blockedUsers.indexOf(chatId)
      if (index > -1) {
        blockedUsers.splice(index, 1)
      }
    }
    localStorage.setItem("blocked_users", JSON.stringify(blockedUsers))

    onAction("block", { blocked: newBlocked })
  }

  const handleSearch = () => {
    // Открываем поиск по сообщениям
    const searchTerm = prompt("🔍 Введите текст для поиска в чате:")
    if (searchTerm && searchTerm.trim()) {
      onAction("search", { term: searchTerm.trim() })
    }
  }

  const handleCopyLink = async () => {
    const link = `https://100gram.app/chat/${chatId}`
    try {
      await navigator.clipboard.writeText(link)
      onAction("copy", { link, success: true })
    } catch (error) {
      // Fallback для старых браузеров
      const textArea = document.createElement("textarea")
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      onAction("copy", { link, success: true })
    }
  }

  const handleDelete = () => {
    const confirmMessage =
      chatType === "group"
        ? `Покинуть группу "${chatName || "Группа"}"? Вы больше не сможете видеть сообщения.`
        : `Удалить чат с "${chatName || "пользователем"}"? Все сообщения будут удалены.`

    if (confirm(confirmMessage)) {
      // Удаляем все данные чата
      localStorage.removeItem(`chat_settings_${chatId}`)
      localStorage.removeItem(`chat_messages_${chatId}`)

      // Удаляем из всех списков
      const pinnedChats = JSON.parse(localStorage.getItem("pinned_chats") || "[]")
      const starredChats = JSON.parse(localStorage.getItem("starred_chats") || "[]")
      const archivedChats = JSON.parse(localStorage.getItem("archived_chats") || "[]")

      localStorage.setItem("pinned_chats", JSON.stringify(pinnedChats.filter((id: string) => id !== chatId)))
      localStorage.setItem("starred_chats", JSON.stringify(starredChats.filter((id: string) => id !== chatId)))
      localStorage.setItem("archived_chats", JSON.stringify(archivedChats.filter((id: string) => id !== chatId)))

      onAction("delete", { chatId })
    }
  }

  const handleClearSobutylnik = () => {
    if (confirm("Очистить все сообщения в Собутыльнике? Это действие нельзя отменить.")) {
      localStorage.removeItem("sobutylnik_messages")
      onAction("clear", { chatId })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-black/90 backdrop-blur-sm border-white/20 text-white w-56">
        {chatType === "sobutylnik" ? (
          <>
            <DropdownMenuItem onClick={handleSearch} className="hover:bg-white/20">
              <Search className="h-4 w-4 mr-2" />
              Поиск в избранном
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleClearSobutylnik} className="hover:bg-white/20 text-red-400">
              <Delete className="h-4 w-4 mr-2" />
              Очистить избранное
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => onAction("info")} className="hover:bg-white/20">
              <Info className="h-4 w-4 mr-2" />
              Информация о чате
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleSearch} className="hover:bg-white/20">
              <Search className="h-4 w-4 mr-2" />
              Поиск сообщений
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handlePinToggle} className="hover:bg-white/20">
              {isPinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
              {isPinned ? "Открепить чат" : "Закрепить чат"}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleStarToggle} className="hover:bg-white/20">
              {isStarred ? <StarOff className="h-4 w-4 mr-2" /> : <Star className="h-4 w-4 mr-2" />}
              {isStarred ? "Убрать из избранного" : "Добавить в избранное"}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/20" />

            <DropdownMenuItem onClick={handleMuteToggle} className="hover:bg-white/20">
              {isMuted ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
              {isMuted ? "Включить уведомления" : "Отключить уведомления"}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleArchiveToggle} className="hover:bg-white/20">
              {isArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
              {isArchived ? "Разархивировать" : "Архивировать"}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleCopyLink} className="hover:bg-white/20">
              <Copy className="h-4 w-4 mr-2" />
              Копировать ссылку
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/20" />

            {chatType === "individual" && (
              <DropdownMenuItem onClick={handleBlockToggle} className="hover:bg-white/20 text-red-400">
                <Block className="h-4 w-4 mr-2" />
                {isBlocked ? "Разблокировать" : "Заблокировать"}
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={handleDelete} className="hover:bg-white/20 text-red-400">
              <Delete className="h-4 w-4 mr-2" />
              {chatType === "group" ? "Покинуть группу" : "Удалить чат"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
