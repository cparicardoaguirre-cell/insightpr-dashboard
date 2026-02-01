"""Debug script that simulates exactly the extraction logic"""
import warnings
warnings.filterwarnings('ignore')

import openpyxl

filepath = r'D:\NLTS-PR\NLTS-PR FS 12 31 2024 Rev156-3.xlsm'
wb = openpyxl.load_workbook(filepath, data_only=True, read_only=True)
ws = wb['Ratios']

structured_ratios = {'leadingIndicators': []}
current_category = None
extracted_count = 0

for i, row in enumerate(ws.iter_rows(min_row=1, max_row=140, min_col=1, max_col=7), start=1):
    vals = [cell.value for cell in row]
    col_a, col_b, col_c, col_d, col_e = vals[0], vals[1], vals[2], vals[3], vals[4]
    
    # Check for header
    is_header_row = isinstance(col_a, str) and len(col_a) > 5 and col_a.upper() == col_a
    if is_header_row:
        for val in [col_a, col_b]:
            if isinstance(val, str):
                upper = val.upper()
                if 'LEADING' in upper or 'FINANCIAL INDICATOR' in upper:
                    current_category = 'leadingIndicators'
                    print(f"Row {i}: Set category to leadingIndicators")
                    break
    
    if current_category != 'leadingIndicators':
        continue
    
    # Check if is a ratio row (numeric index)
    is_ratio_row = isinstance(col_a, (int, float)) and col_a > 0 and col_a <= 30
    
    # Check for leading indicators
    is_leading_indicator = False
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
    
    if current_category == 'leadingIndicators':
        if isinstance(col_b, str) and len(col_b.strip()) > 3:
            check_str = col_b.lower().strip()
            has_value = isinstance(col_d, (int, float)) and col_d != 0
            is_formula_row = '=' in col_b
            
            if has_value and not is_formula_row:
                for keyword in leading_indicator_keywords:
                    if keyword in check_str:
                        is_leading_indicator = True
                        break
                
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
    
    if not (is_ratio_row or is_leading_indicator):
        continue
    
    # Extract name
    ratio_name = None
    
    if is_leading_indicator and isinstance(col_a, str) and len(col_a) > 3:
        check_lower = col_a.lower()
        for keyword in leading_indicator_keywords:
            if keyword in check_lower:
                ratio_name = col_a.strip()
                break
    
    if not ratio_name and isinstance(col_b, str) and len(col_b) > 3:
        if '=' in col_b:
            ratio_name = col_b.split('=')[0].strip()
        else:
            ratio_name = col_b.strip()
    
    if not ratio_name and is_leading_indicator and isinstance(col_a, str) and len(col_a.strip()) > 3:
        if '=' not in col_a:
            ratio_name = col_a.strip()
    
    if not ratio_name:
        print(f"Row {i}: No name extracted, skipping")
        continue
    
    # Get numeric value
    current_val = None
    
    if isinstance(col_d, (int, float)) and col_d != 0:
        current_val = col_d
    elif is_leading_indicator and isinstance(col_c, (int, float)) and col_c != 0:
        current_val = col_c
    
    if current_val is None:
        print(f"Row {i}: No value in col_d or col_c, skipping (name: {ratio_name})")
        continue
    
    extracted_count += 1
    print(f"Row {i}: EXTRACTED -> {ratio_name} = {current_val}")
    structured_ratios['leadingIndicators'].append({
        'name': ratio_name,
        'current': round(current_val, 4)
    })

print(f"\nTotal extracted: {extracted_count}")
print(f"Final leadingIndicators count: {len(structured_ratios['leadingIndicators'])}")
wb.close()
