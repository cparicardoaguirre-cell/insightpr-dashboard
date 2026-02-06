---
description: Extract and sync financial data from Excel to dashboard JSON files
---

# Financial Data Sync Workflow

This workflow extracts financial data from Excel workbooks in Google Drive and updates the dashboard's JSON data files.

## Prerequisites

- Google Drive for Desktop installed and syncing
- Python with openpyxl installed
- Excel source file in sync folder

## Data Sources

| Client | Excel Location | Dashboard Project |
|--------|----------------|-------------------|
| Reyes Contractor | `D:\Reyes Contractor\Reyes Contractor FS Rev157_14 .xlsm` | reyes-construccion-dashboard |
| National Lift Truck | `D:\National Lift Truck\...` | nlts-dashboard |

## Steps

// turbo-all

### 1. Verify Source File Exists

```bash
dir "D:\Reyes Contractor\Reyes Contractor FS Rev157*.xlsm"
```

### 2. Extract Financial Ratios

```bash
cd D:\Antigravity Workspace\reyes-construccion-dashboard
python scripts/extract_ratios_from_sheet.py
```

### 3. Verify Extraction Output

```bash
cd D:\Antigravity Workspace\reyes-construccion-dashboard
python -c "import json; data = json.load(open('public/data/financial_ratios.json')); print('Ratios extracted:', sum(len(data.get(k, [])) for k in ['liquidityRatios', 'profitabilityRatios', 'leverageRatios', 'efficiencyRatios', 'cashFlowRatios', 'constructionMetrics', 'leadingIndicators']))"
```

### 4. Extract Financial Statements (Optional)

```bash
cd D:\Antigravity Workspace\reyes-construccion-dashboard
python scripts/extract_financial_statements.py
```

### 5. Build Dashboard

```bash
cd D:\Antigravity Workspace\reyes-construccion-dashboard
npm run build
```

### 6. Deploy Updated Data

Follow the `/full-deploy` workflow to push changes to production.

## Output Files

After sync, these files are updated:

- `public/data/financial_ratios.json` - 46+ calculated ratios
- `public/data/financial_statements.json` - BS, IS, CF data

## Automated Batch Script

For one-click sync:

```bash
D:\Antigravity Workspace\reyes-construccion-dashboard\scripts\sync_from_gdrive.bat
```

## Ratios Extracted

### Standard Ratios (46)

- Liquidity: 5 ratios
- Profitability: 7 ratios
- Leverage: 6 ratios
- Efficiency: 7 ratios
- Cash Flow: 5 ratios
- Construction Metrics: 6 ratios

### Leading Indicators (10)

- Z-Score (Altman Bankruptcy)
- Sustainable Growth Rate (Current D/E)
- Sustainable Growth Rate (No Debt)
- Contribution Margin
- Break-even Sales
- Personnel Productivity
- EBITDA
- Working Capital to Total Assets
- Retained Earnings to Total Assets
- Sales to Total Assets

## Troubleshooting

### File Not Found

- Ensure Google Drive is fully synced
- Check for correct file name (version number may change)

### Extraction Errors

- Open Excel file to ensure it's not corrupted
- Check sheet names match expected (BS, IS, CF, Ratios)

### Zero Values

- Some ratios may be 0 if source data is missing
- Check Excel file has data for current period
