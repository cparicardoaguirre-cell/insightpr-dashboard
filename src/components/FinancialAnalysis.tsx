import React, { useState, useEffect, useCallback } from 'react';
import * as Switch from '@radix-ui/react-switch';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FinancialRatiosSection } from './FinancialRatiosSection';
import { useLanguage } from '../context/LanguageContext';

// Type definitions for financial ratios
interface FinancialRatio {
    name: string;
    formula: string;
    value: number;
    industryBenchmark: number;
    variance: number;
    status: 'above' | 'below' | 'at';
    interpretation: string;
}

interface RatioCategory {
    category: string;
    description: string;
    ratios: FinancialRatio[];
}

// Helper function to get category icons
function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
        'Liquidity Ratios': '💧',
        'Profitability Ratios': '💰',
        'Leverage Ratios': '⚖️',
        'Efficiency Ratios': '⚡',
        'Cash Flow Ratios': '💵'
    };
    return icons[category] || '📊';
}

// Helper function to format ratio values
function formatRatioValue(value: number, name: string): string {
    if (!value && value !== 0) return 'N/A';
    // Percentages
    if (name.includes('Margin') || name.includes('ROA') || name.includes('ROE') || name.includes('Return')) {
        return `${value.toFixed(1)}%`;
    }
    // Dollar amounts
    if (name.includes('Working Capital') || name.includes('Free Cash Flow')) {
        return `$${(value / 1000000).toFixed(2)}M`;
    }
    // Days
    if (name.includes('Days')) {
        return `${value.toFixed(0)} days`;
    }
    // Ratios (default)
    return value.toFixed(2);
}

// Snapshot Card component
function SnapshotCard({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid var(--border-color)'
        }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{value}</div>
        </div>
    );
}

// Status Badge component
function StatusBadge({ status, t }: { status: 'above' | 'below' | 'at'; t: (key: string) => string }) {
    const getConfig = () => {
        switch (status) {
            case 'above':
                return { label: t('status.above'), color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' };
            case 'below':
                return { label: t('status.below'), color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' };
            default:
                return { label: t('status.atTarget'), color: 'var(--text-secondary)', bg: 'var(--bg-secondary)' };
        }
    };
    const { label, color, bg } = getConfig();
    return (
        <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color,
            backgroundColor: bg,
            padding: '2px 8px',
            borderRadius: '4px'
        }}>
            {label}
        </span>
    );
}

// New Industry Measures Component
function IndustryMeasuresSection({ t }: { t: (key: string) => string }) {
    return (
        <div className="card" style={{ marginTop: '2rem', borderTop: '4px solid var(--accent-primary)' }}>
            <h3 style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🏭</span> {t('kpi.title')}
            </h3>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '3px solid #f59e0b' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b', fontSize: '0.9rem' }}>📒 {t('kpi.sourceTitle')}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {t('kpi.sourceDescription')}
                </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: 'rgba(59, 130, 246, 0.1)', borderBottom: '2px solid var(--accent-primary)' }}>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--accent-primary)' }}>{t('kpi.header')}</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--accent-primary)' }}>{t('kpi.bestInClass')}</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--accent-primary)' }}>{t('kpi.actualResult')}</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--accent-primary)' }}>{t('kpi.statusAnalysis')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{t('kpi.dollarUtilization')}</td>
                            <td style={{ padding: '0.75rem' }}>65% - 75%</td>
                            <td style={{ padding: '0.75rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{t('kpi.notReported')}</td>
                            <td style={{ padding: '0.75rem' }}>{t('kpi.dollarUtilDesc')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{t('kpi.timeUtilization')}</td>
                            <td style={{ padding: '0.75rem' }}>~72% ({t('kpi.balancePoint')})</td>
                            <td style={{ padding: '0.75rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{t('kpi.notReported')}</td>
                            <td style={{ padding: '0.75rem' }}>{t('kpi.timeUtilDesc')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{t('kpi.absorptionRate')}</td>
                            <td style={{ padding: '0.75rem' }}>100% ("{t('kpi.theHolyGrail')}")</td>
                            <td style={{ padding: '0.75rem' }}>~52% ({t('kpi.estimated')})</td>
                            <td style={{ padding: '0.75rem' }}>{t('kpi.absorptionDesc')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(239, 68, 68, 0.05)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{t('kpi.ebitdaMargin')}</td>
                            <td style={{ padding: '0.75rem' }}>&gt; 40%</td>
                            <td style={{ padding: '0.75rem', color: '#ef4444', fontWeight: 700 }}>17.39%</td>
                            <td style={{ padding: '0.75rem', color: '#ef4444' }}>{t('kpi.ebitdaDesc')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(16, 185, 129, 0.05)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{t('kpi.dso')}</td>
                            <td style={{ padding: '0.75rem' }}>67 {t('kpi.days')}</td>
                            <td style={{ padding: '0.75rem', color: '#10b981', fontWeight: 700 }}>37.42 {t('kpi.days')}</td>
                            <td style={{ padding: '0.75rem', color: '#10b981' }}>{t('kpi.dsoDesc')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{t('kpi.inventoryTurnover')}</td>
                            <td style={{ padding: '0.75rem' }}>Variable</td>
                            <td style={{ padding: '0.75rem' }}>2.61 {t('kpi.times')} (140 {t('kpi.days').toLowerCase()})</td>
                            <td style={{ padding: '0.75rem' }}>{t('kpi.inventoryDesc')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>📐 {t('kpi.masterFormulas')}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '4px', borderLeft: '2px solid var(--accent-secondary)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('kpi.financialUtilization')}</div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', margin: '0.25rem 0' }}>{t('kpi.financialUtilFormula')}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{t('kpi.goal')}: &gt; 65%</div>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '4px', borderLeft: '2px solid var(--accent-secondary)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('kpi.absorptionRate')}</div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', margin: '0.25rem 0' }}>(Gross Profit Services + Parts) / Fixed Expenses</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{t('kpi.goal')}: 100%</div>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '4px', borderLeft: '2px solid var(--accent-secondary)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('kpi.hardDown')}</div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', margin: '0.25rem 0' }}>{t('kpi.hardDownFormula')}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{t('kpi.rule')}: {t('kpi.maxDays')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FinancialAnalysis() {
    const { t, language } = useLanguage();
    const [timeframe, setTimeframe] = useState<'yearly' | 'monthly'>('yearly');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [financialData, setFinancialData] = useState<any>(null);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [fsRatios, setFsRatios] = useState<any>(null);
    const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    // Detect if running in production (Netlify) vs development (localhost)
    const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
    const API_BASE_URL = isProduction ? '' : 'http://localhost:3001';

    // Load Executive Summary from localStorage on mount
    useEffect(() => {
        const cachedSummary = localStorage.getItem('executiveSummary');
        const cachedSummaryLang = localStorage.getItem('executiveSummaryLang');

        if (cachedSummary && cachedSummaryLang === language) {
            console.log('Loading cached Executive Summary');
            setExecutiveSummary(cachedSummary);
        }
    }, []);

    // Fetch ratios from NLTS-PR FS file on mount (or static file in production)
    useEffect(() => {
        if (isProduction) {
            // Production: Load pre-generated static data
            fetch('/data/financial_ratios.json')
                .then(res => res.json())
                .then(data => {
                    setFsRatios(data);
                    setLastSync(data.extractedAt ? new Date(data.extractedAt).toLocaleString() : 'Pre-loaded');
                    console.log('Loaded static financial data for production');
                })
                .catch(err => console.error('Failed to fetch static ratios:', err));
        } else {
            // Development: Fetch from live backend
            fetch(`${API_BASE_URL}/api/financial-ratios`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        setFsRatios(data.data);
                    }
                })
                .catch(err => console.error('Failed to fetch FS ratios:', err));
        }
    }, [isProduction]);

    const fetchFinancialData = useCallback(async () => {
        // Production mode: Data is already pre-loaded, just show a message
        if (isProduction) {
            alert(language === 'es'
                ? '📊 Los datos financieros ya están cargados.\n\nPara obtener datos actualizados en tiempo real, contacte a CPA Ricardo Aguirre.'
                : '📊 Financial data is already loaded.\n\nFor real-time updated data, contact CPA Ricardo Aguirre.');
            return;
        }

        // Development mode: Full sync functionality
        setLoading(true);
        setProgress(0);
        setSummaryLoading(true);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return 90;
                return prev + 5;
            });
        }, 800);

        try {
            // Step 1: Sync ratios from Excel (dynamic extraction)
            console.log('Syncing ratios from Excel...');
            const syncResponse = await fetch(`${API_BASE_URL}/api/financial-ratios/sync`);
            const syncData = await syncResponse.json();
            if (syncData.success && syncData.data) {
                setFsRatios(syncData.data);
                console.log('Ratios synced from:', syncData.data.source);
            }

            // Step 2: Generate AI Executive Summary
            console.log('Generating AI Executive Summary...');
            const summaryResponse = await fetch(`${API_BASE_URL}/api/executive-summary/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language })
            });
            const summaryData = await summaryResponse.json();
            if (summaryData.success && summaryData.content) {
                setExecutiveSummary(summaryData.content);
                // Persist to localStorage
                localStorage.setItem('executiveSummary', summaryData.content);
                localStorage.setItem('executiveSummaryLang', language);
                console.log('Executive Summary generated and cached via:', summaryData.source);
            }

        } catch (error) {
            console.error('Sync error:', error);
        } finally {

            setSummaryLoading(false);
        }

        let query = "";
        const langInstruction = language === 'es'
            ? 'IMPORTANTE: Responde COMPLETAMENTE en español. Todas las explicaciones, análisis e interpretaciones deben estar en español.\n\n'
            : 'IMPORTANT: Respond COMPLETELY in English. All explanations, analysis, and interpretations must be in English.\n\n';

        if (timeframe === 'yearly') {
            query = langInstruction + `COMPREHENSIVE FINANCIAL RATIO ANALYSIS REQUEST(NLTS - PR FS 12 31 2024):

Based on the audited financial statements file "NLTS-PR FS 12 31 2024 Rev156-3", provide a complete financial ratio analysis.

EXTRACT AND CALCULATE THE FOLLOWING RATIOS:

1. LIQUIDITY RATIOS:
- Current Ratio(Current Assets / Current Liabilities)
- Quick Ratio((Current Assets - Inventory) / Current Liabilities)
- Cash Ratio(Cash & Equivalents / Current Liabilities)
- Working Capital(Current Assets - Current Liabilities)

2. PROFITABILITY RATIOS:
- Gross Profit Margin(Gross Profit / Revenue × 100)
- Operating Profit Margin(Operating Income / Revenue × 100)
- Net Profit Margin(Net Income / Revenue × 100)
- Return on Assets(ROA)(Net Income / Total Assets × 100)
- Return on Equity(ROE)(Net Income / Shareholders' Equity × 100)
- EBITDA Margin(EBITDA / Revenue × 100)

3. LEVERAGE / SOLVENCY RATIOS:
- Debt-to-Equity Ratio(Total Liabilities / Shareholders' Equity)
- Debt-to-Assets Ratio(Total Liabilities / Total Assets)
- Interest Coverage Ratio(EBIT / Interest Expense)
- Equity Multiplier(Total Assets / Shareholders' Equity)

4. EFFICIENCY RATIOS:
- Asset Turnover(Revenue / Average Total Assets)
- Inventory Turnover(COGS / Average Inventory)
- Days Sales Outstanding(Accounts Receivable / Revenue × 365)
- Days Payable Outstanding(Accounts Payable / COGS × 365)
- Accounts Receivable Turnover(Revenue / Average Accounts Receivable)

5. CASH FLOW RATIOS:
- Operating Cash Flow Ratio(Operating Cash Flow / Current Liabilities)
- Free Cash Flow(Operating Cash Flow - Capital Expenditures)
- Cash Flow to Debt Ratio(Operating Cash Flow / Total Debt)

For EACH RATIO provide:
- Calculated value for NLTS-PR
- Industry benchmark
- Variance percentage
- Status (above/below/at)
- Brief explanation

Return a JSON object with this EXACT structure:
{
    "companySnapshot": {
        "totalRevenue": number,
        "netIncome": number,
        "totalAssets": number,
        "totalEquity": number,
        "fiscalYear": "2024"
    },
    "ratioCategories": [
        {
            "category": "Liquidity Ratios",
            "description": "...",
            "ratios": [
                {
                    "name": "Current Ratio",
                    "formula": "...",
                    "value": number,
                    "industryBenchmark": number,
                    "variance": number,
                    "status": "above|below|at",
                    "interpretation": "..."
                }
            ]
        }
    ],
    "overallAnalysis": "..."
}`;
        } else {
            query = "Monthly breakdown request...";
        }

        try {
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query })
            });
            const data = await response.json();
            let rawContent = data.content || "";
            let parsedData: any = {};

            try {
                const wrapperJson = JSON.parse(rawContent);
                if (wrapperJson.status === "success" && wrapperJson.answer) {
                    rawContent = wrapperJson.answer;
                }
            } catch (e) { }

            const jsonMatch = rawContent.match(/\{[\s\S]*"ratioCategories"[\s\S]*\}/) || rawContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsedData = JSON.parse(jsonMatch[0]);
                } catch (e) {
                    parsedData = { rawAnswer: rawContent, error: "Parse failed" };
                }
            } else {
                parsedData = { rawAnswer: rawContent };
            }

            const now = new Date().toLocaleString();
            setFinancialData(parsedData);
            setLastSync(now);
            localStorage.setItem(`financialData_${timeframe}`, JSON.stringify(parsedData));
            localStorage.setItem(`financialData_${timeframe}_time`, now);

        } catch (error) {
            console.error(error);
        } finally {
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => setLoading(false), 500);
        }
    }, [timeframe, language, t]);

    // Initial Load from Cache
    useEffect(() => {
        const cacheKey = `financialData_${timeframe}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(`${cacheKey}_time`);
        if (cachedData) {
            setFinancialData(JSON.parse(cachedData));
            if (cachedTime) setLastSync(cachedTime);
        } else {
            fetchFinancialData();
        }
    }, [timeframe, fetchFinancialData]);

    // Track previous language to detect changes
    const previousLanguageRef = React.useRef(language);
    const isInitialMount = React.useRef(true);

    // Language Change Effect - Regenerate content when language changes
    useEffect(() => {
        // Skip initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Only regenerate if language actually changed
        if (previousLanguageRef.current !== language) {
            console.log(`Language changed from ${previousLanguageRef.current} to ${language}. Regenerating content...`);
            previousLanguageRef.current = language;

            // Regenerate Executive Summary in new language
            const regenerateContent = async () => {
                setSummaryLoading(true);
                try {
                    console.log(`Regenerating Executive Summary in ${language}...`);
                    const summaryResponse = await fetch('http://localhost:3001/api/executive-summary/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            language,
                            regenerate: true,
                            reason: 'language_change'
                        })
                    });
                    const summaryData = await summaryResponse.json();
                    if (summaryData.success && summaryData.content) {
                        setExecutiveSummary(summaryData.content);
                        // Persist to localStorage
                        localStorage.setItem('executiveSummary', summaryData.content);
                        localStorage.setItem('executiveSummaryLang', language);
                        console.log(`Executive Summary regenerated and cached in ${language}`);
                    }

                    // Clear cached financial data to force refresh with new language
                    const cacheKey = `financialData_${timeframe}`;
                    localStorage.removeItem(cacheKey);
                    localStorage.removeItem(`${cacheKey}_time`);

                    // Refetch financial data with new language context
                    await fetchFinancialData();

                } catch (error) {
                    console.error('Failed to regenerate content for new language:', error);
                } finally {
                    setSummaryLoading(false);
                }
            };

            regenerateContent();
        }
    }, [language, timeframe, fetchFinancialData]);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ background: 'linear-gradient(to right, var(--bg-card), rgba(59, 130, 246, 0.05))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>{t('financial.title')}</h2>
                    <p>{t('financial.subtitle')}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {lastSync ? `${t('financial.lastSync')}: ${lastSync}` : t('financial.notSynced')}
                        <button
                            onClick={fetchFinancialData}
                            disabled={loading}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '8px',
                                background: loading ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: loading ? 'var(--text-secondary)' : 'white',
                                boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <span style={{ fontSize: '1.1rem' }}>{loading ? '⏳' : '🔄'}</span>
                            {loading ? t('financial.analyzing') : t('financial.syncNow')}
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', color: timeframe === 'yearly' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t('financial.yearly')}</span>
                    <Switch.Root checked={timeframe === 'monthly'} onCheckedChange={(c) => setTimeframe(c ? 'monthly' : 'yearly')} style={{ width: 42, height: 25, backgroundColor: 'var(--bg-secondary)', borderRadius: '9999px', position: 'relative', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                        <Switch.Thumb style={{ display: 'block', width: 21, height: 21, backgroundColor: 'var(--accent-primary)', borderRadius: '9999px', transition: 'transform 100ms', transform: timeframe === 'monthly' ? 'translateX(19px)' : 'translateX(2px)' }} />
                    </Switch.Root>
                    <span style={{ fontSize: '0.875rem', color: timeframe === 'monthly' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t('financial.monthly')}</span>
                </div>
            </div>

            {loading && (
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {t('financial.syncing')} - {progress}%
                    </div>
                    {/* Bull Run Progress Track */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '50px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginBottom: '0.5rem'
                    }}>
                        {/* Progress Trail */}
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: `${progress}%`,
                            height: '4px',
                            background: 'linear-gradient(90deg, #10b981, #059669)',
                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                            transition: 'width 0.3s ease-in-out',
                            borderRadius: '2px'
                        }} />
                        {/* The Running Wall Street Bull */}
                        <div style={{
                            position: 'absolute',
                            left: `calc(${progress}% - 25px)`,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '50px',
                            height: '40px',
                            transition: 'left 0.3s ease-in-out',
                            animation: 'bullRun 0.2s ease-in-out infinite',
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))'
                        }}>
                            <img
                                src="/images/wall-street-bull.png"
                                alt="Wall Street Bull"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                        {/* Finish Flag */}
                        <div style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1.2rem',
                            opacity: 0.5
                        }}>
                            🏁
                        </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        {language === 'es' ? '📈 Bull Market en progreso...' : '📈 Bull Market in progress...'}
                    </div>
                    <style>{`
                        @keyframes bullRun {
                            0% { transform: translateY(-50%) translateX(0) rotate(-3deg); }
                            25% { transform: translateY(-55%) translateX(2px) rotate(0deg); }
                            50% { transform: translateY(-50%) translateX(0) rotate(3deg); }
                            75% { transform: translateY(-45%) translateX(-2px) rotate(0deg); }
                            100% { transform: translateY(-50%) translateX(0) rotate(-3deg); }
                        }
                    `}</style>
                </div>
            )}

            {!loading && timeframe === 'yearly' && financialData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Snapshots */}
                    {financialData.companySnapshot && (
                        <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.1) 100%)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>📊 Snapshot - FY {financialData.companySnapshot.fiscalYear}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                <SnapshotCard label="Revenue" value={`$${(financialData.companySnapshot.totalRevenue / 1000000).toFixed(2)}M`} />
                                <SnapshotCard label="Net Income" value={`$${(financialData.companySnapshot.netIncome / 1000000).toFixed(2)}M`} />
                                <SnapshotCard label="Assets" value={`$${(financialData.companySnapshot.totalAssets / 1000000).toFixed(2)}M`} />
                                <SnapshotCard label="Equity" value={`$${(financialData.companySnapshot.totalEquity / 1000000).toFixed(2)}M`} />
                            </div>
                        </div>
                    )}

                    {/* Integrated Financial Ratios Section */}
                    {fsRatios && (
                        <FinancialRatiosSection fsRatios={fsRatios} />
                    )}

                    {/* NEW: Industry Specific Measures Section */}
                    <IndustryMeasuresSection t={t} />

                    {/* AI Generated Categories */}
                    {financialData.ratioCategories?.map((cat: RatioCategory, idx: number) => (
                        <div key={idx} className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>{getCategoryIcon(cat.category)}</span>
                                <h3 style={{ margin: 0 }}>{cat.category}</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                {cat.ratios.map((ratio, rIdx) => (
                                    <div key={rIdx} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: 600 }}>{ratio.name}</div>
                                            <StatusBadge status={ratio.status} t={t} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem' }}>Actual</div>
                                                <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{formatRatioValue(ratio.value, ratio.name)}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem' }}>Industry</div>
                                                <div>{formatRatioValue(ratio.industryBenchmark, ratio.name)}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{ratio.interpretation}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Narrative Analysis */}
                    {financialData.overallAnalysis && (
                        <div className="card">
                            <h3>📈 Summary Analysis</h3>
                            <div className="markdown-body">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{financialData.overallAnalysis}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Executive Summary - Dynamic AI Generated */}
                    {(fsRatios || executiveSummary) && (
                        <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                            <h3 style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                📋 {language === 'es' ? 'Resumen Ejecutivo' : 'Executive Summary'}
                                {fsRatios?.asOf && <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>({fsRatios.asOf})</span>}
                                {summaryLoading && <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>🔄 {language === 'es' ? 'Generando...' : 'Generating...'}</span>}
                            </h3>
                            <div className="markdown-body" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {executiveSummary ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{executiveSummary}</ReactMarkdown>
                                ) : summaryLoading ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
                                        <p>{language === 'es' ? 'Generando resumen ejecutivo con IA...' : 'Generating AI executive summary...'}</p>
                                        <p style={{ fontSize: '0.75rem' }}>{language === 'es' ? 'Esto puede tomar unos segundos' : 'This may take a few seconds'}</p>
                                    </div>
                                ) : (
                                    <p style={{ fontStyle: 'italic', opacity: 0.7 }}>
                                        {language === 'es'
                                            ? 'Haga clic en "Sincronizar" para generar el resumen ejecutivo con IA basado en los datos financieros más recientes.'
                                            : 'Click "Sync" to generate the AI executive summary based on the latest financial data.'}
                                    </p>
                                )}
                            </div>
                            {fsRatios?.source && (
                                <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.5 }}>
                                    📁 {language === 'es' ? 'Fuente' : 'Source'}: {fsRatios.source}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

