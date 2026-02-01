"""Debug script to check leading indicators extraction"""
import warnings
warnings.filterwarnings('ignore')

import sys
sys.path.insert(0, 'server')

from extract_dynamic_ratios import extract_ratios_from_excel, find_latest_fs_file

filepath, file_date = find_latest_fs_file()
print(f"Using file: {filepath}")

result = extract_ratios_from_excel(filepath, file_date)
if result:
    print('leadingIndicators count:', len(result.get('leadingIndicators', [])))
    for r in result.get('leadingIndicators', []):
        print(f"  - {r['name']}: {r['current']}")
else:
    print("No result returned")
