# 🚀 Configuración Completa del Sistema de Datos

## Resumen del Sistema Implementado

Has implementado un sistema completo de captura y análisis de datos de tráfico con:

- ✅ **6 Tablas** en Supabase para almacenamiento
- ✅ **3 Cron Jobs** automatizados
- ✅ **Resolución de 5 minutos** (12x más datos)
- ✅ **Detección automática de anomalías**
- ✅ **Monitoreo del pipeline**
- ✅ **Agregados pre-calculados**

---

## 📋 Paso a Paso: Configuración en Supabase

### Paso 1: Ejecutar Schema Principal
1. Ve a tu proyecto en Supabase: https://ehkdfrbzkqcjyfekehyi.supabase.co
2. Menú lateral → **SQL Editor**
3. Copia y pega el contenido de `supabase-enhanced-schema.sql`
4. Click en **Run**
5. Verifica que aparezca el mensaje de éxito con todas las tablas creadas

**Tablas creadas:**
- `camera_metadata` - Información de cámaras
- `traffic_live_snapshots` - Datos cada 5 minutos
- `traffic_daily_summary` - Resúmenes diarios
- `traffic_anomalies` - Eventos anómalos
- `api_fetch_log` - Monitoreo de cron jobs

### Paso 2: Mejorar Tabla Existente
1. En el mismo **SQL Editor**
2. Copia y pega el contenido de `supabase-migration-enhance-hourly.sql`
3. Click en **Run**
4. Esto agregará campos calculados a `traffic_hourly_stats`

**Campos agregados:**
- `hour_of_day` (0-23)
- `day_of_week` (0-6)
- `is_weekend` (boolean)
- `week_number`, `month`, `year`

### Paso 3: Verificar Tablas
En Supabase, ve a **Table Editor** y verifica que existan estas tablas:
- ✅ `camera_metadata`
- ✅ `traffic_hourly_stats` (mejorada)
- ✅ `traffic_live_snapshots`
- ✅ `traffic_daily_summary`
- ✅ `traffic_anomalies`
- ✅ `api_fetch_log`

---

## ⚙️ Cron Jobs Configurados

### 1. Fetch Live (Cada 5 minutos)
```json
{
  "path": "/api/cron/fetch-live",
  "schedule": "*/5 * * * *"
}
```
**Función:** Obtiene datos en tiempo real del endpoint `/api/v1/live/counts`

**Guarda:**
- Snapshots cada 5 minutos
- Desglose por tipo de vehículo (car, bus, truck)
- Totales de entrada/salida
- Detección automática de congestión

### 2. Fetch Hourly (Cada hora)
```json
{
  "path": "/api/cron/fetch-data",
  "schedule": "0 * * * *"
}
```
**Función:** Obtiene estadísticas horarias del endpoint `/api/v1/statistics/hourly`

**Guarda:**
- Agregados por hora
- Confianza promedio de detección
- Campos temporales calculados automáticamente

### 3. Daily Aggregation (Diario a la 1 AM)
```json
{
  "path": "/api/cron/aggregate-daily",
  "schedule": "0 1 * * *"
}
```
**Función:** Genera resúmenes diarios de todas las cámaras

**Calcula:**
- Totales del día por tipo de vehículo
- Hora pico de entrada/salida
- Métricas de calidad de datos
- Completitud de datos (% de horas con info)

---

## 🔍 Datos Capturados

### Endpoint 1: `/api/v1/live/counts` (Cada 5 min)
```typescript
{
  camera_id: "cam_01",
  camera_name: "Av. Homero Oeste - Este",
  counts: {
    car_in: 45,
    car_out: 38,
    bus_in: 2,
    bus_out: 1,
    truck_in: 0,
    truck_out: 0
  },
  total_in: 47,
  total_out: 39,
  timestamp: "2025-11-05T21:46:04.533435"
}
```

**Almacenado en:** `traffic_live_snapshots`

**Campos adicionales calculados:**
- `net_flow` = total_in - total_out (positivo = congestión)

---

### Endpoint 2: `/api/v1/statistics/hourly` (Cada hora)
```typescript
{
  hour: "2025-11-05T16:00:00",
  camera_id: "cam_01",
  vehicle_type: "car",
  direction: "in",
  count: 225,
  avg_confidence: 0.746
}
```

**Almacenado en:** `traffic_hourly_stats`

**Campos adicionales calculados:**
- `hour_of_day` (0-23)
- `day_of_week` (0-6, Domingo=0)
- `is_weekend` (true/false)
- `week_number`, `month`, `year`

---

### Agregado Diario (Calculado localmente)
**Almacenado en:** `traffic_daily_summary`

```typescript
{
  date: "2025-11-05",
  camera_id: "cam_01",
  car_in_total: 5420,
  car_out_total: 6180,
  bus_in_total: 48,
  bus_out_total: 42,
  truck_in_total: 5,
  truck_out_total: 8,
  total_in: 5473,
  total_out: 6230,
  net_flow: -757,  // Más salidas que entradas
  peak_hour_in: 17,  // 5 PM
  peak_hour_out: 18,  // 6 PM
  peak_hour_value: 890,
  avg_confidence: 0.715,
  hours_with_data: 22,  // 22 de 24 horas
  data_completeness: 91.67  // 91.67%
}
```

---

## 📊 Detección de Anomalías

El sistema detecta automáticamente y registra en `traffic_anomalies`:

### 1. Congestión
**Condición:** `net_flow > 30` vehículos
**Severidad:**
- Medium: 30-50 vehículos de diferencia
- High: >50 vehículos

### 2. Alto Tráfico
**Condición:** `total_vehicles > 100` en 5 minutos
**Severidad:**
- Medium: 100-150 vehículos
- High: >150 vehículos

**Ejemplo de anomalía guardada:**
```typescript
{
  detected_at: "2025-11-05T18:30:00Z",
  camera_id: "cam_01",
  anomaly_type: "congestion",
  severity: "high",
  metric_name: "net_flow",
  metric_value: 52,
  threshold_value: 30,
  deviation_percentage: 73.33,
  metadata: {
    total_in: 98,
    total_out: 46,
    car_in: 92,
    car_out: 41
  }
}
```

---

## 🗂️ Vistas Pre-calculadas

### 1. `recent_congestion`
Muestra eventos de congestión de los últimos 7 días:
```sql
SELECT * FROM recent_congestion;
```

### 2. `camera_health_summary`
Salud y actividad de cada cámara (últimos 30 días):
```sql
SELECT * FROM camera_health_summary;
```

### 3. `daily_traffic_trends`
Tendencias diarias con cambio porcentual:
```sql
SELECT * FROM daily_traffic_trends
WHERE date > NOW() - INTERVAL '7 days';
```

### 4. `hourly_traffic_patterns` (Materialized View)
Patrones de tráfico pre-agregados para consultas rápidas:
```sql
-- Buscar hora pico para cada cámara
SELECT camera_id, hour_of_day, MAX(avg_count)
FROM hourly_traffic_patterns
WHERE vehicle_type = 'car'
GROUP BY camera_id, hour_of_day
ORDER BY MAX(avg_count) DESC;
```

**Refrescar vista:**
```sql
SELECT refresh_hourly_patterns();
```

---

## 🚀 Deployar a Vercel

### Paso 1: Commit y Push
Ya tienes un commit listo. Solo necesitas:

1. **Crear repositorio en GitHub:**
   - Ve a https://github.com/new
   - Nombre: `traffic-dashboard`
   - **NO** inicializar con README

2. **Cambiar remote y hacer push:**
```bash
# Eliminar remote anterior
git remote remove origin

# Agregar nuevo remote (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/traffic-dashboard.git

# Push
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a https://vercel.com
2. Click **Add New → Project**
3. Importa tu repositorio de GitHub
4. En **Environment Variables** agrega:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ehkdfrbzkqcjyfekehyi.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. Click **Deploy**

### Paso 3: Verificar Cron Jobs

1. Una vez desplegado, ve a **Settings → Cron Jobs**
2. Deberías ver 3 cron jobs:
   - **fetch-live** - Cada 5 minutos
   - **fetch-data** - Cada hora
   - **aggregate-daily** - Diario a la 1 AM

3. Puedes ejecutarlos manualmente para probar

---

## 📈 Consultas Útiles

### Ver últimos datos live (5 min)
```sql
SELECT
  snapshot_time,
  c.camera_name,
  l.total_in,
  l.total_out,
  l.net_flow
FROM traffic_live_snapshots l
JOIN camera_metadata c ON l.camera_id = c.camera_id
WHERE snapshot_time > NOW() - INTERVAL '1 hour'
ORDER BY snapshot_time DESC;
```

### Top horas con más tráfico
```sql
SELECT
  hour,
  camera_id,
  SUM(count) as total_vehicles
FROM traffic_hourly_stats
WHERE hour > NOW() - INTERVAL '7 days'
GROUP BY hour, camera_id
ORDER BY total_vehicles DESC
LIMIT 10;
```

### Comparar fin de semana vs días laborales
```sql
SELECT
  is_weekend,
  hour_of_day,
  AVG(count) as avg_vehicles
FROM traffic_hourly_stats
WHERE vehicle_type = 'car'
GROUP BY is_weekend, hour_of_day
ORDER BY is_weekend, hour_of_day;
```

### Ver logs de cron jobs
```sql
SELECT
  fetch_time,
  endpoint,
  status,
  records_inserted,
  response_time_ms
FROM api_fetch_log
ORDER BY fetch_time DESC
LIMIT 20;
```

### Anomalías no resueltas
```sql
SELECT
  a.detected_at,
  c.camera_name,
  a.anomaly_type,
  a.severity,
  a.metric_value
FROM traffic_anomalies a
JOIN camera_metadata c ON a.camera_id = c.camera_id
WHERE is_resolved = false
ORDER BY detected_at DESC;
```

---

## 🧪 Pruebas Locales

### Probar endpoint live
```bash
curl http://localhost:3000/api/cron/fetch-live | jq
```

### Probar endpoint hourly
```bash
curl http://localhost:3000/api/cron/fetch-data | jq
```

### Probar agregación diaria (ayer)
```bash
curl http://localhost:3000/api/cron/aggregate-daily | jq
```

### Probar agregación de fecha específica
```bash
curl "http://localhost:3000/api/cron/aggregate-daily?date=2025-11-04" | jq
```

---

## 📊 Capacidad de Almacenamiento

### Estimación de datos:

**Por día:**
- Live snapshots (5 min): 4 cámaras × 288 snapshots/día = **1,152 registros/día**
- Hourly stats: 4 cámaras × 24 horas × 3 tipos × 2 direcciones = **576 registros/día**
- Daily summaries: 4 cámaras = **4 registros/día**
- Anomalies: ~10-50 registros/día (variable)
- API logs: ~300 registros/día (cron calls)

**Total:** ~2,000 registros/día

**Por mes:** ~60,000 registros
**Por año:** ~730,000 registros

### Espacio estimado:
- Por registro: ~200 bytes promedio
- Por día: ~400 KB
- Por mes: ~12 MB
- Por año: ~146 MB

**Supabase Free Tier:** 500 MB → Suficiente para ~3 años de datos

---

## 🎯 Próximos Pasos

1. ✅ Ejecutar SQL en Supabase
2. ✅ Crear repositorio en GitHub
3. ✅ Deployar a Vercel
4. ✅ Verificar que cron jobs se ejecuten
5. ⏳ Esperar 24 horas para ver datos acumularse
6. 📊 Crear dashboards con datos históricos
7. 🔔 Implementar sistema de notificaciones (opcional)

---

## 📞 Soporte

Si encuentras problemas:

### Verificar logs en Supabase:
```sql
SELECT * FROM api_fetch_log
WHERE status = 'error'
ORDER BY fetch_time DESC;
```

### Verificar logs en Vercel:
1. Dashboard → Tu proyecto
2. Logs → Buscar errores

### Verificar tablas:
```sql
-- Contar registros en cada tabla
SELECT 'traffic_live_snapshots' as table_name, COUNT(*) as count FROM traffic_live_snapshots
UNION ALL
SELECT 'traffic_hourly_stats', COUNT(*) FROM traffic_hourly_stats
UNION ALL
SELECT 'traffic_daily_summary', COUNT(*) FROM traffic_daily_summary
UNION ALL
SELECT 'traffic_anomalies', COUNT(*) FROM traffic_anomalies
UNION ALL
SELECT 'api_fetch_log', COUNT(*) FROM api_fetch_log;
```

---

## 🎉 ¡Listo!

Tu sistema está configurado para capturar **TODOS** los datos de la API trafic.mx con:
- ✅ Resolución de 5 minutos
- ✅ Detección automática de anomalías
- ✅ Monitoreo del pipeline
- ✅ Resúmenes pre-calculados
- ✅ Sistema completamente automatizado 24/7

**Siguiente:** Ejecuta el SQL en Supabase y despliega a Vercel para activar todo el sistema.
