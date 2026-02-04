---
description: Cómo gestionar y actualizar la lista de documentos de compliance
---

# Manage Compliance Documents

Este workflow describe cómo gestionar la lista de documentos de cumplimiento regulatorio que aparece en el dashboard.

## Architecture

Los documentos de compliance se almacenan en:

- `server/data/compliance_docs.json` - Base de datos JSON local
- Servido vía API en `http://localhost:3001/api/compliance-docs`

## Document Categories

Los documentos se clasifican automáticamente en:

- `Financial Statements` - Estados financieros
- `Tax Return` - Declaraciones de impuestos
- `Inventory` - Inventario
- `Contracts` - Contratos
- `Audit` - Auditorías
- `General` - Documentos generales

## Steps to Add/Update Documents

### 1. Estructura del documento

Cada documento tiene esta estructura:

```json
{
    "id": "doc_001",
    "name": "Annual Financial Statements",
    "category": "Financial Statements",
    "status": "current",
    "lastUpdated": "2024-12-31",
    "expirationDate": "2025-12-31",
    "source": "NLTS-PR FS 12 31 2024 Rev156-3.xlsm",
    "period": "2024",
    "version": 3,
    "notes": "Audited by CPA Ricardo Aguirre"
}
```

### 2. Agregar un nuevo documento manualmente

Editar `server/data/compliance_docs.json`:

```json
{
    "documents": [
        // ... existing documents
        {
            "id": "doc_NEW",
            "name": "New Document Name",
            "category": "Tax Return",
            "status": "current",
            "lastUpdated": "2025-02-01",
            "expirationDate": "2026-02-01",
            "source": "filename.pdf",
            "period": "2024",
            "version": 1,
            "notes": ""
        }
    ]
}
```

### 3. Regenerar desde carpeta de archivos

Si tienes muchos documentos, usar el script de regeneración:

```powershell
cd server
node scripts/generate-compliance-docs.js
```

Este script escanea `D:\NLTS-PR\` y genera automáticamente la lista.

### 4. Reiniciar el servidor

Después de cambiar el JSON:

```powershell
# Detener el servidor actual (Ctrl+C)
# Reiniciar
npm run server
```

## Status Values

- `current` - Documento vigente y actualizado
- `expiring-soon` - Vence en los próximos 30 días
- `expired` - Documento vencido
- `pending` - Pendiente de completar
- `review` - Necesita revisión

## Version Detection Logic

El sistema detecta versiones automáticamente:

- `Rev156-1` → version: 1
- `Rev156-2` → version: 2
- `v3` → version: 3
- `-1`, `-2`, `-3` → version: 1, 2, 3

## Scoring and Sorting

Los documentos se ordenan por:

1. Período (más reciente primero)
2. Versión (más alta primero)
3. Fecha de modificación (más reciente primero)

## API Endpoints

### GET /api/compliance-docs

Retorna todos los documentos:

```json
{
    "documents": [...],
    "stats": {
        "total": 12,
        "current": 10,
        "expiring": 1,
        "expired": 1
    }
}
```

### GET /api/compliance-docs/:id

Retorna un documento específico por ID.

## Frontend Component

El componente `ComplianceTracker.tsx` consume estos datos y muestra:

- Score de cumplimiento general
- Lista de documentos categorizados
- Alertas de vencimiento
- Filtros por categoría

## Troubleshooting

### Documentos no aparecen

1. Verificar que el servidor corre en puerto 3001
2. Verificar estructura del JSON
3. Revisar consola del navegador para errores CORS

### Categorías incorrectas

Ajustar las reglas de clasificación en:
`server/scripts/categorize-document.js`

### Versiones no detectadas

Verificar el formato de nombre del archivo sigue el patrón:
`{NAME} {MM} {DD} {YYYY} Rev{XXX}-{N}.ext`
