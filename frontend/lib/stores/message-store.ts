import { create } from "zustand"

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

interface MessageState {
  // Состояние
  messages: Record<string, Message[]> // chatId -> messages[]
  selectedChat: string | null
  isTyping: Record<string, boolean> // chatId -> isTyping

  // Действия
  setMessages: (chatId: string, messages: Message[]) => void
  addMessage: (message: Message) => void
  setSelectedChat: (chatId: string | null) => void
  setTyping: (chatId: string, isTyping: boolean) => void
  clearMessages: (chatId: string) => void
  clearAllMessages: () => void
}

export const useMessageStore = create<MessageState>((set, get) => ({
  // Начальное состояние
  messages: {},
  selectedChat: null,
  isTyping: {},

  // Действия
  setMessages: (chatId, messages) => {
    const { messages: allMessages } = get()
    set({
      messages: {
        ...allMessages,
        [chatId]: messages,
      },
    })
  },

  addMessage: (message) => {
    const { messages } = get()
    const chatMessages = messages[message.chatId] || []

    // Проверяем, что сообщение еще не существует
    if (!chatMessages.find((m) => m.id === message.id)) {
      set({
        messages: {
          ...messages,
          [message.chatId]: [...chatMessages, message],
        },
      })
    }
  },

  setSelectedChat: (chatId) => {
    set({ selectedChat: chatId })
  },

  setTyping: (chatId, isTyping) => {
    const { isTyping: currentTyping } = get()
    set({
      isTyping: {
        ...currentTyping,
        [chatId]: isTyping,
      },
    })
  },

  clearMessages: (chatId) => {
    const { messages } = get()
    const newMessages = { ...messages }
    delete newMessages[chatId]
    set({ messages: newMessages })
  },

  clearAllMessages: () => {
    set({ messages: {}, isTyping: {} })
  },
}))

// Селекторы для оптимизации
export const useMessagesForChat = (chatId: string | null) => {
  return useMessageStore((state) => (chatId ? state.messages[chatId] || [] : []))
}

export const useIsTyping = (chatId: string | null) => {
  return useMessageStore((state) => (chatId ? state.isTyping[chatId] || false : false))
}
