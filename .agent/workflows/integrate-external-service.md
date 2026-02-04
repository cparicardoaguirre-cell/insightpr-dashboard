---
description: Cómo integrar enlaces externos o servicios como NotebookLM en un nuevo tab del dashboard
---

# Integrate External Service Tab

Este workflow describe cómo agregar un nuevo tab al dashboard que integra un servicio externo (como NotebookLM, Google Drive, Tableau, etc.) con manejo para producción y desarrollo.

## Use Cases

- Integrar NotebookLM para chat con AI
- Embeber dashboards de Tableau o Power BI
- Agregar acceso a Google Drive o SharePoint
- Integrar cualquier servicio web externo

## Steps

### 1. Crear el componente del tab

Crear un nuevo archivo en `src/components/ExternalServiceTab.tsx`:

```typescript
import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext';

// Detectar si estamos en producción o desarrollo
const isProduction = window.location.hostname !== 'localhost';

// URL del servicio externo
const EXTERNAL_SERVICE_URL = 'https://your-service-url.com';

export default function ExternalServiceTab() {
    const { language } = useLanguage();
    const [iframeError, setIframeError] = useState(false);

    // Manejar error de iframe (cuando el servicio bloquea embedding)
    const handleIframeError = () => {
        setIframeError(true);
    };

    return (
        <div className="card" style={{ height: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ 
                padding: '1rem', 
                borderBottom: '1px solid var(--border-color)', 
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 style={{ margin: 0, fontSize: '1rem' }}>
                    {language === 'es' ? 'Servicio Externo' : 'External Service'}
                </h2>
                <button 
                    onClick={() => window.open(EXTERNAL_SERVICE_URL, '_blank')}
                    className="btn btn-secondary"
                >
                    {language === 'es' ? '↗ Abrir en Nueva Pestaña' : '↗ Open in New Tab'}
                </button>
            </div>

            {/* Content: iframe or fallback */}
            {iframeError ? (
                // Fallback cuando iframe está bloqueado
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center',
                    padding: '2rem',
                    textAlign: 'center',
                    gap: '1.5rem'
                }}>
                    <div style={{ fontSize: '4rem' }}>🔗</div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
                        {language === 'es' 
                            ? 'Acceder al Servicio' 
                            : 'Access Service'}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: '500px' }}>
                        {language === 'es' 
                            ? 'Por razones de seguridad, debe abrir este servicio en una nueva pestaña.' 
                            : 'For security reasons, you need to open this service in a new tab.'}
                    </p>
                    <button 
                        onClick={() => window.open(EXTERNAL_SERVICE_URL, '_blank')}
                        className="btn btn-primary"
                        style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                    >
                        🚀 {language === 'es' ? 'Abrir Servicio' : 'Open Service'}
                    </button>
                </div>
            ) : (
                // Intentar embeber en iframe
                <iframe
                    src={EXTERNAL_SERVICE_URL}
                    title="External Service"
                    style={{ flex: 1, width: '100%', border: 'none' }}
                    onError={handleIframeError}
                    onLoad={(e) => {
                        try {
                            const iframe = e.target as HTMLIFrameElement;
                            if (!iframe.contentWindow || !iframe.contentDocument) {
                                handleIframeError();
                            }
                        } catch {
                            // Cross-origin es esperado, el iframe probablemente funciona
                        }
                    }}
                />
            )}
        </div>
    );
}
```

### 2. Agregar el tab a la navegación

En `src/components/Header.tsx`, agregar al array `navItems`:

```typescript
{ id: 'external', labelKey: 'nav.external' }
```

### 3. Agregar traducciones

En `src/i18n/translations.ts`, agregar:

```typescript
nav: {
    // ... existing translations
    external: 'External Service'  // or Spanish version
}
```

### 4. Renderizar el componente en App.tsx

En `src/App.tsx`:

```typescript
import ExternalServiceTab from './components/ExternalServiceTab'

// En el render:
{activeTab === 'external' && <ExternalServiceTab />}
```

// turbo

### 5. Build y Deploy

```bash
npm run build
```

## Important Notes

### Servicios que típicamente bloquean iframes

- Google (NotebookLM, Drive, Docs, Sheets)
- Microsoft (SharePoint, OneDrive, Office Online)
- Salesforce
- La mayoría de servicios bancarios

### Servicios que suelen permitir iframes

- YouTube (con embed URL)
- Tableau Public
- Power BI (con configuración)
- Aplicaciones personalizadas

### X-Frame-Options

Si el servicio externo tiene `X-Frame-Options: DENY` o `X-Frame-Options: SAMEORIGIN`, el iframe NO funcionará y el usuario verá el fallback automáticamente.

El patrón implementado maneja esto de forma elegante mostrando un botón para abrir en nueva pestaña.
