#!/usr/bin/env python3
"""
Scan NLTS-PR compliance documents and generate JSON for production deployment.
Uses intelligent versioning and recency scoring to identify the most recent documents.
"""

import os
import json
import re
import subprocess
from datetime import datetime
from pathlib import Path

NLTS_PR_DIR = r"D:\NLTS-PR"
OUTPUT_PATH = r"c:\Users\cpari\.gemini\antigravity\NLT_PR_Dashboard\public\data\compliance_docs.json"

# Document type patterns (same as in server/index.js)
DOCUMENT_PATTERNS = {
    'Financial Statements': [
        'financial statement',
        'estado financiero',
        'balance sheet', 
        'income statement', 
        'statement of cash flows', 
        'estado de situacion', 
        'nlts-pr fs',
        'financial report',
        'estados financieros',
        'audited fs',
        'audited financial'
    ],
    'Tax Returns': ['form 1120', 'form 480', 'contribucion sobre ingresos', 'hacienda', 'corporate income', 'income tax return', 
                   'retorno', 'pr expenses', '480.6', '480.30', 'expenses.pdf', '2024 expenses', 'tax return', 'pr 2024', 
                   'gastos corporativos', 'declaracion', 'suri', 'income tax', 'national lift'],
    'Municipal Taxes': ['planilla municipal', 'patente municipal', 'patente', 'municipal tax', 'impuesto municipal', 'arbitrio', 'volumen de negocios'],
    'Property Tax (CRIM)': ['planilla inmueble', 'crim', 'contribucion sobre propiedad', 'property tax', 'impuesto sobre propiedad', 'contribucion inmueble', 'bienes inmuebles'],
    'Sales Tax Reports': ['iva', 'impuesto sobre ventas', 'sales and use tax', 'form 480.7'],
    'Payroll Reports': ['form 499r', 'wage report', 'w-2', 'informe de salarios'],
    'Depreciation Schedule': ['depreciation', 'depreciacion', 'schedule e', 'anejo e', 'nlts-pr depreciation schedule'],
    'Audit Reports': ['independent auditor', 'audit report', 'opinion letter'],
    'Insurance Certificates': ['certificate of insurance', 'liability coverage', 'workers comp'],
    'Business Licenses': ['patente', 'registro de comerciante', 'business license'],
    'Engagement Letter': ['engagement letter', 'carta de compromiso', 'carta compromiso', 'engagement agreement', 'we are pleased to confirm our understanding'],
    'Representation Letter': ['representation letter', 'carta de representacion', 'management representation', 'carta representacion', 'we confirm to the best of our knowledge']
}

VALID_EXTENSIONS = ['.pdf', '.gsheet', '.xls', '.xlsx', '.xlsm']


def extract_pdf_content(filepath):
    """Extract text from first page of PDF using pdftotext."""
    try:
        result = subprocess.run(
            ['pdftotext', '-f', '1', '-l', '1', filepath, '-'],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.stdout.lower()[:2000]
    except Exception:
        return Path(filepath).name.lower()


def extract_version_number(filename):
    """Extract version number from filename suffix (e.g., '-1', '-2', 'Rev156-3')."""
    # Pattern 1: Simple suffix like "-1.pdf", "-2.pdf"
    match = re.search(r'-(\d+)\.[a-zA-Z]+$', filename)
    if match:
        return int(match.group(1))
    
    # Pattern 2: Revision pattern like "Rev156-3" (extract the last number)
    match = re.search(r'Rev\d*-(\d+)', filename, re.IGNORECASE)
    if match:
        return int(match.group(1))
    
    # Pattern 3: Just Rev number
    match = re.search(r'Rev(\d+)', filename, re.IGNORECASE)
    if match:
        return int(match.group(1))
    
    return 0


def extract_document_period_date(filename, content):
    """Extract document period date from filename or content."""
    search_text = filename + ' ' + content
    
    # Pattern 1: MM DD YYYY (space separated)
    match = re.search(r'(\d{1,2})\s+(\d{1,2})\s+(20\d{2})', search_text)
    if match:
        month, day, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
        try:
            return datetime(year, month, day)
        except ValueError:
            pass
    
    # Pattern 2: MM-DD-YYYY or MM/DD/YYYY
    match = re.search(r'(\d{1,2})[-/](\d{1,2})[-/](20\d{2})', search_text)
    if match:
        month, day, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
        try:
            return datetime(year, month, day)
        except ValueError:
            pass
    
    # Pattern 3: YYYY-MM-DD
    match = re.search(r'(20\d{2})[-/](\d{1,2})[-/](\d{1,2})', search_text)
    if match:
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        try:
            return datetime(year, month, day)
        except ValueError:
            pass
    
    # Pattern 4: Just the year
    match = re.search(r'\b(20\d{2})\b', search_text)
    if match:
        return datetime(int(match.group(1)), 12, 31)
    
    return None


def identify_document_type(content, filename, filepath):
    """Identify document type based on content and filename."""
    search_text = (content + ' ' + filename.lower()).lower()
    
    for doc_type, patterns in DOCUMENT_PATTERNS.items():
        for pattern in patterns:
            if pattern.lower() in search_text:
                return doc_type
    
    # Special case: Planillas folder -> Tax Returns
    if 'planillas' in filepath.lower():
        return 'Tax Returns'
    
    return 'Other Document'


def calculate_recency_score(doc):
    """Calculate composite recency score for intelligent sorting."""
    score = 0
    
    # 1. Document period date (weight: 1,000,000)
    if doc.get('documentPeriodDate'):
        period_date = datetime.fromisoformat(doc['documentPeriodDate'].replace('Z', '+00:00'))
        score += period_date.timestamp() / 1000
    
    # 2. Version number (weight: 10,000)
    score += (doc.get('versionNumber', 0)) * 10000
    
    # 3. File modification time (weight: 1)
    if doc.get('modifiedAt'):
        modified_date = datetime.fromisoformat(doc['modifiedAt'].replace('Z', '+00:00'))
        score += modified_date.timestamp() / 1000000
    
    return score


def scan_documents():
    """Scan NLTS-PR directory and generate compliance documents JSON."""
    documents = []
    
    for root, dirs, files in os.walk(NLTS_PR_DIR):
        for filename in files:
            ext = os.path.splitext(filename)[1].lower()
            if ext not in VALID_EXTENSIONS:
                continue
            
            filepath = os.path.join(root, filename)
            stats = os.stat(filepath)
            
            # Extract content for classification
            if ext == '.pdf':
                content = extract_pdf_content(filepath)
            else:
                content = filename.lower()
            
            doc_type = identify_document_type(content, filename, filepath)
            period_date = extract_document_period_date(filename, content)
            version_number = extract_version_number(filename)
            
            # Format dates
            modified_at = datetime.fromtimestamp(stats.st_mtime)
            created_at = datetime.fromtimestamp(stats.st_ctime)
            
            doc = {
                'filename': filename,
                'path': filepath,
                'documentType': doc_type,
                'modifiedAt': modified_at.isoformat() + 'Z',
                'createdAt': created_at.isoformat() + 'Z',
                'size': stats.st_size,
                'versionNumber': version_number,
                'documentPeriodDate': period_date.isoformat() + 'Z' if period_date else None,
                'documentPeriodFormatted': period_date.strftime('%B %d, %Y') if period_date else 'Unknown period',
                'lastModifiedFormatted': modified_at.strftime('%b %d, %Y, %I:%M %p')
            }
            
            doc['recencyScore'] = calculate_recency_score(doc)
            documents.append(doc)
    
    # Group by document type
    grouped = {}
    for doc in documents:
        doc_type = doc['documentType']
        if doc_type not in grouped:
            grouped[doc_type] = []
        grouped[doc_type].append(doc)
    
    # Sort each group by recency score (highest first)
    for doc_type in grouped:
        grouped[doc_type].sort(key=lambda x: x['recencyScore'], reverse=True)
        
        # Log top document for each category
        if grouped[doc_type]:
            top = grouped[doc_type][0]
            print(f"[{doc_type}] Top: {top['filename']} (v{top['versionNumber']}, {top['documentPeriodFormatted']}, score={top['recencyScore']:.0f})")
    
    result = {
        'success': True,
        'directory': NLTS_PR_DIR,
        'totalFiles': len(documents),
        'documentTypes': list(DOCUMENT_PATTERNS.keys()),
        'documents': grouped,
        'generatedAt': datetime.now().isoformat() + 'Z'
    }
    
    return result


def main():
    print("Scanning compliance documents...")
    result = scan_documents()
    
    print(f"\nTotal files scanned: {result['totalFiles']}")
    print(f"Document types found: {list(result['documents'].keys())}")
    
    # Write to output file
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"\nOutput written to: {OUTPUT_PATH}")
    
    # Highlight Financial Statements
    if 'Financial Statements' in result['documents']:
        fs_docs = result['documents']['Financial Statements']
        print(f"\n=== FINANCIAL STATEMENTS ({len(fs_docs)} found) ===")
        for i, doc in enumerate(fs_docs[:5]):  # Show top 5
            print(f"  {i+1}. {doc['filename']}")
            print(f"     Period: {doc['documentPeriodFormatted']}, Version: {doc['versionNumber']}")
            print(f"     Modified: {doc['lastModifiedFormatted']}")


if __name__ == '__main__':
    main()
