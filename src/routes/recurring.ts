import { Router, Request, Response } from "express"
import { z } from "zod"
import prisma from "../db/prisma"
import { auth } from "../middleware/auth"

export const recurringRouter = Router()
recurringRouter.use(auth)

const RecurringSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  name: z.string().min(1, "নাম দিন"),
  contactName: z.string().optional().default(""),
  contactPhone: z.string().optional().default(""),
  medium: z.string().min(1),
  category: z.string().min(1),
  reason: z.string().optional().default(""),
  frequency: z.enum(["monthly", "weekly", "yearly"]).optional().default("monthly"),
  dayOfMonth: z.number().min(1).max(31).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().optional(),
  autoCreate: z.boolean().optional().default(false),
})

recurringRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const items = await prisma.recurring.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
  res.json(items)
})

recurringRouter.post("/", async (req: Request, res: Response) => {
  const result = RecurringSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  const item = await prisma.recurring.create({ data: { userId, ...result.data, active: true } })
  res.status(201).json(item)
})

recurringRouter.put("/:id", async (req: Request, res: Response) => {
  const result = RecurringSchema.partial().safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const item = await prisma.recurring.update({ where: { id: req.params.id, userId }, data: result.data })
    res.json(item)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

recurringRouter.patch("/:id/toggle", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    const existing = await prisma.recurring.findFirst({ where: { id: req.params.id, userId } })
    if (!existing) { res.status(404).json({ error: "পাওয়া যায়নি" }); return }
    const item = await prisma.recurring.update({ where: { id: req.params.id }, data: { active: !existing.active } })
    res.json(item)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

recurringRouter.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    await prisma.recurring.delete({ where: { id: req.params.id, userId } })
    res.json({ success: true })
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

// POST /api/recurring/:id/run — manually create an entry from this recurring template
recurringRouter.post("/:id/run", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const rec = await prisma.recurring.findFirst({ where: { id: req.params.id, userId } })
  if (!rec) { res.status(404).json({ error: "পাওয়া যায়নি" }); return }

  const dateStr = req.body?.date || new Date().toISOString().split("T")[0]

  if (rec.type === "income") {
    const entry = await prisma.income.create({
      data: {
        userId, amount: rec.amount, date: dateStr,
        from: rec.contactName, fromPhone: rec.contactPhone,
        medium: rec.medium, category: rec.category, reason: rec.reason,
        recurringId: rec.id,
      },
    })
    await prisma.recurring.update({ where: { id: rec.id }, data: { lastRunDate: dateStr } })
    res.status(201).json(entry)
  } else {
    const entry = await prisma.expense.create({
      data: {
        userId, amount: rec.amount, date: dateStr,
        payTo: rec.contactName, payToPhone: rec.contactPhone,
        medium: rec.medium, category: rec.category, reason: rec.reason,
        recurringId: rec.id,
      },
    })
    await prisma.recurring.update({ where: { id: rec.id }, data: { lastRunDate: dateStr } })
    res.status(201).json(entry)
  }
})
