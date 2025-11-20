-- Migration to support file uploads for portfolios
-- This adds a new column to store file paths while keeping URL support

-- Add portfolio_file_path column to store uploaded file paths
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS portfolio_file_path text;

-- Add comment to explain the new column
COMMENT ON COLUMN public.participants.portfolio_file_path IS 'Path to uploaded portfolio file (PDF, etc.) if file was uploaded instead of URL';

-- Make portfolio_url nullable since users can now choose file or URL
ALTER TABLE public.participants
ALTER COLUMN portfolio_url DROP NOT NULL;

-- Add check constraint to ensure at least one portfolio method is provided
ALTER TABLE public.participants
ADD CONSTRAINT portfolio_required CHECK (
  portfolio_url IS NOT NULL OR portfolio_file_path IS NOT NULL
);

COMMENT ON CONSTRAINT portfolio_required ON public.participants IS 'Ensures that either portfolio URL or file path is provided';
