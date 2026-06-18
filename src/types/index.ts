export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

export interface Income {
  id: string
  userId: string
  amount: number
  date: string
  from: string
  medium: string
  category: string
  reason: string
  createdAt: string
}

export interface Expense {
  id: string
  userId: string
  amount: number
  date: string
  payTo: string
  medium: string
  category: string
  reason: string
  createdAt: string
}

export interface Lend {
  id: string
  userId: string
  amount: number
  date: string
  to: string
  medium: string
  dueDate: string
  reason: string
  paid: boolean
  paidDate?: string
  createdAt: string
}

export interface Borrow {
  id: string
  userId: string
  amount: number
  date: string
  from: string
  medium: string
  dueDate: string
  reason: string
  paid: boolean
  paidDate?: string
  createdAt: string
}

export interface Budget {
  id: string
  userId: string
  month: string
  category: string
  amount: number
  updatedAt: string
}

export interface JwtPayload {
  userId: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}
