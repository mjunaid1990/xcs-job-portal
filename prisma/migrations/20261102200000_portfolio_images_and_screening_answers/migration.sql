-- AlterTable portfolio_items to allow project screenshots/images
ALTER TABLE "portfolio_items" ADD COLUMN IF NOT EXISTS "image_url" TEXT;

-- AlterTable proposals to store candidate screening answers
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "screening_answers" TEXT[] NOT NULL DEFAULT '{}';

