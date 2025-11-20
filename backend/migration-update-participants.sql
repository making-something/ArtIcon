-- Migration to add new fields to participants table
-- Run this after the initial migration.sql

-- Add new columns to participants table
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS role text,
ADD COLUMN IF NOT EXISTS experience integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS organization text,
ADD COLUMN IF NOT EXISTS specialization text,
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS password_hash text;

-- Add comment to explain the fields
COMMENT ON COLUMN public.participants.role IS 'Participant role: Student, Professional, or Freelancer';
COMMENT ON COLUMN public.participants.experience IS 'Years of experience';
COMMENT ON COLUMN public.participants.organization IS 'Organization or college name';
COMMENT ON COLUMN public.participants.specialization IS 'Field of specialization: UI/UX Design, Video Editing, or Graphic Design';
COMMENT ON COLUMN public.participants.source IS 'How they heard about the competition';
COMMENT ON COLUMN public.participants.password_hash IS 'Hashed password for authentication';

