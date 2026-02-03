import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import financialsData from '../data/financial_statements.json';
import { FileText, Download, TrendingUp, DollarSign, FileSpreadsheet, Calculator } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for classes
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Type Definitions
interface LineItem {
    name: string;
    2024: number;
    2023: number;
    section: string;
    row_hidden?: boolean;
    format?: string;
    indent?: number;
}

interface CellData {
    v: string | number;
    f?: string;
}

interface FinancialData {
    BS: LineItem[];
    IS: LineItem[];
    CF: LineItem[];
    TaxLead: CellData[][];
    Lead: CellData[][];
    Metadata: {
        SourceFile: string;
        PdfAvailable: boolean;
    }
}

// Educational Tooltips mapping (Simple fuzzy match map)
const TAX_MAP: Record<string, string> = {
    "Cash": "Sched L Part I Line 1",
    "Accounts Receivable": "Sched L Part I Line 2(a)",
    "Inventory": "Sched L Part I Line 3",
    "Prepaid Expenses": "Sched L Part I Line 4",
    "Gross Profit": "Page 2 Part II Line 3",
    "Operating Expenses": "Page 2 Part IV",
    "Net Income": "Page 2 Part II Line 5",
    "Retained Earnings": "Sched L Part III Line 23",
    "Property, Plant & Equipment": "Sched L Part I Line 9"
};

type TabType = 'BS' | 'IS' | 'CF' | 'Lead' | 'TaxLead' | 'Docs';

export default function FinancialStatements() {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>('BS');
    const [showEducation, setShowEducation] = useState(true);

    // Cast JSON data
    const data = financialsData as FinancialData;

    // Helper: Dynamic Value Formatting based on Excel Format
    const formatValue = (val: number | string, fmt?: string) => {
        // Handle zeros or nulls if needed, though data has 0
        if (val === null || val === undefined || val === '') return '';

        // If it's a string that shouldn't be parsed as a number (like "Total"), return it
        // Check if val is number-like but we want to treat it as string based on fmt?
        // Actually, if fmt is General, we just return string representation.

        const cleanFmt = fmt?.trim().toLowerCase();

        // Explicit "General" format from Excel OR Text format (@) -> Return raw value
        if (cleanFmt === 'general' || cleanFmt === '@' || cleanFmt === 'text') {
            return val.toString();
        }

        if (typeof val === 'string' && isNaN(Number(val))) return val;

        const numVal = Number(val);

        // Detect Percentages
        if (fmt?.includes('%') || fmt?.includes('P')) { // Check for P if used in extraction logic or just %
            return new Intl.NumberFormat(language === 'es' ? 'es-PR' : 'en-US', {
                style: 'percent',
                minimumFractionDigits: 5, // High precision as requested
                maximumFractionDigits: 5
            }).format(numVal);
        }

        // Detect explicit Currency
        const isExplicitCurrency = fmt?.includes('$') || fmt?.includes('USD');
        const isExplicitNumber = fmt && (fmt.includes('#') || fmt.includes('0')) && !isExplicitCurrency;

        if (isExplicitNumber) {
            return new Intl.NumberFormat(language === 'es' ? 'es-PR' : 'en-US', {
                style: 'decimal',
                minimumFractionDigits: 2, // Requests #,###.00
                maximumFractionDigits: 2
            }).format(numVal);
        }

        // If it looks like a number but no specific format, stick to default currency if it's in main tables, 
        // but for Grid we might want to be careful. 
        // IF fmt is undefined, let's just return string or minimal format.
        if (!fmt) {
            // For grids, if no format, try to keep as string or simple number
            return val.toString();
        }

        // Default to Currency USD (usually for BS/IS main cols with $)
        return new Intl.NumberFormat(language === 'es' ? 'es-PR' : 'en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(numVal);
    };

    // Render Standard Financial Table (BS, IS, CF) with High Fidelity
    const renderStandardTable = (items: LineItem[]) => {
        // ... (unchanged grouping logic)
        const groupedItems: Record<string, LineItem[]> = {};
        items.forEach(item => {
            if (item.row_hidden) return; // SKIP HIDDEN ROWS
            if (!groupedItems[item.section]) groupedItems[item.section] = [];
            groupedItems[item.section].push(item);
        });

        return (
            <div className="overflow-x-auto border border-gray-500 rounded-lg bg-white shadow-sm">
                <table className="w-full text-sm text-left border-collapse border border-gray-500">
                    <thead className="bg-gray-50 border-b border-gray-500">
                        <tr>
                            <th className="py-3 px-4 font-semibold text-gray-700 w-1/2 border border-gray-500">{t('statements.lineItem')}</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-right w-1/6 min-w-[120px] border border-gray-500">{t('statements.2024')}</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-right w-1/6 min-w-[120px] border border-gray-500">{t('statements.2023')}</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-center w-1/6 border border-gray-500">{t('statements.trend')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedItems).map(([section, sectionItems]) => (
                            <div key={section} className="contents">
                                {/* Section Header */}
                                {section !== 'General' && (
                                    <tr className="bg-gray-50/50">
                                        <td colSpan={4} className="py-2 px-4 font-bold text-xs uppercase tracking-wider text-gray-500 mt-4 border border-gray-500">
                                            {section}
                                        </td>
                                    </tr>
                                )}

                                {/* Items */}
                                {sectionItems.map((item, idx) => {
                                    const variance = item['2023'] !== 0
                                        ? ((item['2024'] - item['2023']) / Math.abs(item['2023'])) * 100
                                        : 0;

                                    const taxMapping = Object.keys(TAX_MAP).find(k => item.name.includes(k));
                                    const isTotal = item.name.toLowerCase().includes('total');
                                    const isPadding = !item.name;

                                    if (isPadding) return <tr key={`${section}-${idx}`} className="h-4"><td colSpan={4} className="border border-gray-500"></td></tr>;

                                    return (
                                        <tr
                                            key={`${section}-${idx}`}
                                            className={cn(
                                                "transition-colors group",
                                                isTotal ? "bg-gray-50 font-semibold" : "hover:bg-blue-50/10"
                                            )}
                                        >
                                            <td className="py-2 px-4 relative border border-gray-500">
                                                <div
                                                    className={cn("text-gray-800", isTotal ? "font-bold" : "font-normal")}
                                                    style={{ paddingLeft: `${(item.indent || 0) * 20}px` }}
                                                >
                                                    {item.name}
                                                    {showEducation && taxMapping && !isTotal && (
                                                        <div className="text-[10px] text-amber-600 mt-0.5 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                            <span>📋</span>
                                                            {TAX_MAP[taxMapping]}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={cn("py-2 px-4 text-right font-mono border border-gray-500", isTotal ? "text-black" : "text-gray-900")}>
                                                {formatValue(item['2024'], item.format)}
                                            </td>
                                            <td className="py-2 px-4 text-right font-mono text-gray-500 border border-gray-500">
                                                {formatValue(item['2023'], item.format)}
                                            </td>
                                            <td className="py-2 px-4 text-center border border-gray-500">
                                                {variance > 0 ? (
                                                    <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded-full inline-block min-w-[60px]">
                                                        +{variance.toFixed(1)}%
                                                    </span>
                                                ) : variance < 0 ? (
                                                    <span className="text-red-500 font-medium text-xs bg-red-50 px-2 py-0.5 rounded-full inline-block min-w-[60px]">
                                                        {variance.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </div>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Render Raw Data Grid (Leadsheets)
    const renderGrid = (rows: CellData[][]) => {
        // DETECT PERCENTAGE COLUMN
        // We scan the first 10 rows for a header containing "%" or "Change" to identify the percentage column.
        let percentColIdx = -1;
        for (let r = 0; r < Math.min(rows.length, 10); r++) {
            const row = rows[r];
            row.forEach((cell, idx) => {
                const valStr = String(cell.v).toLowerCase();
                // "change %" or just "%" or "var %"
                if (valStr.includes('%') || (valStr.includes('change') && !valStr.includes('change in'))) {
                    percentColIdx = idx;
                }
            });
            if (percentColIdx !== -1) break;
        }

        return (
            <div className="w-full overflow-x-auto border border-gray-500 bg-white shadow-sm">
                {/* Ensure border-collapse is strictly applied for visible gridlines */}
                <table className="w-full text-sm text-left font-mono whitespace-nowrap border-collapse border border-gray-500">
                    <tbody>
                        {rows.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx < 5 ? 'bg-gray-100 font-bold' : 'hover:bg-blue-50/10'}>
                                {row.map((cell, cIdx) => {
                                    let formattedVal = formatValue(cell.v, cell.f);

                                    // OVERRIDE FOR PERCENTAGE COLUMN
                                    // If we detected a % column, OR if the value is a small float (abs < 2) and header detection failed but it looks like a rate
                                    // Be careful with small float heuristic, so relied on column index mostly.
                                    // Adding a fallback: if Column 8 (index 8) is usually Change%, we can default to it if detection fails, 
                                    // but specifically extracting 5 decimals as requested: 0.00000%

                                    const isLikelyPercentCol = cIdx === percentColIdx;

                                    if (isLikelyPercentCol && typeof cell.v === 'number' && Math.abs(cell.v) < 100) {
                                        // Assume it's a rate (0.10 for 10%)
                                        formattedVal = new Intl.NumberFormat(language === 'es' ? 'es-PR' : 'en-US', {
                                            style: 'percent',
                                            minimumFractionDigits: 5,
                                            maximumFractionDigits: 5
                                        }).format(cell.v);
                                    }

                                    return (
                                        <td
                                            key={`${rIdx}-${cIdx}`}
                                            className="py-1 px-2 border border-gray-500 min-w-[100px] text-right"
                                        >
                                            {formattedVal}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Render PDF Viewer (High Fidelity "Image" / Iframe)
    const renderPdfViewer = () => (
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[800px] w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Audited Financial Statements 2024</h3>
                        <p className="text-xs text-gray-500">Official PDF • {data.Metadata?.SourceFile}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">

                    <a
                        href="/documents/audited_financials.pdf"
                        download
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition shadow-sm hover:shadow-md"
                    >
                        <Download className="w-4 h-4" />
                        {t('download_pdf')}
                    </a>
                </div>
            </div>
            {/* The closest we can get to "Presentation in Totality as Image" without rasterizing pages server-side is a full iframe embedding */}
            {/* Use object tag for better PDF embedding support with iframe fallback */}
            <object
                data="/documents/audited_financials.pdf#view=FitH&toolbar=1"
                type="application/pdf"
                className="w-full h-full bg-gray-100"
            >
                <iframe
                    src="/documents/audited_financials.pdf#view=FitH&toolbar=1"
                    className="w-full h-full bg-gray-100"
                    title="Audited Financial Statements"
                >
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
                        <p className="mb-4">Unable to display PDF directly.</p>
                        <a
                            href="/documents/audited_financials.pdf"
                            download
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Download PDF to view
                        </a>
                    </div>
                </iframe>
            </object>
        </div>
    );

    return (
        <div className="card animate-fade-in space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-6 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('statements.title')}</h2>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        {t('statements.subtitle')}
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Audited</span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* Main Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl flex-wrap">
                        <button
                            onClick={() => setActiveTab('BS')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'BS' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            )}
                        >
                            <TrendingUp className="w-4 h-4" />
                            {t('statements.bs')}
                        </button>
                        <button
                            onClick={() => setActiveTab('IS')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'IS' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            )}
                        >
                            <DollarSign className="w-4 h-4" />
                            {t('statements.is')}
                        </button>
                        <button
                            onClick={() => setActiveTab('CF')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'CF' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            )}
                        >
                            <TrendingUp className="w-4 h-4 rotate-90" />
                            {t('statements.cf')}
                        </button>
                    </div>

                    {/* Extended Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl flex-wrap">
                        <button
                            onClick={() => setActiveTab('Lead')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'Lead' ? 'bg-white text-purple-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            )}
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Lead
                        </button>
                        <button
                            onClick={() => setActiveTab('TaxLead')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'TaxLead' ? 'bg-white text-purple-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            )}
                        >
                            <Calculator className="w-4 h-4" />
                            Tax
                        </button>
                    </div>

                    {/* Docs Tab */}
                    {data.Metadata?.PdfAvailable && (
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('Docs')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                    activeTab === 'Docs' ? 'bg-white text-red-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                )}
                            >
                                <FileText className="w-4 h-4" />
                                {t('statements.docs')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Education Toggle (Only for standard tables) */}
            {['BS', 'IS', 'CF'].includes(activeTab) && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowEducation(!showEducation)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                            showEducation ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-gray-400 border-gray-200'
                        )}
                    >
                        <span>💡</span>
                        {t('statements.toggleEducation')}
                    </button>
                </div>
            )}

            {/* Content Render */}
            <div className="min-h-[600px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'BS' && renderStandardTable(data.BS)}
                {activeTab === 'IS' && renderStandardTable(data.IS)}
                {activeTab === 'CF' && renderStandardTable(data.CF)}
                {activeTab === 'Lead' && renderGrid(data.Lead)}
                {activeTab === 'TaxLead' && renderGrid(data.TaxLead)}
                {activeTab === 'Docs' && renderPdfViewer()}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-mono">
                <div>
                    {t('statements.auditLabel')}: <span className="font-medium text-gray-600">{data.Metadata?.SourceFile || 'N/A'}</span>
                </div>
                <div>
                    NLT-PR Internal Use Only • Confidential
                </div>
            </div>
        </div>
    );
}
