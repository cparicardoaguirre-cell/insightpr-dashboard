import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import financialsData from '../data/financial_statements.json';

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

// Educational Tooltips mapping (Tax Form 480.20)
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

export default function FinancialStatements() {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'BS' | 'IS'>('BS');
    const [showEducation, setShowEducation] = useState(true);

    // Cast JSON data
    const data = financialsData as FinancialData;
    const currentItems = activeTab === 'BS' ? data.BS : data.IS;

    // Format currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(language === 'es' ? 'es-PR' : 'en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Group by section
    const groupedItems: Record<string, LineItem[]> = {};
    currentItems.forEach(item => {
        if (!groupedItems[item.section]) groupedItems[item.section] = [];
        groupedItems[item.section].push(item);
    });

    return (
        <div className="card animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t('statements.title')}</h2>
                    <p className="text-sm text-gray-500">{t('statements.subtitle')}</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Document Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('BS')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'BS'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t('statements.bs')}
                        </button>
                        <button
                            onClick={() => setActiveTab('IS')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'IS'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t('statements.is')}
                        </button>
                    </div>

                    {/* Education Toggle */}
                    <button
                        onClick={() => setShowEducation(!showEducation)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-full border transition-colors ${showEducation
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-white text-gray-400 border-gray-200'
                            }`}
                    >
                        <span>💡</span>
                        {t('statements.toggleEducation')}
                    </button>
                </div>
            </div>

            {/* Table */}
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
                        {Object.entries(groupedItems).map(([section, items]) => (
                            <>
                                {/* Section Header */}
                                <tr key={section} className="bg-gray-50/50">
                                    <td colSpan={4} className="py-2 px-4 font-bold text-xs uppercase tracking-wider text-gray-500 mt-4">
                                        {section}
                                    </td>
                                </tr>

                                {/* Items */}
                                {items.map((item, idx) => {
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
                            </>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                <div>
                    {t('statements.auditLabel')}: <span className="font-medium text-gray-600">NLTS-PR FS 12 31 2024 Rev156-3.xlsm</span>
                </div>
                <div>
                    NLT-PR Internal Use Only
                </div>
            </div>
        </div>
    );
}
