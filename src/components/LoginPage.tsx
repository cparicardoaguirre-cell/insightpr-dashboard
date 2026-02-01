import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { language } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const success = login(username, password);

        if (!success) {
            setError(language === 'es'
                ? 'Usuario o contraseña incorrectos'
                : 'Invalid username or password');
        }

        setIsLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src="/cpa-logo.png" alt="CPA Ricardo Aguirre" className="login-logo" />
                    <h1 className="login-title">
                        <span className="login-title-main">NLT-PR</span>
                        <span className="login-title-sub">Insight</span>
                    </h1>
                    <p className="login-subtitle">
                        {language === 'es'
                            ? 'Panel de Análisis Financiero'
                            : 'Financial Analysis Dashboard'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">
                            {language === 'es' ? 'Usuario' : 'Username'}
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={language === 'es' ? 'Ingrese usuario' : 'Enter username'}
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            {language === 'es' ? 'Contraseña' : 'Password'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={language === 'es' ? 'Ingrese contraseña' : 'Enter password'}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? (language === 'es' ? 'Iniciando...' : 'Signing in...')
                            : (language === 'es' ? 'Iniciar Sesión' : 'Sign In')}
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2026 CPA Ricardo Aguirre</p>
                    <a href="https://cparicardoaguirre.org" target="_blank" rel="noopener noreferrer">
                        cparicardoaguirre.org
                    </a>
                </div>
            </div>
        </div>
    );
}
