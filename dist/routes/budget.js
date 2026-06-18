"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summaryRouter = exports.budgetRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../db/prisma"));
const auth_1 = require("../middleware/auth");
// ─── Budget ───────────────────────────────────────────────────
exports.budgetRouter = (0, express_1.Router)();
exports.budgetRouter.use(auth_1.auth);
const BudgetSchema = zod_1.z.object({
    month: zod_1.z.string().regex(/^\d{4}-\d{2}$/),
    category: zod_1.z.string().min(1),
    amount: zod_1.z.number().min(0),
});
exports.budgetRouter.get("/:month", async (req, res) => {
    const { userId } = req.user;
    const items = await prisma_1.default.budget.findMany({
        where: { userId, month: req.params.month },
    });
    res.json(items);
});
exports.budgetRouter.put("/", async (req, res) => {
    const result = BudgetSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.issues[0]?.message });
        return;
    }
    const { userId } = req.user;
    const { month, category, amount } = result.data;
    await prisma_1.default.budget.upsert({
        where: { userId_month_category: { userId, month, category } },
        update: { amount },
        create: { userId, month, category, amount },
    });
    res.json({ success: true });
});
// ─── Summary ──────────────────────────────────────────────────
exports.summaryRouter = (0, express_1.Router)();
exports.summaryRouter.use(auth_1.auth);
exports.summaryRouter.get("/", async (req, res) => {
    const { userId } = req.user;
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [allIncome, allExpense, pendingLendItems, pendingBorrowItems, mIncome, mExpense, recentTxns,] = await Promise.all([
        prisma_1.default.income.aggregate({ where: { userId }, _sum: { amount: true } }),
        prisma_1.default.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
        prisma_1.default.lend.findMany({ where: { userId, paid: false } }),
        prisma_1.default.borrow.findMany({ where: { userId, paid: false } }),
        prisma_1.default.income.aggregate({ where: { userId, date: { startsWith: month } }, _sum: { amount: true } }),
        prisma_1.default.expense.aggregate({ where: { userId, date: { startsWith: month } }, _sum: { amount: true } }),
        prisma_1.default.income.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 10,
        }),
    ]);
    const totalIncome = allIncome._sum.amount ?? 0;
    const totalExpense = allExpense._sum.amount ?? 0;
    const pendingLend = pendingLendItems.reduce((s, i) => s + i.amount, 0);
    const pendingBorrow = pendingBorrowItems.reduce((s, i) => s + i.amount, 0);
    const mI = mIncome._sum.amount ?? 0;
    const mE = mExpense._sum.amount ?? 0;
    // Category breakdown for the month
    const mExpenseRows = await prisma_1.default.expense.findMany({
        where: { userId, date: { startsWith: month } },
        select: { category: true, amount: true },
    });
    const expenseByCat = {};
    mExpenseRows.forEach((r) => {
        expenseByCat[r.category] = (expenseByCat[r.category] || 0) + r.amount;
    });
    // Upcoming dues within 7 days
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const allPending = [
        ...pendingLendItems.filter((i) => i.dueDate).map((i) => ({
            type: "lend", name: i.to, amount: i.amount, dueDate: i.dueDate,
            daysLeft: Math.ceil((new Date(i.dueDate).getTime() - now.getTime()) / 86400000),
        })),
        ...pendingBorrowItems.filter((i) => i.dueDate).map((i) => ({
            type: "borrow", name: i.from, amount: i.amount, dueDate: i.dueDate,
            daysLeft: Math.ceil((new Date(i.dueDate).getTime() - now.getTime()) / 86400000),
        })),
    ].filter((d) => d.daysLeft <= 7).sort((a, b) => a.daysLeft - b.daysLeft);
    res.json({
        totals: { income: totalIncome, expense: totalExpense, pendingLend, pendingBorrow, net: totalIncome - totalExpense },
        monthly: {
            income: mI, expense: mE, savings: mI - mE,
            saveRate: mI > 0 ? Math.round(((mI - mE) / mI) * 100) : 0,
        },
        expenseByCat,
        upcoming: allPending,
    });
});
