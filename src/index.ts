import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import authRouter from "./routes/auth"
import incomeRouter from "./routes/income"
import { expenseRouter, lendRouter, borrowRouter } from "./routes/transactions"
import { budgetRouter, summaryRouter } from "./routes/budget"
import { contactsRouter, categoriesRouter, mediumsRouter } from "./routes/settings"
import { accountsRouter } from "./routes/accounts"
import { recurringRouter } from "./routes/recurring"
import { savingsRouter, tagsRouter } from "./routes/savings-tags"
import { ledgerRouter, yearlyRouter } from "./routes/ledger-yearly"

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }))
app.use(morgan("dev"))
app.use(express.json())

app.use("/api/auth", authRouter)
app.use("/api/income", incomeRouter)
app.use("/api/expense", expenseRouter)
app.use("/api/lend", lendRouter)
app.use("/api/borrow", borrowRouter)
app.use("/api/budget", budgetRouter)
app.use("/api/summary", summaryRouter)
app.use("/api/contacts", contactsRouter)
app.use("/api/categories", categoriesRouter)
app.use("/api/mediums", mediumsRouter)
app.use("/api/accounts", accountsRouter)
app.use("/api/recurring", recurringRouter)
app.use("/api/savings", savingsRouter)
app.use("/api/tags", tagsRouter)
app.use("/api/ledger", ledgerRouter)
app.use("/api/yearly", yearlyRouter)

app.get("/api/health", (_, res) => res.json({ status: "ok", version: "4.0.0" }))
app.use((_, res) => res.status(404).json({ error: "Route পাওয়া যায়নি" }))
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে" })
})

app.listen(PORT, () => console.log(`✅ API চলছে → http://localhost:${PORT}`))
export default app
