# 🚦 Dashboard de Tráfico en Tiempo Real

Dashboard interactivo para visualizar y analizar datos de tráfico vehicular en tiempo real desde la API de **api.trafic.mx**.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19.2-61dafb)

## 🎯 Características

### Monitoreo en Tiempo Real
- **Auto-refresh cada 5 segundos** para datos en tiempo real
- **4 cámaras activas** monitoreando:
  - Av. Homero Oeste-Este
  - Av. Homero Este-Oeste
  - Av. Industrias Norte-Sur
  - Av. Industrias Sur-Norte

### Análisis y Visualización
- ✅ **Contadores en vivo** con indicadores de entrada/salida
- ✅ **Gráficos de tráfico por hora** (últimas 24h)
- ✅ **Comparativa entre cámaras** con gráficos de barras
- ✅ **Sistema de alertas** de congestión automático
- ✅ **Indicadores de flujo neto** (acumulación/dispersión)
- ✅ **Clasificación por tipo de vehículo** (autos, buses, camiones)

### Detección de Congestión
El sistema detecta automáticamente:
- **Alto tráfico**: >30 vehículos en 5 minutos
- **Acumulación**: Cuando entrada > salida por más de 10 vehículos
- **Sin actividad**: Cámaras sin tráfico detectado

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Gráficos**: Recharts
- **Data Fetching**: SWR (con auto-refresh)
- **Utilidades**: date-fns, lucide-react, clsx

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## 🚀 Uso

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Abre tu navegador en [http://localhost:3000](http://localhost:3000)

3. El dashboard se actualizará automáticamente cada 5 segundos

## 📊 Datos Disponibles

### Endpoints Utilizados

- **`/api/v1/live/counts`**: Conteos en tiempo real (últimos 5 min)
- **`/api/v1/statistics/hourly`**: Estadísticas por hora (24h)
- **`/api/v1/statistics/summary`**: Resumen general (24h)

### Tipos de Datos

```typescript
// Conteo en vivo
interface LiveCount {
  camera_id: string;
  camera_name: string;
  counts: {
    car_in?: number;
    car_out?: number;
    bus_in?: number;
    bus_out?: number;
    truck_in?: number;
    truck_out?: number;
  };
  total_in: number;
  total_out: number;
  timestamp: string;
}
```

## 🎨 Componentes Principales

### LiveCounter
Muestra contadores en tiempo real para cada cámara con:
- Indicadores de entrada/salida
- Nivel de congestión (Baja/Media/Alta)
- Desglose por tipo de vehículo
- Flujo neto (acumulación/dispersión)

### TrafficChart
Gráfico de líneas mostrando:
- Tráfico por hora de las últimas 24 horas
- 4 líneas (una por cámara)
- Identificación de horas pico

### CameraComparison
Comparativa entre cámaras con:
- Gráfico de barras (entrada vs salida)
- Tabla resumen con totales
- Balance de flujo

### AlertsBanner
Sistema de alertas que muestra:
- Alertas de alto tráfico
- Alertas de congestión
- Información de cámaras inactivas

## 📈 Análisis Implementados

1. **Flujo en Tiempo Real**: Vehículos entrando y saliendo por minuto
2. **Patrones Horarios**: Identificación de horas pico y valle
3. **Comparativa Direccional**: Balance entre entradas y salidas
4. **Detección de Anomalías**: Alertas automáticas de congestión
5. **Clasificación Vehicular**: Desglose por tipo (autos, buses, camiones)

## 🔧 Configuración

### Auto-refresh
Puedes ajustar los intervalos de actualización en `hooks/useTrafficData.ts`:

```typescript
// Actualizar cada 10 segundos en lugar de 5
useLiveCounts(10000);

// Actualizar estadísticas cada 2 minutos
useHourlyStatistics(120000);
```

### Umbrales de Alerta
Ajusta los umbrales en `components/AlertsBanner.tsx`:

```typescript
// Alto tráfico
if (totalVehicles > 30) { ... }

// Congestión
if (netFlow > 10) { ... }
```

## 📱 Responsive Design

El dashboard está optimizado para:
- 📱 Móviles (vista de 1 columna)
- 💻 Tablets (vista de 2 columnas)
- 🖥️ Desktop (vista de 4 columnas)

## 🚧 Mejoras Futuras

- [ ] Mapa interactivo del crucero
- [ ] Snapshots de cámaras en vivo
- [ ] Exportación de datos a CSV/PDF
- [ ] Comparación de datos históricos (día vs día)
- [ ] Predicción de tráfico con ML
- [ ] Visualización de bounding boxes
- [ ] Notificaciones push
- [ ] Modo oscuro

## 📄 Licencia

MIT

## 👨‍💻 Autor

Creado con la API de [api.trafic.mx](https://api.trafic.mx)
