#!/usr/bin/env node
/**
 * হিসাবনিকাশ — JSON থেকে PostgreSQL মাইগ্রেশন স্ক্রিপ্ট
 * 
 * পুরনো data/hisabnkash.json ফাইলের ডেটা PostgreSQL-এ নিয়ে যাবে।
 * ব্যবহার: DATABASE_URL=... node migrate-json-to-pg.js
 */

const fs = require("fs")
const path = require("path")
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

const prisma = new PrismaClient()

async function main() {
  const dbPath = path.join(process.cwd(), "data", "hisabnkash.json")

  if (!fs.existsSync(dbPath)) {
    console.log("⚠️  data/hisabnkash.json পাওয়া যায়নি। মাইগ্রেশনের কিছু নেই।")
    return
  }

  const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"))
  console.log(`📦 পাওয়া গেছে: ${data.users?.length || 0} ইউজার`)

  for (const user of data.users || []) {
    console.log(`👤 মাইগ্রেট করছি: ${user.email}`)

    // Create user (upsert to avoid duplicates)
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: new Date(user.createdAt || Date.now()),
      },
    })

    // Income
    const userIncome = (data.income || []).filter((i) => i.userId === user.id)
    for (const item of userIncome) {
      await prisma.income.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id, userId: dbUser.id,
          amount: item.amount, date: item.date,
          from: item.from || "", medium: item.medium,
          category: item.category, reason: item.reason || "",
          createdAt: new Date(item.createdAt || Date.now()),
        },
      })
    }
    console.log(`  ✓ আয়: ${userIncome.length} টি`)

    // Expense
    const userExpense = (data.expense || []).filter((i) => i.userId === user.id)
    for (const item of userExpense) {
      await prisma.expense.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id, userId: dbUser.id,
          amount: item.amount, date: item.date,
          payTo: item.payTo || "", medium: item.medium,
          category: item.category, reason: item.reason || "",
          createdAt: new Date(item.createdAt || Date.now()),
        },
      })
    }
    console.log(`  ✓ ব্যয়: ${userExpense.length} টি`)

    // Lend
    const userLend = (data.lend || []).filter((i) => i.userId === user.id)
    for (const item of userLend) {
      await prisma.lend.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id, userId: dbUser.id,
          amount: item.amount, date: item.date,
          to: item.to, medium: item.medium,
          dueDate: item.dueDate || "", reason: item.reason || "",
          paid: item.paid || false, paidDate: item.paidDate || null,
          createdAt: new Date(item.createdAt || Date.now()),
        },
      })
    }
    console.log(`  ✓ ধার দিলাম: ${userLend.length} টি`)

    // Borrow
    const userBorrow = (data.borrow || []).filter((i) => i.userId === user.id)
    for (const item of userBorrow) {
      await prisma.borrow.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id, userId: dbUser.id,
          amount: item.amount, date: item.date,
          from: item.from, medium: item.medium,
          dueDate: item.dueDate || "", reason: item.reason || "",
          paid: item.paid || false, paidDate: item.paidDate || null,
          createdAt: new Date(item.createdAt || Date.now()),
        },
      })
    }
    console.log(`  ✓ ধার নিলাম: ${userBorrow.length} টি`)

    // Budgets
    const userBudgets = (data.budgets || []).filter((b) => b.userId === user.id)
    for (const b of userBudgets) {
      await prisma.budget.upsert({
        where: { userId_month_category: { userId: dbUser.id, month: b.month, category: b.category } },
        update: { amount: b.amount },
        create: { id: b.id || uuidv4(), userId: dbUser.id, month: b.month, category: b.category, amount: b.amount },
      })
    }
    console.log(`  ✓ বাজেট: ${userBudgets.length} টি`)
  }

  console.log("\n✅ মাইগ্রেশন সম্পন্ন হয়েছে!")
}

main()
  .catch((e) => { console.error("❌ মাইগ্রেশন ব্যর্থ:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
