-- v3: Accounts, Recurring, SavingsGoals, Tags + new columns

CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'wallet', "opening_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#3b82f6', "icon" TEXT NOT NULL DEFAULT 'wallet',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "recurrings" (
    "id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL, "name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL DEFAULT '', "contact_phone" TEXT NOT NULL DEFAULT '',
    "medium" TEXT NOT NULL, "category" TEXT NOT NULL, "reason" TEXT NOT NULL DEFAULT '',
    "frequency" TEXT NOT NULL DEFAULT 'monthly', "day_of_month" INTEGER,
    "start_date" TEXT NOT NULL, "end_date" TEXT, "last_run_date" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true, "auto_create" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recurrings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "savings_goals" (
    "id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "name" TEXT NOT NULL,
    "target_amount" DOUBLE PRECISION NOT NULL, "current_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "target_date" TEXT, "icon" TEXT NOT NULL DEFAULT 'target', "color" TEXT NOT NULL DEFAULT '#10b981',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "accounts" ADD CONSTRAINT IF NOT EXISTS "accounts_user_id_name_key" UNIQUE ("user_id", "name");
ALTER TABLE "tags" ADD CONSTRAINT IF NOT EXISTS "tags_user_id_name_key" UNIQUE ("user_id", "name");

CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts"("user_id");
CREATE INDEX IF NOT EXISTS "recurrings_user_id_idx" ON "recurrings"("user_id");
CREATE INDEX IF NOT EXISTS "savings_goals_user_id_idx" ON "savings_goals"("user_id");
CREATE INDEX IF NOT EXISTS "tags_user_id_idx" ON "tags"("user_id");

ALTER TABLE "accounts" ADD CONSTRAINT IF NOT EXISTS "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recurrings" ADD CONSTRAINT IF NOT EXISTS "recurrings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "savings_goals" ADD CONSTRAINT IF NOT EXISTS "savings_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tags" ADD CONSTRAINT IF NOT EXISTS "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- New columns on existing tables
ALTER TABLE "income" ADD COLUMN IF NOT EXISTS "account_id" TEXT;
ALTER TABLE "income" ADD COLUMN IF NOT EXISTS "tags" TEXT NOT NULL DEFAULT '';
ALTER TABLE "income" ADD COLUMN IF NOT EXISTS "recurring_id" TEXT;
ALTER TABLE "expense" ADD COLUMN IF NOT EXISTS "account_id" TEXT;
ALTER TABLE "expense" ADD COLUMN IF NOT EXISTS "tags" TEXT NOT NULL DEFAULT '';
ALTER TABLE "expense" ADD COLUMN IF NOT EXISTS "recurring_id" TEXT;
ALTER TABLE "lend" ADD COLUMN IF NOT EXISTS "account_id" TEXT;
ALTER TABLE "borrow" ADD COLUMN IF NOT EXISTS "account_id" TEXT;
