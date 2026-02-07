---
name: Bilingual Content Management
description: Manage Spanish/English content in React dashboards
---

# Bilingual Content Management Skill

This skill covers patterns for managing bilingual (Spanish/English) content in React dashboards.

## Language Context Pattern

### LanguageContext.tsx

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Translations = {
  'nav.home': { en: 'Home', es: 'Inicio' },
  'nav.analysis': { en: 'Financial Analysis', es: 'Análisis Financiero' },
  // Add more translations...
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');
  
  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
```

## Usage in Components

### Basic Usage

```typescript
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { language, t } = useLanguage();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{language === 'es' ? 'Contenido en español' : 'English content'}</p>
    </div>
  );
}
```

### Language Toggle

```typescript
function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="language-toggle">
      <button
        className={language === 'en' ? 'active' : ''}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
      <button
        className={language === 'es' ? 'active' : ''}
        onClick={() => setLanguage('es')}
      >
        ES
      </button>
    </div>
  );
}
```

## Data with Bilingual Fields

### JSON Data Structure

```json
{
  "ratios": [
    {
      "name": "Current Ratio",
      "nameEs": "Razón Corriente",
      "value": 1.8,
      "interpretation": "Measures short-term liquidity",
      "interpretationEs": "Mide la liquidez a corto plazo"
    }
  ]
}
```

### Rendering Bilingual Data

```typescript
function RatioCard({ ratio }) {
  const { language } = useLanguage();
  
  return (
    <div className="ratio-card">
      <h3>{language === 'es' ? ratio.nameEs : ratio.name}</h3>
      <p>{language === 'es' ? ratio.interpretationEs : ratio.interpretation}</p>
    </div>
  );
}
```

## Translation Keys Organization

### Recommended Structure

```typescript
const translations = {
  // Navigation
  'nav.home': { en: 'Home', es: 'Inicio' },
  'nav.dashboard': { en: 'Dashboard', es: 'Panel' },
  'nav.analysis': { en: 'Analysis', es: 'Análisis' },
  
  // Common Actions
  'action.save': { en: 'Save', es: 'Guardar' },
  'action.cancel': { en: 'Cancel', es: 'Cancelar' },
  'action.delete': { en: 'Delete', es: 'Eliminar' },
  
  // Status Messages
  'status.loading': { en: 'Loading...', es: 'Cargando...' },
  'status.success': { en: 'Success', es: 'Éxito' },
  'status.error': { en: 'Error', es: 'Error' },
  
  // Financial Terms
  'finance.revenue': { en: 'Revenue', es: 'Ingresos' },
  'finance.expenses': { en: 'Expenses', es: 'Gastos' },
  'finance.profit': { en: 'Profit', es: 'Ganancia' },
};
```

## Best Practices

1. **Default to Spanish** for Puerto Rico-based projects
2. **Use translation keys** instead of hardcoded strings
3. **Store complex content in data files** with bilingual fields
4. **Test both languages** before deploying
5. **Keep translations organized** by category/component

## Common Translation Patterns

### Date Formatting

```typescript
const formatDate = (date: Date, language: Language) => {
  return date.toLocaleDateString(language === 'es' ? 'es-PR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

### Number Formatting

```typescript
const formatNumber = (num: number, language: Language) => {
  return num.toLocaleString(language === 'es' ? 'es-PR' : 'en-US');
};

const formatCurrency = (num: number, language: Language) => {
  return num.toLocaleString(language === 'es' ? 'es-PR' : 'en-US', {
    style: 'currency',
    currency: 'USD'
  });
};
```

### Percentage Formatting

```typescript
const formatPercent = (num: number) => {
  return `${num.toFixed(2)}%`;
};
```
