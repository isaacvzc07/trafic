-- Crear tabla para snapshots de cámaras
CREATE TABLE IF NOT EXISTS camera_snapshots (
  id SERIAL PRIMARY KEY,
  camera_id VARCHAR(50) NOT NULL,
  incident_type VARCHAR(100),
  description TEXT,
  snapshot_url TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_camera_snapshots_camera_id ON camera_snapshots(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_snapshots_timestamp ON camera_snapshots(timestamp);
CREATE INDEX IF NOT EXISTS idx_camera_snapshots_incident_type ON camera_snapshots(incident_type);

-- Habilitar RLS (Row Level Security) por seguridad
ALTER TABLE camera_snapshots ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones al service role
CREATE POLICY "Allow all operations for service role" ON camera_snapshots
  FOR ALL USING (auth.role() = 'service_role');

-- Política para lecturas públicas si es necesario
CREATE POLICY "Allow read access for anonymous users" ON camera_snapshots
  FOR SELECT USING (auth.role() = 'anon');
