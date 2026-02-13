---
description: Steps to diagnose why financial data might not be updating
---

# Troubleshooting: Data Sync Issues

If the dashboard shows old data or "Error" statuses.

## 1. Check Source File Detection

Run the extraction script manually to see what file it picks up.

```powershell
python scripts/extract_financial_statements.py
```

**Output should say:** `Latest Excel found: Reyes Contractor FS RevXXX-YY .xlsm`.
If not, check if `D:\Reyes Contractor` has the file.

## 2. Check Python Dependencies

Ensure `openpyxl` is installed in the active environment.

```powershell
pip install openpyxl
```

## 3. Check JSON Output

Delete the existing JSON to force a refresh.

```powershell
del src/data/financial_statements.json
del public/data/financial_ratios.json
```

Run the update script (`Update_Reyes_Contractor_Group_Dashboard.bat`) again.

## 4. Check NotebookLM Connection

If "AI Summary" is stuck on "Generating...":

1. Ensure the NotebookLM MCP server is running.
2. Check `server/index.js` console logs for "Connection refused" errors.
3. If offline, the dashboard should fallback to the static `executive_summary_en.json` file. Ensure this file exists and is valid JSON.
