"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.borrowRouter = exports.lendRouter = exports.expenseRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../db/prisma"));
const auth_1 = require("../middleware/auth");
// ─── Expense ─────────────────────────────────────────────────
exports.expenseRouter = (0, express_1.Router)();
exports.expenseRouter.use(auth_1.auth);
const ExpenseSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    payTo: zod_1.z.string().optional().default(""),
    medium: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    reason: zod_1.z.string().optional().default(""),
});
exports.expenseRouter.get("/", async (req, res) => {
    const { userId } = req.user;
    const { month } = req.query;
    const items = await prisma_1.default.expense.findMany({
        where: { userId, ...(month ? { date: { startsWith: String(month) } } : {}) },
        orderBy: { date: "desc" },
    });
    res.json(items);
});
exports.expenseRouter.post("/", async (req, res) => {
    const result = ExpenseSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.issues[0]?.message });
        return;
    }
    const { userId } = req.user;
    const item = await prisma_1.default.expense.create({ data: { userId, ...result.data } });
    res.status(201).json(item);
});
exports.expenseRouter.delete("/:id", async (req, res) => {
    const { userId } = req.user;
    try {
        await prisma_1.default.expense.delete({ where: { id: req.params.id, userId } });
        res.json({ success: true });
    }
    catch {
        res.status(404).json({ error: "পাওয়া যায়নি" });
    }
});
// ─── Lend ─────────────────────────────────────────────────────
exports.lendRouter = (0, express_1.Router)();
exports.lendRouter.use(auth_1.auth);
const LendSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: zod_1.z.string().min(1, "নাম দিন"),
    medium: zod_1.z.string().min(1),
    dueDate: zod_1.z.string().optional().default(""),
    reason: zod_1.z.string().optional().default(""),
});
exports.lendRouter.get("/", async (req, res) => {
    const { userId } = req.user;
    const items = await prisma_1.default.lend.findMany({ where: { userId }, orderBy: { date: "desc" } });
    res.json(items);
});
exports.lendRouter.post("/", async (req, res) => {
    const result = LendSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.issues[0]?.message });
        return;
    }
    const { userId } = req.user;
    const item = await prisma_1.default.lend.create({ data: { userId, ...result.data } });
    res.status(201).json(item);
});
exports.lendRouter.patch("/:id/paid", async (req, res) => {
    const { userId } = req.user;
    try {
        const item = await prisma_1.default.lend.update({
            where: { id: req.params.id, userId },
            data: { paid: true, paidDate: new Date().toISOString().split("T")[0] },
        });
        res.json(item);
    }
    catch {
        res.status(404).json({ error: "পাওয়া যায়নি" });
    }
});
exports.lendRouter.delete("/:id", async (req, res) => {
    const { userId } = req.user;
    try {
        await prisma_1.default.lend.delete({ where: { id: req.params.id, userId } });
        res.json({ success: true });
    }
    catch {
        res.status(404).json({ error: "পাওয়া যায়নি" });
    }
});
// ─── Borrow ───────────────────────────────────────────────────
exports.borrowRouter = (0, express_1.Router)();
exports.borrowRouter.use(auth_1.auth);
const BorrowSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    from: zod_1.z.string().min(1, "নাম দিন"),
    medium: zod_1.z.string().min(1),
    dueDate: zod_1.z.string().optional().default(""),
    reason: zod_1.z.string().optional().default(""),
});
exports.borrowRouter.get("/", async (req, res) => {
    const { userId } = req.user;
    const items = await prisma_1.default.borrow.findMany({ where: { userId }, orderBy: { date: "desc" } });
    res.json(items);
});
exports.borrowRouter.post("/", async (req, res) => {
    const result = BorrowSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.issues[0]?.message });
        return;
    }
    const { userId } = req.user;
    const item = await prisma_1.default.borrow.create({ data: { userId, ...result.data } });
    res.status(201).json(item);
});
exports.borrowRouter.patch("/:id/paid", async (req, res) => {
    const { userId } = req.user;
    try {
        const item = await prisma_1.default.borrow.update({
            where: { id: req.params.id, userId },
            data: { paid: true, paidDate: new Date().toISOString().split("T")[0] },
        });
        res.json(item);
    }
    catch {
        res.status(404).json({ error: "পাওয়া যায়নি" });
    }
});
exports.borrowRouter.delete("/:id", async (req, res) => {
    const { userId } = req.user;
    try {
        await prisma_1.default.borrow.delete({ where: { id: req.params.id, userId } });
        res.json({ success: true });
    }
    catch {
        res.status(404).json({ error: "পাওয়া যায়নি" });
    }
});
