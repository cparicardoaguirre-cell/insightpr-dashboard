---
name: performance-audit
description: Lighthouse performance audit and Vite/React optimization best practices
---

# Performance Audit

## When to Use

Run before every production deploy or when users report slow load times.

## Quick Audit Workflow

1. **Build production bundle**:

```bash
npm run build
```

1. **Analyze bundle size** (add to vite.config.ts temporarily):

```ts
import { visualizer } from 'rollup-plugin-visualizer';
// plugins: [visualizer({ open: true })]
```

1. **Run Lighthouse** via CLI:

```bash
npx lighthouse https://YOUR-SITE.netlify.app --output=json --output-path=./lighthouse.json
```

1. **Check Core Web Vitals**:
   - **LCP** (Largest Contentful Paint): < 2.5s
   - **INP** (Interaction to Next Paint): < 200ms
   - **CLS** (Cumulative Layout Shift): < 0.1

## Vite Build Optimizations

```ts
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts']  // if used
        }
      }
    }
  }
});
```

## React Runtime Checklist

- [ ] Use `React.lazy()` + `Suspense` for route-level code splitting
- [ ] Use `React.memo()` for expensive pure components
- [ ] Use `useMemo`/`useCallback` for referentially stable values
- [ ] Use `react-window` for lists > 50 items
- [ ] Images: WebP format, `loading="lazy"`, explicit width/height
- [ ] Avoid inline object/function creation in JSX props
- [ ] Keep state as local as possible (avoid unnecessary lifting)

## Image Optimization

```tsx
<img
  src="/images/photo.webp"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  decoding="async"
/>
```

## Target Scores

| Category | Target |
|----------|--------|
| Performance | ≥ 90 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |
