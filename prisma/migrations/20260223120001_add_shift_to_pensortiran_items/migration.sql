-- Add shift column to pensortiran_items to store per-baris shift pensortiran
ALTER TABLE "pensortiran_items"
ADD COLUMN "shift" "Shift" NOT NULL DEFAULT 'siang';

