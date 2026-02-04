---
description: Cómo agregar un nuevo tab de navegación al dashboard InsightPR
---

# Add New Navigation Tab

Este workflow describe cómo agregar un nuevo tab de navegación al dashboard InsightPR.

## Prerequisites

- Servidor de desarrollo corriendo (`npm run dev`)
- Conocimiento básico de React y TypeScript

## Steps

### 1. Crear el componente del nuevo tab

Crear un nuevo archivo en `src/components/NewTabName.tsx`:

```typescript
import { useLanguage } from '../context/LanguageContext';

export default function NewTabName() {
    const { language, t } = useLanguage();
    
    return (
        <div className="card">
            <h2>{language === 'es' ? 'Título en Español' : 'English Title'}</h2>
            {/* Tu contenido aquí */}
        </div>
    );
}
```

### 2. Agregar las traducciones

En `src/i18n/translations.ts`, agregar la etiqueta de navegación:

```typescript
// En la sección 'en' (inglés):
nav: {
    // ... existing translations
    newtab: 'New Tab',
},

// En la sección 'es' (español):
nav: {
    // ... existing translations
    newtab: 'Nuevo Tab',
},
```

### 3. Registrar el tab en la navegación

En `src/components/Header.tsx`, agregar al array `navItems`:

```typescript
const navItems = [
    { id: 'overview', labelKey: 'nav.dashboard' },
    { id: 'financials', labelKey: 'nav.financials' },
    { id: 'statements', labelKey: 'statements.title' },
    { id: 'industry', labelKey: 'nav.industry' },
    { id: 'act60', labelKey: 'nav.act60' },
    { id: 'compliance', labelKey: 'nav.compliance' },
    { id: 'chat', labelKey: 'nav.chat' },
    { id: 'newtab', labelKey: 'nav.newtab' }  // AGREGAR AQUÍ
];
```

### 4. Renderizar el componente en App.tsx

En `src/App.tsx`:

```typescript
// Import al inicio del archivo:
import NewTabName from './components/NewTabName'

// En la sección main, agregar la condición de renderizado:
<main className="main-content">
    {activeTab === 'overview' && <Overview />}
    {activeTab === 'financials' && <FinancialAnalysis />}
    {activeTab === 'statements' && <FinancialStatements />}
    {activeTab === 'industry' && <IndustryAnalysis />}
    {activeTab === 'act60' && <Act60Tab />}
    {activeTab === 'compliance' && <ComplianceTracker />}
    {activeTab === 'chat' && <NotebookChat />}
    {activeTab === 'newtab' && <NewTabName />}  {/* AGREGAR AQUÍ */}
</main>
```

// turbo

### 5. Verificar en desarrollo

El hot reload debería mostrar automáticamente el nuevo tab. Verificar que:

- El tab aparece en la navegación
- Al hacer clic, se muestra el contenido correcto
- El idioma cambia correctamente entre EN/ES

// turbo

### 6. Build y Deploy

```bash
npm run build
```

Luego usar `/deploy-dashboard` para desplegar.

## Best Practices

### Estructura recomendada para componentes de tab

```typescript
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function TabComponent() {
    const { language, t } = useLanguage();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Cargar datos si es necesario
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch data...
            setLoading(false);
        } catch (err) {
            setError(language === 'es' ? 'Error al cargar' : 'Error loading');
            setLoading(false);
        }
    };

    if (loading) return <div className="card">Loading...</div>;
    if (error) return <div className="card" style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="card">
            {/* Content */}
        </div>
    );
}
```

### Clases CSS disponibles

- `.card` - Tarjeta con fondo y bordes
- `.btn` - Botón base
- `.btn-primary` - Botón primario (azul)
- `.btn-secondary` - Botón secundario (gris)
- `.status-badge` - Badge de estado
- `.status-green`, `.status-yellow`, `.status-red` - Colores de estado

### Variables CSS del tema

- `var(--bg-primary)` - Fondo principal oscuro
- `var(--bg-secondary)` - Fondo secundario
- `var(--text-primary)` - Texto principal (blanco)
- `var(--text-secondary)` - Texto secundario (gris)
- `var(--accent-primary)` - Color de acento (azul)
- `var(--border-color)` - Color de bordes
