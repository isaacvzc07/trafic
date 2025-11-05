-- Tabla para almacenar estadísticas de tráfico por hora
CREATE TABLE IF NOT EXISTS traffic_hourly_stats (
  id BIGSERIAL PRIMARY KEY,
  hour TIMESTAMP WITH TIME ZONE NOT NULL,
  camera_id VARCHAR(20) NOT NULL,
  vehicle_type VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  count INTEGER NOT NULL,
  avg_confidence DECIMAL(5, 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Índice único para evitar duplicados
  UNIQUE(hour, camera_id, vehicle_type, direction)
);

-- Índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_traffic_hour ON traffic_hourly_stats(hour DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_camera ON traffic_hourly_stats(camera_id);
CREATE INDEX IF NOT EXISTS idx_traffic_hour_camera ON traffic_hourly_stats(hour DESC, camera_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE traffic_hourly_stats ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Allow public read access" ON traffic_hourly_stats
  FOR SELECT
  USING (true);

-- Política para permitir inserción solo desde el servidor (usando service role)
CREATE POLICY "Allow server insert" ON traffic_hourly_stats
  FOR INSERT
  WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE traffic_hourly_stats IS 'Almacena datos históricos de tráfico vehicular por hora desde la API de trafic.mx';
COMMENT ON COLUMN traffic_hourly_stats.hour IS 'Timestamp UTC de la hora registrada';
COMMENT ON COLUMN traffic_hourly_stats.camera_id IS 'ID de la cámara (cam_01, cam_02, etc)';
COMMENT ON COLUMN traffic_hourly_stats.vehicle_type IS 'Tipo de vehículo: car, bus, truck';
COMMENT ON COLUMN traffic_hourly_stats.direction IS 'Dirección: in, out';
COMMENT ON COLUMN traffic_hourly_stats.count IS 'Número de vehículos contados';
COMMENT ON COLUMN traffic_hourly_stats.avg_confidence IS 'Confianza promedio de detección (0-1)';
