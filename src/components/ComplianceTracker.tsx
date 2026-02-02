import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface DocumentInfo {
    filename: string;
    path: string;
    documentType: string;
    modifiedAt: string;
    createdAt: string;
    size: number;
    lastModifiedFormatted: string;
    documentPeriodDate: string | null;
    documentPeriodFormatted: string;
}

interface ComplianceCategory {
    name: string;
    nameKey: string;
    status: 'Found' | 'Not Found' | 'Loading';
    documents: DocumentInfo[];
    lastModified?: string;
}

// Required compliance categories with translation keys
const REQUIRED_CATEGORIES = [
    { name: "Financial Statements", key: "doc.financialStatements" },
    { name: "Tax Returns", key: "doc.taxReturns" },
    { name: "Municipal Taxes", key: "doc.municipalTaxes" },
    { name: "Property Tax (CRIM)", key: "doc.propertyTax" },
    { name: "Depreciation Schedule", key: "doc.depreciationSchedule" },
    { name: "Audit Reports", key: "doc.auditReports" },
    { name: "Sales Tax Reports", key: "doc.salesTaxReports" },
    { name: "Payroll Reports", key: "doc.payrollReports" },
    { name: "Insurance Certificates", key: "doc.insuranceCertificates" },
    { name: "Business Licenses", key: "doc.businessLicenses" },
    { name: "Engagement Letter", key: "doc.engagementLetter" },
    { name: "Representation Letter", key: "doc.representationLetter" }
];

export default function ComplianceTracker() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<ComplianceCategory[]>(
        REQUIRED_CATEGORIES.map(cat => ({
            name: cat.name,
            nameKey: cat.key,
            status: 'Loading',
            documents: []
        }))
    );
    const [totalFiles, setTotalFiles] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [lastScan, setLastScan] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryName)) {
                newSet.delete(categoryName);
            } else {
                newSet.add(categoryName);
            }
            return newSet;
        });
    };

    const scanDocuments = async () => {
        setLoading(true);
        setError(null);

        try {
            // Determine API URL based on environment
            const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

            let data;
            if (isProduction) {
                // Production: Load pre-scanned static list
                const response = await fetch('/data/compliance_docs.json');
                data = await response.json();
                // Simulate small delay for UX
                await new Promise(r => setTimeout(r, 600));
            } else {
                // Development: Scan live
                const response = await fetch('http://localhost:3001/api/compliance-docs');
                data = await response.json();
            }

            if (!data.success) {
                throw new Error(data.error || 'Failed to scan documents');
            }

            setTotalFiles(data.totalFiles);
            setLastScan(new Date().toLocaleString());

            // Map API response to our categories
            const updatedCategories = REQUIRED_CATEGORIES.map(cat => {
                const docs = data.documents[cat.name] || [];
                const latestDoc = docs[0]; // Already sorted by date (newest first)

                return {
                    name: cat.name,
                    nameKey: cat.key,
                    status: docs.length > 0 ? 'Found' : 'Not Found' as 'Found' | 'Not Found',
                    documents: docs,
                    lastModified: latestDoc?.lastModifiedFormatted || undefined
                };
            });

            setCategories(updatedCategories);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Scan failed:', err);
            setError(errorMessage);
            setCategories(prev => prev.map(cat => ({ ...cat, status: 'Not Found' })));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        scanDocuments();
    }, []);

    const foundCount = categories.filter(c => c.status === 'Found').length;
    const missingCount = categories.filter(c => c.status === 'Not Found').length;

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.15) 100%)',
                borderLeft: '4px solid var(--accent-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        📋 {t('compliance.title')}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {t('compliance.subtitle')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {lastScan && <div>{t('compliance.lastScan')}: {lastScan}</div>}
                        <div>{totalFiles} {t('compliance.detected')}</div>
                    </div>
                    <button
                        onClick={scanDocuments}
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ opacity: loading ? 0.5 : 1 }}
                    >
                        {loading ? t('compliance.scanning') : t('compliance.scanNow')}
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <StatCard
                    label={t('compliance.documentsFound')}
                    value={foundCount}
                    total={REQUIRED_CATEGORIES.length}
                    color="#34d399"
                />
                <StatCard
                    label={t('compliance.missingDocuments')}
                    value={missingCount}
                    total={REQUIRED_CATEGORIES.length}
                    color="#f87171"
                />
                <StatCard
                    label={t('compliance.totalScanned')}
                    value={totalFiles}
                    color="var(--accent-primary)"
                />
            </div>

            {error && (
                <div className="card" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', borderColor: '#f87171' }}>
                    <p style={{ color: '#f87171' }}>⚠️ Error: {error}</p>
                </div>
            )}

            {/* Documents Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('compliance.category')}</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('compliance.status')}</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('compliance.latestFile')}</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('compliance.documentPeriod')}</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('compliance.lastModified')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{t(cat.nameKey)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <StatusBadge status={cat.status} t={t} />
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                        {loading && cat.status === 'Loading' ? (
                                            <span style={{ opacity: 0.5 }}>{t('compliance.scanning')}</span>
                                        ) : cat.documents.length > 0 ? (
                                            <span title={cat.documents[0].path}>
                                                {cat.documents[0].filename}
                                                {cat.documents.length > 1 && (
                                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                                                        +{cat.documents.length - 1} {t('misc.more')}
                                                    </span>
                                                )}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#f87171' }}>{t('compliance.noDocument')}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                        {cat.documents.length > 0 ? cat.documents[0].documentPeriodFormatted : '—'}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {cat.lastModified || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed File List */}
            {categories.some(c => c.documents.length > 0) && (
                <div className="card">
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>📁 {t('compliance.allDocuments')}</h3>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {categories.filter(c => c.documents.length > 0).map(cat => {
                            const isExpanded = expandedCategories.has(cat.name);
                            return (
                                <div key={cat.name}>
                                    <h4
                                        onClick={() => toggleCategory(cat.name)}
                                        style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '0.5rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            userSelect: 'none',
                                            padding: '0.5rem',
                                            borderRadius: '4px',
                                            backgroundColor: 'var(--bg-secondary)',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                    >
                                        <span style={{
                                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s',
                                            display: 'inline-block'
                                        }}>
                                            ▶
                                        </span>
                                        {t(cat.nameKey)}
                                        <span style={{
                                            marginLeft: 'auto',
                                            fontSize: '0.75rem',
                                            color: 'var(--accent-primary)',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            padding: '0.125rem 0.5rem',
                                            borderRadius: '9999px'
                                        }}>
                                            {cat.documents.length}
                                        </span>
                                    </h4>
                                    {isExpanded && cat.documents.map((doc, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: 'var(--bg-card)',
                                            borderRadius: '4px',
                                            marginBottom: '0.25rem',
                                            marginLeft: '1.5rem',
                                            fontSize: '0.85rem',
                                            borderLeft: '2px solid var(--accent-primary)'
                                        }}>
                                            <span style={{ fontFamily: 'monospace' }}>{doc.filename}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>{doc.lastModifiedFormatted}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, total, color }: { label: string; value: number; total?: number; color: string }) {
    return (
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color }}>
                {value}
                {total !== undefined && (
                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}> / {total}</span>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status, t }: { status: 'Found' | 'Not Found' | 'Loading'; t: (key: string) => string }) {
    if (status === 'Found') {
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'rgba(52, 211, 153, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.3)'
            }}>
                {t('compliance.found')}
            </span>
        );
    }
    if (status === 'Not Found') {
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'rgba(248, 113, 113, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(248, 113, 113, 0.3)'
            }}>
                {t('compliance.missing')}
            </span>
        );
    }
    return (
        <span style={{
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)'
        }}>
            {t('compliance.loading')}
        </span>
    );
}
