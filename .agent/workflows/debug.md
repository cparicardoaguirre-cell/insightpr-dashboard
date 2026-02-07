---
description: Debug and troubleshoot application issues
---

# Debug Workflow

Systematic approach to debugging issues in React/Vite applications.

## Prerequisites

- Issue identified (error message, unexpected behavior, etc.)
- Development environment running

## Steps

### 1. Identify the Problem

- What is the expected behavior?
- What is the actual behavior?
- When did this start happening?
- Is it reproducible?

### 2. Check Console Logs

// turbo

```bash
# Check terminal for build errors
# Check browser console (F12) for runtime errors
```

### 3. Verify Data Flow

For data display issues:

1. Check the JSON data file in `public/data/`
2. Verify the component is fetching correctly
3. Add `console.log()` to trace data

// turbo

```typescript
// Add debug logging
console.log('Data received:', data);
console.log('Component state:', state);
```

### 4. Check Network Requests

1. Open DevTools > Network tab
2. Filter by Fetch/XHR
3. Verify requests are successful (200 OK)
4. Check response data

### 5. Verify Build

// turbo

```bash
npm run build
```

If build fails, check TypeScript errors:

// turbo

```bash
npx tsc --noEmit 2>&1
```

### 6. Clear Cache

If issues persist after fixes:

// turbo

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### 7. Check Git History

For regression bugs:

// turbo

```bash
git log --oneline -10
git diff HEAD~1
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Blank page | Check console for errors, verify imports |
| Data not loading | Check fetch URL, verify JSON file exists |
| Styles not applying | Check CSS import, clear cache |
| Type errors | Run `npx tsc --noEmit` |
| Build fails | Check imports, remove unused dependencies |
