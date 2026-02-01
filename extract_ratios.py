import json
import openpyxl

# Load extracted data
with open(r'D:\NLTS-PR\extracted_ratios.json', 'r') as f:
    data = json.load(f)

# Define the structure to hold ratios
structured_ratios = {
    'company': 'National Lift Truck Service of PR, Inc.',
    'asOf': 'December 31, 2024',
    'solvencyRatios': [],
    'safetyRatios': [],
    'profitabilityRatios': [],
    'assetManagementRatios': []
}

current_category = 'solvencyRatios'

for item in data:
    d = item['data']
    c1 = d.get('C1', '')
    c2 = d.get('C2', '')
    c4 = d.get('C4', '')
    c5 = d.get('C5', '')
    
    # Detect category
    if isinstance(c1, str):
        if 'SOLVENCY' in c1.upper():
            current_category = 'solvencyRatios'
            continue
        elif 'SAFETY' in c1.upper():
            current_category = 'safetyRatios'
            continue
        elif 'PROFIT' in c1.upper():
            current_category = 'profitabilityRatios'
            continue
        elif 'ASSET MANAGEMENT' in c1.upper():
            current_category = 'assetManagementRatios'
            continue
    
    # Get ratio name
    ratio_name = None
    if isinstance(c2, str) and '=' in c2:
        ratio_name = c2.split('=')[0].strip()
    
    # Only include if it's a calculated ratio (small decimal or reasonable value)
    if ratio_name and isinstance(c4, (int, float)):
        # Check if this might be the ratio value (not raw amounts)
        is_ratio = abs(c4) < 100 and c4 != 0
        
        if is_ratio and len(ratio_name) > 3:
            prior = round(c5, 4) if isinstance(c5, (int, float)) else 'N/A'
            entry = {
                'name': ratio_name,
                'current': round(c4, 4),
                'prior': prior
            }
            structured_ratios[current_category].append(entry)

# Remove duplicates by name within each category
for cat in ['solvencyRatios', 'safetyRatios', 'profitabilityRatios', 'assetManagementRatios']:
    seen = set()
    unique_list = []
    for r in structured_ratios[cat]:
        if r['name'] not in seen:
            seen.add(r['name'])
            unique_list.append(r)
    structured_ratios[cat] = unique_list

# Print summary
print("=== NLTS-PR Financial Ratios ===")
for cat, ratios in structured_ratios.items():
    if isinstance(ratios, list) and ratios:
        print(f"\n{cat}:")
        for r in ratios:
            print(f"  {r['name']}: {r['current']} (prior: {r['prior']})")

# Save to JSON
with open(r'D:\NLTS-PR\structured_ratios.json', 'w') as f:
    json.dump(structured_ratios, f, indent=2)
print("\nSaved to structured_ratios.json")
