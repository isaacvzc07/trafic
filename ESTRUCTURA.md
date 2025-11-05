# 📁 Estructura del Proyecto

```
trafic/
├── app/                        # Next.js App Router
│   ├── dashboard.tsx          # Componente principal del dashboard
│   ├── page.tsx               # Página raíz
│   ├── layout.tsx             # Layout principal
│   └── globals.css            # Estilos globales
│
├── components/                # Componentes reutilizables
│   ├── LiveCounter.tsx        # Contador en tiempo real por cámara
│   ├── TrafficChart.tsx       # Gráfico de tráfico por hora
│   ├── CameraComparison.tsx   # Comparativa entre cámaras
│   └── AlertsBanner.tsx       # Sistema de alertas
│
├── hooks/                     # Custom React Hooks
│   └── useTrafficData.ts      # Hook para consumir API con SWR
│
├── lib/                       # Utilidades y servicios
│   └── api.ts                 # Cliente de API con fetch
│
├── types/                     # Definiciones TypeScript
│   └── api.ts                 # Interfaces de la API
│
├── public/                    # Archivos estáticos
│
├── package.json               # Dependencias del proyecto
├── tsconfig.json              # Configuración TypeScript
├── tailwind.config.ts         # Configuración Tailwind
└── README.md                  # Documentación principal
```

## 🎯 Componentes Clave

### Dashboard (`app/dashboard.tsx`)
- Orquesta todos los componentes
- Maneja el estado con SWR
- Muestra loading states y errores
- Calcula métricas agregadas

### LiveCounter (`components/LiveCounter.tsx`)
- Recibe datos de una cámara
- Muestra contadores de entrada/salida
- Indica nivel de congestión con colores
- Calcula flujo neto

### TrafficChart (`components/TrafficChart.tsx`)
- Usa Recharts para gráficos de líneas
- Muestra 24 horas de datos
- 4 líneas (una por cámara)
- Responsive

### CameraComparison (`components/CameraComparison.tsx`)
- Gráfico de barras comparativo
- Tabla con totales
- Balance de flujo

### AlertsBanner (`components/AlertsBanner.tsx`)
- Detecta anomalías
- Alertas de congestión
- Warnings de tráfico alto

## 🔄 Flujo de Datos

```
API (api.trafic.mx)
    ↓
hooks/useTrafficData.ts (SWR)
    ↓
app/dashboard.tsx (Estado)
    ↓
components/* (Visualización)
```

## 🛠️ Tecnologías por Capa

**Frontend UI:**
- React 19.2
- TypeScript 5
- Tailwind CSS 4

**Data Management:**
- SWR (auto-refresh)
- date-fns (fechas)

**Visualización:**
- Recharts (gráficos)
- lucide-react (iconos)

**Framework:**
- Next.js 16 (App Router)
- Turbopack (build tool)
