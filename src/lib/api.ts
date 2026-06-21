import axios from "axios"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
export const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } })
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("hn_token")
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
api.interceptors.response.use((res) => res, (err) => {
  if (err.response?.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("hn_token"); localStorage.removeItem("hn_user")
    window.location.href = "/login"
  }
  return Promise.reject(err)
})
export const authAPI = {
  register: (d: object) => api.post("/api/auth/register", d).then(r => r.data),
  login: (d: object) => api.post("/api/auth/login", d).then(r => r.data),
}
export const incomeAPI = {
  getAll: (month?: string) => api.get("/api/income", { params: month ? { month } : {} }).then(r => r.data),
  create: (d: object) => api.post("/api/income", d).then(r => r.data),
  update: (id: string, d: object) => api.put(`/api/income/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/api/income/${id}`).then(r => r.data),
}
export const expenseAPI = {
  getAll: (month?: string) => api.get("/api/expense", { params: month ? { month } : {} }).then(r => r.data),
  create: (d: object) => api.post("/api/expense", d).then(r => r.data),
  update: (id: string, d: object) => api.put(`/api/expense/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/api/expense/${id}`).then(r => r.data),
}
export const lendAPI = {
  getAll: () => api.get("/api/lend").then(r => r.data),
  create: (d: object) => api.post("/api/lend", d).then(r => r.data),
  update: (id: string, d: object) => api.put(`/api/lend/${id}`, d).then(r => r.data),
  markPaid: (id: string) => api.patch(`/api/lend/${id}/paid`).then(r => r.data),
  delete: (id: string) => api.delete(`/api/lend/${id}`).then(r => r.data),
}
export const borrowAPI = {
  getAll: () => api.get("/api/borrow").then(r => r.data),
  create: (d: object) => api.post("/api/borrow", d).then(r => r.data),
  update: (id: string, d: object) => api.put(`/api/borrow/${id}`, d).then(r => r.data),
  markPaid: (id: string) => api.patch(`/api/borrow/${id}/paid`).then(r => r.data),
  delete: (id: string) => api.delete(`/api/borrow/${id}`).then(r => r.data),
}
export const budgetAPI = {
  getByMonth: (month: string) => api.get(`/api/budget/${month}`).then(r => r.data),
  set: (d: object) => api.put("/api/budget", d).then(r => r.data),
}
export const summaryAPI = {
  get: (month?: string) => api.get("/api/summary", { params: month ? { month } : {} }).then(r => r.data),
}
export const contactsAPI = {
  getAll: (q?: string) => api.get("/api/contacts", { params: q ? { q } : {} }).then(r => r.data),
  create: (d: object) => api.post("/api/contacts", d).then(r => r.data),
  update: (id: string, d: object) => api.put(`/api/contacts/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/api/contacts/${id}`).then(r => r.data),
}
export const categoriesAPI = {
  getAll: (forType?: string) => api.get("/api/categories", { params: forType ? { forType } : {} }).then(r => r.data),
  create: (d: object) => api.post("/api/categories", d).then(r => r.data),
  update: (id: string, d: object) => api.put(`/api/categories/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/api/categories/${id}`).then(r => r.data),
}
export const mediumsAPI = {
  getAll: () => api.get("/api/mediums").then(r => r.data),
  create: (d: object) => api.post("/api/mediums", d).then(r => r.data),
  update: (id: string, d: object) => api.put(`/api/mediums/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/api/mediums/${id}`).then(r => r.data),
}

// ─── v4 ───────────────────────────────────────────────────────
export const accountsAPI = {
  getAll: () => api.get("/api/accounts").then(r => r.data),
  create: (d: object) => api.post("/api/accounts", d).then(r => r.data),
  update: (id: string, d: object) => api.put(`/api/accounts/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/api/accounts/${id}`).then(r => r.data),
}
export const recurringAPI = {
  getAll: () => api.get("/api/recurring").then(r => r.data),
  create: (d: object) => api.post("/api/recurring", d).then(r => r.data),
  update: (id: string, d: object) => api.put(`/api/recurring/${id}`, d).then(r => r.data),
  toggle: (id: string) => api.patch(`/api/recurring/${id}/toggle`).then(r => r.data),
  run: (id: string, date?: string) => api.post(`/api/recurring/${id}/run`, { date }).then(r => r.data),
  delete: (id: string) => api.delete(`/api/recurring/${id}`).then(r => r.data),
}
export const savingsAPI = {
  getAll: () => api.get("/api/savings").then(r => r.data),
  create: (d: object) => api.post("/api/savings", d).then(r => r.data),
  update: (id: string, d: object) => api.put(`/api/savings/${id}`, d).then(r => r.data),
  contribute: (id: string, amount: number) => api.patch(`/api/savings/${id}/contribute`, { amount }).then(r => r.data),
  delete: (id: string) => api.delete(`/api/savings/${id}`).then(r => r.data),
}
export const tagsAPI = {
  getAll: () => api.get("/api/tags").then(r => r.data),
  create: (d: object) => api.post("/api/tags", d).then(r => r.data),
  update: (id: string, d: object) => api.put(`/api/tags/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/api/tags/${id}`).then(r => r.data),
}
export const ledgerAPI = {
  getAll: () => api.get("/api/ledger").then(r => r.data),
  getByName: (name: string) => api.get(`/api/ledger/${encodeURIComponent(name)}`).then(r => r.data),
}
export const yearlyAPI = {
  get: (year?: string) => api.get("/api/yearly", { params: year ? { year } : {} }).then(r => r.data),
}
