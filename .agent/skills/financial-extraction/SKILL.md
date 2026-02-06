---
name: Financial Data Extraction
description: Extract financial data from Excel workbooks to JSON for dashboard consumption
---

# Financial Data Extraction Skill

This skill handles extraction of financial data from Excel workbooks (`.xlsm` files) and converts them to JSON format for use in React dashboards.

## Capabilities

1. **Ratio Extraction** - Extract 46+ financial ratios from Excel sheets
2. **Financial Statements** - Extract Balance Sheet, Income Statement, Cash Flow
3. **Leading Indicators** - Calculate Z-Score, Sustainable Growth, Break-even analysis
4. **Industry Benchmarks** - Compare against CFMA construction industry standards

## Source Files

The primary data sources are Excel workbooks with the following sheets:

- `BS` - Balance Sheet
- `IS` - Income Statement  
- `CF` - Cash Flow Statement
- `Ratios` - Pre-calculated ratios
- `WoH` - Work on Hand (Construction specific)
- `KPIs` - Key Performance Indicators

## Extraction Script Template

```python
import openpyxl
import json
from datetime import datetime

def extract_ratios(workbook_path: str, output_path: str):
    """Extract financial ratios from Excel workbook."""
    wb = openpyxl.load_workbook(workbook_path, data_only=True)
    
    # Read from Ratios sheet
    ratios_sheet = wb['Ratios']
    
    # Extract data structure
    data = {
        "company": "Company Name",
        "asOf": datetime.now().strftime("%Y-%m-%d"),
        "extractedAt": datetime.now().isoformat(),
        "liquidityRatios": [],
        "profitabilityRatios": [],
        "leverageRatios": [],
        "efficiencyRatios": [],
        "cashFlowRatios": [],
        "constructionMetrics": [],
        "leadingIndicators": []
    }
    
    # Save to JSON
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    return data
```

## Output Format

```json
{
  "company": "Reyes Contractor Group",
  "asOf": "2025-06-30",
  "extractedAt": "2026-02-06T08:00:00",
  "liquidityRatios": [
    {
      "name": "Current Ratio",
      "current": 1.8,
      "prior": 1.7,
      "unit": "x",
      "status": "good",
      "industryBenchmark": 1.5,
      "interpretation": "Healthy short-term liquidity"
    }
  ],
  "profitabilityRatios": [...],
  "leadingIndicators": [
    {
      "name": "Z-Score (Altman Bankruptcy)",
      "current": 3.5,
      "unit": "score",
      "status": "good",
      "industryBenchmark": 2.99
    }
  ]
}
```

## Z-Score Calculation (Altman Model)

```
Z = 1.2(WC/TA) + 1.4(RE/TA) + 3.3(EBIT/TA) + 0.6(MVE/TL) + 1.0(S/TA)

Where:
- WC = Working Capital
- TA = Total Assets
- RE = Retained Earnings
- EBIT = Earnings Before Interest and Taxes
- MVE = Market Value of Equity (use Book Value for private companies)
- TL = Total Liabilities
- S = Sales

Interpretation:
- Z > 2.99: Safe Zone (low bankruptcy risk)
- 1.81 < Z < 2.99: Grey Zone (moderate risk)
- Z < 1.81: Distress Zone (high bankruptcy risk)
```

## CFMA Industry Benchmarks (Construction)

| Metric | Good | Excellent | Warning |
|--------|------|-----------|---------|
| Current Ratio | 1.5x | 2.0x | < 1.0x |
| Quick Ratio | 1.0x | 1.5x | < 0.7x |
| Gross Margin | 20% | 30% | < 15% |
| Net Margin | 5% | 10% | < 2% |
| DSO | 45 days | 30 days | > 60 days |
| Debt to Equity | 1.5x | 1.0x | > 2.5x |

## Usage

```bash
# From project root
python scripts/extract_ratios_from_sheet.py

# Output: public/data/financial_ratios.json
```

## Related Scripts

- `scripts/extract_ratios_from_sheet.py` - Main extraction script
- `scripts/extract_financial_statements.py` - Balance Sheet/IS/CF extraction
- `scripts/sync_from_gdrive.bat` - Automated sync from Google Drive
