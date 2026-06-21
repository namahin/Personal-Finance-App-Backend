"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { translations, type Lang, type TranslationKey } from "@/lib/i18n"

interface LangStore {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

export const useLangStore = create<LangStore>()(
  persist(
    (set, get) => ({
      lang: "bn",
      setLang: (lang) => set({ lang }),
      t: (key) => translations[get().lang][key] as string,
    }),
    { name: "hn-lang" }
  )
)
