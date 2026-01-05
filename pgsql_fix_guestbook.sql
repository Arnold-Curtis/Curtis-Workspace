-- ============================================
-- PostgreSQL Fix: Add 'approved' column to guestbook
-- Run this on your local PostgreSQL database
-- ============================================

-- Add the 'approved' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guestbook' AND column_name = 'approved'
    ) THEN
        ALTER TABLE guestbook ADD COLUMN approved SMALLINT DEFAULT 0;
    END IF;
END $$;

-- Create index for faster queries on approved entries
CREATE INDEX IF NOT EXISTS idx_guestbook_approved ON guestbook(approved);

-- Sync existing 'status' column with 'approved' column
-- Set approved = 1 for any entries where status = 'approved'
UPDATE guestbook SET approved = 1 WHERE status = 'approved';

-- ============================================
-- SUCCESS!
-- The 'approved' column has been added to the guestbook table
-- ============================================
