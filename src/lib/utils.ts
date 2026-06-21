import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBDT(amount: number): string {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string): string {
  if (!date) return ""
  return new Date(date + "T00:00:00").toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function today(): string {
  return new Date().toISOString().split("T")[0]
}

export function thisMonth(): string {
  return today().slice(0, 7)
}

export function getDaysUntil(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + "T00:00:00")
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function getMonthLabel(month: string): string {
  const [year, mo] = month.split("-")
  const names = ["জানু","ফেব","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্ট","অক্টো","নভে","ডিসে"]
  return names[parseInt(mo) - 1] + " " + year.slice(2)
}
