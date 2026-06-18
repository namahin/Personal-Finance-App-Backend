"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../db/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
const IncomeSchema = zod_1.z.object({
    amount: zod_1.z.number().positive("পরিমাণ শূন্যের বেশি হতে হবে"),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    from: zod_1.z.string().optional().default(""),
    medium: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    reason: zod_1.z.string().optional().default(""),
});
// GET /api/income
router.get("/", async (req, res) => {
    const { userId } = req.user;
    const { month } = req.query;
    const items = await prisma_1.default.income.findMany({
        where: {
            userId,
            ...(month ? { date: { startsWith: String(month) } } : {}),
        },
        orderBy: { date: "desc" },
    });
    res.json(items);
});
// POST /api/income
router.post("/", async (req, res) => {
    const result = IncomeSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.issues[0]?.message || "ভুল তথ্য" });
        return;
    }
    const { userId } = req.user;
    const item = await prisma_1.default.income.create({ data: { userId, ...result.data } });
    res.status(201).json(item);
});
// DELETE /api/income/:id
router.delete("/:id", async (req, res) => {
    const { userId } = req.user;
    try {
        await prisma_1.default.income.delete({ where: { id: req.params.id, userId } });
        res.json({ success: true });
    }
    catch {
        res.status(404).json({ error: "পাওয়া যায়নি" });
    }
});
exports.default = router;
