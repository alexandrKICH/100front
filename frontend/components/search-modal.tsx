"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search } from "lucide-react"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  messages: any[]
  onMessageSelect: (messageId: string) => void
}

export function SearchModal({ isOpen, onClose, messages, onMessageSelect }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const results = messages.filter((msg) => msg.text?.toLowerCase().includes(searchTerm.toLowerCase()))
    setSearchResults(results)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border-white/20 text-white max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Поиск сообщений
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Найдите сообщения по содержимому
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Введите текст для поиска..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {searchResults.length === 0 && searchTerm && (
              <div className="text-center text-white/50 py-8">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Сообщения не найдены</p>
              </div>
            )}

            {searchResults.map((message) => (
              <div
                key={message.id}
                onClick={() => {
                  onMessageSelect(message.id)
                  onClose()
                }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-blue-400">{message.sender}</span>
                  <span className="text-xs text-white/50">{formatDate(message.timestamp)}</span>
                </div>
                <p className="text-sm text-white/80 line-clamp-2">{message.text}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
