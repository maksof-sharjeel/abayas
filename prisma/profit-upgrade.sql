-- Preserve unknown historical costs as NULL. Additive and repeatable.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "costPrice" DOUBLE PRECISION;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "itemCost" DOUBLE PRECISION;
