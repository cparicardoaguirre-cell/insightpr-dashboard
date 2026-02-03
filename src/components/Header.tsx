import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

interface HeaderProps {
    activeTab: string
    setActiveTab: (tab: string) => void
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
    const { language, setLanguage, t } = useLanguage()
    const { logout, user } = useAuth()


    const isProduction = window.location.hostname !== 'localhost';

    const navItems = [
        { id: 'overview', labelKey: 'nav.dashboard' },
        { id: 'financials', labelKey: 'nav.financials' },
        { id: 'statements', labelKey: 'statements.title' }, // New Tab
        { id: 'industry', labelKey: 'nav.industry' },
        { id: 'act60', labelKey: 'nav.act60' },
        { id: 'compliance', labelKey: 'nav.compliance' },
        { id: 'chat', labelKey: 'nav.chat' }
    ].filter(item => {
        // Hide Chat in production
        if (isProduction && item.id === 'chat') return false;
        return true;
    });

    return (
        <header className="header">
            <div className="flex items-center gap-4">
                <img
                    src="/cpa-logo.png"
                    alt="CPA Ricardo Aguirre"
                    style={{ height: '45px', marginRight: '12px' }}
                />
                <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--accent-primary)' }}>
                    {t('header.title')} <span style={{ color: 'var(--text-primary)' }}>{t('header.subtitle')}</span>
                </h1>
            </div>

            <nav style={{ display: 'flex', gap: '1rem' }}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`btn ${activeTab === item.id ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ borderRadius: '20px' }}
                    >
                        {t(item.labelKey)}
                    </button>
                ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Language Selector */}
                <div
                    className="language-selector"
                    style={{
                        display: 'flex',
                        gap: '4px',
                        padding: '4px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    <button
                        onClick={() => setLanguage('en')}
                        className={language === 'en' ? 'lang-active' : 'lang-inactive'}
                        style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            backgroundColor: language === 'en' ? 'var(--accent-primary)' : 'transparent',
                            color: language === 'en' ? 'white' : 'var(--text-secondary)'
                        }}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => setLanguage('es')}
                        className={language === 'es' ? 'lang-active' : 'lang-inactive'}
                        style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            backgroundColor: language === 'es' ? 'var(--accent-primary)' : 'transparent',
                            color: language === 'es' ? 'white' : 'var(--text-secondary)'
                        }}
                    >
                        ES
                    </button>
                </div>

                <div className="status-badge status-green">
                    {t('status.active')}
                </div>

                {user && (
                    <button
                        onClick={logout}
                        className="btn btn-secondary logout-btn"
                        title={language === 'es' ? 'Cerrar sesión' : 'Sign out'}
                    >
                        👤 {user} ⏻
                    </button>
                )}
            </div>
        </header>
    )
}
