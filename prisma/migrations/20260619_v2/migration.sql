-- contacts table
CREATE TABLE IF NOT EXISTS "contacts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'person',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- categories table
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "for_type" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- mediums table
CREATE TABLE IF NOT EXISTS "mediums" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mediums_pkey" PRIMARY KEY ("id")
);

-- Unique constraints (standard PostgreSQL syntax)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_user_id_name_key') THEN
    ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_name_key" UNIQUE ("user_id", "name");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_uid_name_type_key') THEN
    ALTER TABLE "categories" ADD CONSTRAINT "categories_uid_name_type_key" UNIQUE ("user_id", "name", "for_type");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mediums_user_id_name_key') THEN
    ALTER TABLE "mediums" ADD CONSTRAINT "mediums_user_id_name_key" UNIQUE ("user_id", "name");
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS "contacts_user_id_idx" ON "contacts"("user_id");
CREATE INDEX IF NOT EXISTS "categories_user_id_for_type_idx" ON "categories"("user_id", "for_type");
CREATE INDEX IF NOT EXISTS "mediums_user_id_idx" ON "mediums"("user_id");

-- Foreign keys
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_user_id_fkey') THEN
    ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_user_id_fkey') THEN
    ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mediums_user_id_fkey') THEN
    ALTER TABLE "mediums" ADD CONSTRAINT "mediums_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Add new columns to existing tables (idempotent)
ALTER TABLE "income"
  ADD COLUMN IF NOT EXISTS "from_phone" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "expense"
  ADD COLUMN IF NOT EXISTS "pay_to_phone" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "lend"
  ADD COLUMN IF NOT EXISTS "to_phone" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "borrow"
  ADD COLUMN IF NOT EXISTS "from_phone" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
