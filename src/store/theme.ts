"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark"

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light"
        set({ theme: next })
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", next === "dark")
        }
      },
      setTheme: (t) => {
        set({ theme: t })
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", t === "dark")
        }
      },
    }),
    { name: "hn-theme" }
  )
)
