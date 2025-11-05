# Sistema de Datos Históricos - Setup Completo

## Resumen
Este documento explica el sistema de almacenamiento histórico de datos de tráfico implementado con Supabase.

## Arquitectura

```
┌─────────────────┐
│  api.trafic.mx  │ (API Externa)
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  /api/cron/fetch-data   │ (Se ejecuta cada hora)
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Supabase PostgreSQL    │
│  traffic_hourly_stats   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  /api/history/hourly    │ (Consulta históricos)
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│    TrafficChart.tsx     │ (Frontend con filtros)
└─────────────────────────┘
```

## Archivos Creados

### Backend
- `lib/supabase.ts` - Cliente de Supabase
- `app/api/cron/fetch-data/route.ts` - API que guarda datos cada hora
- `app/api/history/hourly/route.ts` - API que consulta datos históricos
- `scripts/init-data.ts` - Script para poblar datos iniciales

### Frontend
- `hooks/useTrafficData.ts` - Hook `useHistoricalData()` agregado
- `components/TrafficChart.tsx` - Modificado con filtros de tiempo

### Configuración
- `.env.local` - Variables de entorno de Supabase
- `supabase-schema.sql` - Schema de la base de datos
- `supabase-update-policies.sql` - Políticas RLS actualizadas
- `vercel.json` - Configuración del cron job

## Setup Inicial (Ya Completado)

### 1. Base de Datos Supabase ✅
```sql
-- Ya ejecutado en Supabase
CREATE TABLE traffic_hourly_stats (
  id BIGSERIAL PRIMARY KEY,
  hour TIMESTAMP WITH TIME ZONE NOT NULL,
  camera_id VARCHAR(20) NOT NULL,
  vehicle_type VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  count INTEGER NOT NULL,
  avg_confidence DECIMAL(5, 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hour, camera_id, vehicle_type, direction)
);
```

### 2. Políticas RLS ✅
```sql
-- Ya ejecutado en Supabase
DROP POLICY IF EXISTS "Allow server insert" ON traffic_hourly_stats;

CREATE POLICY "Allow public insert" ON traffic_hourly_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON traffic_hourly_stats
  FOR UPDATE USING (true) WITH CHECK (true);
```

### 3. Datos Iniciales ✅
```bash
# Ya ejecutado
npm run init-data
```
Resultado: 156 registros insertados, 20 horas de datos, 4 cámaras

## Uso

### Filtros de Tiempo en el Dashboard

El componente TrafficChart ahora incluye 4 botones de filtro:

1. **Últimas 24h** - Todos los datos disponibles en la BD
2. **Hoy** - Solo datos de hoy (00:00 - 23:59)
3. **Ayer** - Solo datos de ayer
4. **Últimos 7 días** - Datos de la última semana

### API Endpoints

#### 1. Guardar Datos (Cron Job)
```bash
GET /api/cron/fetch-data
```
- Se ejecuta automáticamente cada hora vía Vercel Cron
- Obtiene datos de api.trafic.mx
- Los guarda en Supabase usando upsert (evita duplicados)

**Respuesta de ejemplo:**
```json
{
  "message": "Data fetched and stored successfully",
  "inserted": 156,
  "timestamp": "2025-11-05T21:32:44.881Z"
}
```

#### 2. Consultar Históricos
```bash
GET /api/history/hourly
GET /api/history/hourly?start=2025-11-05T00:00:00Z&end=2025-11-05T23:59:59Z
```

**Parámetros opcionales:**
- `start` - Fecha/hora inicio (ISO 8601)
- `end` - Fecha/hora fin (ISO 8601)

**Respuesta:**
```json
{
  "period": "2025-11-05T00:00:00Z to 2025-11-05T23:59:59Z",
  "count": 20,
  "data": [
    {
      "hour": "2025-11-05T16:00:00Z",
      "data": [
        {
          "camera_id": "cam_01",
          "vehicle_type": "car",
          "direction": "in",
          "count": 45,
          "avg_confidence": 0.92
        }
      ]
    }
  ]
}
```

## Cron Job de Vercel

El archivo `vercel.json` configura un cron job que se ejecuta cada hora:

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-data",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Formato del schedule (cron syntax):**
- `0 * * * *` = A la hora en punto, cada hora

Cuando despliegues a Vercel, este cron se activará automáticamente y comenzará a acumular datos históricos.

## Monitoreo

### Ver datos en Supabase
1. Ir a tu proyecto en Supabase: https://ehkdfrbzkqcjyfekehyi.supabase.co
2. Table Editor → `traffic_hourly_stats`
3. Verás todos los registros guardados

### Ver logs de cron en Vercel
1. Dashboard de Vercel → Tu proyecto
2. Settings → Cron Jobs
3. Ver execuciones y logs

### Probar localmente
```bash
# Guardar datos manualmente
curl http://localhost:3000/api/cron/fetch-data

# Consultar todos los datos
curl http://localhost:3000/api/history/hourly

# Consultar rango específico
curl "http://localhost:3000/api/history/hourly?start=2025-11-05T00:00:00Z&end=2025-11-05T23:59:59Z"
```

## Mantenimiento

### Poblar datos manualmente
```bash
npm run init-data
```

### Limpieza de datos antiguos (opcional)
Si en el futuro quieres eliminar datos viejos:

```sql
-- Eliminar datos más antiguos de 30 días
DELETE FROM traffic_hourly_stats
WHERE hour < NOW() - INTERVAL '30 days';
```

## Costos

### Supabase (Free Tier)
- ✅ 500 MB de base de datos
- ✅ 5 GB de bandwidth
- ✅ 2 GB de storage
- Con los datos actuales (~156 registros/día), puedes almacenar meses de datos sin problema

### Vercel Cron (Hobby Tier)
- ✅ 1 cron job gratis
- ✅ Ilimitadas ejecuciones

## Próximos Pasos

1. **Desplegar a Vercel**
   - Conectar el repositorio
   - Agregar variables de entorno
   - El cron se activará automáticamente

2. **Agregar más filtros** (opcional)
   - Filtros por cámara específica
   - Comparación día vs día
   - Exportar a CSV

3. **Alertas** (opcional)
   - Notificaciones cuando faltan datos
   - Alertas de tráfico anormal

## Solución de Problemas

### Error: "violates row-level security policy"
**Solución:** Verifica que ejecutaste el archivo `supabase-update-policies.sql` en Supabase.

### No hay datos históricos
**Solución:**
1. Verifica las variables de entorno en `.env.local`
2. Ejecuta `npm run init-data`
3. Verifica en Supabase Table Editor

### Cron no se ejecuta
**Solución:**
1. Verifica que `vercel.json` existe en la raíz
2. En Vercel Dashboard, Settings → Cron Jobs debe aparecer tu cron
3. Los crons solo funcionan en producción, no en preview/development

## Soporte

Si tienes problemas:
1. Revisa los logs de Vercel
2. Verifica la consola del navegador
3. Prueba los endpoints manualmente con curl
