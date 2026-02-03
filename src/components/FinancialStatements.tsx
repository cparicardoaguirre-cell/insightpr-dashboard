import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import financialsData from '../data/financial_statements.json';
import { FileText, Download, TrendingUp, DollarSign, FileSpreadsheet, Calculator } from 'lucide-react';

// Type Definitions
interface LineItem {
    name: string;
    2024: number;
    2023: number;
    section: string;
}

interface FinancialData {
    BS: LineItem[];
    IS: LineItem[];
    CF: LineItem[];
    TaxLead: string[][];
    Lead: string[][];
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

    // Helper: Format Currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(language === 'es' ? 'es-PR' : 'en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Render Standard Financial Table (BS, IS, CF)
    const renderStandardTable = (items: LineItem[]) => {
        // Group by section
        const groupedItems: Record<string, LineItem[]> = {};
        items.forEach(item => {
            if (!groupedItems[item.section]) groupedItems[item.section] = [];
            groupedItems[item.section].push(item);
        });

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="py-3 px-4 font-semibold text-gray-700 w-1/2">{t('statements.lineItem')}</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-right w-1/6" style={{ minWidth: '120px' }}>{t('statements.2024')}</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-right w-1/6" style={{ minWidth: '120px' }}>{t('statements.2023')}</th>
                            <th className="py-3 px-4 font-semibold text-gray-700 text-center w-1/6">{t('statements.trend')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {Object.entries(groupedItems).map(([section, sectionItems]) => (
                            <div key={section} style={{ display: 'contents' }}>
                                {/* Section Header */}
                                <tr className="bg-gray-50/50">
                                    <td colSpan={4} className="py-2 px-4 font-bold text-xs uppercase tracking-wider text-gray-500 mt-4">
                                        {section}
                                    </td>
                                </tr>

                                {/* Items */}
                                {sectionItems.map((item, idx) => {
                                    const variance = item['2023'] !== 0
                                        ? ((item['2024'] - item['2023']) / Math.abs(item['2023'])) * 100
                                        : 0;

                                    // Simple fuzzy matching for tax map
                                    const taxMapping = Object.keys(TAX_MAP).find(k => item.name.includes(k));

                                    return (
                                        <tr
                                            key={`${section}-${idx}`}
                                            className="hover:bg-blue-50/30 transition-colors group"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-800">{item.name}</div>
                                                {showEducation && taxMapping && (
                                                    <div className="text-xs text-amber-600 mt-0.5 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                                        <span>📋</span>
                                                        {t('statements.taxMap')}: {TAX_MAP[taxMapping]}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono text-gray-900">
                                                {formatCurrency(item['2024'])}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono text-gray-500">
                                                {formatCurrency(item['2023'])}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {variance > 0 ? (
                                                    <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded-full">
                                                        +{variance.toFixed(1)}%
                                                    </span>
                                                ) : variance < 0 ? (
                                                    <span className="text-red-500 font-medium text-xs bg-red-50 px-2 py-0.5 rounded-full">
                                                        {variance.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
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
    const renderGrid = (rows: string[][]) => (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs text-left font-mono whitespace-nowrap">
                <tbody className="divide-y divide-gray-100">
                    {rows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx < 5 ? 'bg-gray-50 font-bold' : 'hover:bg-blue-50/30'}>
                            {row.map((cell, cIdx) => (
                                <td key={`${rIdx}-${cIdx}`} className="py-2 px-3 border-r border-gray-50 last:border-none">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Render PDF Viewer
    const renderPdfViewer = () => (
        <div className="flex flex-col h-[800px] w-full bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-700">
                    <FileText className="w-5 h-5 text-red-500" />
                    <span className="font-medium">NLTS-PR Audited Financials 2024</span>
                </div>
                <a
                    href="/documents/audited_financials.pdf"
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                >
                    <Download className="w-4 h-4" />
                    {t('download_pdf')}
                </a>
            </div>
            <iframe
                src="/documents/audited_financials.pdf#toolbar=0"
                className="w-full h-full"
                title="Audited Financial Statements"
            />
        </div>
    );

    return (
        <div className="card animate-fade-in space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t('statements.title')}</h2>
                    <p className="text-sm text-gray-500">{t('statements.subtitle')} - {data.Metadata?.SourceFile || '2024'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* Main Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg flex-wrap">
                        <button
                            onClick={() => setActiveTab('BS')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'BS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            {t('statements.bs')}
                        </button>
                        <button
                            onClick={() => setActiveTab('IS')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'IS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <DollarSign className="w-4 h-4" />
                            {t('statements.is')}
                        </button>
                        <button
                            onClick={() => setActiveTab('CF')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'CF' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <TrendingUp className="w-4 h-4 rotate-90" />
                            {t('statements.cf')}
                        </button>
                    </div>

                    {/* Extended Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg flex-wrap">
                        <button
                            onClick={() => setActiveTab('Lead')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'Lead' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Lead
                        </button>
                        <button
                            onClick={() => setActiveTab('TaxLead')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'TaxLead' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Calculator className="w-4 h-4" />
                            Tax
                        </button>
                    </div>

                    {/* Docs Tab */}
                    {data.Metadata?.PdfAvailable && (
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('Docs')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'Docs' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${showEducation
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-white text-gray-400 border-gray-200'
                            }`}
                    >
                        <span>💡</span>
                        {t('statements.toggleEducation')}
                    </button>
                </div>
            )}

            {/* Content Render */}
            <div className="min-h-[500px]">
                {activeTab === 'BS' && renderStandardTable(data.BS)}
                {activeTab === 'IS' && renderStandardTable(data.IS)}
                {activeTab === 'CF' && renderStandardTable(data.CF)}
                {activeTab === 'Lead' && renderGrid(data.Lead)}
                {activeTab === 'TaxLead' && renderGrid(data.TaxLead)}
                {activeTab === 'Docs' && renderPdfViewer()}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                <div>
                    {t('statements.auditLabel')}: <span className="font-medium text-gray-600">{data.Metadata?.SourceFile || 'N/A'}</span>
                </div>
                <div>
                    NLT-PR Internal Use Only
                </div>
            </div>
        </div>
    );
}
