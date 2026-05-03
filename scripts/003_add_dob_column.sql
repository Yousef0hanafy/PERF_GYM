-- Migration: Add date_of_birth column to members table
-- Run this if your members table was already created without the date_of_birth column

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

CREATE INDEX IF NOT EXISTS idx_members_dob ON members(date_of_birth);
