import { useLanguage } from '../context/LanguageContext'

export default function Overview() {
    const { t } = useLanguage()

    const stats = [
        { titleKey: 'overview.documents', value: '12', change: 'Synced', color: 'accent-primary' },
        { titleKey: 'overview.compliance', value: '92%', change: '+4%', color: 'text-primary' }
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div className="grid-cols-3">
                {stats.map((stat, i) => (
                    <div key={i} className="card">
                        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {t(stat.titleKey)}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{stat.value}</span>
                            <span style={{ fontSize: '0.875rem', color: `var(--${stat.color})` }}>{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid-cols-2">
                <div className="card">
                    <h2>{t('overview.recentActivity')}</h2>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <ActivityItem time="2h ago" text="Updated Depreciation Schedule" />
                        <ActivityItem time="5h ago" text="Synced Inventory List to NotebookLM" />
                        <ActivityItem time="1d ago" text="Generated Financial Report" />
                    </ul>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.1) 100%)' }}>
                    <h2>{t('overview.quickActions')}</h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => alert('Syncing inventory with NotebookLM...')}>↻ {t('overview.syncData')}</button>
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('overview.notebookConnection')}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399' }}></div>
                            <span style={{ fontSize: '0.875rem' }}>{t('overview.connectedMCP')}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

function ActivityItem({ time, text }: { time: string, text: string }) {
    return (
        <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '60px' }}>{time}</span>
            <span style={{ fontSize: '0.875rem' }}>{text}</span>
        </li>
    )
}
