---
name: Netlify Deployment
description: Deploy React/Vite dashboards to Netlify with serverless functions
---

# Netlify Deployment Skill

This skill handles deployment of React/Vite applications to Netlify, including serverless functions and edge functions.

## Prerequisites

- Netlify CLI or MCP integration configured
- Site created in Netlify
- Build output in `dist/` folder

## Deployment Methods

### Method 1: MCP Tool (Recommended)

Use the Netlify MCP server for direct deployment:

```
mcp_netlify_netlify-deploy-services-updater({
  "operation": "deploy-site",
  "params": {
    "deployDirectory": "/path/to/project/dist",
    "siteId": "site-id-here"
  }
})
```

### Method 2: Netlify CLI

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Method 3: Git-based Deploy

Push to connected Git repository for automatic deployment.

## Project Configuration

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Serverless Functions

Place functions in `netlify/functions/`:

```typescript
// netlify/functions/sync-status.mts
import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
    return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" }
    });
};

export const config: Config = {
    path: "/api/sync-status"
};
```

## Site IDs Reference

| Project | Site ID | URL |
|---------|---------|-----|
| Reyes Contractor Group | `23b9a779-8a7d-41a1-a334-8d6800ddf49d` | reyes-contractor-group-dashboard.netlify.app |
| NLT-PR Dashboard | `your-site-id` | nlts-pr-dashboard.netlify.app |
| InsightPR Dashboard | `your-site-id` | insightpr-dashboard.netlify.app |

## Full Deploy Workflow

```bash
# 1. Build the project
npm run build

# 2. Git commit
git add -A
git commit -m "feat: description of changes"
git push

# 3. Deploy to Netlify (using MCP or CLI)
# MCP: Use mcp_netlify_netlify-deploy-services-updater
# CLI: netlify deploy --prod --dir=dist
```

## Environment Variables

Set in Netlify dashboard or via CLI:

```bash
netlify env:set API_KEY "your-api-key"
netlify env:list
```

## Monitoring

After deployment:

1. Check deploy URL in response
2. Monitor at: `https://app.netlify.com/sites/{site-id}/deploys/{deploy-id}`
3. Check function logs: `https://app.netlify.com/sites/{site-id}/logs/functions`

## Troubleshooting

### Build Failures

- Check `npm run build` works locally
- Verify Node.js version in `netlify.toml`
- Check for missing dependencies

### Function Errors

- Ensure TypeScript compiled correctly
- Check function path configuration
- Review function logs in Netlify dashboard

### 404 Errors on Routes

- Add SPA redirect in `netlify.toml`
- Ensure `_redirects` file in `public/` folder
