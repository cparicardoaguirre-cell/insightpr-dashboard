import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import financialsData from '../data/financial_statements.json';
import { FileText, Download, TrendingUp, DollarSign, FileSpreadsheet, Calculator } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for classes
// Build version: 2026.02.03.v5 - Added sectioned leadschedules
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
    v: string | number | boolean;
    f?: string;
}

interface LeadSection {
    name_en: string;
    name_es: string;
    icon: string;
    data: CellData[][];
}

interface FinancialData {
    BS: LineItem[];
    IS: LineItem[];
    CF: LineItem[];
    TaxLead?: CellData[][];
    Lead?: CellData[][];
    LeadSections?: Record<string, LeadSection>;
    TaxLeadSections?: Record<string, LeadSection>;
    Metadata: {
        SourceFile: string;
        PdfAvailable: boolean;
        Version?: string;
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
    const BUILD_VERSION = '2026.02.03.v5'; // Sectioned leadschedules
    console.log('FinancialStatements build:', BUILD_VERSION);
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>('BS');
    const [showEducation, setShowEducation] = useState(true);
    const [activeLeadSection, setActiveLeadSection] = useState<string>('all');
    const [activeTaxLeadSection, setActiveTaxLeadSection] = useState<string>('all');

    // Pagination state for grids
    const ROWS_PER_PAGE = 100;
    const [leadPage, setLeadPage] = useState(1);
    const [taxLeadPage, setTaxLeadPage] = useState(1);

    // Cast JSON data
    const data = financialsData as FinancialData;

    // Helper: Dynamic Value Formatting based on Excel Format
    const formatValue = (val: number | string | boolean, fmt?: string) => {
        if (val === null || val === undefined || val === '' || val === false) return '';
        if (val === true) return '✓';

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
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
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

    // Render Raw Data Grid (Leadsheets) with Pagination
    const renderGrid = (rows: CellData[][], currentPage: number, setPage: (page: number) => void) => {
        if (!rows || rows.length === 0) {
            return (
                <div className="text-center py-12 text-gray-500">
                    {language === 'es' ? 'No hay datos disponibles' : 'No data available'}
                </div>
            );
        }

        const totalRows = rows.length;
        const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
        const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
        const endIdx = Math.min(startIdx + ROWS_PER_PAGE, totalRows);
        const pageRows = rows.slice(startIdx, endIdx);

        // Pagination Controls Component
        const PaginationControls = () => {
            if (totalPages <= 1) return null;

            return (
                <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    {/* Previous Button */}
                    <button
                        onClick={() => setPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={cn(
                            "px-3 py-2 text-sm font-medium rounded-lg transition-all",
                            currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                        )}
                    >
                        ← {language === 'es' ? 'Anterior' : 'Previous'}
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                            // Show first, last, current, and neighbors
                            const showPage = pageNum === 1 ||
                                pageNum === totalPages ||
                                Math.abs(pageNum - currentPage) <= 1;

                            const showEllipsis = (pageNum === 2 && currentPage > 3) ||
                                (pageNum === totalPages - 1 && currentPage < totalPages - 2);

                            if (!showPage && !showEllipsis) return null;

                            if (showEllipsis && !showPage) {
                                return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={cn(
                                        "min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-all",
                                        currentPage === pageNum
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                                    )}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={cn(
                            "px-3 py-2 text-sm font-medium rounded-lg transition-all",
                            currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                        )}
                    >
                        {language === 'es' ? 'Siguiente' : 'Next'} →
                    </button>

                    {/* Page Info */}
                    <div className="ml-4 text-sm text-gray-500">
                        {language === 'es'
                            ? `Página ${currentPage} de ${totalPages} (${totalRows} filas)`
                            : `Page ${currentPage} of ${totalPages} (${totalRows} rows)`
                        }
                    </div>
                </div>
            );
        };

        return (
            <div className="fs-grid-container">
                {/* Top Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl border-b border-purple-100">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                {language === 'es' ? 'Mostrando filas' : 'Showing rows'} {startIdx + 1} - {endIdx} {language === 'es' ? 'de' : 'of'} {totalRows}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                {language === 'es' ? 'Página' : 'Page'}:
                            </span>
                            <select
                                value={currentPage}
                                onChange={(e) => setPage(Number(e.target.value))}
                                title={language === 'es' ? 'Seleccionar página' : 'Select page'}
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <table className="fs-grid">
                    <tbody>
                        {pageRows.map((row, rIdx) => {
                            const actualRowIdx = startIdx + rIdx;
                            const isHeader = actualRowIdx < 5;
                            const rowClass = isHeader
                                ? 'fs-grid-row--header'
                                : (actualRowIdx % 2 === 0 ? 'fs-grid-row--even' : 'fs-grid-row--odd');

                            return (
                                <tr key={actualRowIdx} className={rowClass}>
                                    {row.slice(0, 10).map((cell, cIdx) => {
                                        const formattedVal = formatValue(cell.v, cell.f);

                                        const isNumeric = typeof cell.v === 'number' ||
                                            (typeof cell.v === 'string' && !isNaN(Number(cell.v.toString().replace(/[,$%]/g, ''))));

                                        const cellClasses = cn(
                                            'fs-grid-cell',
                                            isHeader ? 'fs-grid-cell--header' : 'fs-grid-cell--data',
                                            (isNumeric || cIdx > 0) ? 'fs-grid-cell--right' : 'fs-grid-cell--left'
                                        );

                                        return (
                                            <td key={`${actualRowIdx}-${cIdx}`} className={cellClasses}>
                                                {formattedVal}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Bottom Pagination */}
                <PaginationControls />
            </div>
        );
    };

    // Render Section Selector for Leadschedules
    const renderSectionSelector = (
        sections: Record<string, LeadSection> | undefined,
        activeSection: string,
        setActiveSection: (s: string) => void,
        title: string
    ) => {
        if (!sections || Object.keys(sections).length === 0) {
            return null;
        }

        return (
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {Object.keys(sections).length} {language === 'es' ? 'secciones' : 'sections'}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveSection('all')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all border",
                            activeSection === 'all'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                        )}
                    >
                        📊 {language === 'es' ? 'Ver Todo' : 'View All'}
                    </button>

                    {Object.entries(sections).map(([key, section]) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all border",
                                activeSection === key
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                            )}
                        >
                            <span>{section.icon}</span>
                            {language === 'es' ? section.name_es : section.name_en}
                            <span className="text-xs opacity-70">({section.data.length})</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Render Leadschedules with Section Tabs
    const renderLeadschedules = () => {
        const sections = data.LeadSections;

        // Reset page when section changes
        const handleLeadSectionChange = (section: string) => {
            setActiveLeadSection(section);
            setLeadPage(1);  // Reset to page 1 when changing sections
        };

        // If we have sectioned data, use it
        if (sections && Object.keys(sections).length > 0) {
            const gridData = activeLeadSection === 'all'
                ? data.Lead || []
                : sections[activeLeadSection]?.data || [];

            return (
                <div>
                    {renderSectionSelector(
                        sections,
                        activeLeadSection,
                        handleLeadSectionChange,
                        language === 'es' ? 'Cédulas Contables por Categoría' : 'Accounting Leadschedules by Category'
                    )}
                    {renderGrid(gridData, leadPage, setLeadPage)}
                </div>
            );
        }

        // Fallback to full grid
        return renderGrid(data.Lead || [], leadPage, setLeadPage);
    };

    // Render Tax Leadschedules with Section Tabs
    const renderTaxLeadschedules = () => {
        const sections = data.TaxLeadSections;

        // Reset page when section changes
        const handleTaxLeadSectionChange = (section: string) => {
            setActiveTaxLeadSection(section);
            setTaxLeadPage(1);  // Reset to page 1 when changing sections
        };

        // If we have sectioned data, use it
        if (sections && Object.keys(sections).length > 0) {
            const gridData = activeTaxLeadSection === 'all'
                ? data.TaxLead || []
                : sections[activeTaxLeadSection]?.data || [];

            return (
                <div>
                    {renderSectionSelector(
                        sections,
                        activeTaxLeadSection,
                        handleTaxLeadSectionChange,
                        language === 'es' ? 'Cédulas Fiscales por Categoría' : 'Tax Leadschedules by Category'
                    )}

                    {/* Section Description */}
                    {activeTaxLeadSection !== 'all' && sections[activeTaxLeadSection] && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{sections[activeTaxLeadSection].icon}</span>
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        {language === 'es'
                                            ? sections[activeTaxLeadSection].name_es
                                            : sections[activeTaxLeadSection].name_en}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {sections[activeTaxLeadSection].data.length} {language === 'es' ? 'filas de datos' : 'data rows'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {renderGrid(gridData, taxLeadPage, setTaxLeadPage)}
                </div>
            );
        }

        // Fallback to full grid
        return renderGrid(data.TaxLead || [], taxLeadPage, setTaxLeadPage);
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
                        {data.Metadata?.Version && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                v{data.Metadata.Version}
                            </span>
                        )}
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
                            onClick={() => { setActiveTab('Lead'); setActiveLeadSection('all'); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'Lead' ? 'bg-white text-purple-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            )}
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            {language === 'es' ? 'Cédulas' : 'Lead'}
                        </button>
                        <button
                            onClick={() => { setActiveTab('TaxLead'); setActiveTaxLeadSection('all'); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'TaxLead' ? 'bg-white text-purple-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            )}
                        >
                            <Calculator className="w-4 h-4" />
                            {language === 'es' ? 'Fiscal' : 'Tax'}
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
                {activeTab === 'Lead' && renderLeadschedules()}
                {activeTab === 'TaxLead' && renderTaxLeadschedules()}
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
