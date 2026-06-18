"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_DIR = path_1.default.join(process.cwd(), "data");
if (!fs_1.default.existsSync(DB_DIR))
    fs_1.default.mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = path_1.default.join(DB_DIR, "hisabnkash.json");
function readDB() {
    if (!fs_1.default.existsSync(DB_PATH)) {
        return { users: [], income: [], expense: [], lend: [], borrow: [], budgets: [] };
    }
    return JSON.parse(fs_1.default.readFileSync(DB_PATH, "utf-8"));
}
function writeDB(data) {
    fs_1.default.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}
exports.db = {
    read: readDB,
    write: writeDB,
    transaction(fn) {
        const data = readDB();
        const result = fn(data);
        writeDB(data);
        return result;
    },
};
exports.default = exports.db;
