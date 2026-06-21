-- হিসাবনিকাশ — Consolidated Initial Migration
-- Tables created in dependency order: users -> (contacts, categories, mediums, accounts, tags) -> (income, expense, lend, borrow, budget, recurrings, savings_goals)

-- ============================================================
-- CreateTable: users
-- ============================================================
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: contacts
-- ============================================================
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'person',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: categories
-- ============================================================
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "for_type" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: mediums
-- ============================================================
CREATE TABLE "mediums" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mediums_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: accounts
-- ============================================================
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'wallet',
    "opening_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "icon" TEXT NOT NULL DEFAULT 'wallet',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: tags
-- ============================================================
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: recurrings
-- ============================================================
CREATE TABLE "recurrings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL DEFAULT '',
    "contact_phone" TEXT NOT NULL DEFAULT '',
    "medium" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "day_of_month" INTEGER,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT,
    "last_run_date" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "auto_create" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurrings_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: savings_goals
-- ============================================================
CREATE TABLE "savings_goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target_amount" DOUBLE PRECISION NOT NULL,
    "current_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "target_date" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'target',
    "color" TEXT NOT NULL DEFAULT '#10b981',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: income
-- ============================================================
CREATE TABLE "income" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "from" TEXT NOT NULL DEFAULT '',
    "from_phone" TEXT NOT NULL DEFAULT '',
    "medium" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "account_id" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "recurring_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: expense
-- ============================================================
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "pay_to" TEXT NOT NULL DEFAULT '',
    "pay_to_phone" TEXT NOT NULL DEFAULT '',
    "medium" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "account_id" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "recurring_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: lend
-- ============================================================
CREATE TABLE "lend" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "to_phone" TEXT NOT NULL DEFAULT '',
    "medium" TEXT NOT NULL,
    "due_date" TEXT NOT NULL DEFAULT '',
    "reason" TEXT NOT NULL DEFAULT '',
    "account_id" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lend_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: borrow
-- ============================================================
CREATE TABLE "borrow" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "from_phone" TEXT NOT NULL DEFAULT '',
    "medium" TEXT NOT NULL,
    "due_date" TEXT NOT NULL DEFAULT '',
    "reason" TEXT NOT NULL DEFAULT '',
    "account_id" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "borrow_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CreateTable: budget
-- ============================================================
CREATE TABLE "budget" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- Unique constraints
-- ============================================================
ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_name_key" UNIQUE ("user_id", "name");
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_name_for_type_key" UNIQUE ("user_id", "name", "for_type");
ALTER TABLE "mediums" ADD CONSTRAINT "mediums_user_id_name_key" UNIQUE ("user_id", "name");
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_name_key" UNIQUE ("user_id", "name");
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_name_key" UNIQUE ("user_id", "name");
ALTER TABLE "budget" ADD CONSTRAINT "budget_user_id_month_category_key" UNIQUE ("user_id", "month", "category");

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX "contacts_user_id_idx" ON "contacts"("user_id");
CREATE INDEX "categories_user_id_for_type_idx" ON "categories"("user_id", "for_type");
CREATE INDEX "mediums_user_id_idx" ON "mediums"("user_id");
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");
CREATE INDEX "tags_user_id_idx" ON "tags"("user_id");
CREATE INDEX "recurrings_user_id_idx" ON "recurrings"("user_id");
CREATE INDEX "savings_goals_user_id_idx" ON "savings_goals"("user_id");
CREATE INDEX "income_user_id_date_idx" ON "income"("user_id", "date");
CREATE INDEX "expense_user_id_date_idx" ON "expense"("user_id", "date");
CREATE INDEX "lend_user_id_idx" ON "lend"("user_id");
CREATE INDEX "borrow_user_id_idx" ON "borrow"("user_id");
CREATE INDEX "budget_user_id_month_idx" ON "budget"("user_id", "month");

-- ============================================================
-- Foreign keys
-- ============================================================
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mediums" ADD CONSTRAINT "mediums_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recurrings" ADD CONSTRAINT "recurrings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "income" ADD CONSTRAINT "income_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expense" ADD CONSTRAINT "expense_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lend" ADD CONSTRAINT "lend_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "borrow" ADD CONSTRAINT "borrow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budget" ADD CONSTRAINT "budget_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
