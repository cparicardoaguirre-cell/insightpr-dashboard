---
name: Google Drive Integration
description: Sync data files from Google Drive for Desktop to dashboard projects
---

# Google Drive Integration Skill

This skill handles synchronization of data files from Google Drive for Desktop to dashboard projects.

## Architecture

```
Google Drive Web ←→ Google Drive Desktop ←→ Local Folder ←→ Dashboard
                         (D:\)              (Python)      (JSON)
```

## Requirements

- Google Drive for Desktop installed and running
- Files synced to local drive (e.g., `D:\Reyes Contractor\`)
- Python with openpyxl for Excel processing

## Folder Structure

```
📁 D:\Reyes Contractor (Google Drive Synced)
├── 📁 Financial Statements/
│   └── Audited FS 2020-2024
├── 📁 WoH/
│   └── Work on Hand reports
├── 📁 Planillas/
│   └── Payroll and tax forms
├── 📁 Consultoria de CPA Aguirre/
│   └── Strategic documents
├── 📊 Reyes Contractor FS Rev157_14 .xlsm ⭐
├── 📊 Work on Hand Template 54.xlsm
├── 📄 dynamic_ratios.json
├── 📄 Chart of Accounts.xlsx
└── 📄 8692_reglamento_de_contratos_a_largo_plazo.pdf
```

## Sync Process

### 1. File Detection

Detect the latest version of the source file:

```python
import os
import glob

def find_latest_file(pattern: str) -> str:
    """Find the most recently modified file matching pattern."""
    files = glob.glob(pattern)
    if not files:
        raise FileNotFoundError(f"No files match {pattern}")
    return max(files, key=os.path.getmtime)

# Example: Find latest FS file
source_file = find_latest_file("D:\\Reyes Contractor\\Reyes Contractor FS Rev*.xlsm")
```

### 2. Data Extraction

Extract data using openpyxl:

```python
import openpyxl

wb = openpyxl.load_workbook(source_file, data_only=True)

# Access specific sheets
balance_sheet = wb['BS']
income_statement = wb['IS']
cash_flow = wb['CF']
ratios_sheet = wb['Ratios']
```

### 3. JSON Output

Save to dashboard's public/data folder:

```python
import json

output = {
    "company": "Reyes Contractor Group",
    "extractedAt": datetime.now().isoformat(),
    "liquidityRatios": [...],
    "profitabilityRatios": [...],
    # etc.
}

with open("public/data/financial_ratios.json", "w") as f:
    json.dump(output, f, indent=2)
```

## Google Drive URLs

### Accessing via URL

Direct folder link format:

```
https://drive.google.com/drive/folders/{folder-id}
```

### Folder References

| Client | Google Drive URL |
|--------|------------------|
| Reyes Contractor | <https://drive.google.com/drive/folders/19IT9Gyjou7efyQtkL7w97mhqIyxxNi9j> |

## Automation Script

### Batch Script (Windows)

```batch
@echo off
echo Syncing from Google Drive...

cd /d "D:\Antigravity Workspace\reyes-construccion-dashboard"

echo Extracting ratios...
python scripts\extract_ratios_from_sheet.py

echo Building dashboard...
npm run build

echo Done!
```

### PowerShell Script

```powershell
# Sync and update dashboard
$projectPath = "D:\Antigravity Workspace\reyes-construccion-dashboard"

Set-Location $projectPath

# Extract data
python scripts\extract_ratios_from_sheet.py

# Build
npm run build

Write-Host "Sync complete!" -ForegroundColor Green
```

## Monitoring Changes

### Check Last Modified Time

```python
import os
from datetime import datetime

file_path = "D:\\Reyes Contractor\\Reyes Contractor FS Rev157_14 .xlsm"
mod_time = os.path.getmtime(file_path)
last_modified = datetime.fromtimestamp(mod_time)

print(f"Last modified: {last_modified}")
```

### Detect New Versions

```python
def check_for_updates(known_version: str) -> bool:
    """Check if a new version exists."""
    pattern = "D:\\Reyes Contractor\\Reyes Contractor FS Rev*.xlsm"
    latest = find_latest_file(pattern)
    return latest != known_version
```

## API Endpoint for Status

The dashboard exposes a sync status endpoint:

```
GET /api/sync-status

Response:
{
  "success": true,
  "lastSync": "2026-02-06T08:00:00",
  "dataSource": "Reyes Contractor FS Rev157_14 .xlsm",
  "ratiosCount": 46,
  "leadingIndicatorsCount": 10
}
```

## Troubleshooting

### Google Drive Not Syncing

- Check Google Drive icon in system tray
- Verify account is logged in
- Check available disk space

### File Locked Error

- Close Excel if file is open
- Wait for Google Drive sync to complete
- Check for ~$ temporary files

### Permission Denied

- Run as administrator if needed
- Check file permissions in Google Drive
