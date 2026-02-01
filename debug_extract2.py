"""Debug script to check leading indicators extraction - with verbose logging"""
import warnings
warnings.filterwarnings('ignore')

import openpyxl

filepath = r'D:\NLTS-PR\NLTS-PR FS 12 31 2024 Rev156-3.xlsm'
wb = openpyxl.load_workbook(filepath, data_only=True, read_only=True)
ws = wb['Ratios']

leading_indicator_keywords = [
    'variable cost % of sales',
    'contribution margin',
    'break-even as % of net sales',
    '% break-even sales',
    'sustainable growth - current',
    'sustainable growth - no new debt',
    'z-score',
    'retained earnings to total assets',
    'working capital to total assets',
    'ebitda'
]

current_category = None
count = 0

for i, row in enumerate(ws.iter_rows(min_row=1, max_row=140, min_col=1, max_col=7), start=1):
    vals = [cell.value for cell in row]
    col_a, col_b, col_c, col_d, col_e = vals[0], vals[1], vals[2], vals[3], vals[4]
    
    # Check for header
    for val in [col_a, col_b]:
        if isinstance(val, str) and 'LEADING' in val.upper():
            current_category = 'leadingIndicators'
            print(f"Row {i}: Found LEADING header")
            break
    
    if current_category != 'leadingIndicators':
        continue
    
    # Check for leading indicator
    is_leading_indicator = False
    
    if isinstance(col_b, str) and len(col_b.strip()) > 3:
        check_str = col_b.lower().strip()
        has_value = isinstance(col_d, (int, float)) and col_d != 0
        is_formula_row = '=' in col_b
        
        if has_value and not is_formula_row:
            # Check against keywords
            for keyword in leading_indicator_keywords:
                if keyword in check_str:
                    is_leading_indicator = True
                    count += 1
                    print(f"Row {i}: MATCH [{keyword}] -> {col_b[:60]} = {col_d}")
                    break
            
            # Fallback patterns
            if not is_leading_indicator:
                if ('variable cost' in check_str and 'sales' in check_str) or \
                   ('contribution margin' in check_str) or \
                   ('break-even' in check_str or 'break even' in check_str) or \
                   ('sustainable growth' in check_str) or \
                   ('z-score' in check_str or 'bankruptcy' in check_str) or \
                   ('retained earnings' in check_str and 'total assets' in check_str) or \
                   ('working capital' in check_str and 'total assets' in check_str) or \
                   (check_str == 'ebitda'):
                    is_leading_indicator = True
                    count += 1
                    print(f"Row {i}: FALLBACK MATCH -> {col_b[:60]} = {col_d}")

print(f"\nTotal matches: {count}")
wb.close()
