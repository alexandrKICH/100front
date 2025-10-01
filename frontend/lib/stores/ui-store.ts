import { create } from "zustand"

interface GroupChat {
  id: string
  name: string
  description: string
  avatar: string
  participants: any[]
  admin: string
  createdAt: Date
}

interface Contact {
  id: string
  login: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
}

interface FriendRequest {
  id: string
  fromUser: {
    id: string
    login: string
    name: string
    avatar: string
  }
  message: string
  timestamp: number
}

interface UIState {
  // Модальные окна
  showProfile: boolean
  showAuth: boolean
  showPermissions: boolean
  showSearch: boolean
  showSettings: boolean
  showCall: boolean
  showIncomingCall: boolean
  showGroupModal: boolean
  showGroupInfo: boolean
  showThemes: boolean
  showUserProfile: boolean
  showFriendRequests: boolean

  // Данные для модальных окон
  callType: "voice" | "video"
  callContact: Contact | null
  currentCallId: string | null
  incomingCaller: Contact | null
  incomingCallType: "voice" | "video"
  incomingCallId: string | null
  selectedGroup: GroupChat | null
  selectedUser: Contact | null
  friendRequests: FriendRequest[]

  // Группы
  groups: GroupChat[]

  // Тема
  currentTheme: string

  // Действия для модальных окон
  setShowProfile: (show: boolean) => void
  setShowAuth: (show: boolean) => void
  setShowPermissions: (show: boolean) => void
  setShowSearch: (show: boolean) => void
  setShowSettings: (show: boolean) => void
  setShowCall: (show: boolean) => void
  setShowIncomingCall: (show: boolean) => void
  setShowGroupModal: (show: boolean) => void
  setShowGroupInfo: (show: boolean) => void
  setShowThemes: (show: boolean) => void
  setShowUserProfile: (show: boolean) => void
  setShowFriendRequests: (show: boolean) => void

  // Действия для данных
  setCallData: (contact: Contact | null, type: "voice" | "video", callId: string | null) => void
  setIncomingCallData: (caller: Contact | null, type: "voice" | "video", callId: string | null) => void
  setSelectedGroup: (group: GroupChat | null) => void
  setSelectedUser: (user: Contact | null) => void
  setFriendRequests: (requests: FriendRequest[]) => void
  addFriendRequest: (request: FriendRequest) => void
  removeFriendRequest: (requestId: string) => void
  setGroups: (groups: GroupChat[]) => void
  addGroup: (group: GroupChat) => void
  updateGroup: (groupId: string, updates: Partial<GroupChat>) => void
  removeGroup: (groupId: string) => void
  setCurrentTheme: (theme: string) => void

  // Сброс всех модальных окон
  closeAllModals: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Начальное состояние модальных окон
  showProfile: false,
  showAuth: true,
  showPermissions: false,
  showSearch: false,
  showSettings: false,
  showCall: false,
  showIncomingCall: false,
  showGroupModal: false,
  showGroupInfo: false,
  showThemes: false,
  showUserProfile: false,
  showFriendRequests: false,

  // Начальное состояние данных
  callType: "voice",
  callContact: null,
  currentCallId: null,
  incomingCaller: null,
  incomingCallType: "voice",
  incomingCallId: null,
  selectedGroup: null,
  selectedUser: null,
  friendRequests: [],
  groups: [],
  currentTheme: "default",

  // Действия для модальных окон
  setShowProfile: (show) => set({ showProfile: show }),
  setShowAuth: (show) => set({ showAuth: show }),
  setShowPermissions: (show) => set({ showPermissions: show }),
  setShowSearch: (show) => set({ showSearch: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowCall: (show) => set({ showCall: show }),
  setShowIncomingCall: (show) => set({ showIncomingCall: show }),
  setShowGroupModal: (show) => set({ showGroupModal: show }),
  setShowGroupInfo: (show) => set({ showGroupInfo: show }),
  setShowThemes: (show) => set({ showThemes: show }),
  setShowUserProfile: (show) => set({ showUserProfile: show }),
  setShowFriendRequests: (show) => set({ showFriendRequests: show }),

  // Действия для данных
  setCallData: (contact, type, callId) =>
    set({
      callContact: contact,
      callType: type,
      currentCallId: callId,
    }),

  setIncomingCallData: (caller, type, callId) =>
    set({
      incomingCaller: caller,
      incomingCallType: type,
      incomingCallId: callId,
    }),

  setSelectedGroup: (group) => set({ selectedGroup: group }),
  setSelectedUser: (user) => set({ selectedUser: user }),

  setFriendRequests: (requests) => set({ friendRequests: requests }),
  addFriendRequest: (request) => {
    const { friendRequests } = get()
    if (!friendRequests.find((r) => r.id === request.id)) {
      set({ friendRequests: [...friendRequests, request] })
    }
  },
  removeFriendRequest: (requestId) => {
    const { friendRequests } = get()
    set({ friendRequests: friendRequests.filter((r) => r.id !== requestId) })
  },

  setGroups: (groups) => set({ groups }),
  addGroup: (group) => {
    const { groups } = get()
    if (!groups.find((g) => g.id === group.id)) {
      set({ groups: [...groups, group] })
    }
  },
  updateGroup: (groupId, updates) => {
    const { groups } = get()
    set({
      groups: groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g)),
    })
  },
  removeGroup: (groupId) => {
    const { groups } = get()
    set({ groups: groups.filter((g) => g.id !== groupId) })
  },

  setCurrentTheme: (theme) => set({ currentTheme: theme }),

  closeAllModals: () =>
    set({
      showProfile: false,
      showPermissions: false,
      showSearch: false,
      showSettings: false,
      showCall: false,
      showIncomingCall: false,
      showGroupModal: false,
      showGroupInfo: false,
      showThemes: false,
      showUserProfile: false,
      showFriendRequests: false,
    }),
}))
