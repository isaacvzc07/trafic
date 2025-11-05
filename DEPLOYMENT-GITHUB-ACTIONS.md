# 🚀 Deployment con GitHub Actions

## Resumen del Sistema

En lugar de usar Vercel Cron (limitado en plan gratuito), usamos **GitHub Actions** que es completamente gratis y permite cron jobs cada 5 minutos.

---

## 📋 Paso a Paso: Configuración

### 1. Desplegar a Vercel (SIN cron jobs)

**a) Ir a Vercel:**
```
https://vercel.com/new
```

**b) Importar repositorio:**
- Click en "Import Project"
- Selecciona "Import Git Repository"
- Conecta con GitHub
- Selecciona `isaacvzc07/trafic`

**c) Configurar variables de entorno:**

En la sección "Environment Variables" agrega:

```
NEXT_PUBLIC_SUPABASE_URL=https://ehkdfrbzkqcjyfekehyi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoa2RmcmJ6a3FjanlmZWtlaHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjEyNTUsImV4cCI6MjA3MjkzNzI1NX0.wGxW0LVk4JAyRf2XyRYOvrl42tyNbuY2UATLrY0hJSQ
```

**d) Deploy:**
- Click "Deploy"
- Espera a que termine el build
- **Copia la URL de tu app** (ejemplo: `https://trafic-xxxxx.vercel.app`)

---

### 2. Configurar GitHub Secret con URL de Vercel

**a) Ir a tu repositorio en GitHub:**
```
https://github.com/isaacvzc07/trafic
```

**b) Settings → Secrets and variables → Actions:**
- Click en "New repository secret"

**c) Crear secret:**
```
Name: VERCEL_APP_URL
Value: https://trafic-xxxxx.vercel.app
```
(Reemplaza con TU URL de Vercel)

**d) Guardar:**
- Click "Add secret"

---

### 3. Activar GitHub Actions

**a) Ve a la pestaña "Actions" en tu repo:**
```
https://github.com/isaacvzc07/trafic/actions
```

**b) Si está deshabilitado:**
- Click en "I understand my workflows, go ahead and enable them"

**c) Verifica el workflow:**
- Deberías ver "Traffic Data Collection"
- El workflow se ejecutará automáticamente cada 5 minutos

**d) Probar manualmente (opcional):**
- Click en "Traffic Data Collection"
- Click en "Run workflow" → "Run workflow"
- Espera ~30 segundos
- Verifica que se ejecutó correctamente (check verde ✅)

---

## 🔍 Verificar que Funciona

### Ver logs en GitHub Actions:
1. GitHub repo → Actions tab
2. Click en cualquier ejecución
3. Click en "collect-traffic-data"
4. Verás los logs del curl

### Ver datos en Supabase:
```sql
-- Ver últimos datos insertados
SELECT * FROM traffic_live_snapshots
ORDER BY snapshot_time DESC
LIMIT 10;

-- Ver logs de API calls
SELECT * FROM api_fetch_log
ORDER BY fetch_time DESC
LIMIT 10;
```

### Ver en tu dashboard:
```
https://trafic-xxxxx.vercel.app
```
- Deberías ver datos actualizándose
- Los filtros de tiempo deberían funcionar

---

## ⏰ Frecuencia de Ejecución

**GitHub Actions ejecutará el workflow:**
- ✅ Cada 5 minutos
- ✅ 288 veces al día
- ✅ ~8,640 veces al mes
- ✅ Completamente GRATIS

**Límites de GitHub Actions (Free):**
- 2,000 minutos/mes de ejecución
- Nuestro workflow usa ~1 segundo por ejecución
- Total: ~144 minutos/mes (bien dentro del límite)

---

## 🛠️ Cómo Funciona

```
┌─────────────────────┐
│  GitHub Actions     │
│  (cada 5 minutos)   │
└──────────┬──────────┘
           │
           │ HTTP GET Request
           ▼
┌─────────────────────┐
│  Vercel App         │
│  /api/cron/run-all  │
└──────────┬──────────┘
           │
           ├──► fetch-live (cada 5 min)
           │
           ├──► fetch-data (solo en XX:00)
           │
           └──► aggregate-daily (solo 1 AM)
           │
           ▼
┌─────────────────────┐
│  Supabase           │
│  (almacenamiento)   │
└─────────────────────┘
```

---

## 🐛 Troubleshooting

### El workflow no se ejecuta
**Problema:** GitHub Actions deshabilitado
**Solución:** Ve a Actions → Enable workflows

### Error 404 en el workflow
**Problema:** URL de Vercel incorrecta o app no desplegada
**Solución:**
1. Verifica que tu app esté desplegada en Vercel
2. Copia la URL correcta
3. Actualiza el secret `VERCEL_APP_URL`

### Error en la ejecución
**Problema:** Timeout o error de API
**Solución:**
1. Ve a Vercel → Logs
2. Revisa errores en `/api/cron/run-all`
3. Verifica que las variables de entorno estén configuradas

### No se guardan datos
**Problema:** Tablas de Supabase no creadas
**Solución:**
1. Ejecuta `supabase-enhanced-schema.sql` en Supabase
2. Ejecuta `supabase-migration-enhance-hourly.sql`
3. Verifica que las tablas existan

---

## 📊 Monitoreo

### Ver ejecuciones exitosas/fallidas:
```
GitHub → Actions → Workflow runs
```
- Verde ✅ = Exitoso
- Rojo ❌ = Fallido

### Ver datos recolectados:
```sql
-- Conteo de snapshots por día
SELECT
  DATE(snapshot_time) as date,
  COUNT(*) as total_snapshots,
  COUNT(DISTINCT camera_id) as cameras
FROM traffic_live_snapshots
GROUP BY DATE(snapshot_time)
ORDER BY date DESC;
```

### Ver health del sistema:
```sql
-- Ver últimos 10 logs
SELECT
  fetch_time,
  endpoint,
  status,
  records_inserted,
  response_time_ms
FROM api_fetch_log
ORDER BY fetch_time DESC
LIMIT 10;
```

---

## 💰 Costos

**Total: $0 (GRATIS)**

- ✅ Vercel Hobby: $0
- ✅ GitHub Actions: $0 (dentro de límites)
- ✅ Supabase Free: $0 (dentro de límites)

**Límites:**
- Vercel: 100 GB bandwidth/mes
- GitHub Actions: 2,000 minutos/mes
- Supabase: 500 MB storage

**Tu uso estimado:**
- Vercel: ~5 GB/mes (5% del límite)
- GitHub Actions: ~144 minutos/mes (7% del límite)
- Supabase: ~150 MB en 1 año (30% del límite)

---

## 🎯 Próximos Pasos

1. ✅ Desplegar a Vercel
2. ✅ Configurar secret en GitHub
3. ✅ Activar GitHub Actions
4. ⏳ Esperar 5 minutos
5. ✅ Verificar que los datos se recolectan
6. 📊 Ejecutar SQL en Supabase (si no lo has hecho)
7. 🎉 ¡Disfrutar del dashboard con datos históricos!

---

## 📝 Notas Importantes

- GitHub Actions puede tener un delay de ~1-2 minutos en la ejecución
- Los cron jobs de GitHub Actions se ejecutan en UTC
- Si el repositorio está inactivo por 60 días, los workflows se deshabilitan automáticamente
- Puedes pausar el workflow yendo a Actions → Workflow → "..." → Disable workflow

---

## 🆘 Ayuda

Si algo no funciona:

1. **Verifica logs de GitHub Actions**
2. **Verifica logs de Vercel**
3. **Verifica datos en Supabase**
4. **Checa que el secret esté configurado correctamente**

Todo debería funcionar automáticamente una vez configurado. El sistema recolectará datos 24/7 sin intervención.
