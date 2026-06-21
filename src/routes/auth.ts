import { Router, Request, Response } from "express"
import bcrypt from "bcryptjs"
import { z } from "zod"
import prisma from "../db/prisma"
import { signToken } from "../middleware/auth"

const router = Router()

const RegisterSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  email: z.string().email("সঠিক ইমেইল দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const result = RegisterSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message || "ভুল তথ্য" })
    return
  }
  const { name, email, password } = result.data
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    })
    const token = signToken({ userId: user.id, email: user.email })
    res.status(201).json({ token, user })
  } catch (err: any) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "এই ইমেইলে আগেই অ্যাকাউন্ট আছে" })
    } else {
      res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে" })
    }
  }
})

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const result = LoginSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: "সঠিক তথ্য দিন" })
    return
  }
  const { email, password } = result.data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড ভুল" })
    return
  }
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড ভুল" })
    return
  }
  const token = signToken({ userId: user.id, email: user.email })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

export default router
