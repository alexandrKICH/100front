"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Save, Upload, X } from "lucide-react"
import { fileService } from "@/lib/database"

interface User {
  id: string
  login: string
  name: string
  avatar: string
  status: string
}

interface ProfileModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSave: (user: User) => void
}

export function ProfileModal({ user, isOpen, onClose, onSave }: ProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.status || "",
    username: user.login,
  })
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(user.avatar)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    onSave({
      ...user,
      login: formData.username,
      name: formData.name,
      avatar: currentAvatar,
      status: formData.bio,
    })
    onClose()
  }

  const handleAvatarUpload = async (file: File) => {
    if (!file) return

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      setUploadError("Пожалуйста, выберите изображение")
      return
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Файл слишком большой. Максимальный размер: 10MB")
      return
    }

    setIsUploadingAvatar(true)
    setUploadError(null)

    try {
      console.log("📸 Uploading avatar:", file.name, "Size:", (file.size / 1024).toFixed(2) + "KB")
      const avatarUrl = await fileService.uploadFile(file, user.id)
      console.log("✅ Avatar uploaded successfully:", avatarUrl.substring(0, 50) + "...")
      setCurrentAvatar(avatarUrl)
    } catch (error: any) {
      console.error("❌ Avatar upload error:", error)
      setUploadError("Ошибка загрузки фото. Попробуйте еще раз.")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900 max-w-md border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Редактировать профиль</DialogTitle>
          <DialogDescription className="text-gray-600">
            Измените свои личные данные
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={currentAvatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-blue-500 text-white text-2xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <Button
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 rounded-full w-8 h-8"
                title="Загрузить фото"
              >
                {isUploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>

            {uploadError && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{uploadError}</div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm text-gray-700">
                Имя
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="username" className="text-sm text-gray-700">
                Имя пользователя
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm text-gray-700">
                О себе
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1.5 resize-none"
                rows={3}
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1">{formData.bio.length}/200</div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
