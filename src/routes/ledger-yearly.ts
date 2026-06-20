import { Router, Request, Response } from "express"
import prisma from "../db/prisma"
import { auth } from "../middleware/auth"

type IncomeRow = { from: string; fromPhone: string; amount: number }
type ExpenseRow = { payTo: string; payToPhone: string; amount: number }
type LendRow = { to: string; toPhone: string; amount: number; paid: boolean }
type BorrowRow = { from: string; fromPhone: string; amount: number; paid: boolean }

// ─── Ledger: per-contact full history ──────────────────────────
export const ledgerRouter = Router()
ledgerRouter.use(auth)

// GET /api/ledger — summary per contact: net owed
ledgerRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!

  const [incomes, expenses, lends, borrows]: [IncomeRow[], ExpenseRow[], LendRow[], BorrowRow[]] = await Promise.all([
    prisma.income.findMany({ where: { userId, from: { not: "" } } }),
    prisma.expense.findMany({ where: { userId, payTo: { not: "" } } }),
    prisma.lend.findMany({ where: { userId } }),
    prisma.borrow.findMany({ where: { userId } }),
  ])

  type Row = { name: string; phone: string; totalIncome: number; totalExpense: number; totalLent: number; totalLentPending: number; totalBorrowed: number; totalBorrowedPending: number; txCount: number }
  const map = new Map<string, Row>()

  const ensure = (name: string, phone: string) => {
    const key = name.toLowerCase()
    if (!map.has(key)) {
      map.set(key, { name, phone, totalIncome: 0, totalExpense: 0, totalLent: 0, totalLentPending: 0, totalBorrowed: 0, totalBorrowedPending: 0, txCount: 0 })
    }
    return map.get(key)!
  }

  incomes.forEach((i: IncomeRow) => { const r = ensure(i.from, i.fromPhone); r.totalIncome += i.amount; r.txCount++ })
  expenses.forEach((e: ExpenseRow) => { const r = ensure(e.payTo, e.payToPhone); r.totalExpense += e.amount; r.txCount++ })
  lends.forEach((l: LendRow) => {
    const r = ensure(l.to, l.toPhone); r.totalLent += l.amount; r.txCount++
    if (!l.paid) r.totalLentPending += l.amount
  })
  borrows.forEach((b: BorrowRow) => {
    const r = ensure(b.from, b.fromPhone); r.totalBorrowed += b.amount; r.txCount++
    if (!b.paid) r.totalBorrowedPending += b.amount
  })

  // netOwed: positive = they owe you (you lent more than you borrowed from them)
  const rows = Array.from(map.values()).map((r) => ({
    ...r,
    netOwed: r.totalLentPending - r.totalBorrowedPending,
  })).sort((a, b) => b.txCount - a.txCount)

  res.json(rows)
})

// GET /api/ledger/:name — full transaction history with one contact
ledgerRouter.get("/:name", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const name = decodeURIComponent(String(req.params.name))

  const [incomes, expenses, lends, borrows] = await Promise.all([
    prisma.income.findMany({ where: { userId, from: { equals: name, mode: "insensitive" } }, orderBy: { date: "desc" } }),
    prisma.expense.findMany({ where: { userId, payTo: { equals: name, mode: "insensitive" } }, orderBy: { date: "desc" } }),
    prisma.lend.findMany({ where: { userId, to: { equals: name, mode: "insensitive" } }, orderBy: { date: "desc" } }),
    prisma.borrow.findMany({ where: { userId, from: { equals: name, mode: "insensitive" } }, orderBy: { date: "desc" } }),
  ])

  const timeline = [
    ...incomes.map((i: any) => ({ ...i, _type: "income" as const })),
    ...expenses.map((e: any) => ({ ...e, _type: "expense" as const })),
    ...lends.map((l: any) => ({ ...l, _type: "lend" as const })),
    ...borrows.map((b: any) => ({ ...b, _type: "borrow" as const })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  const totalLentPending = lends.filter((l: LendRow) => !l.paid).reduce((s: number, l: LendRow) => s + l.amount, 0)
  const totalBorrowedPending = borrows.filter((b: BorrowRow) => !b.paid).reduce((s: number, b: BorrowRow) => s + b.amount, 0)

  res.json({
    name,
    summary: {
      totalIncome: incomes.reduce((s: number, i: IncomeRow) => s + i.amount, 0),
      totalExpense: expenses.reduce((s: number, e: ExpenseRow) => s + e.amount, 0),
      totalLentPending,
      totalBorrowedPending,
      netOwed: totalLentPending - totalBorrowedPending,
    },
    timeline,
  })
})

// ─── Yearly comparison ──────────────────────────────────────────
export const yearlyRouter = Router()
yearlyRouter.use(auth)

yearlyRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const currentYear = (req.query.year as string) || String(new Date().getFullYear())
  const prevYear = String(Number(currentYear) - 1)

  const [curIncome, curExpense, prevIncome, prevExpense]: [{date:string;amount:number}[], {date:string;amount:number}[], {date:string;amount:number}[], {date:string;amount:number}[]] = await Promise.all([
    prisma.income.findMany({ where: { userId, date: { startsWith: currentYear } } }),
    prisma.expense.findMany({ where: { userId, date: { startsWith: currentYear } } }),
    prisma.income.findMany({ where: { userId, date: { startsWith: prevYear } } }),
    prisma.expense.findMany({ where: { userId, date: { startsWith: prevYear } } }),
  ])

  const monthlyBreakdown = (items: { date: string; amount: number }[]) => {
    const months = Array(12).fill(0)
    items.forEach((i) => { const mo = parseInt(i.date.slice(5, 7)) - 1; months[mo] += i.amount })
    return months
  }

  const curIncomeByMonth = monthlyBreakdown(curIncome)
  const curExpenseByMonth = monthlyBreakdown(curExpense)
  const prevIncomeByMonth = monthlyBreakdown(prevIncome)
  const prevExpenseByMonth = monthlyBreakdown(prevExpense)

  const curTotalIncome = curIncome.reduce((s, i) => s + i.amount, 0)
  const curTotalExpense = curExpense.reduce((s, i) => s + i.amount, 0)
  const prevTotalIncome = prevIncome.reduce((s, i) => s + i.amount, 0)
  const prevTotalExpense = prevExpense.reduce((s, i) => s + i.amount, 0)

  const bestMonth = curIncomeByMonth.map((inc, i) => inc - curExpenseByMonth[i])
    .reduce((best, val, i, arr) => (val > arr[best] ? i : best), 0)
  const worstMonth = curIncomeByMonth.map((inc, i) => inc - curExpenseByMonth[i])
    .reduce((worst, val, i, arr) => (val < arr[worst] ? i : worst), 0)

  res.json({
    currentYear, prevYear,
    current: { income: curIncomeByMonth, expense: curExpenseByMonth, totalIncome: curTotalIncome, totalExpense: curTotalExpense },
    previous: { income: prevIncomeByMonth, expense: prevExpenseByMonth, totalIncome: prevTotalIncome, totalExpense: prevTotalExpense },
    growth: {
      income: prevTotalIncome > 0 ? Math.round(((curTotalIncome - prevTotalIncome) / prevTotalIncome) * 100) : null,
      expense: prevTotalExpense > 0 ? Math.round(((curTotalExpense - prevTotalExpense) / prevTotalExpense) * 100) : null,
    },
    bestMonth, worstMonth,
  })
})
