"use client"

import { create } from "zustand"
import { authAPI } from "@/lib/api"

interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
  initialized: boolean

  init: () => void
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false,

  init: () => {
    if (typeof window === "undefined") return
    const token = localStorage.getItem("hn_token")
    const userStr = localStorage.getItem("hn_user")
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ user, token, initialized: true })
      } catch {
        localStorage.removeItem("hn_token")
        localStorage.removeItem("hn_user")
        set({ initialized: true })
      }
    } else {
      set({ initialized: true })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const data = await authAPI.login({ email, password })
      localStorage.setItem("hn_token", data.token)
      localStorage.setItem("hn_user", JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "লগইন ব্যর্থ হয়েছে", loading: false })
      throw err
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null })
    try {
      const data = await authAPI.register({ name, email, password })
      localStorage.setItem("hn_token", data.token)
      localStorage.setItem("hn_user", JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
    } catch (err: any) {
      set({ error: err.response?.data?.error || "নিবন্ধন ব্যর্থ হয়েছে", loading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem("hn_token")
    localStorage.removeItem("hn_user")
    // Also clear finance data
    localStorage.removeItem("hisabnkash-v1")
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))
