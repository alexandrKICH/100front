import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  login: string
  name: string
  avatar: string
  status: string
  isOnline: boolean
}

interface Contact {
  id: string
  login: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
}

interface UserState {
  // Состояние
  user: User | null
  contacts: Contact[]
  isAuthenticated: boolean
  isLoading: boolean

  // Действия
  setUser: (user: User) => void
  setContacts: (contacts: Contact[]) => void
  addContact: (contact: Contact) => void
  removeContact: (contactId: string) => void
  updateContactStatus: (contactId: string, isOnline: boolean) => void
  setAuthenticated: (authenticated: boolean) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      user: null,
      contacts: [],
      isAuthenticated: false,
      isLoading: false,

      // Действия
      setUser: (user) => {
        set({ user, isAuthenticated: true })
      },

      setContacts: (contacts) => {
        set({ contacts })
      },

      addContact: (contact) => {
        const { contacts } = get()
        if (!contacts.find((c) => c.id === contact.id)) {
          set({ contacts: [...contacts, contact] })
        }
      },

      removeContact: (contactId) => {
        const { contacts } = get()
        set({ contacts: contacts.filter((c) => c.id !== contactId) })
      },

      updateContactStatus: (contactId, isOnline) => {
        const { contacts } = get()
        set({
          contacts: contacts.map((c) =>
            c.id === contactId ? { ...c, isOnline, lastSeen: isOnline ? undefined : new Date() } : c,
          ),
        })
      },

      setAuthenticated: (authenticated) => {
        set({ isAuthenticated: authenticated })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      logout: () => {
        set({
          user: null,
          contacts: [],
          isAuthenticated: false,
          isLoading: false,
        })
      },
    }),
    {
      name: "100gram-user-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
