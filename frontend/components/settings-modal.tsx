"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Bell, Shield, Volume2, Mic, Video } from "lucide-react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onUpdateSettings: (settings: any) => void
}

export function SettingsModal({ isOpen, onClose, user, onUpdateSettings }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    notifications: {
      sound: true,
      vibration: true,
      calls: true,
      messages: true,
    },
    privacy: {
      onlineStatus: true,
      lastSeen: true,
      readReceipts: true,
      typing: true,
    },
    media: {
      autoDownload: true,
      compression: true,
      quality: "high",
    },
    calls: {
      camera: "front",
      microphone: true,
      speaker: true,
      noise: false,
    },
  })

  const handleSave = () => {
    onUpdateSettings(settings)
    localStorage.setItem("100gram_settings", JSON.stringify(settings))
    onClose()
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border-white/20 text-white max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Управление параметрами приложения
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10">
            <TabsTrigger value="general" className="data-[state=active]:bg-white/20">
              <Settings className="h-4 w-4 mr-1" />
              Общие
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white/20">
              <Bell className="h-4 w-4 mr-1" />
              Уведомления
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-white/20">
              <Shield className="h-4 w-4 mr-1" />
              Приватность
            </TabsTrigger>
            <TabsTrigger value="calls" className="data-[state=active]:bg-white/20">
              <Video className="h-4 w-4 mr-1" />
              Звонки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Аккаунт</h3>

              <div className="space-y-3">
                <div>
                  <Label className="text-white/80">Логин</Label>
                  <Input value={user.login} disabled className="bg-white/10 border-white/20 text-white/50" />
                </div>

                <div>
                  <Label className="text-white/80">Имя</Label>
                  <Input value={user.name} className="bg-white/10 border-white/20 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Язык и регион</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/80">Язык</Label>
                    <select className="w-full p-2 bg-white/10 border border-white/20 rounded text-white">
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                      <option value="uk">Українська</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-white/80">Часовой пояс</Label>
                    <select className="w-full p-2 bg-white/10 border border-white/20 rounded text-white">
                      <option value="auto">Автоматически</option>
                      <option value="msk">Москва (UTC+3)</option>
                      <option value="kyiv">Киев (UTC+2)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Уведомления
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Звук уведомлений</Label>
                    <p className="text-sm text-white/70">Воспроизводить звук при получении сообщений</p>
                  </div>
                  <Switch
                    checked={settings.notifications.sound}
                    onCheckedChange={(checked) => updateSetting("notifications", "sound", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Вибрация</Label>
                    <p className="text-sm text-white/70">Вибрировать при уведомлениях</p>
                  </div>
                  <Switch
                    checked={settings.notifications.vibration}
                    onCheckedChange={(checked) => updateSetting("notifications", "vibration", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Уведомления о звонках</Label>
                    <p className="text-sm text-white/70">Показывать входящие звонки</p>
                  </div>
                  <Switch
                    checked={settings.notifications.calls}
                    onCheckedChange={(checked) => updateSetting("notifications", "calls", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Уведомления о сообщениях</Label>
                    <p className="text-sm text-white/70">Показывать новые сообщения</p>
                  </div>
                  <Switch
                    checked={settings.notifications.messages}
                    onCheckedChange={(checked) => updateSetting("notifications", "messages", checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Приватность
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Статус "в сети"</Label>
                    <p className="text-sm text-white/70">Показывать когда вы онлайн</p>
                  </div>
                  <Switch
                    checked={settings.privacy.onlineStatus}
                    onCheckedChange={(checked) => updateSetting("privacy", "onlineStatus", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Время последнего посещения</Label>
                    <p className="text-sm text-white/70">Показывать когда вы были в сети</p>
                  </div>
                  <Switch
                    checked={settings.privacy.lastSeen}
                    onCheckedChange={(checked) => updateSetting("privacy", "lastSeen", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Отметки о прочтении</Label>
                    <p className="text-sm text-white/70">Показывать что сообщения прочитаны</p>
                  </div>
                  <Switch
                    checked={settings.privacy.readReceipts}
                    onCheckedChange={(checked) => updateSetting("privacy", "readReceipts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Индикатор набора</Label>
                    <p className="text-sm text-white/70">Показывать когда вы печатаете</p>
                  </div>
                  <Switch
                    checked={settings.privacy.typing}
                    onCheckedChange={(checked) => updateSetting("privacy", "typing", checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calls" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Video className="h-5 w-5" />
                Звонки и видео
              </h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-white">Камера по умолчанию</Label>
                  <select
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white mt-1"
                    value={settings.calls.camera}
                    onChange={(e) => updateSetting("calls", "camera", e.target.value)}
                  >
                    <option value="front">Фронтальная</option>
                    <option value="back">Основная</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Микрофон
                    </Label>
                    <p className="text-sm text-white/70">Включать микрофон при звонках</p>
                  </div>
                  <Switch
                    checked={settings.calls.microphone}
                    onCheckedChange={(checked) => updateSetting("calls", "microphone", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Динамик
                    </Label>
                    <p className="text-sm text-white/70">Включать динамик при звонках</p>
                  </div>
                  <Switch
                    checked={settings.calls.speaker}
                    onCheckedChange={(checked) => updateSetting("calls", "speaker", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Шумоподавление</Label>
                    <p className="text-sm text-white/70">Убирать фоновый шум</p>
                  </div>
                  <Switch
                    checked={settings.calls.noise}
                    onCheckedChange={(checked) => updateSetting("calls", "noise", checked)}
                  />
                </div>

                <div>
                  <Label className="text-white">Качество видео</Label>
                  <select
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white mt-1"
                    value={settings.media.quality}
                    onChange={(e) => updateSetting("media", "quality", e.target.value)}
                  >
                    <option value="low">Низкое (экономия трафика)</option>
                    <option value="medium">Среднее</option>
                    <option value="high">Высокое</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={onClose} className="flex-1 text-white hover:bg-white/20">
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
