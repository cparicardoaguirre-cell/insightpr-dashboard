import { useLanguage } from '../context/LanguageContext'

export default function IndustryAnalysis() {
    const { t, language } = useLanguage()

    const naicsData = {
        code: '532490',
        subCode: '532412-05',
        title: t('industry.naicsTitle') || 'Commercial and Industrial Machinery and Equipment Rental',
        subTitle: t('industry.naicsSubtitle') || 'Fork Lifts - Renting',
        sector: t('industry.sector') || 'Real Estate and Rental and Leasing',
        marketSize: '$5.39B',
        marketGrowth: '6.2%',
        year: '2025'
    }

    const marketStats = [
        {
            label: t('industry.globalMarket') || 'Global Forklift Rental Market',
            value: '$5.39B',
            growth: '+6.2% CAGR',
            icon: '🏭'
        },
        {
            label: t('industry.materialHandling') || 'Material Handling Equipment Rental',
            value: '$32.9B',
            growth: '+3.1% YoY',
            icon: '📦'
        },
        {
            label: t('industry.prManufacturing') || 'PR Manufacturing Share of GDP',
            value: '44.2%',
            growth: '+1.2% avg',
            icon: '🇵🇷'
        }
    ]

    const challenges = [
        {
            icon: '⚡',
            title: t('industry.challenge1Title') || 'Energy Infrastructure',
            description: t('industry.challenge1Desc') || 'Puerto Rico\'s fragile power grid and PREPA bankruptcy create operational uncertainty and higher costs.'
        },
        {
            icon: '🔌',
            title: t('industry.challenge2Title') || 'Electrification Mandates',
            description: t('industry.challenge2Desc') || 'CARB 2026 regulations phasing out propane/gas forklifts signal nationwide trend toward electric equipment.'
        },
        {
            icon: '📋',
            title: t('industry.challenge3Title') || 'OSHA 2025 Compliance',
            description: t('industry.challenge3Desc') || 'Stricter documentation for equipment modifications, enhanced training records, and digital reporting requirements.'
        },
        {
            icon: '🌀',
            title: t('industry.challenge4Title') || 'Climate Resilience',
            description: t('industry.challenge4Desc') || 'Hurricane exposure requires robust contingency planning and equipment protection strategies.'
        }
    ]

    const opportunities = [
        {
            icon: '💰',
            title: t('industry.opp1Title') || 'Act 60 Tax Incentives',
            description: t('industry.opp1Desc') || '4% fixed income tax rate and 75% property tax exemption available for qualifying businesses.'
        },
        {
            icon: '📈',
            title: t('industry.opp2Title') || '$2.2B New Investments',
            description: t('industry.opp2Desc') || 'Major pharmaceutical and manufacturing investments announced, creating demand for equipment rental.'
        },
        {
            icon: '🔋',
            title: t('industry.opp3Title') || 'Electric Fleet Transition',
            description: t('industry.opp3Desc') || 'First-mover advantage in lithium-ion forklift rental as industry transitions from propane.'
        },
        {
            icon: '🤝',
            title: t('industry.opp4Title') || 'Service Differentiation',
            description: t('industry.opp4Desc') || 'Bundled maintenance, training, and compliance services create competitive advantage.'
        }
    ]

    const recommendations = [
        {
            priority: 'high',
            title: t('industry.rec1Title') || 'Evaluate Act 60 Restructuring',
            description: t('industry.rec1Desc') || 'Consult with tax advisors to determine eligibility for Act 60 manufacturing incentives and potential tax savings.',
            timeline: '1-3 months'
        },
        {
            priority: 'high',
            title: t('industry.rec2Title') || 'Develop Electric Fleet Strategy',
            description: t('industry.rec2Desc') || 'Begin transitioning rental fleet to electric forklifts to prepare for regulatory changes and market demands.',
            timeline: '6-18 months'
        },
        {
            priority: 'medium',
            title: t('industry.rec3Title') || 'Strengthen Training Programs',
            description: t('industry.rec3Desc') || 'Enhance operator certification and OSHA compliance tracking to meet 2025 enhanced documentation requirements.',
            timeline: '3-6 months'
        },
        {
            priority: 'medium',
            title: t('industry.rec4Title') || 'Pursue Manufacturer Partnerships',
            description: t('industry.rec4Desc') || 'Establish stronger relationships with Toyota, Hyster, and electric equipment manufacturers for preferential terms.',
            timeline: '6-12 months'
        }
    ]

    const legislationUpdates = [
        {
            jurisdiction: 'Federal',
            law: 'OSHA 29 CFR 1910.178',
            status: t('industry.statusActive') || 'Active',
            statusColor: 'green',
            impact: t('industry.oshaImpact') || 'Stricter equipment modification documentation and enhanced training records required for 2025.'
        },
        {
            jurisdiction: 'California',
            law: 'CARB Zero-Emission Forklift',
            status: t('industry.statusPending') || 'Effective 2026',
            statusColor: 'yellow',
            impact: t('industry.carbImpact') || 'Phase-out of propane/gas forklifts starting Jan 2026. Signals likely federal trend.'
        },
        {
            jurisdiction: 'Puerto Rico',
            law: 'Act 60-2019',
            status: t('industry.statusActive') || 'Active',
            statusColor: 'green',
            impact: t('industry.act60Impact') || '4% income tax, 75% property tax exemption for qualifying manufacturing businesses.'
        }
    ]

    // Glossary terms for client education
    const glossaryTerms = [
        {
            term: 'NAICS',
            definition: language === 'es'
                ? 'Sistema de Clasificación Industrial de Norteamérica - código estándar que identifica su tipo de negocio para propósitos tributarios y estadísticos.'
                : 'North American Industry Classification System - the standard code identifying your business type for tax and statistical purposes.'
        },
        {
            term: 'CAGR',
            definition: language === 'es'
                ? 'Tasa de Crecimiento Anual Compuesta - la tasa de crecimiento promedio anual durante un período de tiempo.'
                : 'Compound Annual Growth Rate - the average annual growth rate over a period of time.'
        },
        {
            term: 'Act 60',
            definition: language === 'es'
                ? 'Código de Incentivos de Puerto Rico - ofrece beneficios tributarios significativos a negocios que cualifiquen.'
                : 'Puerto Rico Incentives Code - offers significant tax benefits to qualifying businesses.'
        },
        {
            term: 'OSHA',
            definition: language === 'es'
                ? 'Administración de Seguridad y Salud Ocupacional - regula estándares de seguridad en el lugar de trabajo.'
                : 'Occupational Safety and Health Administration - regulates workplace safety standards.'
        },
        {
            term: 'CARB',
            definition: language === 'es'
                ? 'Junta de Recursos del Aire de California - establece estándares de emisiones que a menudo se convierten en tendencias nacionales.'
                : 'California Air Resources Board - sets emissions standards that often become national trends.'
        },
        {
            term: 'YoY',
            definition: language === 'es'
                ? 'Año contra Año - comparación de métricas entre el mismo período en años diferentes.'
                : 'Year over Year - comparison of metrics between the same period in different years.'
        }
    ]

    // Checklist items for client preparation
    const checklistItems = language === 'es' ? [
        'Revisar su clasificación NAICS actual y confirmar precisión',
        'Evaluar elegibilidad para incentivos de Acta 60',
        'Auditar cumplimiento con OSHA para documentación de equipos',
        'Desarrollar plan de contingencia para interrupciones de energía',
        'Investigar opciones de flota de montacargas eléctricos',
        'Programar revisión de estrategia con su CPA'
    ] : [
        'Review your current NAICS classification and confirm accuracy',
        'Evaluate eligibility for Act 60 incentives',
        'Audit OSHA compliance for equipment documentation',
        'Develop contingency plan for power outages',
        'Research electric forklift fleet options',
        'Schedule strategy review with your CPA'
    ]

    return (
        <div className="industry-analysis">
            {/* Educational Introduction Banner - NEW */}
            <div className="industry-intro-banner">
                <h3 className="industry-intro-title">
                    📚 {language === 'es' ? '¿Por Qué Este Análisis es Importante Para Usted?' : 'Why This Analysis Matters For You'}
                </h3>
                <p className="industry-intro-text">
                    {language === 'es'
                        ? 'Este análisis de industria le ayuda a entender su posición competitiva, identificar oportunidades de ahorro tributario, y prepararse para cambios regulatorios que podrían afectar su negocio. Revise cada sección con su asesor para desarrollar estrategias proactivas.'
                        : 'This industry analysis helps you understand your competitive position, identify tax-saving opportunities, and prepare for regulatory changes that could impact your business. Review each section with your advisor to develop proactive strategies.'
                    }
                </p>

                {/* Client Checklist */}
                <ul className="industry-checklist">
                    {checklistItems.map((item, idx) => (
                        <li key={idx} className="industry-checklist-item">
                            <span className="industry-checklist-icon">✓</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Glossary Section - NEW */}
            <div className="industry-glossary">
                <h4 className="industry-glossary-title">
                    📖 {language === 'es' ? 'Términos Clave' : 'Key Terms'}
                </h4>
                <div className="industry-glossary-grid">
                    {glossaryTerms.map((item, idx) => (
                        <div key={idx} className="industry-glossary-item">
                            <div className="industry-glossary-term">{item.term}</div>
                            <div className="industry-glossary-def">{item.definition}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* NAICS Classification Header */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>
                            🏢 {t('industry.title') || 'Industry Analysis'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            {t('industry.subtitle') || 'NAICS Classification & Market Overview'}
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            NAICS Code
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                            {naicsData.code}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            ({naicsData.subCode})
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0,150,255,0.1)', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{naicsData.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {t('industry.description') || 'Establishments primarily engaged in renting or leasing commercial-type and industrial-type machinery and equipment, including material handling machinery, industrial trucks, and forklifts.'}
                    </div>
                </div>
            </div>

            {/* Market Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {marketStats.map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.8rem', color: '#22c55e', marginBottom: '0.25rem' }}>{stat.growth}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Challenges & Opportunities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Challenges */}
                <div className="card">
                    <h3 style={{ margin: 0, marginBottom: '1rem', color: '#f59e0b' }}>
                        ⚠️ {t('industry.challengesTitle') || 'Current Challenges'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {challenges.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'rgba(255,180,0,0.1)', borderRadius: '8px' }}>
                                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Opportunities */}
                <div className="card">
                    <h3 style={{ margin: 0, marginBottom: '1rem', color: '#22c55e' }}>
                        ✅ {t('industry.opportunitiesTitle') || 'Growth Opportunities'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {opportunities.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'rgba(0,200,100,0.1)', borderRadius: '8px' }}>
                                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legislation Updates */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, marginBottom: '1rem' }}>
                    📜 {t('industry.legislationTitle') || 'Regulatory & Legislative Updates'}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem' }}>{t('industry.jurisdiction') || 'Jurisdiction'}</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem' }}>{t('industry.lawRegulation') || 'Law/Regulation'}</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem' }}>{t('industry.status') || 'Status'}</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem' }}>{t('industry.impactRelevance') || 'Impact & Relevance'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {legislationUpdates.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{item.jurisdiction}</td>
                                    <td style={{ padding: '0.75rem' }}>{item.law}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <span className={`status-badge status-${item.statusColor}`}>{item.status}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.8rem' }}>{item.impact}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="card">
                <h3 style={{ margin: 0, marginBottom: '1rem' }}>
                    💡 {t('industry.recommendationsTitle') || 'Strategic Recommendations'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recommendations.map((rec, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            gap: '1rem',
                            padding: '1rem',
                            backgroundColor: rec.priority === 'high' ? 'rgba(0,150,255,0.1)' : 'var(--bg-secondary)',
                            borderRadius: '8px',
                            borderLeft: rec.priority === 'high' ? '4px solid var(--accent-primary)' : '4px solid var(--border-color)'
                        }}>
                            <div style={{
                                minWidth: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: rec.priority === 'high' ? 'var(--accent-primary)' : 'var(--bg-card)',
                                color: rec.priority === 'high' ? 'white' : 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700
                            }}>
                                {idx + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: 600 }}>{rec.title}</span>
                                    <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                        {rec.timeline}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{rec.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Callout - NEW */}
            <div className="industry-action-callout">
                <h4 className="industry-action-title">
                    📞 {language === 'es' ? 'Próximos Pasos' : 'Next Steps'}
                </h4>
                <p className="industry-action-text">
                    {language === 'es'
                        ? 'Para discutir cómo estas tendencias de la industria afectan específicamente su negocio y desarrollar un plan de acción personalizado, comuníquese con su asesor de NLT-PR. Estamos aquí para ayudarle a navegar estos cambios y capitalizar las oportunidades disponibles.'
                        : 'To discuss how these industry trends specifically affect your business and develop a customized action plan, contact your NLT-PR advisor. We\'re here to help you navigate these changes and capitalize on available opportunities.'
                    }
                </p>
            </div>
        </div>
    )
}
