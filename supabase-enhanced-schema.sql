-- =====================================================
-- ENHANCED SCHEMA FOR COMPREHENSIVE TRAFFIC ANALYTICS
-- =====================================================
-- Run this after the initial schema setup to add all
-- additional tables for complete data capture
-- =====================================================

-- =====================================================
-- TABLE 1: Camera Metadata
-- =====================================================
-- Stores static information about each camera
-- =====================================================

CREATE TABLE IF NOT EXISTS camera_metadata (
  camera_id VARCHAR(20) PRIMARY KEY,
  camera_name VARCHAR(100) NOT NULL,
  location_description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  installation_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial camera data from API
INSERT INTO camera_metadata (camera_id, camera_name, is_active) VALUES
  ('cam_01', 'Av. Homero Oeste - Este', true),
  ('cam_02', 'Av. Homero Este - Oeste', true),
  ('cam_03', 'Av. Industrias Norte - Sur', true),
  ('cam_04', 'Av. Industrias Sur - Norte', true)
ON CONFLICT (camera_id) DO UPDATE
  SET camera_name = EXCLUDED.camera_name,
      updated_at = NOW();

-- Enable RLS
ALTER TABLE camera_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read camera_metadata" ON camera_metadata
  FOR SELECT USING (true);

CREATE POLICY "Allow public update camera_metadata" ON camera_metadata
  FOR UPDATE USING (true) WITH CHECK (true);

COMMENT ON TABLE camera_metadata IS 'Almacena metadata estática de las cámaras de tráfico';


-- =====================================================
-- TABLE 2: Traffic Live Snapshots (5-minute resolution)
-- =====================================================
-- Stores real-time traffic snapshots every 5 minutes
-- =====================================================

CREATE TABLE IF NOT EXISTS traffic_live_snapshots (
  id BIGSERIAL PRIMARY KEY,
  snapshot_time TIMESTAMP WITH TIME ZONE NOT NULL,
  camera_id VARCHAR(20) NOT NULL REFERENCES camera_metadata(camera_id),

  -- Vehicle counts by type and direction
  car_in INTEGER DEFAULT 0,
  car_out INTEGER DEFAULT 0,
  bus_in INTEGER DEFAULT 0,
  bus_out INTEGER DEFAULT 0,
  truck_in INTEGER DEFAULT 0,
  truck_out INTEGER DEFAULT 0,

  -- Pre-calculated totals for faster queries
  total_in INTEGER NOT NULL,
  total_out INTEGER NOT NULL,
  net_flow INTEGER GENERATED ALWAYS AS (total_in - total_out) STORED,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique snapshots per camera per time
  UNIQUE(snapshot_time, camera_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_snapshots_time ON traffic_live_snapshots(snapshot_time DESC);
CREATE INDEX IF NOT EXISTS idx_live_snapshots_camera ON traffic_live_snapshots(camera_id);
CREATE INDEX IF NOT EXISTS idx_live_snapshots_time_camera ON traffic_live_snapshots(snapshot_time DESC, camera_id);
CREATE INDEX IF NOT EXISTS idx_live_snapshots_net_flow ON traffic_live_snapshots(net_flow) WHERE ABS(net_flow) > 20;

-- Enable RLS
ALTER TABLE traffic_live_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read live_snapshots" ON traffic_live_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert live_snapshots" ON traffic_live_snapshots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update live_snapshots" ON traffic_live_snapshots
  FOR UPDATE USING (true) WITH CHECK (true);

COMMENT ON TABLE traffic_live_snapshots IS 'Snapshots de tráfico en tiempo real cada 5 minutos';
COMMENT ON COLUMN traffic_live_snapshots.net_flow IS 'Flujo neto (positivo = acumulación, negativo = dispersión)';


-- =====================================================
-- TABLE 3: Traffic Daily Summary
-- =====================================================
-- Pre-aggregated daily statistics for fast queries
-- =====================================================

CREATE TABLE IF NOT EXISTS traffic_daily_summary (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  camera_id VARCHAR(20) NOT NULL REFERENCES camera_metadata(camera_id),

  -- Vehicle totals by type
  car_in_total INTEGER DEFAULT 0,
  car_out_total INTEGER DEFAULT 0,
  bus_in_total INTEGER DEFAULT 0,
  bus_out_total INTEGER DEFAULT 0,
  truck_in_total INTEGER DEFAULT 0,
  truck_out_total INTEGER DEFAULT 0,

  -- Aggregates
  total_in INTEGER NOT NULL,
  total_out INTEGER NOT NULL,
  net_flow INTEGER GENERATED ALWAYS AS (total_in - total_out) STORED,

  -- Peak hour statistics (hour of day 0-23)
  peak_hour_in INTEGER,
  peak_hour_out INTEGER,
  peak_hour_value INTEGER,

  -- Quality metrics
  avg_confidence DECIMAL(5, 3),
  hours_with_data INTEGER, -- How many hours had data
  data_completeness DECIMAL(5, 2), -- Percentage (0-100)

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(date, camera_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON traffic_daily_summary(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_summary_camera ON traffic_daily_summary(camera_id);
CREATE INDEX IF NOT EXISTS idx_daily_summary_date_camera ON traffic_daily_summary(date DESC, camera_id);

-- Enable RLS
ALTER TABLE traffic_daily_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read daily_summary" ON traffic_daily_summary
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert daily_summary" ON traffic_daily_summary
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update daily_summary" ON traffic_daily_summary
  FOR UPDATE USING (true) WITH CHECK (true);

COMMENT ON TABLE traffic_daily_summary IS 'Resumen diario de tráfico por cámara para consultas rápidas';


-- =====================================================
-- TABLE 4: Traffic Anomalies
-- =====================================================
-- Stores detected traffic anomalies and alerts
-- =====================================================

CREATE TABLE IF NOT EXISTS traffic_anomalies (
  id BIGSERIAL PRIMARY KEY,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
  camera_id VARCHAR(20) NOT NULL REFERENCES camera_metadata(camera_id),

  -- Anomaly classification
  anomaly_type VARCHAR(50) NOT NULL, -- 'high_traffic', 'congestion', 'no_activity', 'unusual_pattern'
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'

  -- Context
  reference_period TIMESTAMP WITH TIME ZONE,
  metric_name VARCHAR(50), -- 'total_in', 'net_flow', 'vehicle_count', etc.
  metric_value DECIMAL(10, 2),
  threshold_value DECIMAL(10, 2),
  deviation_percentage DECIMAL(5, 2),

  -- Additional context as JSON
  metadata JSONB,

  -- Resolution tracking
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_anomalies_time ON traffic_anomalies(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_camera ON traffic_anomalies(camera_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_type ON traffic_anomalies(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON traffic_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_anomalies_unresolved ON traffic_anomalies(is_resolved) WHERE is_resolved = false;

-- Enable RLS
ALTER TABLE traffic_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read anomalies" ON traffic_anomalies
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert anomalies" ON traffic_anomalies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update anomalies" ON traffic_anomalies
  FOR UPDATE USING (true) WITH CHECK (true);

COMMENT ON TABLE traffic_anomalies IS 'Registro de anomalías detectadas en el tráfico';


-- =====================================================
-- TABLE 5: API Fetch Log
-- =====================================================
-- Monitors API data collection and pipeline health
-- =====================================================

CREATE TABLE IF NOT EXISTS api_fetch_log (
  id BIGSERIAL PRIMARY KEY,
  fetch_time TIMESTAMP WITH TIME ZONE NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'partial'

  -- Metrics
  records_fetched INTEGER DEFAULT 0,
  records_inserted INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,

  -- Performance
  response_time_ms INTEGER,

  -- Error tracking
  error_message TEXT,
  error_details JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fetch_log_time ON api_fetch_log(fetch_time DESC);
CREATE INDEX IF NOT EXISTS idx_fetch_log_endpoint ON api_fetch_log(endpoint);
CREATE INDEX IF NOT EXISTS idx_fetch_log_status ON api_fetch_log(status);
CREATE INDEX IF NOT EXISTS idx_fetch_log_errors ON api_fetch_log(status) WHERE status = 'error';

-- Enable RLS
ALTER TABLE api_fetch_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read fetch_log" ON api_fetch_log
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert fetch_log" ON api_fetch_log
  FOR INSERT WITH CHECK (true);

COMMENT ON TABLE api_fetch_log IS 'Log de fetches a la API para monitoreo y debugging';


-- =====================================================
-- USEFUL VIEWS FOR ANALYTICS
-- =====================================================

-- View: Recent congestion events
CREATE OR REPLACE VIEW recent_congestion AS
SELECT
  a.detected_at,
  c.camera_name,
  a.severity,
  a.metric_value,
  a.threshold_value,
  a.deviation_percentage,
  a.is_resolved
FROM traffic_anomalies a
JOIN camera_metadata c ON a.camera_id = c.camera_id
WHERE a.anomaly_type IN ('high_traffic', 'congestion')
  AND a.detected_at > NOW() - INTERVAL '7 days'
ORDER BY a.detected_at DESC;

-- View: Camera health summary
CREATE OR REPLACE VIEW camera_health_summary AS
SELECT
  c.camera_id,
  c.camera_name,
  c.is_active,
  COUNT(DISTINCT DATE(l.snapshot_time)) as days_with_data,
  COUNT(*) as total_snapshots,
  MAX(l.snapshot_time) as last_snapshot,
  AVG(l.total_in + l.total_out) as avg_vehicles_per_snapshot
FROM camera_metadata c
LEFT JOIN traffic_live_snapshots l ON c.camera_id = l.camera_id
WHERE l.snapshot_time > NOW() - INTERVAL '30 days'
GROUP BY c.camera_id, c.camera_name, c.is_active;

-- View: Daily traffic trends
CREATE OR REPLACE VIEW daily_traffic_trends AS
SELECT
  d.date,
  c.camera_name,
  d.total_in + d.total_out as total_vehicles,
  d.net_flow,
  d.peak_hour_value,
  d.data_completeness,
  LAG(d.total_in + d.total_out) OVER (PARTITION BY d.camera_id ORDER BY d.date) as prev_day_total,
  ((d.total_in + d.total_out - LAG(d.total_in + d.total_out) OVER (PARTITION BY d.camera_id ORDER BY d.date))::DECIMAL /
   NULLIF(LAG(d.total_in + d.total_out) OVER (PARTITION BY d.camera_id ORDER BY d.date), 0) * 100) as pct_change
FROM traffic_daily_summary d
JOIN camera_metadata c ON d.camera_id = c.camera_id
ORDER BY d.date DESC, c.camera_name;


-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Enhanced schema created successfully!';
  RAISE NOTICE '📊 New tables: camera_metadata, traffic_live_snapshots, traffic_daily_summary, traffic_anomalies, api_fetch_log';
  RAISE NOTICE '📈 Views created: recent_congestion, camera_health_summary, daily_traffic_trends';
  RAISE NOTICE '🚀 Ready for comprehensive traffic analytics!';
END $$;
