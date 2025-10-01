"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Folder,
  Search,
  Settings,
  LogOut,
  Star,
  Archive,
  Bookmark,
  Bell,
  Shield,
  HelpCircle,
  Info,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps {
  user: any
  onProfileClick: () => void
  onSearchClick: () => void
  onFoldersClick: () => void
  onSettingsClick: () => void
  onLogout: () => void
}

export function Sidebar({
  user,
  onProfileClick,
  onSearchClick,
  onFoldersClick,
  onSettingsClick,
  onLogout,
}: SidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
      {/* User Avatar */}
      <button
        onClick={onProfileClick}
        className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-200 transition-all"
      >
        <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-full h-full object-cover" />
      </button>

      {/* Navigation Icons */}
      <div className="flex flex-col space-y-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchClick}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-10 h-10"
          title="Поиск контактов"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onFoldersClick}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-10 h-10"
          title="Папки для чатов"
        >
          <Folder className="h-5 w-5" />
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Menu */}
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-10 h-10">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="end"
          className="w-56 bg-white border-gray-200"
        >
          <DropdownMenuItem onClick={onSettingsClick} className="hover:bg-gray-100">
            <Settings className="mr-2 h-4 w-4" />
            <span>Настройки</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-200" />

          <DropdownMenuItem className="hover:bg-gray-100">
            <Archive className="mr-2 h-4 w-4" />
            <span>Архивированные</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="hover:bg-gray-100">
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Сохраненные</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-200" />

          <DropdownMenuItem className="hover:bg-gray-100">
            <Bell className="mr-2 h-4 w-4" />
            <span>Уведомления</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="hover:bg-gray-100">
            <Shield className="mr-2 h-4 w-4" />
            <span>Конфиденциальность</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-200" />

          <DropdownMenuItem className="hover:bg-gray-100">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Помощь</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="hover:bg-gray-100">
            <Info className="mr-2 h-4 w-4" />
            <span>О программе</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-200" />

          <DropdownMenuItem onClick={onLogout} className="hover:bg-red-50 text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Выйти</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
