import { Router, Request, Response } from "express"
import { z } from "zod"
import prisma from "../db/prisma"
import { auth } from "../middleware/auth"

const router = Router()
router.use(auth)

const IncomeSchema = z.object({
  amount: z.number().positive("পরিমাণ শূন্যের বেশি হতে হবে"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  from: z.string().optional().default(""),
  fromPhone: z.string().optional().default(""),
  medium: z.string().min(1),
  category: z.string().min(1),
  reason: z.string().optional().default(""),
})

router.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const { month } = req.query
  const items = await prisma.income.findMany({
    where: { userId, ...(month ? { date: { startsWith: String(month) } } : {}) },
    orderBy: { date: "desc" },
  })
  res.json(items)
})

router.post("/", async (req: Request, res: Response) => {
  const result = IncomeSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  const item = await prisma.income.create({ data: { userId, ...result.data } })
  // Auto-save contact
  if (result.data.from) {
    await prisma.contact.upsert({
      where: { userId_name: { userId, name: result.data.from } },
      update: { phone: result.data.fromPhone || "" },
      create: { userId, name: result.data.from, phone: result.data.fromPhone || "" },
    })
  }
  res.status(201).json(item)
})

router.put("/:id", async (req: Request, res: Response) => {
  const result = IncomeSchema.partial().safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const item = await prisma.income.update({ where: { id: req.params.id, userId }, data: result.data })
    res.json(item)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

router.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    await prisma.income.delete({ where: { id: req.params.id, userId } })
    res.json({ success: true })
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

export default router
