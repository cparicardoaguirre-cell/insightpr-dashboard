import { useLanguage } from '../../context/LanguageContext';

export default function Act60OrgChart() {
    const { t } = useLanguage();

    const boxStyle: React.CSSProperties = {
        padding: '1rem',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        textAlign: 'center',
        minWidth: '180px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        marginBottom: '0.25rem'
    };

    const valueStyle: React.CSSProperties = {
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--text-primary)'
    };

    const rateStyle: React.CSSProperties = {
        display: 'inline-block',
        marginTop: '0.5rem',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
    };

    return (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {t('act60.org.title')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

                {/* Level 1: Owner */}
                <div style={boxStyle}>
                    <span style={labelStyle}>{t('act60.org.owner')}</span>
                    <div style={valueStyle}>Individual (Bona Fide Resident)</div>
                    <span style={{ ...rateStyle, backgroundColor: '#e6fffa', color: '#047857' }}>0% {t('act60.org.taxRate')}</span>
                </div>

                {/* Arrow */}
                <div style={{ height: '20px', borderLeft: '2px dashed var(--border-color)' }} />

                {/* Level 2: Holding */}
                <div style={boxStyle}>
                    <span style={labelStyle}>{t('act60.org.holding')}</span>
                    <div style={valueStyle}>PR Holding LLC</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('act60.org.flow')}</span>
                </div>

                {/* Arrow Split */}
                <div style={{ position: 'relative', width: '200px', height: '20px' }}>
                    <div style={{
                        position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '2px dashed var(--border-color)'
                    }} />
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, borderTop: '2px dashed var(--border-color)'
                    }} />
                </div>

                {/* Level 3: Entities */}
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>

                    {/* Entity A: US Source */}
                    <div style={{ ...boxStyle, backgroundColor: 'var(--bg-primary)' }}>
                        <span style={labelStyle}>{t('act60.org.usSource')}</span>
                        <div style={valueStyle}>US LLC / Corp</div>
                        <span style={{ ...rateStyle, backgroundColor: '#fff1f2', color: '#be123c' }}>21%+ {t('act60.org.taxRate')}</span>
                    </div>

                    {/* Entity B: Act 60 */}
                    <div style={{ ...boxStyle, backgroundColor: 'var(--bg-primary)', border: '2px solid var(--accent-primary)' }}>
                        <span style={labelStyle}>{t('act60.org.prEntity')}</span>
                        <div style={valueStyle}>{t('act60.org.service')}</div>
                        <span style={{ ...rateStyle, backgroundColor: '#e6fffa', color: '#047857' }}>4% {t('act60.org.taxRate')}</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
