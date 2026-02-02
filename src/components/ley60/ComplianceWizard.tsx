import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function ComplianceWizard() {
    const { t } = useLanguage();
    const [step, setStep] = useState(0); // 0 = start, 1..3 = questions, 4 = result
    const [answers, setAnswers] = useState<boolean[]>([]);

    const questions = [
        { id: 'q1', text: t('act60.wizard.q1') },
        { id: 'q2', text: t('act60.wizard.q2') },
        { id: 'q3', text: t('act60.wizard.q3') }
    ];

    const handleAnswer = (answer: boolean) => {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        if (newAnswers.length < questions.length) {
            setStep(step + 1);
        } else {
            setStep(4); // Finished
        }
    };

    const resetWizard = () => {
        setStep(0);
        setAnswers([]);
    };

    const isEligible = answers.every(a => a === true);

    return (
        <div className="card" style={{
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
            border: '1px solid var(--accent-primary)',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
        }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                ✨ {t('act60.wizard.title')}
            </h3>

            {step === 0 && (
                <div>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                        {t('act60.wizard.q1')}.. {t('misc.more')}
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setStep(1)}
                        style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
                    >
                        {t('act60.wizard.btn.start')} 👉
                    </button>
                </div>
            )}

            {step > 0 && step <= questions.length && (
                <div className="animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Question {step} / {questions.length}
                    </div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                        {questions[step - 1].text}
                    </h4>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleAnswer(true)}
                            style={{ flex: 1 }}
                        >
                            {t('act60.wizard.btn.yes')}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleAnswer(false)}
                            style={{ flex: 1 }}
                        >
                            {t('act60.wizard.btn.no')}
                        </button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="animate-fade-in">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                        {isEligible ? '🎉' : '🤔'}
                    </div>
                    <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                        {isEligible ? t('act60.wizard.result.eligible') : t('act60.wizard.result.review')}
                    </h4>
                    <button
                        className="btn btn-secondary"
                        onClick={resetWizard}
                        style={{ marginTop: '1rem' }}
                    >
                        ↻ Start Over
                    </button>
                </div>
            )}
        </div>
    );
}
