-- Migration: Add session/benefit columns to membership_plans
-- NOTE: This has already been applied to the live Supabase database.
-- Column name is pt_sessions (used for "Orientation Sessions" in the UI)

-- Run only if starting from scratch:
ALTER TABLE membership_plans
  ADD COLUMN IF NOT EXISTS invitations INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pt_sessions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS body_assessments INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS kickboxing_sessions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS freeze_weeks INTEGER DEFAULT 0;

-- Seed the default benefit values per plan (already applied live):
UPDATE membership_plans SET invitations=5,  pt_sessions=1, kickboxing_sessions=1, body_assessments=0, freeze_weeks=0 WHERE name='Monthly';
UPDATE membership_plans SET invitations=5,  pt_sessions=1, kickboxing_sessions=1, body_assessments=1, freeze_weeks=1 WHERE name='Quarter';
UPDATE membership_plans SET invitations=5,  pt_sessions=2, kickboxing_sessions=2, body_assessments=1, freeze_weeks=2 WHERE name='Semi-Annual';
UPDATE membership_plans SET invitations=10, pt_sessions=4, kickboxing_sessions=4, body_assessments=2, freeze_weeks=4 WHERE name='Annual';
