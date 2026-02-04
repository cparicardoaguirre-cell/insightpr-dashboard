---
description: Cómo actualizar la fuente de datos de estados financieros (archivo Excel)
---

# Update Financial Data Source

Este workflow describe cómo actualizar la fuente de datos del dashboard cuando se genera una nueva versión del archivo de estados financieros.

## When to Use

- Cuando hay una nueva versión del archivo Excel (ej: `NLTS-PR FS 12 31 2024 Rev156-3.xlsm` → `Rev156-4.xlsm`)
- Cuando cambias el período fiscal
- Cuando migras a un nuevo cliente

## Steps

// turbo

### 1. Identificar el nuevo archivo

Verificar que el nuevo archivo Excel existe en la carpeta `D:\NLTS-PR\`:

```powershell
Get-ChildItem "D:\NLTS-PR\*.xlsm" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

### 2. Actualizar la referencia en el componente

En `src/components/FinancialStatements.tsx`, buscar y actualizar la variable `sourceFile`:

```typescript
const sourceFile = 'NLTS-PR FS 12 31 2024 Rev156-4.xlsm';  // ACTUALIZAR AQUÍ
```

O buscar donde se usa:

```typescript
{language === 'es' ? 'Fuente' : 'Source'}: NLTS-PR FS 12 31 2024 Rev156-4.xlsm
```

### 3. Regenerar los datos JSON (si aplica)

Si el servidor de datos usa snapshots JSON, regenerarlos:

```powershell
# En la carpeta del servidor
cd server
node generate-snapshots.js
```

### 4. Actualizar el servidor de ratios

Si el servidor expone los datos de ratios, puede necesitar recarga:

```powershell
# Reiniciar el servidor
npm run server
```

### 5. Verificar los datos

Abrir el dashboard y verificar que:

- Los valores de ratios son correctos
- Los estados financieros (BS, IS, CF) muestran datos actualizados
- La fuente mostrada refleja el nuevo archivo

// turbo

### 6. Build y Deploy

```bash
npm run build
```

Usar `/deploy-dashboard` para desplegar.

## File Naming Convention

El formato estándar de nombrado es:

```
{CLIENT} FS {MM} {DD} {YYYY} Rev{VERSION}.xlsm
```

Ejemplos:

- `NLTS-PR FS 12 31 2024 Rev156-1.xlsm`
- `NLTS-PR FS 12 31 2024 Rev156-2.xlsm`
- `NLTS-PR FS 12 31 2024 Rev156-3.xlsm`

## Version Detection

El sistema detecta automáticamente versiones en varios formatos:

- `-1`, `-2`, `-3` (sufijo simple)
- `Rev156-1`, `Rev156-2` (formato RevXXX-Y)
- `v1`, `v2`, `v3` (formato vX)

## Troubleshooting

### Los datos no se actualizan

1. Verificar que el servidor de datos está corriendo en puerto 3001
2. Limpiar la cache del navegador (Ctrl+F5)
3. Verificar la consola del navegador para errores

### El archivo no se encuentra

1. Verificar la ruta exacta del archivo
2. Verificar permisos de lectura
3. Asegurarse de que el archivo no está abierto en Excel (modo de solo lectura bloqueado)

### Ratios muestran valores incorrectos

1. Revisar que las celdas en el Excel tienen las fórmulas correctas
2. Verificar que los "Lead Schedules" están actualizados
3. Regenerar los snapshots si se usan
