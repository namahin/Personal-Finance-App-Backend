"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
exports.default = exports.prisma;
