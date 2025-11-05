# 🚀 Comandos Útiles

## Desarrollo

```bash
# Iniciar servidor de desarrollo (auto-refresh)
npm run dev

# El servidor estará disponible en:
# - http://localhost:3000
# - http://192.168.1.131:3000 (red local)
```

## Producción

```bash
# Crear build optimizado
npm run build

# Iniciar en modo producción
npm start
```

## Mantenimiento

```bash
# Verificar errores de ESLint
npm run lint

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## Testing de la API

```bash
# Probar endpoint de conteos en vivo
curl https://api.trafic.mx/api/v1/live/counts | json_pp

# Probar estadísticas horarias
curl https://api.trafic.mx/api/v1/statistics/hourly | json_pp

# Probar resumen
curl https://api.trafic.mx/api/v1/statistics/summary | json_pp

# Ver eventos recientes
curl https://api.trafic.mx/api/v1/events?limit=5 | json_pp
```

## Desarrollo

```bash
# Ver estructura del proyecto
tree -L 3 -I 'node_modules|.next'

# Ver tamaño del build
npm run build
du -sh .next

# Limpiar archivos temporales
rm -rf .next
```

## Tips

1. **Auto-refresh**: Los datos se actualizan cada 5 segundos automáticamente
2. **Hot reload**: Los cambios en el código se reflejan instantáneamente
3. **TypeScript**: El IDE mostrará errores en tiempo real
4. **Responsive**: Prueba en diferentes tamaños de pantalla

## Personalización

### Cambiar intervalo de actualización

Edita `hooks/useTrafficData.ts`:

```typescript
// Cambiar de 5 segundos a 10 segundos
useLiveCounts(10000);
```

### Cambiar umbrales de alerta

Edita `components/AlertsBanner.tsx`:

```typescript
// Alto tráfico: cambiar de 30 a 50
if (totalVehicles > 50) { ... }
```

### Agregar nueva cámara

Si la API agrega nuevas cámaras, los componentes se adaptarán automáticamente.
Solo asegúrate de actualizar los colores en `TrafficChart.tsx` si quieres personalizarlos.
