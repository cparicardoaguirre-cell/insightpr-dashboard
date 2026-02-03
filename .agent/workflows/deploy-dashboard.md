---
description: Full deployment workflow for NLT-PR Dashboard including data extraction and publishing
---

# Deploy NLT-PR Dashboard

## Purpose

Complete deployment workflow that extracts fresh data from Excel, builds the application, and deploys to Netlify.

## Prerequisites

- Excel workbook at `D:\NLTS-PR\NLTS-PR FS 12 31 2024 Rev156-3.xlsm`
- Python with openpyxl installed
- Node.js and npm installed
- Git configured with push access to repository
- Netlify auto-deploy configured on master branch

## Full Deployment Steps

### 1. Extract Financial Data from Excel

// turbo

```powershell
cd c:\Users\cpari\.gemini\antigravity\NLT_PR_Dashboard
python scripts/extract_financials.py
```

### 2. Build the Application

// turbo

```powershell
npm run build
```

### 3. Stage All Changes

// turbo

```powershell
git add -A
```

### 4. Commit with Descriptive Message

```powershell
git commit -m "Deploy: Updated financial data and dashboard"
```

### 5. Push to Trigger Netlify Deploy

```powershell
git push origin master
```

### 6. Wait for Netlify Deployment

```powershell
Start-Sleep -Seconds 60
```

### 7. Verify Production Site

Open browser to verify the deployed site at: <https://insightpr-dashboard.netlify.app>

## Quick Deploy (No Data Extraction)

If you only need to deploy code changes without refreshing Excel data:

### 1. Build

// turbo

```powershell
npm run build
```

### 2. Commit and Push

```powershell
git commit -a -m "Quick deploy: [describe changes]"
git push origin master
```

## Rollback

If deployment causes issues:

```powershell
git revert HEAD
git push origin master
```

## Post-Deployment Checklist

- [ ] Verify all tabs load correctly (BS, IS, CF, Lead, TaxLead, Docs)
- [ ] Test sectioned leadschedules (click each category button)
- [ ] Verify PDF viewer loads the audited financial statements
- [ ] Check language toggle works (EN/ES)
- [ ] Verify Industry Analysis educational content displays
- [ ] Test on mobile viewport

## Related Workflows

- `/extract-financial-data` - Data extraction only
- `/update-audited-pdf` - If you need to replace the audited PDF

## Files Modified in Typical Deploy

- `src/data/financial_statements.json` - Financial data
- `public/documents/audited_financials.pdf` - Audited statements PDF
- `src/components/*.tsx` - React components
