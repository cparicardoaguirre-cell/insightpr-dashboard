---
description: Quick development workflow - build and test locally
---

# Quick Dev Workflow

Fast iteration workflow for local development and testing.

## Prerequisites

- Project dependencies installed (`npm install`)
- Development server running or startable

## Steps

// turbo

1. **Start Development Server**

```bash
npm run dev
```

1. **Watch for Errors**

- Check terminal for build errors
- Check browser console for runtime errors

// turbo
3. **Run Type Check** (if TypeScript)

```bash
npx tsc --noEmit
```

// turbo
4. **Run Linting** (if configured)

```bash
npm run lint
```

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npx tsc --noEmit` | Type check only |
| `npm run lint` | Run linter |

## Notes

- Use `Ctrl+C` to stop the dev server
- Hot reload is automatic for most changes
- If styles don't update, hard refresh with `Ctrl+Shift+R`
