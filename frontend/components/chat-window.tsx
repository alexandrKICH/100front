"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageBubble } from "@/components/message-bubble"
import { VoiceRecorder } from "@/components/voice-recorder"
import { VideoRecorder } from "@/components/video-recorder"
import { FileUpload } from "@/components/file-upload"
import { ChatMenu } from "@/components/chat-menu"
import { Send, Paperclip, Mic, Video, Users, Star, ArrowLeft } from "lucide-react"
import { messageService, fileService } from "@/lib/database"

interface Message {
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
  chatId: string
}

interface ChatWindowProps {
  chatId: string
  currentUser: any
  contacts: any[]
  messages: Message[]
  onSendMessage: (message: Message) => void
  onLoadMessages: () => void
  onMenuAction: (action: string, data?: any) => void
  onBack?: () => void
  isLoadingMessages?: boolean
}

export function ChatWindow({
  chatId,
  currentUser,
  contacts,
  messages,
  onSendMessage,
  onLoadMessages,
  onMenuAction,
  onBack,
  isLoadingMessages = false,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("")
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentContact = contacts.find((c) => c.id === chatId)
  const isGroupChat = false

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (newMessage.trim() && !isSending) {
      setIsSending(true)
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        timestamp: new Date(),
        isOwn: true,
        sender: currentUser.name,
        senderAvatar: currentUser.avatar,
        senderLogin: currentUser.login,
        chatId: chatId,
      }

      console.log("📤 Sending message:", message.text)
      await onSendMessage(message)
      setNewMessage("")
      setIsTyping(false)
      setIsSending(false)
    }
  }


  const handleVoiceMessage = async (audioBlob: Blob) => {
    if (isSending) return
    setIsSending(true)

    try {
      console.log("🎤 Processing voice message...")

      // Загружаем аудио файл
      const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: audioBlob.type })
      const audioUrl = await fileService.uploadFile(audioFile, currentUser.id)

      const message: Message = {
        id: Date.now().toString(),
        audio: audioUrl,
        timestamp: new Date(),
        isOwn: true,
        sender: currentUser.name,
        senderAvatar: currentUser.avatar,
        senderLogin: currentUser.login,
        chatId: chatId,
      }

      // Сохраняем в базу данных
      const actualChatId = await getActualChatId()
      if (actualChatId) {
        await messageService.sendMessage(
          actualChatId,
          currentUser.id,
          "🎤 Голосовое сообщение",
          "audio",
          audioUrl,
          audioFile.name,
          audioFile.size,
        )
      }

      await onSendMessage(message)
      setShowVoiceRecorder(false)
    } catch (error) {
      console.error("❌ Error sending voice message:", error)
      alert("Ошибка отправки голосового сообщения")
    } finally {
      setIsSending(false)
    }
  }

  const handleVideoMessage = async (videoBlob: Blob) => {
    if (isSending) return
    setIsSending(true)

    try {
      console.log("📹 Processing video message...")

      // Загружаем видео файл
      const videoFile = new File([videoBlob], `video_${Date.now()}.webm`, { type: videoBlob.type })
      const videoUrl = await fileService.uploadFile(videoFile, currentUser.id)

      const message: Message = {
        id: Date.now().toString(),
        video: videoUrl,
        timestamp: new Date(),
        isOwn: true,
        sender: currentUser.name,
        senderAvatar: currentUser.avatar,
        senderLogin: currentUser.login,
        chatId: chatId,
      }

      // Сохраняем в базу данных
      const actualChatId = await getActualChatId()
      if (actualChatId) {
        await messageService.sendMessage(
          actualChatId,
          currentUser.id,
          "📹 Видеосообщение",
          "video",
          videoUrl,
          videoFile.name,
          videoFile.size,
        )
      }

      await onSendMessage(message)
      setShowVideoRecorder(false)
    } catch (error) {
      console.error("❌ Error sending video message:", error)
      alert("Ошибка отправки видеосообщения")
    } finally {
      setIsSending(false)
    }
  }

  const handleFileMessage = async (file: { name: string; url: string; size: number; type: string }) => {
    if (isSending) return
    setIsSending(true)

    try {
      console.log("📁 Sending file message:", file)

      const message: Message = {
        id: Date.now().toString(),
        // Если это изображение, сохраняем в поле image, иначе в file
        ...(file.type.startsWith("image/")
          ? { image: file.url }
          : {
              file: {
                name: file.name,
                url: file.url,
                size: file.size,
                type: file.type,
              },
            }),
        timestamp: new Date(),
        isOwn: true,
        sender: currentUser.name,
        senderAvatar: currentUser.avatar,
        senderLogin: currentUser.login,
        chatId: chatId,
      }

      // Сохраняем в базу данных
      if (chatId !== "sobutylnik") {
        const actualChatId = await getActualChatId()
        if (actualChatId) {
          await messageService.sendMessage(
            actualChatId,
            currentUser.id,
            file.type.startsWith("image/") ? `🖼️ Изображение` : `📎 ${file.name}`,
            file.type.startsWith("image/") ? "image" : "file",
            file.url,
            file.name,
            file.size,
          )
        }
      }

      await onSendMessage(message)
      setShowFileUpload(false)
    } catch (error) {
      console.error("❌ Error sending file message:", error)
      alert("Ошибка отправки файла")
    } finally {
      setIsSending(false)
    }
  }

  const getActualChatId = async () => {
    if (contacts.find((c) => c.id === chatId)) {
      return await messageService.getChatId(currentUser.id, chatId)
    }
    return null
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)
    if (value.length > 0 && !isTyping) {
      setIsTyping(true)
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false)
    }
  }

  const getHeaderInfo = () => {
    return {
      name: currentContact?.name || currentContact?.login || "Пользователь",
      subtitle: currentContact?.isOnline ? "онлайн" : "не в сети",
      avatar: currentContact?.avatar,
      bgClass: "bg-gradient-to-r from-purple-500 to-blue-500",
      chatType: "individual" as const,
    }
  }

  const headerInfo = getHeaderInfo()

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white animate-slide-in-right">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            {onBack && (
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden text-gray-700 hover:bg-gray-100 -ml-2"
                onClick={onBack}
                title="Назад к чатам"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Avatar className="w-10 h-10">
              <AvatarImage src={headerInfo.avatar || "/placeholder.svg?height=40&width=40"} />
              <AvatarFallback className={`text-white ${headerInfo.bgClass}`}>
                {headerInfo.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-none">{headerInfo.name}</h2>
              <p
                className={`text-sm transition-colors-smooth ${
                  currentContact?.isOnline ? "text-green-500" : "text-gray-500"
                }`}
              >
                {isTyping && !isGroupChat ? (
                  <span className="animate-pulse">печатает...</span>
                ) : (
                  headerInfo.subtitle
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ChatMenu chatId={chatId} chatType={headerInfo.chatType} onAction={onMenuAction} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-fade-in-up bg-gray-50">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-gray-600">Загрузка сообщений...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <h3 className="text-xl font-bold mb-2">Начните общение</h3>
            <p>Отправьте первое сообщение</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recorder */}
      {showVoiceRecorder && <VoiceRecorder onSave={handleVoiceMessage} onCancel={() => setShowVoiceRecorder(false)} />}

      {/* Video Recorder */}
      {showVideoRecorder && <VideoRecorder onSave={handleVideoMessage} onCancel={() => setShowVideoRecorder(false)} />}

      {/* File Upload */}
      <FileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFileSelect={handleFileMessage}
        currentUserId={currentUser.id}
      />

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-gray-700 hover:bg-gray-100"
            onClick={() => setShowFileUpload(true)}
            title="Отправить файл"
            disabled={isSending}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Написать сообщение..."
              className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500 pr-24"
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={isSending}
            />
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="text-gray-700 hover:bg-gray-100"
            onClick={() => setShowVoiceRecorder(true)}
            title="Голосовое сообщение"
            disabled={isSending}
          >
            <Mic className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="text-gray-700 hover:bg-gray-100"
            onClick={() => setShowVideoRecorder(true)}
            title="Видеосообщение"
            disabled={isSending}
          >
            <Video className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            className={`transition-all-smooth hover-lift ${
              isSending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            }`}
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
