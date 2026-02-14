# Antigravity Workspace - Projects & Agents Configuration

This document provides an overview of all projects in the Antigravity Workspace and their configurations.

**Last Updated**: 2026-02-07T00:35:00-04:00

## Projects Overview

| Project | Type | Status | Netlify | Supabase | GitHub |
|---------|------|--------|---------|----------|--------|
| reyes-construccion-dashboard | Dashboard | ✅ Active | ✅ | ✅ | ✅ |
| nlts-dashboard | Dashboard | ✅ Active | ✅ | ✅ | ✅ |
| insightpr-dashboard | Dashboard | ✅ Active | ✅ | ❌ | ✅ |
| InnovationSolutionsLLC | Website | ✅ Active | ✅ | ✅ | ✅ |
| CpaRicardoAguirreWebSite | Website | ✅ Active | ✅ | ❌ | ✅ |

## Project Details

### Reyes Contractor Group Dashboard

- **Path**: `C:\Users\cpari\.gemini\antigravity\Aguirre_Workspace\reyes-construccion-dashboard`
- **Tech**: React + Vite + TypeScript
- **Port (Dev)**: 5175
- **Netlify Site ID**: `23b9a779-8a7d-41a1-a334-8d6800ddf49d`
- **Netlify URL**: <https://reyes-contractor-group-dashboard.netlify.app>
- **Supabase Project**: `pbuqcwlmfhxbdjthoiwd` (us-east-1)
- **GitHub**: <https://github.com/cparicardoaguirre-cell/reyes-construccion-dashboard>
- **Data Source**: `D:\Reyes Contractor\Reyes Contractor FS Rev157_14 .xlsm`
- **Google Drive**: <https://drive.google.com/drive/folders/19IT9Gyjou7efyQtkL7w97mhqIyxxNi9j>

### NLT-PR Dashboard  

- **Path**: `C:\Users\cpari\.gemini\antigravity\Aguirre_Workspace\nlts-dashboard`
- **Tech**: React + Vite + TypeScript
- **Port (Dev)**: Default (5173)
- **Netlify Site ID**: `2af0eead-b243-4730-b1ce-a4f42948b7e6`
- **Netlify URL**: <https://nlts-pr-dashboard.netlify.app>
- **Supabase Project**: `owyslyqjawxzbzsohaxl` (us-east-1)
- **GitHub**: <https://github.com/cparicardoaguirre-cell/nlts-dashboard>
- **Features**: Financial analysis, KPIs, NotebookLM integration

### InsightPR Dashboard

- **Path**: `C:\Users\cpari\.gemini\antigravity\Aguirre_Workspace\insightpr-dashboard`
- **Tech**: React + Vite + TypeScript
- **Port (Dev)**: 5174
- **Netlify Site ID**: `31415027-79b1-4ed7-b6f1-29d96df9de6a`
- **Netlify URL**: <https://insightpr-dashboard.netlify.app>
- **GitHub**: <https://github.com/cparicardoaguirre-cell/insightpr-dashboard>
- **Features**: Multi-client dashboard framework

### Innovation Solutions LLC

- **Path**: `C:\Users\cpari\.gemini\antigravity\Aguirre_Workspace\InnovationSolutionsLLC`
- **Tech**: React + Vite + TypeScript
- **Port (Dev)**: 5176
- **Netlify Site ID**: `05ab368a-ab18-4b19-9555-cbac3eadfa43`
- **Netlify URL**: <https://innovationsolutionsllc.org>
- **Supabase Project**: `wstdkudydrhbkbbowyxr` (us-west-2)
- **GitHub**: <https://github.com/cparicardoaguirre-cell/InnovationSolutionsLLC>

### CPA Ricardo Aguirre Website

- **Path**: `C:\Users\cpari\.gemini\antigravity\Aguirre_Workspace\CpaRicardoAguirreWebSite`
- **Tech**: React + Vite
- **Netlify Site ID**: `5df5cfa9-c1c2-4133-9842-0a4a22cdd595`
- **Netlify URL**: <https://cparicardoaguirre.org>
- **GitHub**: <https://github.com/cparicardoaguirre-cell/CpaRicardoAguirreWebSite>
- **Features**: CPA practice website

## Skills Available

| Skill | Location | Purpose |
|-------|----------|---------|
| financial-extraction | `.agent/skills/financial-extraction/` | Excel to JSON data extraction |
| netlify-deployment | `.agent/skills/netlify-deployment/` | Netlify deployment processes |
| supabase-operations | `.agent/skills/supabase-operations/` | Database operations |
| react-dashboard | `.agent/skills/react-dashboard/` | Dashboard development patterns |
| google-drive-sync | `.agent/skills/google-drive-sync/` | Google Drive file sync |
| project-automation | `.agent/skills/project-automation/` | CI/CD and deployment pipelines |
| bilingual-content | `.agent/skills/bilingual-content/` | Spanish/English content management |

## Workflows Available

| Workflow | Command | Purpose |
|----------|---------|---------|
| full-deploy | `/full-deploy` | Build, commit, push, deploy |
| financial-sync | `/financial-sync` | Extract data from Excel |
| new-dashboard | `/new-dashboard` | Create new project |
| supabase-setup | `/supabase-setup` | Configure Supabase |
| quick-dev | `/quick-dev` | Local development iteration |
| debug | `/debug` | Troubleshoot application issues |
| deps-update | `/deps-update` | Manage dependencies |

## MCP Servers Connected

### Netlify

- Deploy sites
- Manage environment variables
- Check deployment status

### Supabase

- Database operations
- Execute SQL
- Apply migrations
- Deploy edge functions
- View logs

## Supabase Projects

| Project Name | ID | Region | Status |
|--------------|-------|--------|--------|
| Reyes Contractor Group | `pbuqcwlmfhxbdjthoiwd` | us-east-1 | ✅ ACTIVE_HEALTHY |
| NLTS-PR Dashboard | `owyslyqjawxzbzsohaxl` | us-east-1 | ✅ ACTIVE_HEALTHY |
| InnovationSolutionsLLC | `wstdkudydrhbkbbowyxr` | us-west-2 | ✅ ACTIVE_HEALTHY |
| cparicardoaguirre-cell's Project | `puzdwmpklihscmytkvgz` | us-east-2 | ✅ ACTIVE_HEALTHY |

## Netlify Sites

| Site Name | ID | URL | Status |
|-----------|----|----|--------|
| reyes-contractor-group-dashboard | `23b9a779-8a7d-41a1-a334-8d6800ddf49d` | <https://reyes-contractor-group-dashboard.netlify.app> | ✅ ready |
| nlts-pr-dashboard | `2af0eead-b243-4730-b1ce-a4f42948b7e6` | <https://nlts-pr-dashboard.netlify.app> | ✅ ready |
| insightpr-dashboard | `31415027-79b1-4ed7-b6f1-29d96df9de6a` | <https://insightpr-dashboard.netlify.app> | ✅ ready |
| innovationsolutionsllc.org | `05ab368a-ab18-4b19-9555-cbac3eadfa43` | <https://innovationsolutionsllc.org> | ✅ ready |
| cparicardoaguirre.org | `5df5cfa9-c1c2-4133-9842-0a4a22cdd595` | <https://cparicardoaguirre.org> | ✅ ready |

## Common Commands

### Start All Dev Servers

```bash
# Reyes Dashboard (port 5175)
cd C:\Users\cpari\.gemini\antigravity\Aguirre_Workspace\reyes-construccion-dashboard && npm run dev

# NLT Dashboard (port 5173)
cd C:\Users\cpari\.gemini\antigravity\Aguirre_Workspace\nlts-dashboard && npm run dev

# InsightPR (port 5174)
cd C:\Users\cpari\.gemini\antigravity\Aguirre_Workspace\insightpr-dashboard && npm run dev -- --port 5174

# Innovation Solutions (port 5176)
cd C:\Users\cpari\.gemini\antigravity\Aguirre_Workspace\InnovationSolutionsLLC && npm run dev -- --port 5176
```

### Quick Deploy Commands

```bash
# Deploy Reyes Dashboard
cd C:\Users\cpari\.gemini\antigravity\Aguirre_Workspace\reyes-construccion-dashboard
npm run build && git add -A && git commit -m "Update" && git push
# Then use: /full-deploy

# Sync Financial Data
cd C:\Users\cpari\.gemini\antigravity\Aguirre_Workspace\reyes-construccion-dashboard
python scripts/extract_ratios_from_sheet.py
```

## Data Flow Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Google Drive   │────▶│  Python Scripts  │────▶│   JSON Files     │
│   (Excel/XLSM)   │     │  (openpyxl)      │     │  (public/data/)  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│     Supabase     │◀───▶│  React Dashboard │◀────│  Netlify CDN     │
│   (PostgreSQL)   │     │    (Vite)        │     │   (Production)   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## NotebookLM Resources

| Notebook | URL | Topics |
|----------|-----|--------|
| Reyes Financials | [Link](https://notebooklm.google.com/notebook/0acad575-53dd-4607-a2bd-2610b004e2f6) | Financial analysis |
| Ley 60 Guide | [Link](https://notebooklm.google.com/notebook/26e84352-d977-41bf-8e49-5a06c97dcd0e) | Tax incentives |
| Construction Industry | [Link](https://notebooklm.google.com/notebook/0cb8f6a2-c9a5-48ed-ba7f-2d8a86129318) | CFMA benchmarks |
| GAAP Standards | [Link](https://notebooklm.google.com/notebook/38def0f0-528b-4c21-b6fc-c4b9ce320341) | Accounting standards |
| Industria Construcción PR | [Link](https://notebooklm.google.com/notebook/25a9d90c-2e2b-4cc7-952e-2c0dd79e018f) | DACO/Hacienda regulations, surety bonds, construction accounting, FASB ASC 606 |
