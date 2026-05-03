-- RLS Policies for Performance Gym
-- Run this in your Supabase SQL Editor

-- ============================================================
-- BOOKING REQUESTS
-- ============================================================
-- Enable RLS
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow public insert booking_requests" ON booking_requests;
DROP POLICY IF EXISTS "Allow service role full access booking_requests" ON booking_requests;

-- Public can INSERT (submit a booking form)
CREATE POLICY "Allow public insert booking_requests"
  ON booking_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only the service role (admin via Supabase dashboard or server-side) can SELECT and DELETE
-- For the admin panel using the anon key, we use a simple password check approach.
-- If you want the admin panel to read/delete via anon key, temporarily add:
CREATE POLICY "Allow anon read booking_requests"
  ON booking_requests
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon delete booking_requests"
  ON booking_requests
  FOR DELETE
  TO anon
  USING (true);

-- NOTE: For production security, replace the anon read/delete policies above with
-- server-side authenticated calls using a service role key stored as a server secret
-- (not a NEXT_PUBLIC_ variable). The above policies are suitable for a private admin
-- panel where only the admin knows the password.

-- ============================================================
-- MEMBERS — Allow public read for portal login verification
-- ============================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read members" ON members;
DROP POLICY IF EXISTS "Allow anon insert members" ON members;
DROP POLICY IF EXISTS "Allow anon update members" ON members;

CREATE POLICY "Allow anon read members"
  ON members FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert members"
  ON members FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update members"
  ON members FOR UPDATE TO anon USING (true);

-- ============================================================
-- GALLERY — Public read, anon write for admin panel
-- ============================================================
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all gallery_images" ON gallery_images;
CREATE POLICY "Allow anon all gallery_images"
  ON gallery_images FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- TRANSFORMATIONS — Public read, anon write for admin panel
-- ============================================================
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all transformations" ON transformations;
CREATE POLICY "Allow anon all transformations"
  ON transformations FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- TESTIMONIALS — Public read
-- ============================================================
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read testimonials" ON testimonials;
CREATE POLICY "Allow anon read testimonials"
  ON testimonials FOR SELECT TO anon USING (true);

-- ============================================================
-- MEMBERSHIP PLANS — Public read
-- ============================================================
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read membership_plans" ON membership_plans;
CREATE POLICY "Allow anon read membership_plans"
  ON membership_plans FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon all membership_plans" ON membership_plans;
CREATE POLICY "Allow anon all membership_plans"
  ON membership_plans FOR ALL TO anon USING (true) WITH CHECK (true);
