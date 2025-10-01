"use client"

import { useState, useEffect, useRef } from "react"
import { ChatList } from "@/components/chat-list"
import { ChatWindow } from "@/components/chat-window"
import { ProfileModal } from "@/components/profile-modal"
import { AuthModal } from "@/components/auth-modal"
import { ContactSearch } from "@/components/contact-search"
import { Sidebar } from "@/components/sidebar"
import { PermissionsModal } from "@/components/permissions-modal"
import { UserProfileModal } from "@/components/user-profile-modal"
import { SettingsModal } from "@/components/settings-modal"
import { FoldersModal } from "@/components/folders-modal"
import { Button } from "@/components/ui/button"
import { Search, Settings, Folder, Star, LogOut } from "lucide-react"
import { authService, contactService, messageService, folderService } from "@/lib/database"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  login: string
  name: string
  avatar: string
  status: string
  isOnline: boolean
}

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

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuth, setShowAuth] = useState(true)
  const [showPermissions, setShowPermissions] = useState(false)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [folders, setFolders] = useState<ChatFolder[]>([])
  const [showFoldersModal, setShowFoldersModal] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<ChatFolder | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const [user, setUser] = useState<User>({
    id: "",
    login: "",
    name: "Anonymous User",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "",
    isOnline: false,
  })

  const [contacts, setContacts] = useState<Contact[]>([])
  const [lastMessages, setLastMessages] = useState<Record<string, { text: string; time: Date; type: string }>>({})
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  
  // КЭШ для сообщений - мгновенное переключение между чатами
  const messagesCache = useRef<Record<string, Message[]>>({})

  // Ref для отслеживания текущего selectedChat без пересоздания подписки
  const selectedChatRef = useRef<string | null>(null)
  
  // Обновляем ref при изменении selectedChat
  useEffect(() => {
    selectedChatRef.current = selectedChat
    // Обнуляем счетчик непрочитанных при открытии чата
    if (selectedChat) {
      setUnreadCounts((prev) => ({
        ...prev,
        [selectedChat]: 0,
      }))
    }
  }, [selectedChat])

  // Запрашиваем разрешение на уведомления при загрузке
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        console.log("🔔 Requesting notification permission...")
        Notification.requestPermission().then((permission) => {
          console.log("🔔 Notification permission:", permission)
        })
      }
    }
  }, [])

  // Функция для показа браузерного уведомления
  const showNotification = (title: string, body: string, icon?: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          body,
          icon: icon || "/placeholder.svg?height=64&width=64",
          badge: "/placeholder.svg?height=64&width=64",
          tag: "100gram-message",
          requireInteraction: false,
        })
        
        // Автоматически закрываем уведомление через 5 секунд
        setTimeout(() => notification.close(), 5000)
      } catch (error) {
        console.error("❌ Error showing notification:", error)
      }
    }
  }

  // Восстановление сессии при загрузке страницы
  useEffect(() => {
    const restoreSession = async () => {
      const savedUserId = localStorage.getItem("100gram_user_id")
      if (savedUserId) {
        try {
          console.log("🔄 Restoring session for user ID:", savedUserId)
          
          // Проверяем и получаем актуальные данные пользователя из базы данных
          const { data: userData, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", savedUserId)
            .single()
          
          if (error || !userData) {
            console.error("❌ Invalid session - user not found")
            localStorage.removeItem("100gram_user_id")
            return
          }
          
          // Обновляем статус пользователя на онлайн
          await supabase
            .from("users")
            .update({
              is_online: true,
              last_seen: new Date().toISOString(),
            })
            .eq("id", userData.id)
          
          const user = {
            id: userData.id,
            login: userData.login,
            name: userData.name,
            avatar: userData.avatar,
            status: userData.status || "",
            isOnline: true,
          }
          
          setUser(user)
          setIsAuthenticated(true)
          setShowAuth(false)
          await loadUserData(user)
          
          // Восстанавливаем выбранный чат
          const savedChat = localStorage.getItem("100gram_selected_chat")
          if (savedChat) {
            console.log("🔄 Restoring selected chat:", savedChat)
            setSelectedChat(savedChat)
          }
        } catch (error) {
          console.error("❌ Failed to restore session:", error)
          localStorage.removeItem("100gram_user_id")
        }
      }
    }
    
    restoreSession()
  }, [])


  const loadLastMessages = async (contactsList: Contact[], userId: string) => {
    try {
      // НОВЫЙ БЫСТРЫЙ СПОСОБ: Один запрос вместо N*2 запросов!
      console.log("📊 Loading last messages in batch (fast mode)...")
      const lastMsgs = await messageService.getBatchLastMessages(userId)
      setLastMessages(lastMsgs)
      console.log("✅ Last messages loaded in batch:", Object.keys(lastMsgs).length)
    } catch (error) {
      console.warn("⚠️ Batch loading failed, falling back to individual requests:", error)
      
      // Fallback: старый способ если новый не работает
      const lastMsgs: Record<string, { text: string; time: Date; type: string }> = {}
      const messagePromises = contactsList.map(async (contact) => {
        try {
          const chatId = await messageService.getChatId(userId, contact.id)
          if (chatId) {
            const lastMsg = await messageService.getLastMessage(chatId)
            if (lastMsg) {
              return {
                contactId: contact.id,
                message: {
                  ...lastMsg,
                  time: new Date(lastMsg.time)
                }
              }
            }
          }
        } catch (error) {
          console.warn("⚠️ Failed to load last message for contact:", contact.id)
        }
        return null
      })

      const results = await Promise.all(messagePromises)
      
      results.forEach(result => {
        if (result) {
          lastMsgs[result.contactId] = result.message
        }
      })

      setLastMessages(lastMsgs)
      console.log("✅ Last messages loaded (fallback):", Object.keys(lastMsgs).length)
    }
  }

  const loadUserData = async (userData: User) => {
    setIsLoading(true)
    try {
      console.log("📊 Loading user data from database...")

      // Загружаем контакты и папки ПАРАЛЛЕЛЬНО
      const [contactsData, foldersData] = await Promise.all([
        contactService.getContacts(userData.id).catch(err => {
          console.warn("⚠️ Failed to load contacts:", err)
          return []
        }),
        folderService.getFolders(userData.id).catch(err => {
          console.warn("⚠️ Failed to load folders:", err)
          return []
        })
      ])

      // Форматируем и показываем контакты СРАЗУ
      const formattedContacts = contactsData.map((contact: any) => ({
        id: contact.contact_user.id,
        login: contact.contact_user.login,
        name: contact.contact_user.name,
        avatar: contact.contact_user.avatar,
        isOnline: contact.contact_user.is_online,
        lastSeen: contact.contact_user.last_seen ? new Date(contact.contact_user.last_seen) : undefined,
      }))
      
      setContacts(formattedContacts)
      console.log("✅ Contacts loaded:", formattedContacts.length)

      // Форматируем и показываем папки
      const formattedFolders = foldersData.map((f: any) => ({
        id: f.id,
        name: f.name,
        userId: f.user_id,
        chatIds: f.chat_ids || [],
        createdAt: new Date(f.created_at),
      }))
      setFolders(formattedFolders)

      // Убираем loader - UI уже готов к работе
      setIsLoading(false)

      // Загружаем последние сообщения В ФОНЕ (не блокирует UI)
      loadLastMessages(formattedContacts, userData.id).catch(err => {
        console.warn("⚠️ Failed to load last messages:", err)
      })

      console.log("✅ User data loading completed")
    } catch (error) {
      console.error("❌ Error loading user data:", error)
      setIsLoading(false)
    }
  }


  const handleLogin = async (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    setShowAuth(false)

    // Сохраняем только ID пользователя для восстановления сессии
    localStorage.setItem("100gram_user_id", userData.id)

    // Проверяем, нужно ли показать запрос разрешений
    const hasShownPermissions = localStorage.getItem("100gram_permissions_shown")
    if (!hasShownPermissions) {
      setShowPermissions(true)
    }

    await loadUserData(userData)
  }

  const handlePermissionsComplete = (granted: boolean) => {
    setShowPermissions(false)
    localStorage.setItem("100gram_permissions_shown", "true")

    if (!granted) {
      alert("⚠️ Некоторые функции могут быть недоступны без разрешений на микрофон и камеру")
    }
  }

  const handleLogout = async () => {
    if (user.id) {
      await authService.logout(user.id)
    }
    
    // Удаляем ID пользователя из localStorage
    localStorage.removeItem("100gram_user_id")
    
    setIsAuthenticated(false)
    setShowAuth(true)
    setSelectedChat(null)
    setContacts([])
    setFolders([])
    setMessages([])
    setUser({
      id: "",
      login: "",
      name: "Anonymous User",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "",
      isOnline: false,
    })
  }

  const handleAddContact = async (contact: Contact) => {
    try {
      // Добавляем в state независимо от результата БД (может уже существовать)
      if (!contacts.find((c) => c.id === contact.id)) {
        setContacts([...contacts, contact])
        console.log("✅ Contact added to state:", contact.login)
      }
      
      // Пытаемся добавить в БД (может уже существовать)
      try {
        await contactService.addContact(user.id, contact.id)
      } catch (dbError) {
        console.warn("⚠️ Contact may already exist in database:", dbError)
      }
    } catch (error: any) {
      console.error("Error adding contact:", error)
      alert("Ошибка добавления контакта: " + error.message)
    }
  }

  const handleRemoveContact = async (contactId: string) => {
    try {
      console.log("🗑️ Removing contact:", contactId)
      // Удаляем контакт из базы данных
      await contactService.removeContact(user.id, contactId)
      // Удаляем из state
      setContacts(contacts.filter((c) => c.id !== contactId))
      console.log("✅ Contact removed successfully")
    } catch (error: any) {
      console.error("❌ Error removing contact:", error)
      alert("Ошибка удаления контакта: " + error.message)
    }
  }

  // Папки теперь загружаются в loadUserData() параллельно с контактами

  const handleCreateFolder = async (name: string) => {
    try {
      const newFolder = await folderService.createFolder(user.id, name)
      const formattedFolder: ChatFolder = {
        id: newFolder.id,
        name: newFolder.name,
        userId: newFolder.user_id,
        chatIds: newFolder.chat_ids || [],
        createdAt: new Date(newFolder.created_at),
      }
      setFolders([...folders, formattedFolder])
    } catch (error) {
      console.error("Error creating folder:", error)
      alert("Ошибка создания папки")
    }
  }

  const handleEditFolder = async (folderId: string, newName: string) => {
    try {
      await folderService.updateFolder(folderId, newName)
      setFolders(folders.map((f) => (f.id === folderId ? { ...f, name: newName } : f)))
    } catch (error) {
      console.error("Error updating folder:", error)
      alert("Ошибка обновления папки")
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await folderService.deleteFolder(folderId)
      setFolders(folders.filter((f) => f.id !== folderId))
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(null)
      }
    } catch (error) {
      console.error("Error deleting folder:", error)
      alert("Ошибка удаления папки")
    }
  }

  const handleAddChatToFolder = async (folderId: string, chatId: string) => {
    try {
      await folderService.addChatToFolder(folderId, chatId)
      setFolders(
        folders.map((f) => (f.id === folderId ? { ...f, chatIds: [...f.chatIds, chatId] } : f))
      )
    } catch (error) {
      console.error("Error adding chat to folder:", error)
      alert("Ошибка добавления чата в папку")
    }
  }

  const handleRemoveChatFromFolder = async (folderId: string, chatId: string) => {
    try {
      await folderService.removeChatFromFolder(folderId, chatId)
      setFolders(
        folders.map((f) => (f.id === folderId ? { ...f, chatIds: f.chatIds.filter((id) => id !== chatId) } : f))
      )
    } catch (error) {
      console.error("Error removing chat from folder:", error)
      alert("Ошибка удаления чата из папки")
    }
  }

  const handleSelectFolder = (folder: ChatFolder | null) => {
    setSelectedFolder(folder)
  }

  // Фильтрация контактов по выбранной папке
  const filteredContacts = selectedFolder
    ? contacts.filter((c) => selectedFolder.chatIds.includes(c.id))
    : contacts

  const handleUserProfile = (contact: Contact) => {
    setSelectedUser(contact)
    setShowUserProfile(true)
  }

  const handleStartChatFromProfile = (userId: string) => {
    setSelectedChat(userId)
    setShowUserProfile(false)
  }


  const handleChatMenuAction = (action: string, data?: any) => {
    console.log("Chat menu action:", action, data)

    switch (action) {
      case "info":
        if (selectedChat) {
          const contact = contacts.find((c) => c.id === selectedChat)
          if (contact) {
            handleUserProfile(contact)
          }
        }
        break

      case "search":
        if (data?.term) {
          // Фильтруем сообщения по поисковому запросу
          const filteredMessages = messages.filter((msg) => msg.text?.toLowerCase().includes(data.term.toLowerCase()))

          if (filteredMessages.length > 0) {
            alert(`🔍 Найдено ${filteredMessages.length} сообщений с текстом "${data.term}"`)
            // Здесь можно добавить подсветку найденных сообщений
          } else {
            alert(`🔍 Сообщения с текстом "${data.term}" не найдены`)
          }
        }
        break

      case "pin":
        const pinText = data?.pinned ? "📌 Чат закреплен" : "📌 Чат откреплен"
        alert(pinText)
        // Обновляем порядок чатов в списке
        break

      case "star":
        const starText = data?.starred ? "⭐ Добавлено в избранное" : "⭐ Убрано из избранного"
        alert(starText)
        break

      case "mute":
        const muteText = data?.muted ? "🔇 Уведомления отключены на 24 часа" : "🔔 Уведомления включены"
        alert(muteText)
        break

      case "archive":
        const archiveText = data?.archived ? "📦 Чат архивирован" : "📦 Чат разархивирован"
        alert(archiveText)

        // Если чат архивирован, убираем его из активного списка
        if (data?.archived && selectedChat === data.chatId) {
          setSelectedChat(null)
        }
        break

      case "copy":
        if (data?.success) {
          alert("🔗 Ссылка скопирована в буфер обмена")
        }
        break

      case "block":
        const blockText = data?.blocked
          ? "🚫 Пользователь заблокирован. Вы не будете получать от него сообщения"
          : "✅ Пользователь разблокирован"
        alert(blockText)

        // Если пользователь заблокирован, закрываем чат
        if (data?.blocked && selectedChat) {
          setSelectedChat(null)
        }
        break

      case "delete":
        if (data?.chatId) {
          // Удаляем контакт из БД
          handleRemoveContact(data.chatId)
          alert("🗑️ Чат удален")
          setSelectedChat(null)
        }
        break

      case "clear":
        alert("История сообщений очищена")
        setMessages([])
        break

      default:
        console.log("Unknown action:", action)
    }
  }

  const handleSendMessage = async (message: Message) => {
    try {
      let chatId = message.chatId

      // Для контактов получаем или создаем чат
      if (contacts.find((c) => c.id === chatId)) {
        let existingChatId = await messageService.getChatId(user.id, chatId)
        if (!existingChatId) {
          // Создаем новый чат
          existingChatId = await contactService.createPrivateChat(user.id, chatId)
        }
        if (existingChatId) {
          chatId = existingChatId
        }
      }

      if (chatId) {
        console.log("💾 Saving message to database:", message.text)
        await messageService.sendMessage(chatId, user.id, message.text || "", "text")
        console.log("✅ Message saved successfully")
      }

    } catch (error: any) {
      console.error("❌ Error sending message:", error)
      alert("Ошибка отправки сообщения. Попробуйте еще раз.")
    }
  }

  const loadMessages = async () => {
    if (!selectedChat || !user.id) return

    // ПРОВЕРЯЕМ КЭШ ПЕРВЫМ ДЕЛОМ - мгновенная загрузка!
    if (messagesCache.current[selectedChat]) {
      console.log("⚡ Loading messages from cache (instant!):", selectedChat)
      setMessages(messagesCache.current[selectedChat])
      setIsLoading(false)
      return
    }

    // Если в кэше нет - показываем индикатор загрузки
    setMessages([])
    setIsLoading(true)

    try {
      let actualChatId = selectedChat

      // Получаем реальный chat_id
      if (contacts.find((c) => c.id === selectedChat)) {
        const existingChatId = await messageService.getChatId(user.id, selectedChat)
        if (existingChatId) {
          actualChatId = existingChatId
        }
      }

      if (actualChatId) {
        console.log("📥 Loading messages for chat:", actualChatId)
        const messagesData = await messageService.getMessages(actualChatId, user.id)

        // Проверяем, что данные не пустые и имеют правильный формат
        if (Array.isArray(messagesData) && messagesData.length > 0) {
          // Преобразуем строковые даты в объекты Date
          const formattedMessages = messagesData.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            // Убедимся, что все необходимые поля присутствуют
            text: msg.text || "",
            sender: msg.sender || "Unknown",
            senderAvatar: msg.senderAvatar || "/placeholder.svg?height=32&width=32",
            senderLogin: msg.senderLogin || "unknown",
            isOwn: !!msg.isOwn,
            chatId: selectedChat, // Используем оригинальный chatId для UI
          }))

          // СОХРАНЯЕМ В КЭШ для следующего раза
          messagesCache.current[selectedChat] = formattedMessages
          setMessages(formattedMessages)
          console.log("✅ Messages loaded and cached:", formattedMessages.length)
        } else {
          // Если сообщений нет, показываем пустой чат
          console.log("ℹ️ No messages found for this chat")
          messagesCache.current[selectedChat] = []
          setMessages([])
        }
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error("❌ Error loading messages:", error)
      // При ошибке показываем пустой чат
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  // Сохраняем выбранный чат в localStorage
  useEffect(() => {
    if (selectedChat) {
      localStorage.setItem("100gram_selected_chat", selectedChat)
      console.log("💾 Selected chat saved to localStorage:", selectedChat)
    } else {
      localStorage.removeItem("100gram_selected_chat")
      console.log("🗑️ Selected chat removed from localStorage")
    }
  }, [selectedChat])

  // Загружаем сообщения при выборе чата
  useEffect(() => {
    if (selectedChat && user.id) {
      loadMessages()
    }
  }, [selectedChat, user.id])

  // Глобальная подписка на ВСЕ новые сообщения для текущего пользователя
  useEffect(() => {
    if (!user.id) return

    console.log("📡 Setting up GLOBAL real-time messages subscription for user:", user.id)

    const channel = supabase
      .channel(`user-messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload: any) => {
          console.log("📨 New message received via Realtime:", payload.new)

          const msgData = payload.new
          const senderId = msgData.sender_id
          
          let uiChatId: string = ""
          let senderInfo = null
          
          if (senderId === user.id) {
            const contact = contacts.find(c => messagesCache.current[c.id]?.some(m => m.chatId === c.id))
            if (!contact) {
              console.log("⏭️ Could not determine receiver, skipping")
              return
            }
            uiChatId = contact.id
            senderInfo = { name: user.name, login: user.login, avatar: user.avatar }
          } else {
            uiChatId = senderId
            const contact = contacts.find(c => c.id === senderId)
            senderInfo = contact ? 
              { name: contact.name, login: contact.login, avatar: contact.avatar } :
              { name: "Unknown", login: "unknown", avatar: "/placeholder.svg?height=32&width=32" }
          }

          if (!uiChatId) {
            console.log("⏭️ Could not determine chat ID, skipping")
            return
          }

          const currentSelectedChat = selectedChatRef.current

          setLastMessages((prevLastMessages) => ({
            ...prevLastMessages,
            [uiChatId]: {
              text: msgData.content || "",
              time: new Date(msgData.created_at),
              type: msgData.message_type,
            },
          }))

          if (currentSelectedChat !== uiChatId && senderId !== user.id) {
            setUnreadCounts((prev) => ({
              ...prev,
              [uiChatId]: (prev[uiChatId] || 0) + 1,
            }))

            const messagePreview = (msgData.content || "Новое сообщение").length > 50 ? 
              (msgData.content || "Новое сообщение").slice(0, 50) + "..." : 
              (msgData.content || "Новое сообщение")
            
            showNotification(
              `💬 ${senderInfo.name}`,
              messagePreview,
              senderInfo.avatar
            )
          }

          const newMessage = {
            id: msgData.id,
            text: msgData.content || "",
            timestamp: new Date(msgData.created_at),
            isOwn: senderId === user.id,
            sender: senderInfo.name,
            senderAvatar: senderInfo.avatar,
            senderLogin: senderInfo.login,
            chatId: uiChatId,
          }

          messagesCache.current[uiChatId] = [
            ...(messagesCache.current[uiChatId] || []),
            newMessage
          ].filter((msg, index, self) => 
            index === self.findIndex((m) => m.id === msg.id)
          )

          if (currentSelectedChat === uiChatId) {
            setMessages((prevMessages) => {
              if (prevMessages.find((m) => m.id === newMessage.id)) {
                return prevMessages
              }
              return [...prevMessages, newMessage]
            })
          }
        }
      )
      .subscribe((status: string) => {
        console.log("📡 Subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user.id, contacts])

  if (!isAuthenticated) {
    return <AuthModal isOpen={showAuth} onLogin={handleLogin} />
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar
          user={user}
          onProfileClick={() => setShowProfile(true)}
          onSearchClick={() => setShowSearch(true)}
          onFoldersClick={() => setShowFoldersModal(true)}
          onSettingsClick={() => setShowSettings(true)}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex-1 flex">
        {/* Chat List - full width on mobile when no chat selected, hidden when chat is open */}
        <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-80`}>
          <ChatList
            selectedChat={selectedChat}
            onChatSelect={setSelectedChat}
            contacts={contacts}
            user={user}
            lastMessages={lastMessages}
            unreadCounts={unreadCounts}
            onUserProfile={handleUserProfile}
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={handleSelectFolder}
          />
        </div>

        {/* Chat Window - full width on mobile when chat selected */}
        <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1`}>
          {selectedChat ? (
            <ChatWindow
              chatId={selectedChat}
              currentUser={user}
              contacts={contacts}
              messages={messages.filter((m) => m.chatId === selectedChat)}
              onSendMessage={handleSendMessage}
              onLoadMessages={loadMessages}
              onMenuAction={handleChatMenuAction}
              onBack={() => setSelectedChat(null)}
              isLoadingMessages={isLoading}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-600">Загрузка данных...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <img
                        src="/images/100gram-icon.png"
                        alt="100GRAM"
                        className="w-20 h-20 object-contain mx-auto mb-2"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">100GRAM</h2>
                    <p className="text-gray-600 mb-4">
                      {contacts.length === 0
                        ? "Найдите друзей по логину, чтобы начать общение"
                        : "Выберите чат для начала общения"}
                    </p>
                    {contacts.length === 0 && (
                      <button
                        onClick={() => setShowSearch(true)}
                        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all font-medium shadow-lg"
                      >
                        Найти друзей по логину
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <PermissionsModal isOpen={showPermissions} onComplete={handlePermissionsComplete} />

      <ProfileModal
        user={user}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onSave={async (updatedUser) => {
          try {
            console.log("💾 Updating user profile:", updatedUser)
            const updated = await authService.updateUser(user.id, {
              login: updatedUser.login,
              name: updatedUser.name,
              avatar: updatedUser.avatar,
              status: updatedUser.status,
            })
            setUser({ 
              ...user, 
              login: updated.login,
              name: updated.name, 
              avatar: updated.avatar,
              status: updated.status
            })
            console.log("✅ Profile updated successfully")
          } catch (error: any) {
            console.error("❌ Error updating profile:", error)
            alert("Ошибка обновления профиля: " + error.message)
          }
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        onUpdateSettings={(settings) => {
          console.log("Settings updated:", settings)
          alert("✅ Настройки сохранены")
        }}
      />

      <ContactSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onAddContact={handleAddContact}
        onStartChat={(contactId) => {
          setSelectedChat(contactId)
          setShowSearch(false)
        }}
        currentUser={user}
      />

      <FoldersModal
        isOpen={showFoldersModal}
        onClose={() => setShowFoldersModal(false)}
        folders={folders}
        contacts={contacts}
        onCreateFolder={handleCreateFolder}
        onEditFolder={handleEditFolder}
        onDeleteFolder={handleDeleteFolder}
        onAddChatToFolder={handleAddChatToFolder}
        onRemoveChatFromFolder={handleRemoveChatFromFolder}
        onSelectFolder={handleSelectFolder}
      />

      {selectedUser && (
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          user={selectedUser}
          currentUser={user}
          isContact={contacts.some((c) => c.id === selectedUser.id)}
          onAddContact={handleAddContact}
          onRemoveContact={handleRemoveContact}
          onStartChat={handleStartChatFromProfile}
        />
      )}

      {/* Mobile Bottom Navigation - visible only on mobile and only when not in a chat */}
      {!selectedChat && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
          <div className="flex justify-around items-center h-16 px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProfile(true)}
              className="flex flex-col items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-14 w-14 gap-1"
            >
              <img src={user.avatar || "/placeholder.svg"} alt="Profile" className="w-6 h-6 rounded-full" />
              <span className="text-[10px]">Профиль</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              className="flex flex-col items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-14 w-14 gap-1"
            >
              <Search className="h-6 w-6" />
              <span className="text-[10px]">Поиск</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFoldersModal(true)}
              className="flex flex-col items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-14 w-14 gap-1"
            >
              <Folder className="h-6 w-6" />
              <span className="text-[10px]">Папки</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMenu(true)}
              className="flex flex-col items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-14 w-14 gap-1"
            >
              <Settings className="h-6 w-6" />
              <span className="text-[10px]">Ещё</span>
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Menu Modal */}
      {showMobileMenu && (
        <div
          className="md:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-900 hover:bg-gray-100 h-14"
                onClick={() => {
                  setShowSettings(true)
                  setShowMobileMenu(false)
                }}
              >
                <Settings className="mr-3 h-5 w-5" />
                <span>Настройки</span>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:bg-red-50 h-14 mt-4"
                onClick={() => {
                  handleLogout()
                  setShowMobileMenu(false)
                }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
