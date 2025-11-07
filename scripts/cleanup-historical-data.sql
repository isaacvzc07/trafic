-- Database cleanup script
-- Delete all traffic data before November 6, 2025
-- Keep only recent entries from 2025-11-06 onwards

-- First, let's see what we're deleting
SELECT 
    camera_id,
    hour,
    count,
    created_at
FROM traffic_hourly_stats 
WHERE hour < '2025-11-06T00:00:00.000Z'
ORDER BY hour DESC
LIMIT 10;

-- Count total records to be deleted
SELECT 
    COUNT(*) as total_records_to_delete
FROM traffic_hourly_stats 
WHERE hour < '2025-11-06T00:00:00.000Z';

-- Delete the old data
DELETE FROM traffic_hourly_stats 
WHERE hour < '2025-11-06T00:00:00.000Z';

-- Verify what remains
SELECT 
    camera_id,
    hour,
    count,
    created_at
FROM traffic_hourly_stats 
WHERE hour >= '2025-11-06T00:00:00.000Z'
ORDER BY hour DESC;

-- Show final count
SELECT 
    COUNT(*) as remaining_records
FROM traffic_hourly_stats;
