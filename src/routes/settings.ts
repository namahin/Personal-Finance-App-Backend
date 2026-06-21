import { Router, Request, Response } from "express"
import { z } from "zod"
import prisma from "../db/prisma"
import { auth } from "../middleware/auth"

// ─── Contacts ─────────────────────────────────────────────────
export const contactsRouter = Router()
contactsRouter.use(auth)

const ContactSchema = z.object({
  name: z.string().min(1, "নাম দিন"),
  phone: z.string().optional().default(""),
  type: z.enum(["person", "organization"]).optional().default("person"),
})

contactsRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const { q } = req.query
  const contacts = await prisma.contact.findMany({
    where: {
      userId,
      ...(q ? { name: { contains: String(q), mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
  })
  res.json(contacts)
})

contactsRouter.post("/", async (req: Request, res: Response) => {
  const result = ContactSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const contact = await prisma.contact.upsert({
      where: { userId_name: { userId, name: result.data.name } },
      update: { phone: result.data.phone || "", type: result.data.type || "person" },
      create: { userId, ...result.data },
    })
    res.status(201).json(contact)
  } catch { res.status(500).json({ error: "সমস্যা হয়েছে" }) }
})

contactsRouter.put("/:id", async (req: Request, res: Response) => {
  const result = ContactSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const c = await prisma.contact.update({
      where: { id: req.params.id, userId },
      data: result.data,
    })
    res.json(c)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

contactsRouter.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    await prisma.contact.delete({ where: { id: req.params.id, userId } })
    res.json({ success: true })
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

// ─── Categories ───────────────────────────────────────────────
export const categoriesRouter = Router()
categoriesRouter.use(auth)

const CategorySchema = z.object({
  name: z.string().min(1, "নাম দিন"),
  forType: z.enum(["income", "expense", "both"]),
  color: z.string().optional().default("#6b7280"),
})

categoriesRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const { forType } = req.query
  const cats = await prisma.category.findMany({
    where: {
      userId,
      ...(forType ? { forType: { in: [String(forType), "both"] } } : {}),
    },
    orderBy: { name: "asc" },
  })
  res.json(cats)
})

categoriesRouter.post("/", async (req: Request, res: Response) => {
  const result = CategorySchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const cat = await prisma.category.create({ data: { userId, ...result.data } })
    res.status(201).json(cat)
  } catch (e: any) {
    if (e.code === "P2002") res.status(409).json({ error: "এই ক্যাটাগরি আগেই আছে" })
    else res.status(500).json({ error: "সমস্যা হয়েছে" })
  }
})

categoriesRouter.put("/:id", async (req: Request, res: Response) => {
  const result = CategorySchema.partial().safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const cat = await prisma.category.update({ where: { id: req.params.id, userId }, data: result.data })
    res.json(cat)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

categoriesRouter.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    await prisma.category.delete({ where: { id: req.params.id, userId } })
    res.json({ success: true })
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

// ─── Mediums ──────────────────────────────────────────────────
export const mediumsRouter = Router()
mediumsRouter.use(auth)

const MediumSchema = z.object({ name: z.string().min(1, "নাম দিন") })

mediumsRouter.get("/", async (req: Request, res: Response) => {
  const { userId } = req.user!
  const mediums = await prisma.medium.findMany({ where: { userId }, orderBy: { name: "asc" } })
  res.json(mediums)
})

mediumsRouter.post("/", async (req: Request, res: Response) => {
  const result = MediumSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const m = await prisma.medium.create({ data: { userId, ...result.data } })
    res.status(201).json(m)
  } catch (e: any) {
    if (e.code === "P2002") res.status(409).json({ error: "এই মাধ্যম আগেই আছে" })
    else res.status(500).json({ error: "সমস্যা হয়েছে" })
  }
})

mediumsRouter.put("/:id", async (req: Request, res: Response) => {
  const result = MediumSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.issues[0]?.message }); return }
  const { userId } = req.user!
  try {
    const m = await prisma.medium.update({ where: { id: req.params.id, userId }, data: result.data })
    res.json(m)
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})

mediumsRouter.delete("/:id", async (req: Request, res: Response) => {
  const { userId } = req.user!
  try {
    await prisma.medium.delete({ where: { id: req.params.id, userId } })
    res.json({ success: true })
  } catch { res.status(404).json({ error: "পাওয়া যায়নি" }) }
})
