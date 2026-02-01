import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
    const { language } = useLanguage()
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-branding">
                    <img
                        src="/cpa-logo.png"
                        alt="CPA Ricardo Aguirre"
                        className="footer-logo"
                    />
                    <div className="footer-company">
                        <span className="footer-company-name">CPA Ricardo Aguirre</span>
                        <span className="footer-tagline">Accounting & Advisory</span>
                    </div>
                </div>

                <div className="footer-info">
                    <p className="footer-copyright">
                        © {currentYear} CPA Ricardo Aguirre. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
                    </p>
                    <p className="footer-tagline-small">
                        {language === 'es'
                            ? 'Soluciones financieras con integridad y excelencia'
                            : 'Financial solutions with integrity and excellence'}
                    </p>
                </div>

                <div className="footer-contact">
                    <a href="https://cparicardoaguirre.org" target="_blank" rel="noopener noreferrer" className="footer-link">
                        🌐 {language === 'es' ? 'Sitio Web' : 'Website'}
                    </a>
                    <span className="footer-separator">|</span>
                    <span className="footer-location">
                        📍 Puerto Rico
                    </span>
                </div>
            </div>
        </footer>
    )
}
