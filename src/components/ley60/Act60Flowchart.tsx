import { useLanguage } from '../../context/LanguageContext';

export default function Act60Flowchart() {
    const { t } = useLanguage();

    const steps = [
        { id: 1, title: t('act60.flow.step1'), desc: t('act60.flow.step1Desc'), icon: '📝' },
        { id: 2, title: t('act60.flow.step2'), desc: t('act60.flow.step2Desc'), icon: '🔍' },
        { id: 3, title: t('act60.flow.step3'), desc: t('act60.flow.step3Desc'), icon: '📜' },
        { id: 4, title: t('act60.flow.step4'), desc: t('act60.flow.step4Desc'), icon: '✅' },
    ];

    return (
        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                {t('act60.flow.title')}
            </h3>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                position: 'relative'
            }}>
                {/* Connecting Line (visual only for desktop) */}
                <div style={{
                    position: 'absolute',
                    top: '25px',
                    left: '10%',
                    right: '10%',
                    height: '2px',
                    background: 'var(--border-color)',
                    zIndex: 0,
                    display: window.innerWidth > 768 ? 'block' : 'none'
                }} />

                {steps.map((step) => (
                    <div key={step.id} style={{
                        flex: 1,
                        minWidth: '150px',
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-primary)',
                            border: '2px solid var(--accent-primary)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '1.5rem',
                            marginBottom: '0.5rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {step.icon}
                        </div>
                        <h4 style={{ fontSize: '1rem', margin: '0.25rem 0', color: 'var(--text-primary)' }}>
                            {step.title}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
