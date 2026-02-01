import { useLanguage } from '../context/LanguageContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Act60Tab() {
    const { t } = useLanguage()

    const currentStructure = {
        type: t('act60.corpType') || 'C-Corporation (Puerto Rico)',
        incomeTax: '37.5%',
        propertyTax: '100%',
        municipalTax: '100%',
        distributionTax: '15%',
        term: 'N/A'
    }

    const proposedStructure = {
        type: t('act60.act60Entity') || 'Act 60 Eligible Entity',
        incomeTax: '4%',
        propertyTax: '25%',
        municipalTax: '50%',
        distributionTax: '0%',
        term: '15-30 ' + (t('act60.years') || 'years')
    }

    const taxComparisonData = [
        {
            name: t('act60.incomeTax') || 'Income Tax',
            current: 37.5,
            proposed: 4,
        },
        {
            name: t('act60.propertyTax') || 'Property Tax',
            current: 100,
            proposed: 25,
        },
        {
            name: t('act60.municipalTax') || 'Municipal Tax',
            current: 100,
            proposed: 50,
        },
        {
            name: t('act60.distributionTax') || 'Distribution Tax',
            current: 15,
            proposed: 0,
        }
    ]

    // Estimated savings based on 2024 financial data
    const estimatedSavings = {
        netIncome: 250000, // Approximate based on EBITDA
        currentTax: 93750, // 37.5%
        act60Tax: 10000, // 4%
        annualSavings: 83750,
        over15Years: 1256250
    }

    const savingsData = [
        { name: t('act60.currentTax') || 'Current Tax', value: estimatedSavings.currentTax, color: '#ef4444' },
        { name: t('act60.act60Tax') || 'Act 60 Tax', value: estimatedSavings.act60Tax, color: '#22c55e' }
    ]

    const implementationSteps = [
        {
            phase: 1,
            title: t('act60.phase1Title') || 'Eligibility Assessment',
            duration: '1-2 ' + (t('act60.months') || 'months'),
            tasks: [
                t('act60.phase1Task1') || 'Review current corporate structure',
                t('act60.phase1Task2') || 'Verify manufacturing activity qualifies',
                t('act60.phase1Task3') || 'Consult with Act 60 tax specialist',
                t('act60.phase1Task4') || 'Prepare cost-benefit analysis'
            ],
            status: 'pending'
        },
        {
            phase: 2,
            title: t('act60.phase2Title') || 'Application & Approval',
            duration: '2-4 ' + (t('act60.months') || 'months'),
            tasks: [
                t('act60.phase2Task1') || 'Prepare Act 60 application package',
                t('act60.phase2Task2') || 'Submit to DDEC (Dept. of Economic Development)',
                t('act60.phase2Task3') || 'Negotiate decree terms',
                t('act60.phase2Task4') || 'Obtain tax exemption decree'
            ],
            status: 'pending'
        },
        {
            phase: 3,
            title: t('act60.phase3Title') || 'Corporate Restructuring',
            duration: '1-3 ' + (t('act60.months') || 'months'),
            tasks: [
                t('act60.phase3Task1') || 'Restructure entity if needed',
                t('act60.phase3Task2') || 'Update accounting systems',
                t('act60.phase3Task3') || 'Register for exempt status',
                t('act60.phase3Task4') || 'Notify stakeholders and lenders'
            ],
            status: 'pending'
        },
        {
            phase: 4,
            title: t('act60.phase4Title') || 'Compliance & Reporting',
            duration: t('act60.ongoing') || 'Ongoing',
            tasks: [
                t('act60.phase4Task1') || 'Annual compliance reporting',
                t('act60.phase4Task2') || 'Maintain employment requirements',
                t('act60.phase4Task3') || 'Track eligible income separately',
                t('act60.phase4Task4') || 'Periodic decree review/renewal'
            ],
            status: 'pending'
        }
    ]

    const keyBenefits = [
        {
            icon: '💰',
            title: t('act60.benefit1Title') || '4% Fixed Income Tax',
            description: t('act60.benefit1Desc') || 'vs standard 37.5% corporate rate. Applies to industrial development income.',
            highlight: '~90% savings'
        },
        {
            icon: '🏠',
            title: t('act60.benefit2Title') || '75% Property Tax Exemption',
            description: t('act60.benefit2Desc') || 'Reduced property tax burden on real and personal property.',
            highlight: '75% off'
        },
        {
            icon: '🏛️',
            title: t('act60.benefit3Title') || '50% Municipal Tax Exemption',
            description: t('act60.benefit3Desc') || 'Reduced municipal license tax (patente) for eligible businesses.',
            highlight: '50% off'
        },
        {
            icon: '📤',
            title: t('act60.benefit4Title') || '0% Distribution Tax',
            description: t('act60.benefit4Desc') || 'No tax on dividend distributions to shareholders.',
            highlight: '100% exempt'
        },
        {
            icon: '📅',
            title: t('act60.benefit5Title') || '15-30 Year Terms',
            description: t('act60.benefit5Desc') || 'Initial 15-year decree with option to extend for additional 15 years.',
            highlight: 'Long-term'
        },
        {
            icon: '🛒',
            title: t('act60.benefit6Title') || 'IVU Exemptions',
            description: t('act60.benefit6Desc') || 'Sales tax exemption on raw materials, machinery, and equipment.',
            highlight: '0% IVU'
        }
    ]

    return (
        <div className="act60-tab">
            {/* Header */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>
                            🏛️ {t('act60.title') || 'Act 60 Restructuring Analysis'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '600px' }}>
                            {t('act60.subtitle') || 'Puerto Rico Incentives Code - Manufacturing Tax Benefits'}
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: 'rgba(0,200,100,0.15)',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,200,100,0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>
                            {t('act60.potentialSavings') || 'POTENTIAL ANNUAL SAVINGS'}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                            ${estimatedSavings.annualSavings.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Structure Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Current Structure */}
                <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
                    <h3 style={{ margin: 0, marginBottom: '1rem', color: 'var(--danger)' }}>
                        ❌ {t('act60.currentStructure') || 'Current Structure'}
                    </h3>
                    <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>
                        {currentStructure.type}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>
                            <span>{t('act60.incomeTax') || 'Income Tax'}:</span>
                            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{currentStructure.incomeTax}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                            <span>{t('act60.propertyTax') || 'Property Tax'}:</span>
                            <span style={{ fontWeight: 700 }}>{currentStructure.propertyTax}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                            <span>{t('act60.municipalTax') || 'Municipal Tax'}:</span>
                            <span style={{ fontWeight: 700 }}>{currentStructure.municipalTax}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>
                            <span>{t('act60.distributionTax') || 'Distribution Tax'}:</span>
                            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{currentStructure.distributionTax}</span>
                        </div>
                    </div>
                </div>

                {/* Proposed Structure */}
                <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
                    <h3 style={{ margin: 0, marginBottom: '1rem', color: 'var(--success)' }}>
                        ✅ {t('act60.proposedStructure') || 'Proposed Structure'}
                    </h3>
                    <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>
                        {proposedStructure.type}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: '4px' }}>
                            <span>{t('act60.incomeTax') || 'Income Tax'}:</span>
                            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{proposedStructure.incomeTax}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: '4px' }}>
                            <span>{t('act60.propertyTax') || 'Property Tax'}:</span>
                            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{proposedStructure.propertyTax}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: '4px' }}>
                            <span>{t('act60.municipalTax') || 'Municipal Tax'}:</span>
                            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{proposedStructure.municipalTax}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: '4px' }}>
                            <span>{t('act60.distributionTax') || 'Distribution Tax'}:</span>
                            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{proposedStructure.distributionTax}</span>
                        </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        📅 {t('act60.termDuration') || 'Term'}: <strong>{proposedStructure.term}</strong>
                    </div>
                </div>
            </div>

            {/* Tax Comparison Chart */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, marginBottom: '1rem' }}>
                    📊 {t('act60.taxComparison') || 'Tax Rate Comparison'}
                </h3>
                <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={taxComparisonData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="var(--text-secondary)" />
                            <YAxis type="category" dataKey="name" width={100} stroke="var(--text-secondary)" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                            />
                            <Bar dataKey="current" name={t('act60.current') || 'Current'} fill="#ef4444" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="proposed" name={t('act60.proposed') || 'Act 60'} fill="#22c55e" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></span>
                        {t('act60.current') || 'Current'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '2px' }}></span>
                        {t('act60.proposed') || 'Act 60'}
                    </span>
                </div>
            </div>

            {/* Key Benefits Grid */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, marginBottom: '1rem' }}>
                    🎁 {t('act60.keyBenefits') || 'Key Benefits of Act 60'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {keyBenefits.map((benefit, idx) => (
                        <div key={idx} style={{
                            padding: '1rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.65rem', fontWeight: 700, color: 'var(--success)', backgroundColor: 'rgba(34,197,94,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                                {benefit.highlight}
                            </div>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{benefit.icon}</div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>{benefit.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{benefit.description}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Savings Visualization */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, marginBottom: '1rem' }}>
                    💵 {t('act60.estimatedSavings') || 'Estimated Tax Savings'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={savingsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    dataKey="value"
                                    label
                                    labelLine={false}
                                >
                                    {savingsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('act60.currentAnnualTax') || 'Current Annual Tax (37.5%)'}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>${estimatedSavings.currentTax.toLocaleString()}</div>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('act60.act60AnnualTax') || 'Act 60 Annual Tax (4%)'}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>${estimatedSavings.act60Tax.toLocaleString()}</div>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: 'rgba(0,150,255,0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('act60.savingsOver15Years') || '15-Year Cumulative Savings'}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>${estimatedSavings.over15Years.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Implementation Roadmap */}
            <div className="card">
                <h3 style={{ margin: 0, marginBottom: '1.5rem' }}>
                    🗺️ {t('act60.implementationRoadmap') || 'Implementation Roadmap'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {implementationSteps.map((step, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            gap: '1rem',
                            padding: '1rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            position: 'relative'
                        }}>
                            <div style={{
                                minWidth: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent-primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '1.25rem'
                            }}>
                                {step.phase}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{step.title}</span>
                                    <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '4px' }}>
                                        ⏱️ {step.duration}
                                    </span>
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {step.tasks.map((task, taskIdx) => (
                                        <li key={taskIdx} style={{ marginBottom: '0.25rem' }}>{task}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0,150,255,0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)', fontSize: '0.875rem' }}>
                    <strong>⚠️ {t('act60.disclaimer') || 'Important'}:</strong> {t('act60.disclaimerText') || 'This analysis is for informational purposes. Consult with qualified tax and legal professionals before making restructuring decisions.'}
                </div>
            </div>
        </div>
    )
}
