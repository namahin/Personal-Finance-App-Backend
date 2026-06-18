"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../db/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
    email: zod_1.z.string().email("সঠিক ইমেইল দিন"),
    password: zod_1.z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
});
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
// POST /api/auth/register
router.post("/register", async (req, res) => {
    const result = RegisterSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.issues[0]?.message || "ভুল তথ্য" });
        return;
    }
    const { name, email, password } = result.data;
    try {
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.default.user.create({
            data: { name, email, passwordHash },
            select: { id: true, name: true, email: true },
        });
        const token = (0, auth_1.signToken)({ userId: user.id, email: user.email });
        res.status(201).json({ token, user });
    }
    catch (err) {
        if (err.code === "P2002") {
            res.status(409).json({ error: "এই ইমেইলে আগেই অ্যাকাউন্ট আছে" });
        }
        else {
            res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে" });
        }
    }
});
// POST /api/auth/login
router.post("/login", async (req, res) => {
    const result = LoginSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: "সঠিক তথ্য দিন" });
        return;
    }
    const { email, password } = result.data;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড ভুল" });
        return;
    }
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid) {
        res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড ভুল" });
        return;
    }
    const token = (0, auth_1.signToken)({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});
exports.default = router;
