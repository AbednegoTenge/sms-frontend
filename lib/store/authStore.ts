import { create } from 'zustand'

interface User {
  id: string
  school_id: string
  full_name: string
  roles: string[]
  active_role: string
  must_change_password: boolean
}

interface AuthStore {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  hasRole: (role) => get().user?.roles.includes(role) ?? false,
  hasAnyRole: (roles) => roles.some((r) => get().user?.roles.includes(r)) ?? false,
}))
