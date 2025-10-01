"use client"

import { useEffect } from "react"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"

interface ToastProps {
  type: "success" | "error" | "info"
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function ToastNotification({ type, message, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  }

  const bgColors = {
    success: "bg-green-500/20 border-green-500/30",
    error: "bg-red-500/20 border-red-500/30",
    info: "bg-blue-500/20 border-blue-500/30",
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm ${bgColors[type]} text-white max-w-sm`}
      >
        {icons[type]}
        <p className="flex-1 text-sm">{message}</p>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors-smooth">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
