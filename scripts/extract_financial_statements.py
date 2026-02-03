import openpyxl
import json
import os

# Configuration
SOURCE_FILE = r"D:\NLTS-PR\NLTS-PR FS 12 31 2024 Rev156-3.xlsm"
OUTPUT_FILE = r"src\data\financial_statements.json"

def extract_financials():
    if not os.path.exists(SOURCE_FILE):
        print(f"Error: Source file not found at {SOURCE_FILE}")
        return

    print(f"Loading workbook: {SOURCE_FILE}")
    try:
        wb = openpyxl.load_workbook(SOURCE_FILE, data_only=True)
    except Exception as e:
        print(f"Error loading workbook: {e}")
        return

    financials = {
        "BS": [],
        "IS": []
    }

    # Extract Balance Sheet (BS)
    if "BS" in wb.sheetnames:
        print("Processing Balance Sheet (BS)...")
        ws = wb["BS"]
        current_section = "Assets" # Default start
        
        for row in ws.iter_rows(min_row=5, values_only=True): 
            desc = row[0] # Column A
            val_2024 = row[2] # Column C
            val_2023 = row[4] # Column E
            
            if not desc:
                continue

            desc_str = str(desc).strip()
            
            # Detect Sections (Heuristic)
            if desc_str.upper() in ["ASSETS", "LIABILITIES", "STOCKHOLDERS' EQUITY", "LIABILITIES AND STOCKHOLDERS' EQUITY"]:
                current_section = desc_str
                continue
            
            # Skip headers/empty rows
            if val_2024 is None and val_2023 is None:
                continue

            # Clean values
            def clean_val(v):
                if isinstance(v, (int, float)):
                    return round(v)
                return 0

            item = {
                "name": desc_str,
                "2024": clean_val(val_2024),
                "2023": clean_val(val_2023),
                "section": current_section
            }
            
            # Filter out zero rows unless meaningful? 
            # For now, keep if at least one year has data or it looks important
            if item["2024"] != 0 or item["2023"] != 0:
                financials["BS"].append(item)

    # Extract Income Statement (IS)
    if "IS" in wb.sheetnames:
        print("Processing Income Statement (IS)...")
        ws = wb["IS"]
        current_section = "Income"
        
        for row in ws.iter_rows(min_row=5, values_only=True):
            desc = row[0] 
            val_2024 = row[2]
            val_2023 = row[4]

            if not desc:
                continue

            desc_str = str(desc).strip()

            if desc_str.upper() in ["REVENUE", "OPERATING EXPENSES", "OTHER INCOME", "INCOME TAX PROVISION"]:
                current_section = desc_str
                continue

            if val_2024 is None and val_2023 is None:
                continue

            def clean_val(v):
                if isinstance(v, (int, float)):
                    return round(v)
                return 0

            item = {
                "name": desc_str,
                "2024": clean_val(val_2024),
                "2023": clean_val(val_2023),
                "section": current_section
            }

            if item["2024"] != 0 or item["2023"] != 0:
                financials["IS"].append(item)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, "w", encoding='utf-8') as f:
        json.dump(financials, f, indent=2)
    
    print(f"Extraction complete. Saved to {OUTPUT_FILE}")
    print(f"BS Items: {len(financials['BS'])}")
    print(f"IS Items: {len(financials['IS'])}")

if __name__ == "__main__":
    extract_financials()
