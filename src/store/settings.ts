"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Contact, Category, Medium } from "@/types"
import { contactsAPI, categoriesAPI, mediumsAPI } from "@/lib/api"
import { generateId, today } from "@/lib/utils"

interface SettingsStore {
  contacts: Contact[]
  categories: Category[]
  mediums: Medium[]
  useAPI: boolean

  setUseAPI: (v: boolean) => void
  syncSettings: () => Promise<void>

  // Contacts
  addContact: (name: string, phone?: string, type?: "person" | "organization") => Promise<Contact>
  updateContact: (id: string, data: Partial<Contact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  findOrCreateContact: (name: string, phone?: string) => Promise<Contact>

  // Categories
  addCategory: (name: string, forType: "income" | "expense" | "both", color?: string) => Promise<void>
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  // Mediums
  addMedium: (name: string) => Promise<void>
  updateMedium: (id: string, name: string) => Promise<void>
  deleteMedium: (id: string) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      contacts: [],
      categories: [],
      mediums: [],
      useAPI: false,

      setUseAPI: (v) => set({ useAPI: v }),

      syncSettings: async () => {
        try {
          const [contacts, categories, mediums] = await Promise.all([
            contactsAPI.getAll(),
            categoriesAPI.getAll(),
            mediumsAPI.getAll(),
          ])
          set({ contacts, categories, mediums })
        } catch (e) {
          console.error("Settings sync failed", e)
        }
      },

      // ─── Contacts ───────────────────────────────────────
      addContact: async (name, phone = "", type = "person") => {
        if (get().useAPI) {
          const c = await contactsAPI.create({ name, phone, type })
          set((s) => ({
            contacts: s.contacts.find((x) => x.id === c.id)
              ? s.contacts.map((x) => (x.id === c.id ? c : x))
              : [...s.contacts, c],
          }))
          return c
        } else {
          const c: Contact = { id: generateId(), name, phone, type, createdAt: today() }
          set((s) => ({ contacts: [...s.contacts.filter((x) => x.name !== name), c] }))
          return c
        }
      },

      updateContact: async (id, data) => {
        if (get().useAPI) await contactsAPI.update(id, data)
        set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)) }))
      },

      deleteContact: async (id) => {
        if (get().useAPI) await contactsAPI.delete(id)
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) }))
      },

      findOrCreateContact: async (name, phone = "") => {
        const existing = get().contacts.find((c) => c.name.toLowerCase() === name.toLowerCase())
        if (existing) {
          // update phone if provided
          if (phone && phone !== existing.phone) {
            await get().updateContact(existing.id, { phone })
            return { ...existing, phone }
          }
          return existing
        }
        return get().addContact(name, phone)
      },

      // ─── Categories ─────────────────────────────────────
      addCategory: async (name, forType, color = "#6b7280") => {
        if (get().useAPI) {
          const c = await categoriesAPI.create({ name, forType, color })
          set((s) => ({ categories: [...s.categories, c] }))
        } else {
          const c: Category = { id: generateId(), name, forType, color, createdAt: today() }
          set((s) => ({ categories: [...s.categories, c] }))
        }
      },

      updateCategory: async (id, data) => {
        if (get().useAPI) await categoriesAPI.update(id, data)
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)) }))
      },

      deleteCategory: async (id) => {
        if (get().useAPI) await categoriesAPI.delete(id)
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
      },

      // ─── Mediums ────────────────────────────────────────
      addMedium: async (name) => {
        if (get().useAPI) {
          const m = await mediumsAPI.create({ name })
          set((s) => ({ mediums: [...s.mediums, m] }))
        } else {
          const m: Medium = { id: generateId(), name, createdAt: today() }
          set((s) => ({ mediums: [...s.mediums, m] }))
        }
      },

      updateMedium: async (id, name) => {
        if (get().useAPI) await mediumsAPI.update(id, { name })
        set((s) => ({ mediums: s.mediums.map((m) => (m.id === id ? { ...m, name } : m)) }))
      },

      deleteMedium: async (id) => {
        if (get().useAPI) await mediumsAPI.delete(id)
        set((s) => ({ mediums: s.mediums.filter((m) => m.id !== id) }))
      },
    }),
    { name: "hn-settings-v1" }
  )
)
