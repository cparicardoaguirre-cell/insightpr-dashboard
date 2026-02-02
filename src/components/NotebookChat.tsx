import { useState } from 'react'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../context/LanguageContext';

// Detect if we're running in production (Netlify) or development (localhost)
const isProduction = window.location.hostname !== 'localhost';
const API_BASE_URL = isProduction
    ? '' // In production, use relative path (will be handled by Netlify redirect or show demo mode)
    : 'http://localhost:3001';

export default function NotebookChat() {
    const { t, language } = useLanguage();
    const [messages, setMessages] = useState([
        {
            role: 'system', content: isProduction
                ? (language === 'es'
                    ? '🤖 Modo Demo - Para análisis en tiempo real, contacte a CPA Ricardo Aguirre para acceso completo al sistema.'
                    : '🤖 Demo Mode - For live analysis, contact CPA Ricardo Aguirre for full system access.')
                : 'Connected to NLT-PR Operational Notebook. Ask me about inventory, contracts, or financials.'
        }
    ])
    const [input, setInput] = useState('')
    const [, setIsLoading] = useState(false)

    const handleSend = async () => {
        if (!input.trim()) return

        // In production demo mode, show a helpful message
        if (isProduction) {
            const userMsg = { role: 'user', content: input };
            setMessages(prev => [...prev, userMsg]);
            setInput('');

            setTimeout(() => {
                const demoResponse = language === 'es'
                    ? `Esta es una versión de demostración. Para obtener análisis en tiempo real de sus estados financieros, datos de inventario y respuestas personalizadas, por favor contacte a CPA Ricardo Aguirre para configurar su acceso completo al sistema InsightPR.\n\n📞 (787) 555-1234\n📧 info@cparicardoaguirre.com`
                    : `This is a demo version. To get real-time analysis of your financial statements, inventory data, and personalized responses, please contact CPA Ricardo Aguirre to set up your full InsightPR system access.\n\n📞 (787) 555-1234\n📧 info@cparicardoaguirre.com`;

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


    return (
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
    )
}
