import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import authRouter from "./routes/auth"
import incomeRouter from "./routes/income"
import { expenseRouter, lendRouter, borrowRouter } from "./routes/transactions"
import { budgetRouter, summaryRouter } from "./routes/budget"

const app = express()
const PORT = process.env.PORT || 4000

// ─── Middleware ────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}))
app.use(morgan("dev"))
app.use(express.json())

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authRouter)
app.use("/api/income", incomeRouter)
app.use("/api/expense", expenseRouter)
app.use("/api/lend", lendRouter)
app.use("/api/borrow", borrowRouter)
app.use("/api/budget", budgetRouter)
app.use("/api/summary", summaryRouter)

// ─── Health check ─────────────────────────────────────────────
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "2.0.0" })
})

// ─── 404 ──────────────────────────────────────────────────────
app.use((_, res) => {
  res.status(404).json({ error: "Route পাওয়া যায়নি" })
})

// ─── Error handler ────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে" })
})

app.listen(PORT, () => {
  console.log(`✅ হিসাবনিকাশ API চলছে → http://localhost:${PORT}`)
  console.log(`📊 Health: http://localhost:${PORT}/api/health`)
})

export default app
