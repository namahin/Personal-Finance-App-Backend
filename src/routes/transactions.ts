import { Router, Request, Response } from "express"
import { z } from "zod"
import prisma from "../db/prisma"
import { auth } from "../middleware/auth"

// ─── Expense ──────────────────────────────────────────────────
export const expenseRouter = Router()
expenseRouter.use(auth)

const ExpenseSchema = z.object({
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payTo: z.string().optional().default(""),
  payToPhone: z.string().optional().default(""),
  medium: z.string().min(1),
  category: z.string().min(1),
  reason: z.string().optional().default(""),
  accountId: z.string().optional().nullable(),
  tags: z.string().optional().default(""),
})

expenseRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const { month } = req.query
  const items = await prisma.expense.findMany({
    where: { userId, ...(month ? { date: { startsWith: String(month) } } : {}) },
    orderBy: { date: "desc" },
  })
  res.json(items)
})

expenseRouter.post("/", async (req: Request, res: Response) => {
  const result = ExpenseSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  const item = await prisma.expense.create({ data: { userId, ...result.data } })
  if (result.data.payTo) {
    await prisma.contact.upsert({
      where: { userId_name: { userId, name: result.data.payTo } },
      update: { phone: result.data.payToPhone || "" },
      create: { userId, name: result.data.payTo, phone: result.data.payToPhone || "" },
    })
  }
  res.status(201).json(item)
})

expenseRouter.put("/:id", async (req: Request, res: Response) => {
  const result = ExpenseSchema.partial().safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const item = await prisma.expense.update({ where: { id: req.params.id, userId }, data: result.data })
    res.json(item)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

expenseRouter.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    await prisma.expense.delete({ where: { id: req.params.id, userId } })
    res.json({ success: true })
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

// ─── Lend ──────────────────────────────────────────────────────
export const lendRouter = Router()
lendRouter.use(auth)

const LendSchema = z.object({
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().min(1, "নাম দিন"),
  toPhone: z.string().optional().default(""),
  medium: z.string().min(1),
  dueDate: z.string().optional().default(""),
  reason: z.string().optional().default(""),
  accountId: z.string().optional().nullable(),
})

lendRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const items = await prisma.lend.findMany({ where: { userId }, orderBy: { date: "desc" } })
  res.json(items)
})

lendRouter.post("/", async (req: Request, res: Response) => {
  const result = LendSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  const item = await prisma.lend.create({ data: { userId, ...result.data } })
  await prisma.contact.upsert({
    where: { userId_name: { userId, name: result.data.to } },
    update: { phone: result.data.toPhone || "" },
    create: { userId, name: result.data.to, phone: result.data.toPhone || "" },
  })
  res.status(201).json(item)
})

lendRouter.put("/:id", async (req: Request, res: Response) => {
  const result = LendSchema.partial().safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const item = await prisma.lend.update({ where: { id: req.params.id, userId }, data: result.data })
    res.json(item)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

lendRouter.patch("/:id/paid", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    const item = await prisma.lend.update({
      where: { id: req.params.id, userId },
      data: { paid: true, paidDate: new Date().toISOString().split("T")[0] },
    })
    res.json(item)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

lendRouter.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    await prisma.lend.delete({ where: { id: req.params.id, userId } })
    res.json({ success: true })
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

// ─── Borrow ───────────────────────────────────────────────────
export const borrowRouter = Router()
borrowRouter.use(auth)

const BorrowSchema = z.object({
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  from: z.string().min(1, "নাম দিন"),
  fromPhone: z.string().optional().default(""),
  medium: z.string().min(1),
  dueDate: z.string().optional().default(""),
  reason: z.string().optional().default(""),
  accountId: z.string().optional().nullable(),
})

borrowRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const items = await prisma.borrow.findMany({ where: { userId }, orderBy: { date: "desc" } })
  res.json(items)
})

borrowRouter.post("/", async (req: Request, res: Response) => {
  const result = BorrowSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  const item = await prisma.borrow.create({ data: { userId, ...result.data } })
  await prisma.contact.upsert({
    where: { userId_name: { userId, name: result.data.from } },
    update: { phone: result.data.fromPhone || "" },
    create: { userId, name: result.data.from, phone: result.data.fromPhone || "" },
  })
  res.status(201).json(item)
})

borrowRouter.put("/:id", async (req: Request, res: Response) => {
  const result = BorrowSchema.partial().safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const item = await prisma.borrow.update({ where: { id: req.params.id, userId }, data: result.data })
    res.json(item)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

borrowRouter.patch("/:id/paid", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    const item = await prisma.borrow.update({
      where: { id: req.params.id, userId },
      data: { paid: true, paidDate: new Date().toISOString().split("T")[0] },
    })
    res.json(item)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

borrowRouter.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    await prisma.borrow.delete({ where: { id: req.params.id, userId } })
    res.json({ success: true })
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})
