---
description: Cómo agregar una nueva perspectiva de stakeholder al análisis de ratios financieros
---

# Add Stakeholder Perspective to Financial Ratios

Este workflow describe cómo agregar una nueva perspectiva de stakeholder (como Bank, Investor, Insurance, etc.) al análisis de ratios financieros del dashboard.

## Prerequisites

- El servidor de desarrollo debe estar corriendo (`npm run dev`)
- Familiaridad con el archivo `FinancialRatiosSection.tsx`

## Steps

### 1. Localizar el archivo de ratios

El archivo principal está en:

```
src/components/FinancialRatiosSection.tsx
```

### 2. Agregar la perspectiva en la función `generateMultiPerspectiveAnalysis`

Buscar la función `generateMultiPerspectiveAnalysis` que contiene las perspectivas existentes:

- `bankPerspective`
- `fiscalPerspective`
- `manufacturingPerspective`
- `investorPerspective`
- `insurancePerspective`

Agregar una nueva perspectiva siguiendo el patrón:

```typescript
const newPerspective = {
    en: {
        title: '🏢 New Stakeholder Perspective',
        analysis: name.includes('relevant_ratio_keyword')
            ? `Analysis for ${ratioName} with value ${formattedValue}...`
            : `Generic analysis for new stakeholder...`
    },
    es: {
        title: '🏢 Perspectiva del Nuevo Stakeholder',
        analysis: name.includes('relevant_ratio_keyword')
            ? `Análisis para ${ratioName} con valor ${formattedValue}...`
            : `Análisis genérico para nuevo stakeholder...`
    }
};
```

### 3. Incluir la nueva perspectiva en el objeto de retorno

Agregar la nueva perspectiva al objeto `stakeholders`:

```typescript
return {
    stakeholders: {
        bank: language === 'es' ? bankPerspective.es : bankPerspective.en,
        fiscal: language === 'es' ? fiscalPerspective.es : fiscalPerspective.en,
        manufacturing: language === 'es' ? manufacturingPerspective.es : manufacturingPerspective.en,
        investor: language === 'es' ? investorPerspective.es : investorPerspective.en,
        insurance: language === 'es' ? insurancePerspective.es : insurancePerspective.en,
        newStakeholder: language === 'es' ? newPerspective.es : newPerspective.en  // ADD THIS
    }
};
```

### 4. Agregar la visualización en el grid de stakeholders

Buscar el grid con `gridTemplateColumns: '1fr 1fr'` y agregar una nueva tarjeta:

```tsx
{/* New Stakeholder Perspective */}
<div style={{ 
    background: 'rgba(COLOR_R, COLOR_G, COLOR_B, 0.08)', 
    padding: '0.75rem', 
    borderRadius: '0.5rem', 
    border: '1px solid rgba(COLOR_R, COLOR_G, COLOR_B, 0.2)' 
}}>
    <h5 style={{ margin: '0 0 0.5rem 0', color: '#HEX_COLOR', fontSize: '0.85rem' }}>
        {ratioAnalysis.stakeholders.newStakeholder.title}
    </h5>
    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        {ratioAnalysis.stakeholders.newStakeholder.analysis}
    </p>
</div>
```

### 5. Colores sugeridos para nuevos stakeholders

- 🏛️ Government: `#6366f1` (indigo)
- 🏥 Healthcare: `#ef4444` (red)
- 📊 Analysts: `#8b5cf6` (violet)
- 🌍 Environmental: `#10b981` (emerald)
- 👥 HR/Employees: `#f59e0b` (amber)

// turbo

### 6. Reconstruir y desplegar

```bash
npm run build
```

Luego usar el workflow `/deploy-dashboard` para desplegar a producción.

## Notes

- Cada perspectiva debe tener análisis específicos para los ratios más relevantes
- Siempre incluir versiones en inglés (en) y español (es)
- Usar emojis apropiados para identificar visualmente cada perspectiva
