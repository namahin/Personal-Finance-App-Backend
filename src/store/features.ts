"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Account, Recurring, SavingsGoal, Tag } from "@/types"
import { accountsAPI, recurringAPI, savingsAPI, tagsAPI } from "@/lib/api"
import { generateId, today } from "@/lib/utils"

interface FeaturesStore {
  accounts: Account[]
  recurrings: Recurring[]
  savingsGoals: SavingsGoal[]
  tags: Tag[]
  useAPI: boolean

  setUseAPI: (v: boolean) => void
  syncFeatures: () => Promise<void>

  // Accounts
  addAccount: (data: Omit<Account, "id" | "createdAt" | "balance">) => Promise<void>
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>
  deleteAccount: (id: string) => Promise<void>

  // Recurring
  addRecurring: (data: Omit<Recurring, "id" | "createdAt" | "active" | "lastRunDate">) => Promise<void>
  updateRecurring: (id: string, data: Partial<Recurring>) => Promise<void>
  toggleRecurring: (id: string) => Promise<void>
  runRecurring: (id: string, date?: string) => Promise<void>
  deleteRecurring: (id: string) => Promise<void>

  // Savings
  addSavingsGoal: (data: Omit<SavingsGoal, "id" | "createdAt" | "completed" | "currentAmount">) => Promise<void>
  updateSavingsGoal: (id: string, data: Partial<SavingsGoal>) => Promise<void>
  contributeSavings: (id: string, amount: number) => Promise<void>
  deleteSavingsGoal: (id: string) => Promise<void>

  // Tags
  addTag: (name: string, color?: string) => Promise<void>
  updateTag: (id: string, data: Partial<Tag>) => Promise<void>
  deleteTag: (id: string) => Promise<void>
}

export const useFeaturesStore = create<FeaturesStore>()(
  persist(
    (set, get) => ({
      accounts: [], recurrings: [], savingsGoals: [], tags: [],
      useAPI: false,

      setUseAPI: (v) => set({ useAPI: v }),

      syncFeatures: async () => {
        try {
          const [accounts, recurrings, savingsGoals, tags] = await Promise.all([
            accountsAPI.getAll(), recurringAPI.getAll(), savingsAPI.getAll(), tagsAPI.getAll(),
          ])
          set({ accounts, recurrings, savingsGoals, tags })
        } catch (e) { console.error("Features sync failed", e) }
      },

      // ─── Accounts ───────────────────────────────────────
      addAccount: async (data) => {
        if (get().useAPI) {
          const acc = await accountsAPI.create(data)
          set((s) => ({ accounts: [...s.accounts, acc] }))
        } else {
          const acc: Account = { ...data, id: generateId(), createdAt: today(), balance: data.openingBalance }
          set((s) => ({ accounts: [...s.accounts, acc] }))
        }
      },
      updateAccount: async (id, data) => {
        if (get().useAPI) await accountsAPI.update(id, data)
        set((s) => ({ accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)) }))
      },
      deleteAccount: async (id) => {
        if (get().useAPI) await accountsAPI.delete(id)
        set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }))
      },

      // ─── Recurring ──────────────────────────────────────
      addRecurring: async (data) => {
        if (get().useAPI) {
          const rec = await recurringAPI.create(data)
          set((s) => ({ recurrings: [rec, ...s.recurrings] }))
        } else {
          const rec: Recurring = { ...data, id: generateId(), createdAt: today(), active: true }
          set((s) => ({ recurrings: [rec, ...s.recurrings] }))
        }
      },
      updateRecurring: async (id, data) => {
        if (get().useAPI) await recurringAPI.update(id, data)
        set((s) => ({ recurrings: s.recurrings.map((r) => (r.id === id ? { ...r, ...data } : r)) }))
      },
      toggleRecurring: async (id) => {
        if (get().useAPI) await recurringAPI.toggle(id)
        set((s) => ({ recurrings: s.recurrings.map((r) => (r.id === id ? { ...r, active: !r.active } : r)) }))
      },
      runRecurring: async (id, date) => {
        if (get().useAPI) {
          await recurringAPI.run(id, date)
          set((s) => ({ recurrings: s.recurrings.map((r) => (r.id === id ? { ...r, lastRunDate: date || today() } : r)) }))
        }
      },
      deleteRecurring: async (id) => {
        if (get().useAPI) await recurringAPI.delete(id)
        set((s) => ({ recurrings: s.recurrings.filter((r) => r.id !== id) }))
      },

      // ─── Savings ────────────────────────────────────────
      addSavingsGoal: async (data) => {
        if (get().useAPI) {
          const goal = await savingsAPI.create(data)
          set((s) => ({ savingsGoals: [goal, ...s.savingsGoals] }))
        } else {
          const goal: SavingsGoal = { ...data, id: generateId(), createdAt: today(), completed: false, currentAmount: 0 }
          set((s) => ({ savingsGoals: [goal, ...s.savingsGoals] }))
        }
      },
      updateSavingsGoal: async (id, data) => {
        if (get().useAPI) await savingsAPI.update(id, data)
        set((s) => ({ savingsGoals: s.savingsGoals.map((g) => (g.id === id ? { ...g, ...data } : g)) }))
      },
      contributeSavings: async (id, amount) => {
        if (get().useAPI) {
          const goal = await savingsAPI.contribute(id, amount)
          set((s) => ({ savingsGoals: s.savingsGoals.map((g) => (g.id === id ? goal : g)) }))
        } else {
          set((s) => ({
            savingsGoals: s.savingsGoals.map((g) => {
              if (g.id !== id) return g
              const newAmount = g.currentAmount + amount
              return { ...g, currentAmount: newAmount, completed: newAmount >= g.targetAmount }
            }),
          }))
        }
      },
      deleteSavingsGoal: async (id) => {
        if (get().useAPI) await savingsAPI.delete(id)
        set((s) => ({ savingsGoals: s.savingsGoals.filter((g) => g.id !== id) }))
      },

      // ─── Tags ───────────────────────────────────────────
      addTag: async (name, color = "#6b7280") => {
        if (get().useAPI) {
          const tag = await tagsAPI.create({ name, color })
          set((s) => ({ tags: [...s.tags, tag] }))
        } else {
          const tag: Tag = { id: generateId(), name, color, createdAt: today() }
          set((s) => ({ tags: [...s.tags, tag] }))
        }
      },
      updateTag: async (id, data) => {
        if (get().useAPI) await tagsAPI.update(id, data)
        set((s) => ({ tags: s.tags.map((t) => (t.id === id ? { ...t, ...data } : t)) }))
      },
      deleteTag: async (id) => {
        if (get().useAPI) await tagsAPI.delete(id)
        set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }))
      },
    }),
    { name: "hn-features-v1" }
  )
)
