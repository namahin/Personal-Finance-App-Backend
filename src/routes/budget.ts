import { Router, Request, Response } from "express"
import { z } from "zod"
import prisma from "../db/prisma"
import { auth } from "../middleware/auth"

// ─── Budget ───────────────────────────────────────────────────
export const budgetRouter = Router()
budgetRouter.use(auth)

const BudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  category: z.string().min(1),
  amount: z.number().min(0),
})

budgetRouter.get("/:month", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const items = await prisma.budget.findMany({
    where: { userId, month: req.params.month },
  })
  res.json(items)
})

budgetRouter.put("/", async (req: Request, res: Response) => {
  const result = BudgetSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  const { month, category, amount } = result.data
  await prisma.budget.upsert({
    where: { userId_month_category: { userId, month, category } },
    update: { amount },
    create: { userId, month, category, amount },
  })
  res.json({ success: true })
})

// ─── Summary ──────────────────────────────────────────────────
export const summaryRouter = Router()
summaryRouter.use(auth)

summaryRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const month = (req.query.month as string) || new Date().toISOString().slice(0, 7)

  const [
    allIncome, allExpense,
    pendingLendItems, pendingBorrowItems,
    mIncome, mExpense,
    recentTxns,
  ] = await Promise.all([
    prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.lend.findMany({ where: { userId, paid: false } }),
    prisma.borrow.findMany({ where: { userId, paid: false } }),
    prisma.income.aggregate({ where: { userId, date: { startsWith: month } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { userId, date: { startsWith: month } }, _sum: { amount: true } }),
    prisma.income.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ])

  const totalIncome = allIncome._sum.amount ?? 0
  const totalExpense = allExpense._sum.amount ?? 0
  type LendRow = { amount: number; dueDate: string | null; to: string }
  type BorrowRow = { amount: number; dueDate: string | null; from: string }
  type ExpRow = { category: string; amount: number }

  const pendingLend = (pendingLendItems as LendRow[]).reduce((s: number, i: LendRow) => s + i.amount, 0)
  const pendingBorrow = (pendingBorrowItems as BorrowRow[]).reduce((s: number, i: BorrowRow) => s + i.amount, 0)
  const mI = mIncome._sum.amount ?? 0
  const mE = mExpense._sum.amount ?? 0

  // Category breakdown for the month
  const mExpenseRows = await prisma.expense.findMany({
    where: { userId, date: { startsWith: month } },
    select: { category: true, amount: true },
  })
  const expenseByCat: Record<string, number> = {}
  ;(mExpenseRows as ExpRow[]).forEach((r: ExpRow) => {
    expenseByCat[r.category] = (expenseByCat[r.category] || 0) + r.amount
  })

  // Upcoming dues within 7 days
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const allPending = [
    ...(pendingLendItems as LendRow[]).filter((i: LendRow) => i.dueDate).map((i: LendRow) => ({
      type: "lend" as const, name: i.to, amount: i.amount, dueDate: i.dueDate!,
      daysLeft: Math.ceil((new Date(i.dueDate!).getTime() - now.getTime()) / 86400000),
    })),
    ...(pendingBorrowItems as BorrowRow[]).filter((i: BorrowRow) => i.dueDate).map((i: BorrowRow) => ({
      type: "borrow" as const, name: i.from, amount: i.amount, dueDate: i.dueDate!,
      daysLeft: Math.ceil((new Date(i.dueDate!).getTime() - now.getTime()) / 86400000),
    })),
  ].filter((d) => d.daysLeft <= 7).sort((a, b) => a.daysLeft - b.daysLeft)

  res.json({
    totals: { income: totalIncome, expense: totalExpense, pendingLend, pendingBorrow, net: totalIncome - totalExpense },
    monthly: {
      income: mI, expense: mE, savings: mI - mE,
      saveRate: mI > 0 ? Math.round(((mI - mE) / mI) * 100) : 0,
    },
    expenseByCat,
    upcoming: allPending,
  })
})
