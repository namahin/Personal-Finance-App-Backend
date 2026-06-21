"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AppData, Income, Expense, Lend, Borrow } from "@/types"
import { generateId, today } from "@/lib/utils"
import { incomeAPI, expenseAPI, lendAPI, borrowAPI, budgetAPI } from "@/lib/api"

type LoadState = "idle" | "loading" | "loaded" | "error"

interface FinanceStore extends AppData {
  loadState: LoadState
  syncError: string | null
  useAPI: boolean
  syncAll: () => Promise<void>
  setUseAPI: (v: boolean) => void
  // Income
  addIncome: (data: Omit<Income, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateIncome: (id: string, data: Partial<Income>) => Promise<void>
  deleteIncome: (id: string) => Promise<void>
  // Expense
  addExpense: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  // Lend
  addLend: (data: Omit<Lend, "id" | "paid" | "createdAt" | "updatedAt">) => Promise<void>
  updateLend: (id: string, data: Partial<Lend>) => Promise<void>
  deleteLend: (id: string) => Promise<void>
  markLendPaid: (id: string) => Promise<void>
  // Borrow
  addBorrow: (data: Omit<Borrow, "id" | "paid" | "createdAt" | "updatedAt">) => Promise<void>
  updateBorrow: (id: string, data: Partial<Borrow>) => Promise<void>
  deleteBorrow: (id: string) => Promise<void>
  markBorrowPaid: (id: string) => Promise<void>
  // Budget
  setBudget: (month: string, category: string, amount: number) => Promise<void>
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      income: [], expense: [], lend: [], borrow: [], budgets: {},
      loadState: "idle", syncError: null, useAPI: false,

      setUseAPI: (v) => set({ useAPI: v }),

      syncAll: async () => {
        set({ loadState: "loading", syncError: null })
        try {
          const [income, expense, lend, borrow] = await Promise.all([
            incomeAPI.getAll(), expenseAPI.getAll(), lendAPI.getAll(), borrowAPI.getAll(),
          ])
          set({ income, expense, lend, borrow, loadState: "loaded" })
        } catch (err: any) {
          set({ loadState: "error", syncError: err.message || "সিঙ্ক ব্যর্থ" })
        }
      },

      // Income
      addIncome: async (data) => {
        if (get().useAPI) {
          const item = await incomeAPI.create(data)
          set((s) => ({ income: [item, ...s.income] }))
        } else {
          set((s) => ({ income: [{ ...data, id: generateId(), createdAt: today() }, ...s.income] }))
        }
      },
      updateIncome: async (id, data) => {
        if (get().useAPI) await incomeAPI.update(id, data)
        set((s) => ({ income: s.income.map((i) => (i.id === id ? { ...i, ...data } : i)) }))
      },
      deleteIncome: async (id) => {
        if (get().useAPI) await incomeAPI.delete(id)
        set((s) => ({ income: s.income.filter((i) => i.id !== id) }))
      },

      // Expense
      addExpense: async (data) => {
        if (get().useAPI) {
          const item = await expenseAPI.create(data)
          set((s) => ({ expense: [item, ...s.expense] }))
        } else {
          set((s) => ({ expense: [{ ...data, id: generateId(), createdAt: today() }, ...s.expense] }))
        }
      },
      updateExpense: async (id, data) => {
        if (get().useAPI) await expenseAPI.update(id, data)
        set((s) => ({ expense: s.expense.map((i) => (i.id === id ? { ...i, ...data } : i)) }))
      },
      deleteExpense: async (id) => {
        if (get().useAPI) await expenseAPI.delete(id)
        set((s) => ({ expense: s.expense.filter((i) => i.id !== id) }))
      },

      // Lend
      addLend: async (data) => {
        if (get().useAPI) {
          const item = await lendAPI.create(data)
          set((s) => ({ lend: [item, ...s.lend] }))
        } else {
          set((s) => ({ lend: [{ ...data, id: generateId(), paid: false, createdAt: today() }, ...s.lend] }))
        }
      },
      updateLend: async (id, data) => {
        if (get().useAPI) await lendAPI.update(id, data)
        set((s) => ({ lend: s.lend.map((i) => (i.id === id ? { ...i, ...data } : i)) }))
      },
      deleteLend: async (id) => {
        if (get().useAPI) await lendAPI.delete(id)
        set((s) => ({ lend: s.lend.filter((i) => i.id !== id) }))
      },
      markLendPaid: async (id) => {
        if (get().useAPI) await lendAPI.markPaid(id)
        set((s) => ({ lend: s.lend.map((i) => (i.id === id ? { ...i, paid: true, paidDate: today() } : i)) }))
      },

      // Borrow
      addBorrow: async (data) => {
        if (get().useAPI) {
          const item = await borrowAPI.create(data)
          set((s) => ({ borrow: [item, ...s.borrow] }))
        } else {
          set((s) => ({ borrow: [{ ...data, id: generateId(), paid: false, createdAt: today() }, ...s.borrow] }))
        }
      },
      updateBorrow: async (id, data) => {
        if (get().useAPI) await borrowAPI.update(id, data)
        set((s) => ({ borrow: s.borrow.map((i) => (i.id === id ? { ...i, ...data } : i)) }))
      },
      deleteBorrow: async (id) => {
        if (get().useAPI) await borrowAPI.delete(id)
        set((s) => ({ borrow: s.borrow.filter((i) => i.id !== id) }))
      },
      markBorrowPaid: async (id) => {
        if (get().useAPI) await borrowAPI.markPaid(id)
        set((s) => ({ borrow: s.borrow.map((i) => (i.id === id ? { ...i, paid: true, paidDate: today() } : i)) }))
      },

      // Budget
      setBudget: async (month, category, amount) => {
        if (get().useAPI) await budgetAPI.set({ month, category, amount })
        set((s) => ({ budgets: { ...s.budgets, [month]: { ...(s.budgets[month] || {}), [category]: amount } } }))
      },
    }),
    { name: "hisabnkash-v2" }
  )
)
