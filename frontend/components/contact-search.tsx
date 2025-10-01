"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageCircle } from "lucide-react"
import { contactService } from "@/lib/database"

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

interface ContactSearchProps {
  isOpen: boolean
  onClose: () => void
  onAddContact: (contact: Contact) => void
  onStartChat: (contactId: string) => void
  currentUser: User
}

export function ContactSearch({ isOpen, onClose, onAddContact, onStartChat, currentUser }: ContactSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Contact[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchUsers = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const users = await contactService.searchUsers(searchQuery, currentUser.id)
      const results = users.map((user: any) => ({
        id: user.id,
        login: user.login,
        name: user.name,
        avatar: user.avatar,
        isOnline: user.is_online,
        lastSeen: user.last_seen ? new Date(user.last_seen) : undefined,
      }))

      setSearchResults(results)
    } catch (error: any) {
      console.error("Search error:", error)
      alert("Ошибка поиска: " + error.message)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleStartChat = async (contact: Contact) => {
    try {
      console.log("💬 Starting chat with:", contact.login)

      // Добавляем контакт и сразу открываем чат
      try {
        await contactService.addContact(currentUser.id, contact.id)
        onAddContact(contact)
      } catch (dbError) {
        console.warn("⚠️ Contact may already exist:", dbError)
      }

      // Открываем чат с этим пользователем
      onStartChat(contact.id)
      
      // Закрываем окно поиска
      onClose()

      console.log("✅ Chat opened with:", contact.login)
    } catch (error: any) {
      console.error("Error starting chat:", error)
      alert("Ошибка открытия чата: " + error.message)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchUsers()
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        className={`w-full md:max-w-md bg-white backdrop-blur-lg border-t border-gray-200 md:border md:rounded-2xl rounded-t-3xl p-6 transition-all duration-300 shadow-xl ${isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0 md:scale-95'}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85vh' }}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6 md:hidden" />
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Search className="h-5 w-5" />
            Поиск пользователей
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Введите логин пользователя..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
            </div>
            <Button
              onClick={searchUsers}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="text-center py-8 text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Пользователи не найдены</p>
                <p className="text-sm">Попробуйте изменить запрос</p>
              </div>
            )}

            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {user.login.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">@{user.login}</h3>
                  <p className="text-sm text-gray-600">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    {user.isOnline ? (
                      <span className="text-green-500">онлайн</span>
                    ) : (
                      `был(а) ${user.lastSeen?.toLocaleDateString()}`
                    )}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleStartChat(user)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Написать
                </Button>
              </div>
            ))}
          </div>

          {!searchQuery && (
            <div className="text-center py-8 text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Введите логин для поиска</p>
              <p className="text-sm">Найдите друзей по их логину</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
