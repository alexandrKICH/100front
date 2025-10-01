"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mic, Video, Check, X, AlertTriangle } from "lucide-react"

interface PermissionsModalProps {
  isOpen: boolean
  onComplete: (granted: boolean) => void
}

export function PermissionsModal({ isOpen, onComplete }: PermissionsModalProps) {
  const [micPermission, setMicPermission] = useState<"pending" | "granted" | "denied">("pending")
  const [cameraPermission, setCameraPermission] = useState<"pending" | "granted" | "denied">("pending")
  const [isChecking, setIsChecking] = useState(false)

  const checkPermissions = async () => {
    setIsChecking(true)

    try {
      // Проверяем микрофон
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setMicPermission("granted")
        audioStream.getTracks().forEach((track) => track.stop())
      } catch (error) {
        setMicPermission("denied")
      }

      // Проверяем камеру
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
        setCameraPermission("granted")
        videoStream.getTracks().forEach((track) => track.stop())
      } catch (error) {
        setCameraPermission("denied")
      }
    } catch (error) {
      console.error("Error checking permissions:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleContinue = () => {
    const allGranted = micPermission === "granted" && cameraPermission === "granted"
    onComplete(allGranted)
  }

  const getPermissionIcon = (status: string) => {
    switch (status) {
      case "granted":
        return <Check className="h-5 w-5 text-green-400" />
      case "denied":
        return <X className="h-5 w-5 text-red-400" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
    }
  }

  const getPermissionText = (status: string) => {
    switch (status) {
      case "granted":
        return "Разрешено"
      case "denied":
        return "Запрещено"
      default:
        return "Ожидание"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Разрешения для 100GRAM</DialogTitle>
          <DialogDescription className="text-white/70 text-center">
            Доступ к микрофону и камере для звонков
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🎤📹</div>
            <p className="text-white/70">
              Для работы звонков и видеосвязи необходимо разрешить доступ к микрофону и камере
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Mic className="h-6 w-6 text-blue-400" />
                <div>
                  <h3 className="font-medium">Микрофон</h3>
                  <p className="text-sm text-white/70">Для голосовых звонков</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPermissionIcon(micPermission)}
                <span className="text-sm">{getPermissionText(micPermission)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Video className="h-6 w-6 text-purple-400" />
                <div>
                  <h3 className="font-medium">Камера</h3>
                  <p className="text-sm text-white/70">Для видеозвонков</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPermissionIcon(cameraPermission)}
                <span className="text-sm">{getPermissionText(cameraPermission)}</span>
              </div>
            </div>
          </div>

          {micPermission === "pending" && cameraPermission === "pending" && (
            <Button
              onClick={checkPermissions}
              disabled={isChecking}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isChecking ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Проверка разрешений...
                </div>
              ) : (
                "Запросить разрешения"
              )}
            </Button>
          )}

          {(micPermission !== "pending" || cameraPermission !== "pending") && (
            <div className="space-y-3">
              {(micPermission === "denied" || cameraPermission === "denied") && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Некоторые разрешения отклонены</span>
                  </div>
                  <p className="text-xs text-white/70 mt-1">Вы можете изменить разрешения в настройках браузера</p>
                </div>
              )}

              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Продолжить
              </Button>
            </div>
          )}

          <div className="text-xs text-white/50 text-center">
            💡 Разрешения можно изменить в любое время в настройках браузера
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
