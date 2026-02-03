---
description: Extract and structure financial data from Excel to JSON for NLT-PR Dashboard
---

# Financial Data Extraction Skill

## Purpose

Automates the extraction of financial statement data from Excel workbooks into structured JSON files for the NLT-PR Dashboard, organizing leadschedules by accounting categories.

## When to Use

- When financial data in the Excel workbook has been updated
- When new categories need to be added to leadschedules
- When regenerating the dashboard data after Excel changes
- When deploying updates to the NLT-PR Dashboard

## Prerequisites

- Python 3.x with `openpyxl` library installed
- Access to the source Excel file at `D:\NLTS-PR\NLTS-PR FS 12 31 2024 Rev156-3.xlsm`
- Write access to `NLT_PR_Dashboard/src/data/`

## Execution Steps

### 1. Run the Extraction Script

// turbo

```powershell
cd c:\Users\cpari\.gemini\antigravity\NLT_PR_Dashboard
python scripts/extract_financials.py
```

### 2. Verify the Output

Check that the JSON file was updated:

```powershell
Get-Item src\data\financial_statements.json | Select-Object Length, LastWriteTime
```

### 3. Build and Test

// turbo

```powershell
npm run build
```

### 4. Commit Changes

```powershell
git add -A
git commit -m "Updated financial data from Excel extraction"
git push origin master
```

## Data Structure

The extraction creates a JSON file with the following structure:

```json
{
  "Metadata": {
    "SourceFile": "NLTS-PR FS 12 31 2024 Rev156-3.xlsm",
    "ExtractedAt": "2026-02-03T19:42:13",
    "PdfAvailable": true,
    "Version": "2.0.0"
  },
  "BS": [...],  // Balance Sheet line items
  "IS": [...],  // Income Statement line items
  "CF": [...],  // Cash Flow line items
  "Lead": [...],  // Full Leadschedules grid
  "TaxLead": [...],  // Full Tax Leadschedules grid
  "LeadSections": {
    "assets": { "name_en": "Assets", "icon": "📦", "data": [...] },
    "liabilities": { "name_en": "Liabilities", "icon": "📋", "data": [...] },
    ...
  },
  "TaxLeadSections": {
    "assets": { ... },
    "liabilities": { ... },
    "equity": { ... },
    "revenue": { ... },
    "costs": { ... },
    "expenses": { ... },
    "other": { ... },
    "taxes": { ... }
  }
}
```

## Section Categories

| Section Key | English Name | Spanish Name | Icon | Keywords |
|-------------|--------------|--------------|------|----------|
| `assets` | Assets | Activos | 📦 | Cash, Receivable, Inventory, Equipment |
| `liabilities` | Liabilities | Pasivos | 📋 | Payable, Loan, Debt, Lease |
| `equity` | Shareholders' Equity | Capital Contable | 🏛️ | Capital, Stock, Retained Earnings |
| `revenue` | Revenue | Ingresos | 💰 | Sales, Income, Service, Rental |
| `costs` | Costs of Revenue | Costo de Ventas | 🔧 | COGS, Material, Labor, Direct |
| `expenses` | Operating Expenses | Gastos Operacionales | 📊 | Rent, Insurance, Professional, Travel |
| `other` | Other Income/Expenses | Otros Ingresos/Gastos | 📈 | Interest, Gain, Loss |
| `taxes` | Taxes & Contributions | Contribuciones | 🏦 | Tax, IVU, Patente, Municipal |

## Troubleshooting

### Excel file is locked

Close Excel or use a copy of the file:

```powershell
Copy-Item "D:\NLTS-PR\NLTS-PR FS 12 31 2024 Rev156-3.xlsm" "$env:TEMP\temp_fs.xlsm"
```

### openpyxl not installed

```powershell
pip install openpyxl
```

### JSON too large

The extraction limits rows to 500 per section and columns to 15. Adjust in `extract_financials.py` if needed.

## Related Files

- `scripts/extract_financials.py` - Main extraction script
- `src/data/financial_statements.json` - Output data file
- `src/components/FinancialStatements.tsx` - Dashboard component that consumes the data
