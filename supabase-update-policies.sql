-- Update RLS policies to allow upsert operations
-- Run this after the initial schema setup

-- Drop existing policies
DROP POLICY IF EXISTS "Allow server insert" ON traffic_hourly_stats;

-- Create new policy for INSERT
CREATE POLICY "Allow public insert" ON traffic_hourly_stats
  FOR INSERT
  WITH CHECK (true);

-- Create new policy for UPDATE (needed for upsert)
CREATE POLICY "Allow public update" ON traffic_hourly_stats
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
