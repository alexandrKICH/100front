"use client"

import { useState } from "react"

interface User {
  id: string
  login: string
  name: string
  avatar: string
  description?: string
  phone?: string
  isOnline: boolean
  lastSeen?: string
}

interface UserProfileProps {
  user: User
  isOwn?: boolean
  onEditProfile?: () => void
  onMessage?: () => void
  onCall?: () => void
  onAddContact?: () => void
  onBlock?: () => void
  onDelete?: () => void
  onClose: () => void
}

export default function UserProfile({
  user,
  isOwn = false,
  onEditProfile,
  onMessage,
  onCall,
  onAddContact,
  onBlock,
  onDelete,
  onClose
}: UserProfileProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 md:bg-black/40"
      onClick={onClose}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`
          bg-white dark:bg-[#18181c]
          rounded-t-3xl md:rounded-2xl
          shadow-xl
          w-full md:max-w-md
          md:w-full
          p-0 md:p-6
          max-h-screen
          flex flex-col
          transition-all
          ${typeof window !== "undefined" && window.innerWidth < 768 ? "absolute bottom-0 h-[94vh]" : "relative"}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Закрыть */}
        <button className="absolute top-5 right-5 md:top-4 md:right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl" onClick={onClose}>✕</button>
        {/* Аватар */}
        <div className="flex flex-col items-center gap-2 mt-8 md:mt-6 mb-3">
          <img
            src={user.avatar || "/placeholder.svg"}
            alt="avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-300 dark:border-blue-600 shadow"
            draggable={false}
          />
          <div className="text-xl md:text-lg font-bold text-gray-900 dark:text-white mt-2">{user.name}</div>
          <div className="text-gray-500 text-base">{user.login}</div>
          <div className="text-sm text-gray-500">
            {user.isOnline ? "онлайн" : user.lastSeen ? `был(а) ${user.lastSeen}` : "не в сети"}
          </div>
          {user.description && <div className="text-center text-gray-600 dark:text-gray-300 my-2 text-sm">{user.description}</div>}

        </div>
        {/* Кнопки действий */}
        <div className="flex justify-center gap-3 mt-4">
          {isOwn ? (
            <button
              onClick={onEditProfile}
              className="px-5 py-2 bg-blue-500 text-white rounded-full font-medium shadow hover:bg-blue-600"
            >
              Изменить
            </button>
          ) : (
            <>
              <button
                onClick={onMessage}
                className="px-5 py-2 bg-blue-500 text-white rounded-full font-medium shadow hover:bg-blue-600"
              >
                Сообщение
              </button>
              <button
                onClick={onCall}
                className="px-5 py-2 bg-green-500 text-white rounded-full font-medium shadow hover:bg-green-600"
              >
                Позвонить
              </button>
            </>
          )}
        </div>
        {/* Ещё действия */}
        {!isOwn && (
          <div className="flex justify-center mt-3 mb-1">
            <button onClick={() => setShowActions(v => !v)} className="text-blue-500 underline text-sm">
              {showActions ? "Скрыть действия" : "Ещё"}
            </button>
          </div>
        )}
        {!isOwn && showActions && (
          <div className="flex flex-col items-center gap-1 mt-0 mb-2">
            <button onClick={onAddContact} className="text-sm text-gray-700 dark:text-blue-200 hover:text-blue-600">Добавить в контакты</button>
            <button onClick={onBlock} className="text-sm text-red-500 hover:text-red-700">Заблокировать</button>
            <button onClick={onDelete} className="text-sm text-gray-500 hover:text-red-400">Удалить контакт</button>
          </div>
        )}
        {/* ID копия */}
        <div className="flex justify-center mt-3 mb-3">
          <button
            onClick={() => { navigator.clipboard.writeText(user.id); alert("ID скопирован!"); }}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-blue-400"
          >
            ID: {user.id} (копировать)
          </button>
        </div>
        {/* Для мобильных - отступ снизу для жестов */}
        <div className="h-5 md:hidden" />
      </div>
    </div>
  )
}
