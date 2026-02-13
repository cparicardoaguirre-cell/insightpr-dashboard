---
description: Run all audit skills (performance, security, accessibility, errors, SEO) on the current project
---

# Run All Audits

// turbo-all

## Purpose

Executes the 5 audit skills sequentially to identify and fix issues across performance, security, accessibility, error handling, and SEO.

## Prerequisites

- Node.js and npm installed
- Project has `package.json` with build script
- For security audit: Supabase project ID known

## Step 1: Install Audit Dependencies

```powershell
npm install --save-dev eslint-plugin-jsx-a11y
```

## Step 2: Build Production Bundle

```powershell
npm run build
```

## Step 3: Analyze Bundle Size

Add to `vite.config.ts` temporarily:

```ts
// import { visualizer } from 'rollup-plugin-visualizer';
// Add to plugins: [visualizer({ open: true, filename: 'bundle-stats.html' })]
```

Run `npm install --save-dev rollup-plugin-visualizer` if needed, then rebuild.

## Step 4: Performance Audit

Read the `performance-audit` skill and apply the React Runtime Checklist:

- Check for `React.lazy()` usage on routes
- Verify images use `loading="lazy"` and WebP format
- Ensure `useMemo`/`useCallback` on expensive computations
- Check Vite build config has `manualChunks` for large vendors

## Step 5: Security Audit

Read the `security-audit` skill and run:

1. Use Supabase MCP to check advisors:

   ```
   mcp_supabase-mcp-server_get_advisors({ project_id: "PROJECT_ID", type: "security" })
   ```

2. Verify RLS is enabled on all tables
3. Confirm no secrets in frontend code (grep for API keys)
4. Check `netlify.toml` has security headers

## Step 6: Accessibility Audit

Read the `accessibility-audit` skill and check:

1. Verify ESLint a11y plugin is configured
2. Check all `<img>` tags have `alt` attributes
3. Verify color contrast meets WCAG AA (4.5:1)
4. Test keyboard navigation on main flows
5. Ensure semantic HTML (`<main>`, `<nav>`, `<header>`)

## Step 7: Error Monitoring Check

Read the `error-monitoring` skill and verify:

1. Error boundaries wrap route-level components
2. All Supabase calls have error handling
3. `netlify.toml` has `on_error` configured for edge functions
4. No uncaught promise rejections in code

## Step 8: SEO Check

Read the `seo-optimization` skill and verify:

1. `<title>` tag is descriptive and unique
2. `<meta name="description">` present
3. Open Graph tags configured
4. `robots.txt` present in `public/`
5. Single `<h1>` per page

## Step 9: Generate Audit Report

Create a markdown report summarizing findings from all 5 audits with:

- ✅ Items passing
- ⚠️ Items needing attention
- ❌ Critical issues to fix

## Step 10: Fix Critical Issues

Address any ❌ critical items found, prioritizing:

1. Security (RLS, exposed keys)
2. Accessibility (keyboard nav, screen reader)
3. Performance (bundle size, lazy loading)
4. SEO (meta tags, headings)
5. Error handling (boundaries, logging)

## Post-Audit

After fixing issues, rebuild and redeploy:

```powershell
npm run build
```

Then use `/full-deploy` to push changes to production.
