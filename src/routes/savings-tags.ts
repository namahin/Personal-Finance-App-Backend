import { Router, Request, Response } from "express"
import { z } from "zod"
import prisma from "../db/prisma"
import { auth } from "../middleware/auth"

// ─── Savings Goals ───────────────────────────────────────────
export const savingsRouter = Router()
savingsRouter.use(auth)

const SavingsGoalSchema = z.object({
  name: z.string().min(1, "নাম দিন"),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).optional().default(0),
  targetDate: z.string().optional(),
  icon: z.string().optional().default("target"),
  color: z.string().optional().default("#10b981"),
})

savingsRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const goals = await prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
  res.json(goals)
})

savingsRouter.post("/", async (req: Request, res: Response) => {
  const result = SavingsGoalSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  const goal = await prisma.savingsGoal.create({ data: { userId, ...result.data } })
  res.status(201).json(goal)
})

savingsRouter.put("/:id", async (req: Request, res: Response) => {
  const result = SavingsGoalSchema.partial().safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const goal = await prisma.savingsGoal.update({ where: { id: req.params.id, userId }, data: result.data })
    res.json(goal)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

// PATCH /api/savings/:id/contribute — add money toward a goal
savingsRouter.patch("/:id/contribute", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const amount = Number(req.body?.amount)
  if (!amount || amount <= 0) { res.status(400).json({ error: "সঠিক পরিমাণ দিন" }); return }
  try {
    const existing = await prisma.savingsGoal.findFirst({ where: { id: req.params.id, userId } })
    if (!existing) { res.status(404).json({ error: "পাওয়া যায়নি" }); return }
    const newAmount = existing.currentAmount + amount
    const goal = await prisma.savingsGoal.update({
      where: { id: req.params.id },
      data: { currentAmount: newAmount, completed: newAmount >= existing.targetAmount },
    })
    res.json(goal)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

savingsRouter.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    await prisma.savingsGoal.delete({ where: { id: req.params.id, userId } })
    res.json({ success: true })
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

// ─── Tags ────────────────────────────────────────────────────
export const tagsRouter = Router()
tagsRouter.use(auth)

const TagSchema = z.object({
  name: z.string().min(1, "নাম দিন"),
  color: z.string().optional().default("#6b7280"),
})

tagsRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const tags = await prisma.tag.findMany({ where: { userId }, orderBy: { name: "asc" } })
  res.json(tags)
})

tagsRouter.post("/", async (req: Request, res: Response) => {
  const result = TagSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const tag = await prisma.tag.create({ data: { userId, ...result.data } })
    res.status(201).json(tag)
  } catch (e: any) {
    if (e.code === "P2002") res.status(409).json({ error: "এই ট্যাগ আগেই আছে" })
    else res.status(500).json({ error: "সমস্যা হয়েছে" })
  }
})

tagsRouter.put("/:id", async (req: Request, res: Response) => {
  const result = TagSchema.partial().safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const tag = await prisma.tag.update({ where: { id: req.params.id, userId }, data: result.data })
    res.json(tag)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

tagsRouter.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    await prisma.tag.delete({ where: { id: req.params.id, userId } })
    res.json({ success: true })
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})
