-- Fix Database Schema for Subtopic Tables
-- Run this SQL in your Supabase SQL Editor

-- 1. Check if Subtopic table exists and add missing columns
DO $$ 
BEGIN
    -- Add createdAt if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='Subtopic' AND column_name='createdAt'
    ) THEN
        ALTER TABLE "Subtopic" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added createdAt column to Subtopic table';
    END IF;

    -- Add updatedAt if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='Subtopic' AND column_name='updatedAt'
    ) THEN
        ALTER TABLE "Subtopic" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updatedAt column to Subtopic table';
    END IF;
END $$;

-- 2. Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Subtopic'
ORDER BY ordinal_position;
