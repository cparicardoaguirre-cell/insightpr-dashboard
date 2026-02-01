import { useState } from 'react'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../context/LanguageContext';

export default function NotebookChat() {
    const { t, language } = useLanguage();
    const [messages, setMessages] = useState([
        { role: 'system', content: 'Connected to NLT-PR Operational Notebook. Ask me about inventory, contracts, or financials.' }
    ])
    const [input, setInput] = useState('')

    const handleSend = async () => {
        if (!input.trim()) return
        const newMsg = { role: 'user', content: input }
        setMessages(prev => [...prev, newMsg])
        setInput('')

        try {
            // Add language instruction to ensure response is in the selected language
            const langInstruction = language === 'es'
                ? '[Responde en español] '
                : '[Respond in English] ';

            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: langInstruction + input })
            });

            const data = await response.json();

            // Extract the raw content first
            let rawContent = data.content || data.answer || data.response || "No response content";

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
                        // It was JSON but didn't have a clear answer field, keep it parsed or string? 
                        // If it's complex, maybe just show the text, OR if it has 'answer' use it.
                        // Let's assume if it has 'status' and 'answer' (like the user saw), we want 'answer'.
                        answerText = parsed.answer || parsed.message || rawContent;
                    }
                } catch (e) {
                    // Not valid JSON, ignore
                }
            }

            setMessages(prev => [...prev, {
                role: 'system',
                content: answerText
            }]);
        } catch (error) {
            console.error('Error fetching chat response:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: "Error connecting to backend server. Ensure 'npm run server' is running."
            }]);
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
