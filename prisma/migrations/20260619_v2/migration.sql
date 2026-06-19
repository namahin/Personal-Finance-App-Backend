-- contacts, categories, mediums tables + new columns

CREATE TABLE IF NOT EXISTS "contacts" (
    "id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '', "type" TEXT NOT NULL DEFAULT 'person',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "name" TEXT NOT NULL,
    "for_type" TEXT NOT NULL, "color" TEXT NOT NULL DEFAULT '#6b7280',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "mediums" (
    "id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mediums_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "contacts" ADD CONSTRAINT IF NOT EXISTS "contacts_user_id_name_key" UNIQUE ("user_id", "name");
ALTER TABLE "categories" ADD CONSTRAINT IF NOT EXISTS "categories_uid_name_type_key" UNIQUE ("user_id", "name", "for_type");
ALTER TABLE "mediums" ADD CONSTRAINT IF NOT EXISTS "mediums_user_id_name_key" UNIQUE ("user_id", "name");
CREATE INDEX IF NOT EXISTS "contacts_user_id_idx" ON "contacts"("user_id");
CREATE INDEX IF NOT EXISTS "categories_user_id_for_type_idx" ON "categories"("user_id", "for_type");
CREATE INDEX IF NOT EXISTS "mediums_user_id_idx" ON "mediums"("user_id");
ALTER TABLE "contacts" ADD CONSTRAINT IF NOT EXISTS "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT IF NOT EXISTS "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mediums" ADD CONSTRAINT IF NOT EXISTS "mediums_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "income" ADD COLUMN IF NOT EXISTS "from_phone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "income" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "expense" ADD COLUMN IF NOT EXISTS "pay_to_phone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "expense" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "lend" ADD COLUMN IF NOT EXISTS "to_phone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "lend" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "borrow" ADD COLUMN IF NOT EXISTS "from_phone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "borrow" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
