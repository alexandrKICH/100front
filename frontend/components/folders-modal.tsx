"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Folder, Plus, Edit2, Trash2, Check, X } from "lucide-react"

interface ChatFolder {
  id: string
  name: string
  userId: string
  chatIds: string[]
  createdAt: Date
}

interface Contact {
  id: string
  login: string
  name: string
  avatar: string
  isOnline: boolean
}

interface FoldersModalProps {
  isOpen: boolean
  onClose: () => void
  folders: ChatFolder[]
  contacts: Contact[]
  onCreateFolder: (name: string) => void
  onEditFolder: (folderId: string, newName: string) => void
  onDeleteFolder: (folderId: string) => void
  onAddChatToFolder: (folderId: string, chatId: string) => void
  onRemoveChatFromFolder: (folderId: string, chatId: string) => void
  onSelectFolder: (folder: ChatFolder | null) => void
}

export function FoldersModal({
  isOpen,
  onClose,
  folders,
  contacts,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onAddChatToFolder,
  onRemoveChatFromFolder,
  onSelectFolder,
}: FoldersModalProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [selectedFolderForManage, setSelectedFolderForManage] = useState<string | null>(null)

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName("")
      setIsCreating(false)
    }
  }

  const handleEditFolder = (folderId: string) => {
    if (editingName.trim()) {
      onEditFolder(folderId, editingName.trim())
      setEditingFolderId(null)
      setEditingName("")
    }
  }

  const startEditFolder = (folder: ChatFolder) => {
    setEditingFolderId(folder.id)
    setEditingName(folder.name)
  }

  const getFolderChatCount = (folder: ChatFolder) => {
    return folder.chatIds.length
  }

  const isContactInFolder = (folderId: string, contactId: string) => {
    const folder = folders.find((f) => f.id === folderId)
    return folder?.chatIds.includes(contactId) || false
  }

  const toggleChatInFolder = (folderId: string, chatId: string) => {
    if (isContactInFolder(folderId, chatId)) {
      onRemoveChatFromFolder(folderId, chatId)
    } else {
      onAddChatToFolder(folderId, chatId)
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={onClose}
    >
      <div
        className={`w-full md:max-w-md bg-white backdrop-blur-lg border-t border-gray-200 md:border md:rounded-2xl rounded-t-3xl p-6 transition-all duration-300 shadow-xl ${isOpen ? "translate-y-0" : "translate-y-full md:translate-y-0 md:scale-95"}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "85vh" }}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6 md:hidden" />

        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Folder className="h-5 w-5" />
            Папки чатов
          </h2>
          <p className="text-sm text-gray-600 mt-1">Организуйте чаты по папкам</p>
        </div>

        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "calc(85vh - 180px)" }}>
          {/* Кнопка "Все чаты" */}
          <button
            onClick={() => {
              onSelectFolder(null)
              onClose()
            }}
            className="w-full text-left p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all text-gray-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Folder className="h-5 w-5" />
                <span className="font-medium">Все чаты</span>
              </div>
              <span className="text-sm text-gray-500">{contacts.length}</span>
            </div>
          </button>

          {/* Список папок */}
          {folders.map((folder) => (
            <div key={folder.id} className="space-y-2">
              <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                {editingFolderId === folder.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleEditFolder(folder.id)}
                      className="flex-1 bg-white border-gray-300 text-gray-900"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditFolder(folder.id)}
                      className="text-green-400 hover:bg-green-500/20"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingFolderId(null)
                        setEditingName("")
                      }}
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        onSelectFolder(folder)
                        onClose()
                      }}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <Folder className="h-5 w-5 text-blue-500" />
                      <div>
                        <span className="font-medium text-gray-900">{folder.name}</span>
                        <p className="text-xs text-gray-500">
                          {getFolderChatCount(folder)} {getFolderChatCount(folder) === 1 ? "чат" : "чатов"}
                        </p>
                      </div>
                    </button>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedFolderForManage(selectedFolderForManage === folder.id ? null : folder.id)}
                        className="text-blue-400 hover:bg-blue-500/20 h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditFolder(folder)}
                        className="text-yellow-400 hover:bg-yellow-500/20 h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Удалить папку "${folder.name}"?`)) {
                            onDeleteFolder(folder.id)
                          }
                        }}
                        className="text-red-400 hover:bg-red-500/20 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Управление чатами в папке */}
              {selectedFolderForManage === folder.id && (
                <div className="ml-4 p-3 rounded-lg bg-gray-100 space-y-2">
                  <p className="text-xs text-gray-600 mb-2">Добавить/убрать чаты:</p>
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => toggleChatInFolder(folder.id, contact.id)}
                      className={`w-full text-left p-2 rounded transition-all ${
                        isContactInFolder(folder.id, contact.id)
                          ? "bg-blue-100 text-blue-900"
                          : "bg-white hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={contact.avatar} alt="" className="w-6 h-6 rounded-full" />
                        <span className="text-sm">{contact.name}</span>
                        {isContactInFolder(folder.id, contact.id) && <Check className="h-4 w-4 ml-auto text-blue-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Создание новой папки */}
          {isCreating ? (
            <div className="p-4 rounded-lg bg-gray-50 space-y-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
                placeholder="Название папки..."
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateFolder}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Создать
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false)
                    setNewFolderName("")
                  }}
                  variant="ghost"
                  className="text-gray-600 hover:bg-gray-100"
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Создать папку
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
