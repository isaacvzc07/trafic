-- =====================================================
-- MIGRATION: Enhance traffic_hourly_stats table
-- =====================================================
-- Adds computed fields and metadata to existing hourly stats
-- =====================================================

-- Add new columns for enhanced analytics
ALTER TABLE traffic_hourly_stats
  ADD COLUMN IF NOT EXISTS hour_of_day INTEGER,
  ADD COLUMN IF NOT EXISTS day_of_week INTEGER,
  ADD COLUMN IF NOT EXISTS is_weekend BOOLEAN,
  ADD COLUMN IF NOT EXISTS week_number INTEGER,
  ADD COLUMN IF NOT EXISTS month INTEGER,
  ADD COLUMN IF NOT EXISTS year INTEGER;

-- Add comment
COMMENT ON COLUMN traffic_hourly_stats.hour_of_day IS 'Hora del día (0-23) para análisis de patrones';
COMMENT ON COLUMN traffic_hourly_stats.day_of_week IS 'Día de la semana (0=Domingo, 6=Sábado)';
COMMENT ON COLUMN traffic_hourly_stats.is_weekend IS 'True si es sábado o domingo';

-- Backfill temporal fields for existing records
UPDATE traffic_hourly_stats
SET
  hour_of_day = EXTRACT(HOUR FROM hour),
  day_of_week = EXTRACT(DOW FROM hour),
  is_weekend = EXTRACT(DOW FROM hour) IN (0, 6),
  week_number = EXTRACT(WEEK FROM hour),
  month = EXTRACT(MONTH FROM hour),
  year = EXTRACT(YEAR FROM hour)
WHERE hour_of_day IS NULL;

-- Create function to automatically populate temporal fields on insert/update
CREATE OR REPLACE FUNCTION populate_temporal_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hour_of_day := EXTRACT(HOUR FROM NEW.hour);
  NEW.day_of_week := EXTRACT(DOW FROM NEW.hour);
  NEW.is_weekend := EXTRACT(DOW FROM NEW.hour) IN (0, 6);
  NEW.week_number := EXTRACT(WEEK FROM NEW.hour);
  NEW.month := EXTRACT(MONTH FROM NEW.hour);
  NEW.year := EXTRACT(YEAR FROM NEW.hour);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_temporal_fields ON traffic_hourly_stats;
CREATE TRIGGER set_temporal_fields
  BEFORE INSERT OR UPDATE ON traffic_hourly_stats
  FOR EACH ROW
  EXECUTE FUNCTION populate_temporal_fields();

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_hourly_hour_of_day ON traffic_hourly_stats(hour_of_day);
CREATE INDEX IF NOT EXISTS idx_hourly_day_of_week ON traffic_hourly_stats(day_of_week);
CREATE INDEX IF NOT EXISTS idx_hourly_weekend ON traffic_hourly_stats(is_weekend);
CREATE INDEX IF NOT EXISTS idx_hourly_year_month ON traffic_hourly_stats(year, month);

-- =====================================================
-- Create materialized view for common analytics queries
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_traffic_patterns AS
SELECT
  camera_id,
  hour_of_day,
  day_of_week,
  is_weekend,
  vehicle_type,
  direction,
  AVG(count) as avg_count,
  MIN(count) as min_count,
  MAX(count) as max_count,
  STDDEV(count) as stddev_count,
  COUNT(*) as sample_size,
  AVG(avg_confidence) as avg_confidence_score
FROM traffic_hourly_stats
GROUP BY camera_id, hour_of_day, day_of_week, is_weekend, vehicle_type, direction;

-- Create unique index for fast refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_hourly_patterns_unique
  ON hourly_traffic_patterns(camera_id, hour_of_day, day_of_week, is_weekend, vehicle_type, direction);

COMMENT ON MATERIALIZED VIEW hourly_traffic_patterns IS 'Patrones de tráfico pre-calculados para consultas rápidas';

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_hourly_patterns()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY hourly_traffic_patterns;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_hourly_patterns() IS 'Refresca la vista materializada de patrones horarios';

-- =====================================================
-- Completion message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ traffic_hourly_stats table enhanced successfully!';
  RAISE NOTICE '📊 Added temporal fields: hour_of_day, day_of_week, is_weekend, etc.';
  RAISE NOTICE '🔄 Auto-population trigger created';
  RAISE NOTICE '📈 Materialized view for patterns created';
END $$;
