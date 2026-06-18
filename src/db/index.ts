import fs from "fs"
import path from "path"
import type { User, Income, Expense, Lend, Borrow, Budget } from "../types"

const DB_DIR = path.join(process.cwd(), "data")
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

const DB_PATH = path.join(DB_DIR, "hisabnkash.json")

interface DBSchema {
  users: User[]
  income: Income[]
  expense: Expense[]
  lend: Lend[]
  borrow: Borrow[]
  budgets: Budget[]
}

function readDB(): DBSchema {
  if (!fs.existsSync(DB_PATH)) {
    return { users: [], income: [], expense: [], lend: [], borrow: [], budgets: [] }
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"))
}

function writeDB(data: DBSchema): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8")
}

export const db = {
  read: readDB,
  write: writeDB,

  transaction<T>(fn: (data: DBSchema) => T): T {
    const data = readDB()
    const result = fn(data)
    writeDB(data)
    return result
  },
}

export default db
