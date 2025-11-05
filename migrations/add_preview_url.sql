-- Migration: Add preview_url column to submissions table
-- Date: 2025-01-XX
-- Description: Adds preview_url field to store processed/copied Drive links for preview

-- Add preview_url column if it doesn't exist
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS preview_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN submissions.preview_url IS 'URL to the copied/processed submission file in our Drive for preview purposes';

-- Create index for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_submissions_preview_url ON submissions(preview_url) WHERE preview_url IS NOT NULL;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed: preview_url column added to submissions table';
END $$;
