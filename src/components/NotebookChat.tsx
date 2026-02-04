import { useState } from 'react'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../context/LanguageContext';

// Detect if we're running in production (Netlify) or development (localhost)
const isProduction = window.location.hostname !== 'localhost';
const API_BASE_URL = isProduction
    ? '' // In production, use relative path (will be handled by Netlify redirect or show demo mode)
    : 'http://localhost:3001';

// NotebookLM public viewer link for NLTS-PR
const NOTEBOOKLM_CHAT_URL = 'https://notebooklm.google.com/notebook/3fd28c9e-4c8d-4521-816a-9b5c652cf944';

export default function NotebookChat() {
    const { t, language } = useLanguage();
    const [viewMode, setViewMode] = useState<'embedded' | 'fallback'>(isProduction ? 'embedded' : 'fallback');
    const [iframeError, setIframeError] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'system', content: isProduction
                ? (language === 'es'
                    ? '🤖 Conectando con el Asistente IA de NLTS-PR...'
                    : '🤖 Connecting to NLTS-PR AI Assistant...')
                : 'Connected to NLT-PR Operational Notebook. Ask me about inventory, contracts, or financials.'
        }
    ])
    const [input, setInput] = useState('')
    const [, setIsLoading] = useState(false)

    // Handle iframe load error 
    const handleIframeError = () => {
        setIframeError(true);
        setViewMode('fallback');
    };

    const handleSend = async () => {
        if (!input.trim()) return

        // In production demo mode with fallback, show a helpful message
        if (isProduction && viewMode === 'fallback') {
            const userMsg = { role: 'user', content: input };
            setMessages(prev => [...prev, userMsg]);
            setInput('');

            setTimeout(() => {
                const demoResponse = language === 'es'
                    ? `Para obtener respuestas en tiempo real, por favor use el botón "Abrir Asistente IA" arriba para acceder directamente al chat de NotebookLM.\n\n📞 (787) 555-1234\n📧 info@cparicardoaguirre.com`
                    : `To get real-time responses, please use the "Open AI Assistant" button above to access NotebookLM chat directly.\n\n📞 (787) 555-1234\n📧 info@cparicardoaguirre.com`;

                setMessages(prev => [...prev, {
                    role: 'system',
                    content: demoResponse
                }]);
            }, 500);
            return;
        }

        const newMsg = { role: 'user', content: input }
        setMessages(prev => [...prev, newMsg])
        setInput('')
        setIsLoading(true)

        try {
            // Add language instruction to ensure response is in the selected language
            const langInstruction = language === 'es'
                ? '[Responde en español] '
                : '[Respond in English] ';

            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: langInstruction + input })
            });

            const data = await response.json();

            // Extract the raw content first
            const rawContent = data.content || data.answer || data.response || "No response content";

            // If the content itself is a JSON string (nested JSON), try to parse it
            let answerText = rawContent;
            if (typeof rawContent === 'string' && (rawContent.trim().startsWith('{') || rawContent.trim().startsWith('['))) {
                try {
                    const parsed = JSON.parse(rawContent);
                    if (parsed.answer) {
                        answerText = parsed.answer;
                    } else if (parsed.content) {
                        answerText = parsed.content;
                    } else {
                        answerText = parsed.answer || parsed.message || rawContent;
                    }
                } catch {
                    // Not valid JSON, ignore
                }
            }

            setMessages(prev => [...prev, {
                role: 'system',
                content: answerText
            }]);
        } catch (error) {
            console.error('Error fetching chat response:', error);
            const errorMsg = language === 'es'
                ? '⚠️ No se pudo conectar al servidor. Verifique que el servidor backend esté ejecutándose (`npm run server` en la carpeta del servidor).'
                : "⚠️ Could not connect to server. Please ensure the backend server is running (`npm run server` in the server folder).";
            setMessages(prev => [...prev, {
                role: 'system',
                content: errorMsg
            }]);
        } finally {
            setIsLoading(false)
        }
    }

    // Render the embedded NotebookLM view (for production)
    const renderEmbeddedView = () => (
        <div className="card" style={{ height: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Header with controls */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🤖</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1rem' }}>
                            {language === 'es' ? 'Asistente IA de NLTS-PR' : 'NLTS-PR AI Assistant'}
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {language === 'es' ? 'Powered by Google NotebookLM' : 'Powered by Google NotebookLM'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => window.open(NOTEBOOKLM_CHAT_URL, '_blank')}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                    >
                        {language === 'es' ? '↗ Abrir en Nueva Pestaña' : '↗ Open in New Tab'}
                    </button>
                </div>
            </div>

            {/* Embedded iframe or fallback */}
            {iframeError ? (
                // Fallback: Nice card with link
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2rem',
                    textAlign: 'center',
                    gap: '1.5rem'
                }}>
                    <div style={{
                        fontSize: '4rem',
                        background: 'linear-gradient(135deg, #4285f4, #34a853, #fbbc05, #ea4335)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>🧠</div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
                        {language === 'es'
                            ? 'Accede al Asistente IA de NLTS-PR'
                            : 'Access NLTS-PR AI Assistant'}
                    </h3>
                    <p style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        maxWidth: '500px',
                        lineHeight: '1.6'
                    }}>
                        {language === 'es'
                            ? 'El chat de NotebookLM te permite hacer preguntas sobre los estados financieros, inventario, contratos y operaciones de NLTS-PR. Por razones de seguridad, debes abrirlo en una nueva pestaña.'
                            : 'The NotebookLM chat allows you to ask questions about NLTS-PR financial statements, inventory, contracts, and operations. For security reasons, you need to open it in a new tab.'}
                    </p>
                    <button
                        onClick={() => window.open(NOTEBOOKLM_CHAT_URL, '_blank')}
                        className="btn btn-primary"
                        style={{
                            fontSize: '1.1rem',
                            padding: '1rem 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>🚀</span>
                        {language === 'es' ? 'Abrir Asistente IA' : 'Open AI Assistant'}
                    </button>
                    <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        margin: 0
                    }}>
                        {language === 'es'
                            ? '(Se abrirá NotebookLM en una nueva pestaña)'
                            : '(NotebookLM will open in a new tab)'}
                    </p>
                </div>
            ) : (
                // Try to embed the iframe
                <iframe
                    src={NOTEBOOKLM_CHAT_URL}
                    title="NLTS-PR AI Assistant"
                    style={{
                        flex: 1,
                        width: '100%',
                        border: 'none',
                        backgroundColor: 'white'
                    }}
                    onError={handleIframeError}
                    onLoad={(e) => {
                        // Check if iframe loaded correctly - if blocked, show fallback
                        try {
                            const iframe = e.target as HTMLIFrameElement;
                            // If we can't access contentWindow, it might be blocked
                            if (!iframe.contentWindow || !iframe.contentDocument) {
                                handleIframeError();
                            }
                        } catch {
                            // Cross-origin error means it loaded but we can't access it - that's OK
                            // The iframe should work, just can't check its contents
                        }
                    }}
                    allow="clipboard-write; clipboard-read"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                />
            )}
        </div>
    );

    // Render the local chat view (for development)
    const renderLocalChatView = () => (
        <div className="card" style={{ height: '70vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <h2 style={{ margin: 0, fontSize: '1rem' }}>{t('chat.title')}</h2>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                        borderBottomLeftRadius: msg.role === 'system' ? '2px' : '12px',
                        // Markdown styles
                        overflowWrap: 'break-word'
                    }}>
                        <div className="markdown-body">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('chat.placeholder')}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'white',
                        outline: 'none'
                    }}
                />
                <button onClick={handleSend} className="btn btn-primary">{t('chat.send')}</button>
            </div>
        </div>
    );

    // In production, try to show embedded NotebookLM first
    // In development, show the local chat interface
    if (isProduction) {
        return renderEmbeddedView();
    }

    return renderLocalChatView();
}
