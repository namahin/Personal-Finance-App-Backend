export interface Contact {
  id: string
  name: string
  phone: string
  type: "person" | "organization"
  createdAt: string
}

export interface Category {
  id: string
  name: string
  forType: "income" | "expense" | "both"
  color: string
  createdAt: string
}

export interface Medium {
  id: string
  name: string
  createdAt: string
}

export interface Income {
  id: string
  amount: number
  date: string
  from: string
  fromPhone: string
  medium: string
  category: string
  reason: string
  accountId?: string | null
  tags?: string
  createdAt: string
  updatedAt?: string
}

export interface Expense {
  id: string
  amount: number
  date: string
  payTo: string
  payToPhone: string
  medium: string
  category: string
  reason: string
  accountId?: string | null
  tags?: string
  createdAt: string
  updatedAt?: string
}

export interface Lend {
  id: string
  amount: number
  date: string
  to: string
  toPhone: string
  medium: string
  dueDate: string
  reason: string
  accountId?: string | null
  paid: boolean
  paidDate?: string
  createdAt: string
  updatedAt?: string
}

export interface Borrow {
  id: string
  amount: number
  date: string
  from: string
  fromPhone: string
  medium: string
  dueDate: string
  reason: string
  accountId?: string | null
  paid: boolean
  paidDate?: string
  createdAt: string
  updatedAt?: string
}

export interface Budget {
  [category: string]: number
}

export interface MonthlyBudgets {
  [month: string]: Budget
}

export interface AppData {
  income: Income[]
  expense: Expense[]
  lend: Lend[]
  borrow: Borrow[]
  budgets: MonthlyBudgets
}

// ─── v4 additions ──────────────────────────────────────────────
export interface Account {
  id: string
  name: string
  type: "wallet" | "bank" | "cash" | "other"
  openingBalance: number
  balance: number
  color: string
  icon: string
  isDefault: boolean
  createdAt: string
}

export interface Recurring {
  id: string
  type: "income" | "expense"
  amount: number
  name: string
  contactName: string
  contactPhone: string
  medium: string
  category: string
  reason: string
  frequency: "monthly" | "weekly" | "yearly"
  dayOfMonth?: number
  startDate: string
  endDate?: string
  lastRunDate?: string
  active: boolean
  autoCreate: boolean
  createdAt: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  icon: string
  color: string
  completed: boolean
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface LedgerRow {
  name: string
  phone: string
  totalIncome: number
  totalExpense: number
  totalLent: number
  totalLentPending: number
  totalBorrowed: number
  totalBorrowedPending: number
  netOwed: number
  txCount: number
}
