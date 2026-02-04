---
description: Cómo agregar nuevas traducciones al dashboard bilingüe (EN/ES)
---

# Add Translations

Este workflow describe cómo agregar nuevas traducciones al sistema bilingüe del dashboard InsightPR.

## Architecture Overview

El sistema de traducciones está compuesto por:

1. `src/i18n/translations.ts` - Diccionario de traducciones
2. `src/context/LanguageContext.tsx` - Contexto React para idioma
3. `useLanguage()` hook - Para acceder a traducciones en componentes

## Steps

### 1. Agregar las traducciones al diccionario

En `src/i18n/translations.ts`, agregar las nuevas claves:

```typescript
export const translations = {
    en: {
        // ... existing translations
        
        // New section example:
        mySection: {
            title: 'My Section Title',
            description: 'Description in English',
            button: 'Click Here',
            loading: 'Loading...',
            error: 'An error occurred',
            empty: 'No data available'
        }
    },
    es: {
        // ... existing translations
        
        // Same section in Spanish:
        mySection: {
            title: 'Título de Mi Sección',
            description: 'Descripción en Español',
            button: 'Haz Clic Aquí',
            loading: 'Cargando...',
            error: 'Ocurrió un error',
            empty: 'No hay datos disponibles'
        }
    }
};
```

### 2. Usar traducciones con el hook `useLanguage()`

```typescript
import { useLanguage } from '../context/LanguageContext';

export default function MyComponent() {
    const { t, language } = useLanguage();
    
    return (
        <div>
            {/* Usando la función t() para traducciones simples */}
            <h1>{t('mySection.title')}</h1>
            <p>{t('mySection.description')}</p>
            <button>{t('mySection.button')}</button>
            
            {/* Usando el idioma directamente para contenido dinámico */}
            <p>
                {language === 'es' 
                    ? `Tenemos ${count} items`
                    : `We have ${count} items`
                }
            </p>
        </div>
    );
}
```

### 3. Traducciones con interpolación

Para textos que incluyen variables, usar el idioma directamente:

```typescript
const { language } = useLanguage();

// Opción 1: Condicional inline
<span>
    {language === 'es' 
        ? `Total: ${formatCurrency(amount)}`
        : `Total: ${formatCurrency(amount)}`
    }
</span>

// Opción 2: Función helper
const getText = (es: string, en: string) => language === 'es' ? es : en;

<span>{getText(`Mostrando ${count} de ${total}`, `Showing ${count} of ${total}`)}</span>
```

## Common Translation Patterns

### Estados y badges

```typescript
status: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    error: 'Error'
}
```

### Navegación

```typescript
nav: {
    dashboard: 'Dashboard',
    settings: 'Settings',
    help: 'Help',
    logout: 'Sign Out'
}
```

### Formularios

```typescript
form: {
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    required: 'Required field',
    invalid: 'Invalid value'
}
```

### Mensajes de sistema

```typescript
messages: {
    success: 'Operation completed successfully',
    error: 'An error occurred',
    loading: 'Loading...',
    noData: 'No data available',
    confirm: 'Are you sure?'
}
```

## Best Practices

1. **Mantener consistencia**: Usar las mismas claves en ambos idiomas
2. **Estructura lógica**: Agrupar traducciones por sección/componente
3. **Evitar concatenación**: No concatenar texto traducido con variables
4. **Pluralización**: Manejar singular/plural cuando sea necesario

```typescript
// ❌ MAL - No concatenar
t('items') + ': ' + count

// ✅ BIEN - Usar interpolación o idioma directo
language === 'es' ? `Items: ${count}` : `Items: ${count}`
```

## Testing Translations

1. Cambiar el idioma usando el toggle EN/ES en el header
2. Navegar por todas las secciones
3. Verificar que no hay textos sin traducir
4. Verificar que los formatos de números/fechas son correctos para cada idioma

## Adding a New Language (Future)

Para agregar un nuevo idioma (ej: Portugués):

1. Agregar las traducciones en `translations.ts`:

```typescript
export const translations = {
    en: { ... },
    es: { ... },
    pt: { ... }  // Nuevo idioma
};
```

1. Actualizar el tipo en `LanguageContext.tsx`:

```typescript
type Language = 'en' | 'es' | 'pt';
```

1. Agregar el botón en `Header.tsx`
