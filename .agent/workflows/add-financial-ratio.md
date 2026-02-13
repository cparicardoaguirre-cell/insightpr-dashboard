---
description: How to add a new financial ratio to the extraction and display pipeline
---

# Workflow: Add New Profitability/Solvency Ratio

This workflow explains how to extract a *new* financial ratio from the Excel file and display it on the Dashboard.

## Steps

### 1. Identify the Source Data

Open `scripts/extract_financial_statements.py` or `server/extract_dynamic_ratios.py`. Identify which Excel cells or named ranges match the needed data.

### 2. Update Python Extractor (`server/extract_dynamic_ratios.py`)

Add the calculation logic in the calculated fields section.

```python
# Example: Adding Interest Coverage Ratio
ebit = income_statement.get('Income from Operations', 0)
interest = income_statement.get('Interest Expense', 0)
coverage = ebit / interest if interest != 0 else 0

results['solvencyRatios'].append({
    "name": "Interest Coverage",
    "current": coverage,
    "status": "good" if coverage > 3 else "warning"
})
```

### 3. Run Extraction Locally

Test the extraction script to ensure the JSON updates correctly.

```bash
python server/extract_dynamic_ratios.py
```

Check `public/data/financial_ratios.json` to verify the new field exists.

### 4. Update React Component (`src/components/Overview.tsx`)

Add the new ratio to the display logic.

```tsx
const interestCoverage = getRatio('solvencyRatios', 'Interest Coverage');
// Add to kpiCards array...
```

### 5. Deploy

Run the standard specific update workflow.
