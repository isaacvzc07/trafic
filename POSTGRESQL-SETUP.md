# Configuración de PostgreSQL para Snapshots

## Estado Actual
✅ **API de trafic.mx conectada** - Funcionando con endpoints reales
✅ **Snapshots funcionando** - Obteniendo imágenes reales de las cámaras
✅ **Dashboard integrado** - Componente de historial agregado
⚠️ **Base de datos en modo mock** - Usando almacenamiento temporal

## Para activar PostgreSQL real:

### 1. Instalar paquetes requeridos
```bash
npm install pg @types/pg
```

### 2. Reemplazar implementaciones mock
Los siguientes archivos usan actualmente datos mock y necesitan ser reemplazados:

- `/app/api/v1/history/snapshots/route.ts` - Usar implementación con Pool de PostgreSQL
- `/app/api/v1/cameras/[camera_id]/snapshot/route.ts` - Usar implementación con Pool de PostgreSQL

### 3. Ejecutar SQL en Supabase
Conéctate a tu base de datos Supabase y ejecuta:

```sql
-- Crear tabla para snapshots
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
```

## Funcionalidades Actuales

### ✅ Funcionando:
- **API Real de trafic.mx**: Conexión directa a `https://api.trafic.mx`
- **Snapshots en vivo**: Imágenes JPEG reales de cámaras `cam_01` a `cam_04`
- **Visualización**: Componente `CameraSnapshots` con zoom y descarga
- **Historial**: Componente `SnapshotHistory` con gestión de datos
- **Dashboard**: Integrado completamente en la página principal

### 🔄 Endpoints disponibles:
- `GET /api/v1/cameras/{camera_id}/snapshot` - Obtiene imagen real
- `POST /api/v1/cameras/{camera_id}/snapshot` - Guarda snapshot (mock)
- `GET /api/v1/history/snapshots` - Obtiene historial (mock)
- `DELETE /api/v1/history/snapshots?snapshot_id={id}` - Elimina snapshot (mock)

## Pruebas Realizadas

### API de trafic.mx:
```bash
# Health check
curl https://api.trafic.mx/api/v1/health
# ✅ Respuesta: {"status":"healthy","database":"healthy"}

# Lista de cámaras
curl https://api.trafic.mx/api/v1/cameras
# ✅ Respuesta: 4 cámaras configuradas

# Conteos en vivo
curl https://api.trafic.mx/api/v1/live/counts
# ✅ Respuesta: Datos de tráfico en tiempo real

# Snapshot real
curl -I "http://localhost:3000/api/v1/cameras/cam_01/snapshot"
# ✅ Respuesta: Content-Type: image/jpeg
```

### Dashboard:
- ✅ Snapshots mostrándose correctamente
- ✅ Historial funcionando (modo mock)
- ✅ Interfaz completamente integrada

## Siguientes Pasos

1. **Instalar PostgreSQL**: `npm install pg @types/pg`
2. **Reemplazar código mock** con las implementaciones de PostgreSQL
3. **Probar guardado real** de snapshots
4. **Verificar persistencia** de datos

La aplicación está completamente funcional con la API real de trafic.mx. Solo falta instalar PostgreSQL para persistencia de datos real.
