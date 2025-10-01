"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserMinus, Crown, Phone, Video, Edit, Save, X } from "lucide-react"

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

interface GroupInfoModalProps {
  isOpen: boolean
  onClose: () => void
  group: GroupChat
  currentUser: any
  onUpdateGroup: (group: GroupChat) => void
  onLeaveGroup: (groupId: string) => void
  onStartCall: (group: GroupChat, type: "voice" | "video") => void
}

export function GroupInfoModal({
  isOpen,
  onClose,
  group,
  currentUser,
  onUpdateGroup,
  onLeaveGroup,
  onStartCall,
}: GroupInfoModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(group.name)
  const [editDescription, setEditDescription] = useState(group.description)

  const isAdmin = group.admin === currentUser.id
  const participantCount = group.participants.length

  const handleSaveChanges = () => {
    const updatedGroup = {
      ...group,
      name: editName,
      description: editDescription,
    }
    onUpdateGroup(updatedGroup)
    setIsEditing(false)
  }

  const handleRemoveParticipant = (participantId: string) => {
    if (!isAdmin || participantId === currentUser.id) return

    const updatedGroup = {
      ...group,
      participants: group.participants.filter((p) => p.id !== participantId),
    }
    onUpdateGroup(updatedGroup)
  }

  const handleLeaveGroup = () => {
    onLeaveGroup(group.id)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border-white/20 text-white max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Информация о группе
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Просмотр и управление группой {group.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="info" className="data-[state=active]:bg-white/20">
              Информация
            </TabsTrigger>
            <TabsTrigger value="participants" className="data-[state=active]:bg-white/20">
              Участники ({participantCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-6">
            {/* Group Avatar and Info */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 border-4 border-white/20">
                <AvatarImage src={group.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-2xl">
                  {group.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {!isEditing ? (
                <div className="text-center">
                  <h2 className="text-xl font-bold">{group.name}</h2>
                  {group.description && <p className="text-white/70 mt-1">{group.description}</p>}
                  <p className="text-sm text-white/50 mt-2">Создана {group.createdAt.toLocaleDateString("ru-RU")}</p>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white text-center font-bold"
                    maxLength={50}
                  />
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="bg-white/10 border-white/20 text-white text-center"
                    placeholder="Описание группы"
                    maxLength={100}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isEditing ? (
                <>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onStartCall(group, "voice")}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Голосовой звонок
                    </Button>
                    <Button
                      onClick={() => onStartCall(group, "video")}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Видеозвонок
                    </Button>
                  </div>

                  {isAdmin && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="ghost"
                      className="w-full text-white hover:bg-white/20"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать группу
                    </Button>
                  )}

                  <Button
                    onClick={handleLeaveGroup}
                    variant="ghost"
                    className="w-full text-red-400 hover:bg-red-500/20"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Покинуть группу
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="ghost"
                    className="flex-1 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Отмена
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4 mt-6">
            <div className="max-h-80 overflow-y-auto space-y-2">
              {group.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        {participant.login.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black/20" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">@{participant.login}</h3>
                      {participant.id === group.admin && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Админ
                        </Badge>
                      )}
                      {participant.id === currentUser.id && (
                        <Badge className="bg-white/20 text-white text-xs">Вы</Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/70">{participant.name}</p>
                  </div>

                  {isAdmin && participant.id !== currentUser.id && participant.id !== group.admin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveParticipant(participant.id)}
                      className="text-red-400 hover:bg-red-500/20"
                      title="Удалить из группы"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
