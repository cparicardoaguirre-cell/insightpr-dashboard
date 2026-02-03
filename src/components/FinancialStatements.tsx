import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import financialsData from '../data/financial_statements.json';
import { FileText, Download, TrendingUp, DollarSign, FileSpreadsheet, Calculator } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for classes
// Build version: 2026.02.03.v4 - Refactored to CSS classes
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
    const BUILD_VERSION = '2026.02.03.v4'; // Force rebuild - CSS classes
    console.log('FinancialStatements build:', BUILD_VERSION);
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>('BS');
    const [showEducation, setShowEducation] = useState(true);

    // Cast JSON data
    const data = financialsData as FinancialData;

    // Helper: Dynamic Value Formatting based on Excel Format
    const formatValue = (val: number | string, fmt?: string) => {
        if (val === null || val === undefined || val === '') return '';

        const cleanFmt = fmt?.trim().toLowerCase();

        // Explicit "General" format from Excel OR Text format (@) -> Return raw value
        if (cleanFmt === 'general' || cleanFmt === '@' || cleanFmt === 'text') {
            return val.toString();
        }

        if (typeof val === 'string' && isNaN(Number(val))) return val;

        const numVal = Number(val);

        // Detect Percentages
        if (fmt?.includes('%') || fmt?.includes('P')) {
            return new Intl.NumberFormat(language === 'es' ? 'es-PR' : 'en-US', {
                style: 'percent',
                minimumFractionDigits: 5,
                maximumFractionDigits: 5
            }).format(numVal);
        }

        // Detect explicit Currency
        const isExplicitCurrency = fmt?.includes('$') || fmt?.includes('USD');
        const isExplicitNumber = fmt && (fmt.includes('#') || fmt.includes('0')) && !isExplicitCurrency;

        if (isExplicitNumber) {
            return new Intl.NumberFormat(language === 'es' ? 'es-PR' : 'en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numVal);
        }

        if (!fmt) {
            return val.toString();
        }

        // Default to Currency USD
        return new Intl.NumberFormat(language === 'es' ? 'es-PR' : 'en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(numVal);
    };

    // Render Standard Financial Table (BS, IS, CF) using CSS classes
    const renderStandardTable = (items: LineItem[]) => {
        const groupedItems: Record<string, LineItem[]> = {};
        items.forEach(item => {
            if (item.row_hidden) return;
            if (!groupedItems[item.section]) groupedItems[item.section] = [];
            groupedItems[item.section].push(item);
        });

        return (
            <div className="fs-table-container">
                <table className="fs-table">
                    <thead className="fs-thead">
                        <tr>
                            <th className="fs-th fs-th--left">{t('statements.lineItem')}</th>
                            <th className="fs-th fs-th--right">{t('statements.2024')}</th>
                            <th className="fs-th fs-th--right">{t('statements.2023')}</th>
                            <th className="fs-th fs-th--center">{t('statements.trend')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedItems).map(([section, sectionItems]) => (
                            <>
                                {/* Section Header */}
                                {section !== 'General' && (
                                    <tr key={`section-${section}`} className="fs-section-row">
                                        <td colSpan={4} className="fs-section-cell">
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

                                    if (isPadding) {
                                        return (
                                            <tr key={`${section}-${idx}`} className="fs-row--padding">
                                                <td colSpan={4} className="fs-td"></td>
                                            </tr>
                                        );
                                    }

                                    const rowClass = cn(
                                        'fs-row',
                                        isTotal ? 'fs-row--total' : (idx % 2 === 0 ? 'fs-row--even' : 'fs-row--odd')
                                    );

                                    return (
                                        <tr key={`${section}-${idx}`} className={rowClass}>
                                            <td
                                                className={cn('fs-td', isTotal ? 'fs-td--name-total' : 'fs-td--name')}
                                                style={{ paddingLeft: `${16 + (item.indent || 0) * 24}px` }}
                                            >
                                                {item.name}
                                                {showEducation && taxMapping && !isTotal && (
                                                    <span className="fs-tax-ref">
                                                        📋 {TAX_MAP[taxMapping]}
                                                    </span>
                                                )}
                                            </td>
                                            <td className={cn('fs-td fs-td--amount', isTotal && 'fs-td--amount-total')}>
                                                {formatValue(item['2024'], item.format)}
                                            </td>
                                            <td className="fs-td fs-td--prior">
                                                {formatValue(item['2023'], item.format)}
                                            </td>
                                            <td className="fs-td fs-td--trend">
                                                {variance > 0 ? (
                                                    <span className="fs-variance fs-variance--positive">
                                                        +{variance.toFixed(1)}%
                                                    </span>
                                                ) : variance < 0 ? (
                                                    <span className="fs-variance fs-variance--negative">
                                                        {variance.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="fs-variance--neutral">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Render Raw Data Grid (Leadsheets) using CSS classes
    const renderGrid = (rows: CellData[][]) => {
        let percentColIdx = -1;
        for (let r = 0; r < Math.min(rows.length, 10); r++) {
            const row = rows[r];
            row.forEach((cell, idx) => {
                const valStr = String(cell.v).toLowerCase();
                if (valStr.includes('%') || (valStr.includes('change') && !valStr.includes('change in'))) {
                    percentColIdx = idx;
                }
            });
            if (percentColIdx !== -1) break;
        }

        return (
            <div className="fs-grid-container">
                <table className="fs-grid">
                    <tbody>
                        {rows.map((row, rIdx) => {
                            const isHeader = rIdx < 5;
                            const rowClass = isHeader
                                ? 'fs-grid-row--header'
                                : (rIdx % 2 === 0 ? 'fs-grid-row--even' : 'fs-grid-row--odd');

                            return (
                                <tr key={rIdx} className={rowClass}>
                                    {row.map((cell, cIdx) => {
                                        let formattedVal = formatValue(cell.v, cell.f);

                                        const isLikelyPercentCol = cIdx === percentColIdx;

                                        if (isLikelyPercentCol && typeof cell.v === 'number' && Math.abs(cell.v) < 100) {
                                            formattedVal = new Intl.NumberFormat(language === 'es' ? 'es-PR' : 'en-US', {
                                                style: 'percent',
                                                minimumFractionDigits: 5,
                                                maximumFractionDigits: 5
                                            }).format(cell.v);
                                        }

                                        const isNumeric = typeof cell.v === 'number' ||
                                            (typeof cell.v === 'string' && !isNaN(Number(cell.v.replace(/[,$%]/g, ''))));

                                        const cellClasses = cn(
                                            'fs-grid-cell',
                                            isHeader ? 'fs-grid-cell--header' : 'fs-grid-cell--data',
                                            (isNumeric || cIdx > 0) ? 'fs-grid-cell--right' : 'fs-grid-cell--left'
                                        );

                                        return (
                                            <td key={`${rIdx}-${cIdx}`} className={cellClasses}>
                                                {formattedVal}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // Render PDF Viewer using CSS classes
    const renderPdfViewer = () => (
        <div className="pdf-viewer-container">
            {/* Header Bar */}
            <div className="pdf-viewer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="pdf-viewer-icon-wrapper">
                        <FileText className="pdf-viewer-icon" />
                    </div>
                    <div>
                        <h3 className="pdf-viewer-title">
                            {language === 'es' ? 'Estados Financieros Auditados 2024' : 'Audited Financial Statements 2024'}
                        </h3>
                        <p className="pdf-viewer-subtitle">
                            {language === 'es' ? 'Incluye Opinión del Auditor y Notas' : 'Includes Auditor Opinion & Notes'} • {data.Metadata?.SourceFile}
                        </p>
                    </div>
                </div>
                <a href="/documents/audited_financials.pdf" download className="pdf-download-btn">
                    <Download style={{ width: '16px', height: '16px' }} />
                    {t('download_pdf')}
                </a>
            </div>
            {/* PDF Embed */}
            <div className="pdf-embed-container">
                <embed
                    src="/documents/audited_financials.pdf#toolbar=1&navpanes=1&scrollbar=1&view=FitH"
                    type="application/pdf"
                    className="pdf-embed"
                />
            </div>
            {/* Fallback message */}
            <noscript>
                <div className="pdf-fallback">
                    <p>Your browser does not support embedded PDFs.</p>
                    <a href="/documents/audited_financials.pdf">Click here to download the PDF</a>
                </div>
            </noscript>
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
