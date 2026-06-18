"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("./routes/auth"));
const income_1 = __importDefault(require("./routes/income"));
const transactions_1 = require("./routes/transactions");
const budget_1 = require("./routes/budget");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// ─── Middleware ────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// ─── Routes ───────────────────────────────────────────────────
app.use("/api/auth", auth_1.default);
app.use("/api/income", income_1.default);
app.use("/api/expense", transactions_1.expenseRouter);
app.use("/api/lend", transactions_1.lendRouter);
app.use("/api/borrow", transactions_1.borrowRouter);
app.use("/api/budget", budget_1.budgetRouter);
app.use("/api/summary", budget_1.summaryRouter);
// ─── Health check ─────────────────────────────────────────────
app.get("/api/health", (_, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), version: "2.0.0" });
});
// ─── 404 ──────────────────────────────────────────────────────
app.use((_, res) => {
    res.status(404).json({ error: "Route পাওয়া যায়নি" });
});
// ─── Error handler ────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে" });
});
app.listen(PORT, () => {
    console.log(`✅ হিসাবনিকাশ API চলছে → http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});
exports.default = app;
