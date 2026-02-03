import openpyxl
import json
import os
import shutil
import glob
import re
import warnings

# Suppress warnings
warnings.filterwarnings("ignore", category=UserWarning)

SOURCE_DIR = r"D:\NLTS-PR"
OUTPUT_JSON = r"src/data/financial_statements.json"
PUBLIC_DOCS_DIR = r"public/documents"

def find_latest_files():
    # Find all Excel files matching pattern
    excel_pattern = os.path.join(SOURCE_DIR, "NLTS-PR FS*.xlsm")
    excel_files = glob.glob(excel_pattern)
    
    if not excel_files:
        print("No Excel files found.")
        return None, None

    # Sort by revision number (e.g., Rev156-3)
    def parse_revision(fname):
        match = re.search(r"Rev(\d+)-(\d+)", fname)
        if match:
            return int(match.group(1)) * 1000 + int(match.group(2))
        return 0

    latest_excel = max(excel_files, key=parse_revision)
    print(f"Latest Excel found: {latest_excel}")

    # Find matching PDF (Look in subfolders too)
    # Strategy: Look for strict name match first, then same revision
    base_name = os.path.splitext(os.path.basename(latest_excel))[0]
    
    # 1. Look for exact PDF name in ROOT
    pdf_candidates = glob.glob(os.path.join(SOURCE_DIR, f"{base_name}.pdf"))
    
    # 2. Look for exact PDF name in 2024 subfolder
    if not pdf_candidates:
        pdf_candidates = glob.glob(os.path.join(SOURCE_DIR, "**", f"{base_name}.pdf"), recursive=True)
    
    latest_pdf = pdf_candidates[0] if pdf_candidates else None
    
    if latest_pdf:
        print(f"Matching PDF found: {latest_pdf}")
    else:
        print("No matching PDF found.")

    return latest_excel, latest_pdf

def extract_financials():
    latest_excel, latest_pdf = find_latest_files()
    
    if not latest_excel:
        return

    # Create public docs dir
    if not os.path.exists(PUBLIC_DOCS_DIR):
        os.makedirs(PUBLIC_DOCS_DIR)

    # Copy files to public
    print(f"Copying {latest_excel} to public...")
    shutil.copy2(latest_excel, os.path.join(PUBLIC_DOCS_DIR, "latest_source.xlsm"))
    if latest_pdf:
        print(f"Copying {latest_pdf} to public...")
        shutil.copy2(latest_pdf, os.path.join(PUBLIC_DOCS_DIR, "audited_financials.pdf"))

    print(f"Loading workbook: {latest_excel}")
    try:
        wb = openpyxl.load_workbook(latest_excel, data_only=True)
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
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    # Save
    if not os.path.exists(os.path.dirname(OUTPUT_JSON)):
        os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
        
    with open(OUTPUT_JSON, "w") as f:
        json.dump(financials, f, indent=2)
    
    print(f"Extraction complete. Saved to {OUTPUT_JSON}")
    print(f"BS Items: {len(financials['BS'])}")
    print(f"IS Items: {len(financials['IS'])}")

if __name__ == "__main__":
    extract_financials()
