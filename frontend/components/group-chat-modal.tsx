"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Users, X, Camera, Plus } from "lucide-react"

interface Contact {
  id: string
  login: string
  name: string
  avatar: string
  isOnline: boolean
}

interface GroupChat {
  id: string
  name: string
  description: string
  avatar: string
  participants: Contact[]
  admin: string
  createdAt: Date
}

interface GroupChatModalProps {
  isOpen: boolean
  onClose: () => void
  contacts: Contact[]
  currentUser: any
  onCreateGroup: (group: GroupChat) => void
}

export function GroupChatModal({ isOpen, onClose, contacts, currentUser, onCreateGroup }: GroupChatModalProps) {
  const [step, setStep] = useState<"info" | "participants">("info")
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [groupAvatar, setGroupAvatar] = useState("")
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  const filteredContacts = contacts.filter((contact) => contact.login.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleParticipantToggle = (contactId: string) => {
    const newSelected = new Set(selectedParticipants)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
    } else {
      newSelected.add(contactId)
    }
    setSelectedParticipants(newSelected)
  }

  const generateGroupAvatar = () => {
    const avatarUrl = `/placeholder.svg?height=100&width=100&query=group ${groupName} ${Math.random()}`
    setGroupAvatar(avatarUrl)
  }

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedParticipants.size === 0) return

    const participants = contacts.filter((contact) => selectedParticipants.has(contact.id))

    const newGroup: GroupChat = {
      id: Date.now().toString(),
      name: groupName,
      description: groupDescription,
      avatar: groupAvatar || `/placeholder.svg?height=100&width=100&query=group ${groupName}`,
      participants: [
        {
          id: currentUser.id,
          login: currentUser.login,
          name: currentUser.name,
          avatar: currentUser.avatar,
          isOnline: true,
        },
        ...participants,
      ],
      admin: currentUser.id,
      createdAt: new Date(),
    }

    onCreateGroup(newGroup)
    handleClose()
  }

  const handleClose = () => {
    setStep("info")
    setGroupName("")
    setGroupDescription("")
    setGroupAvatar("")
    setSelectedParticipants(new Set())
    setSearchQuery("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border-white/20 text-white max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5" />
            {step === "info" ? "Создать группу" : "Добавить участников"}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {step === "info" ? "Введите информацию о группе" : `Выбрано участников: ${selectedParticipants.size}`}
          </DialogDescription>
        </DialogHeader>

        {step === "info" && (
          <div className="space-y-6">
            {/* Group Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white/20">
                  <AvatarImage src={groupAvatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-2xl">
                    {groupName.charAt(0).toUpperCase() || "G"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  onClick={generateGroupAvatar}
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full w-8 h-8"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Group Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name" className="text-white/80">
                  Название группы *
                </Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Введите название группы"
                  maxLength={50}
                />
                <div className="text-xs text-white/50 mt-1">{groupName.length}/50</div>
              </div>

              <div>
                <Label htmlFor="group-description" className="text-white/80">
                  Описание (необязательно)
                </Label>
                <Input
                  id="group-description"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Описание группы"
                  maxLength={100}
                />
                <div className="text-xs text-white/50 mt-1">{groupDescription.length}/100</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleClose} className="flex-1 text-white hover:bg-white/20">
                Отмена
              </Button>
              <Button
                onClick={() => setStep("participants")}
                disabled={!groupName.trim()}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Далее
              </Button>
            </div>
          </div>
        )}

        {step === "participants" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Поиск контактов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            {/* Selected Participants */}
            {selectedParticipants.size > 0 && (
              <div className="space-y-2">
                <Label className="text-white/80">Выбрано участников: {selectedParticipants.size}</Label>
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {Array.from(selectedParticipants).map((participantId) => {
                    const participant = contacts.find((c) => c.id === participantId)
                    if (!participant) return null
                    return (
                      <Badge
                        key={participantId}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center gap-1"
                      >
                        @{participant.login}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-4 h-4 p-0 hover:bg-white/20"
                          onClick={() => handleParticipantToggle(participantId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Contacts List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredContacts.length === 0 && (
                <div className="text-center py-8 text-white/50">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Контакты не найдены</p>
                </div>
              )}

              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => handleParticipantToggle(contact.id)}
                >
                  <Checkbox
                    checked={selectedParticipants.has(contact.id)}
                    onChange={() => handleParticipantToggle(contact.id)}
                    className="border-white/20"
                  />

                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        {contact.login.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black/20" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white">@{contact.login}</h3>
                    <p className="text-sm text-white/70">{contact.name}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("info")} className="flex-1 text-white hover:bg-white/20">
                Назад
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={selectedParticipants.size === 0}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать ({selectedParticipants.size})
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
