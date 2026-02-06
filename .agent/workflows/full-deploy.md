---
description: Complete workflow to build, commit, and deploy any dashboard project to production
---

# Full Deploy Workflow

This workflow handles the complete process of building, committing, and deploying a dashboard to production.

## Prerequisites

- Project is a Vite/React application
- Git repository is initialized and connected
- Netlify site is configured

## Steps

// turbo-all

### 1. Identify the Project

Confirm which project to deploy from the workspace:

- `reyes-construccion-dashboard` - Reyes Contractor Group
- `nlts-dashboard` - NLT-PR Dashboard
- `insightpr-dashboard` - InsightPR Dashboard
- `InnovationSolutionsLLC` - Innovation Solutions

### 2. Build the Project

```bash
cd D:\Antigravity Workspace\{project-name}
npm run build
```

### 3. Stage All Changes

```bash
cd D:\Antigravity Workspace\{project-name}
git add -A
```

### 4. Commit with Descriptive Message

```bash
cd D:\Antigravity Workspace\{project-name}
git commit -m "feat: description of changes"
```

### 5. Push to GitHub

```bash
cd D:\Antigravity Workspace\{project-name}
git push
```

### 6. Deploy to Netlify

Use the MCP tool to deploy:

```
mcp_netlify_netlify-deploy-services-updater({
  "operation": "deploy-site",
  "params": {
    "deployDirectory": "D:\\Antigravity Workspace\\{project-name}\\dist",
    "siteId": "{site-id}"
  }
})
```

## Site IDs Reference

| Project | Site ID |
|---------|---------|
| reyes-construccion-dashboard | `23b9a779-8a7d-41a1-a334-8d6800ddf49d` |
| nlts-dashboard | TBD |
| insightpr-dashboard | TBD |

## Post-Deploy Verification

1. Check deploy status at Netlify dashboard
2. Verify production site loads correctly
3. Test key functionality (sync button, language toggle, etc.)
4. Check browser console for errors
