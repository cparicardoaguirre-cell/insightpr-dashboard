---
description: Update Financial Dashboards for NLTS-PR and Reyes Contractor
---
This workflow updates the financial data for the dashboards by extracting the latest information from the Excel files in the project directories.

1. **Update NLTS-PR Data**
   Navigate to the NLTS dashboard scripts directory and run the extraction script.
   ```bash
   cd "D:\Antigravity Workspace\nlts-dashboard\scripts"
   python extract_financial_statements.py
   ```

2. **Update Reyes Contractor Data**
   Navigate to the Reyes dashboard scripts directory and run the extraction script.
   ```bash
   cd "D:\Antigravity Workspace\reyes-dashboard\scripts"
   python extract_financial_statements.py
   ```

3. **Verify Dashboards**
   Open the dashboards to ensure data is populated correctly.
   - NLTS-PR: http://localhost:5174
   - Reyes Contractor: http://localhost:5175
