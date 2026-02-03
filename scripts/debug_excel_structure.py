import openpyxl

SOURCE_FILE = r"D:\NLTS-PR\NLTS-PR FS 12 31 2024 Rev156-3.xlsm"

def inspect_structure():
    wb = openpyxl.load_workbook(SOURCE_FILE, data_only=True)
    
    for sheet_name in ["BS", "IS"]:
        if sheet_name in wb.sheetnames:
            print(f"\n--- {sheet_name} First 10 Rows ---")
            ws = wb[sheet_name]
            rows = list(ws.iter_rows(values_only=True, max_row=10))
            for i, row in enumerate(rows):
                # Print index and first 5 columns
                print(f"Row {i+1}: {row[:6]}")
        else:
            print(f"Sheet {sheet_name} not found")

if __name__ == "__main__":
    inspect_structure()
