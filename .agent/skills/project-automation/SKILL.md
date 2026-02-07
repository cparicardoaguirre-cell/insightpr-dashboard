---
name: Project Automation
description: CI/CD patterns, automated testing, and deployment pipelines
---

# Project Automation Skill

This skill covers automation patterns for React/Vite projects including CI/CD, testing, and deployment.

## Netlify Deployment

### Using MCP Tool (Recommended)

```typescript
// Use the Netlify MCP deploy tool
mcp_netlify_netlify-deploy-services-updater({
  selectSchema: {
    operation: "deploy-site",
    params: {
      deployDirectory: "path/to/dist",
      siteId: "netlify-site-id"
    }
  }
})
```

### Site IDs Reference

| Project | Site ID |
|---------|---------|
| reyes-construccion-dashboard | `23b9a779-8a7d-41a1-a334-8d6800ddf49d` |
| nlts-dashboard | `2af0eead-b243-4730-b1ce-a4f42948b7e6` |
| insightpr-dashboard | `31415027-79b1-4ed7-b6f1-29d96df9de6a` |
| InnovationSolutionsLLC | `05ab368a-ab18-4b19-9555-cbac3eadfa43` |
| CpaRicardoAguirreWebSite | `5df5cfa9-c1c2-4133-9842-0a4a22cdd595` |

## Build Pipeline

### Standard Build Process

```bash
# 1. Install dependencies
npm install

# 2. Type check (TypeScript)
npx tsc --noEmit

# 3. Build for production
npm run build

# 4. Verify build output
ls -la dist/
```

### Pre-deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] Build completes without warnings
- [ ] Assets copied to dist folder
- [ ] Environment variables configured

## Git Workflow

### Standard Commit Pattern

```bash
# Stage all changes
git add -A

# Commit with conventional message
git commit -m "type: description"

# Push to remote
git push
```

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code restructuring |
| `chore` | Maintenance |
| `build` | Build system |

## Environment Configuration

### Vite Environment Variables

```bash
# .env.local (local development)
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Netlify environment variables
# Set via Netlify dashboard or CLI
```

### netlify.toml Configuration

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Automated Scripts

### Full Deploy Script (Windows)

```powershell
# deploy.ps1
npm run build
if ($LASTEXITCODE -eq 0) {
    git add -A
    git commit -m "build: Production deployment"
    git push
    Write-Host "Deployment triggered successfully"
} else {
    Write-Host "Build failed, deployment aborted"
}
```

### Data Sync Script (Python)

```python
# sync_data.py
import subprocess
import sys

def sync_and_deploy():
    # Run extraction
    subprocess.run([sys.executable, "scripts/extract_ratios.py"])
    
    # Build
    subprocess.run(["npm", "run", "build"])
    
    # Git operations
    subprocess.run(["git", "add", "-A"])
    subprocess.run(["git", "commit", "-m", "data: Update financial data"])
    subprocess.run(["git", "push"])

if __name__ == "__main__":
    sync_and_deploy()
```

## Monitoring

### Check Deployment Status

```typescript
// Use Netlify MCP to check deploy status
mcp_netlify_netlify-deploy-services-reader({
  selectSchema: {
    operation: "get-deploy",
    params: {
      deployId: "deploy-id-here"
    }
  }
})
```

### Health Checks

1. Verify site is accessible
2. Check for console errors
3. Verify data loads correctly
4. Test authentication flow

## Best Practices

1. **Always build before deploy** - Catch errors early
2. **Use conventional commits** - Maintain clear history
3. **Test locally first** - Verify changes work
4. **Backup before major changes** - Easy rollback
5. **Monitor after deploy** - Catch production issues
