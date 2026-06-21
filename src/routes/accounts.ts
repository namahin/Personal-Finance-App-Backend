import { Router, Request, Response } from "express"
import { z } from "zod"
import prisma from "../db/prisma"
import { auth } from "../middleware/auth"

export const accountsRouter = Router()
accountsRouter.use(auth)

const AccountSchema = z.object({
  name: z.string().min(1, "নাম দিন"),
  type: z.enum(["wallet", "bank", "cash", "other"]).optional().default("wallet"),
  openingBalance: z.number().optional().default(0),
  color: z.string().optional().default("#3b82f6"),
  icon: z.string().optional().default("wallet"),
  isDefault: z.boolean().optional().default(false),
})

// GET /api/accounts — list with computed current balance
accountsRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const accounts = await prisma.account.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })

  // Compute balance per account: opening + income - expense (+ lend received - lend given, + borrow received - borrow repaid)
  const result = await Promise.all(accounts.map(async (acc: typeof accounts[number]) => {
    const [incomeSum, expenseSum, lendOutSum, lendBackSum, borrowInSum, borrowBackSum] = await Promise.all([
      prisma.income.aggregate({ where: { userId, accountId: acc.id }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId, accountId: acc.id }, _sum: { amount: true } }),
      prisma.lend.aggregate({ where: { userId, accountId: acc.id }, _sum: { amount: true } }),
      prisma.lend.aggregate({ where: { userId, accountId: acc.id, paid: true }, _sum: { amount: true } }),
      prisma.borrow.aggregate({ where: { userId, accountId: acc.id }, _sum: { amount: true } }),
      prisma.borrow.aggregate({ where: { userId, accountId: acc.id, paid: true }, _sum: { amount: true } }),
    ])
    const balance = acc.openingBalance
      + (incomeSum._sum.amount ?? 0)
      - (expenseSum._sum.amount ?? 0)
      - (lendOutSum._sum.amount ?? 0)
      + (lendBackSum._sum.amount ?? 0)
      + (borrowInSum._sum.amount ?? 0)
      - (borrowBackSum._sum.amount ?? 0)
    return { ...acc, balance }
  }))
  res.json(result)
})

accountsRouter.post("/", async (req: Request, res: Response) => {
  const result = AccountSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    if (result.data.isDefault) {
      await prisma.account.updateMany({ where: { userId }, data: { isDefault: false } })
    }
    const acc = await prisma.account.create({ data: { userId, ...result.data } })
    res.status(201).json({ ...acc, balance: acc.openingBalance })
  } catch (e: any) {
    if (e.code === "P2002") res.status(409).json({ error: "এই নামে অ্যাকাউন্ট আগেই আছে" })
    else res.status(500).json({ error: "সমস্যা হয়েছে" })
  }
})

accountsRouter.put("/:id", async (req: Request, res: Response) => {
  const result = AccountSchema.partial().safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    if (result.data.isDefault) {
      await prisma.account.updateMany({ where: { userId }, data: { isDefault: false } })
    }
    const acc = await prisma.account.update({ where: { id: req.params.id, userId }, data: result.data })
    res.json(acc)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

accountsRouter.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    await prisma.account.delete({ where: { id: req.params.id, userId } })
    res.json({ success: true })
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})
