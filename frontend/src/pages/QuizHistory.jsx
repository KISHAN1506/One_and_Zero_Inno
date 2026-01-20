import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, ChevronRight, CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import api from '../api/client';

const QuizHistory = () => {
    const { user, loading: authLoading } = useUser();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        const fetchHistory = async () => {
            try {
                console.log('Fetching quiz history...');
                const { data } = await api.get('/assessment/history');
                console.log('Quiz history response:', data);
                setAttempts(data.attempts || []);
            } catch (err) {
                console.error('Failed to fetch quiz history:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchHistory();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading, navigate]);

    const viewDetail = async (attemptId) => {
        setDetailLoading(true);
        try {
            const { data } = await api.get(`/assessment/history/${attemptId}`);
            setSelectedAttempt(data);
        } catch (err) {
            console.error('Failed to fetch attempt detail:', err);
        } finally {
            setDetailLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="page-container">
            <motion.header
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="page-header"
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/dashboard" className="btn-secondary btn-small">
                        <ArrowLeft size={18} /> Back
                    </Link>
                    <div>
                        <h1>
                            <History size={32} style={{ marginRight: '0.75rem' }} />
                            Quiz History
                        </h1>
                        <p>Review your past assessments and detailed reports</p>
                    </div>
                </div>
            </motion.header>

            <div style={{ display: 'grid', gridTemplateColumns: selectedAttempt ? '350px 1fr' : '1fr', gap: '2rem' }}>
                {/* Attempts List */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                >
                    <h2 style={{ marginBottom: '1.5rem' }}>All Attempts ({attempts.length})</h2>
                    
                    {attempts.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)' }}>
                            No quiz attempts yet. Take an assessment to see your history!
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {attempts.map((attempt, i) => (
                                <motion.div
                                    key={attempt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => viewDetail(attempt.id)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '0.75rem',
                                        background: selectedAttempt?.id === attempt.id ? 'var(--primary-dim)' : 'var(--surface-hover)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        border: selectedAttempt?.id === attempt.id ? '1px solid var(--primary)' : '1px solid transparent'
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                            {attempt.quizType === 'diagnostic' ? 'Diagnostic Quiz' : 'Topic Quiz'}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                            <Clock size={12} />
                                            {new Date(attempt.createdAt).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ 
                                            padding: '0.25rem 0.75rem', 
                                            borderRadius: '99px', 
                                            background: attempt.overallScore >= 0.7 ? 'rgba(34, 197, 94, 0.2)' : attempt.overallScore >= 0.5 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: attempt.overallScore >= 0.7 ? 'var(--success)' : attempt.overallScore >= 0.5 ? 'var(--warning)' : 'var(--error)',
                                            fontWeight: 700,
                                            fontSize: '0.875rem'
                                        }}>
                                            {Math.round(attempt.overallScore * 100)}%
                                        </div>
                                        <ChevronRight size={16} style={{ color: 'var(--text-dim)' }} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>

                {/* Detail View */}
                {selectedAttempt && (
                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card"
                        style={{ maxHeight: '80vh', overflowY: 'auto' }}
                    >
                        {detailLoading ? (
                            <div className="spinner" />
                        ) : (
                            <>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h2>Quiz Report</h2>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                                        {new Date(selectedAttempt.createdAt).toLocaleDateString('en-US', {
                                            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {/* Score Summary */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '0.75rem' }}>
                                        <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
                                            {Math.round(selectedAttempt.overallScore * 100)}%
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Score</p>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '0.75rem' }}>
                                        <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success)' }}>
                                            {selectedAttempt.correctCount}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Correct</p>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '0.75rem' }}>
                                        <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--error)' }}>
                                            {selectedAttempt.incorrectCount}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Incorrect</p>
                                    </div>
                                </div>

                                {/* Incorrect Questions */}
                                {selectedAttempt.incorrectQuestions?.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ marginBottom: '1rem', color: 'var(--error)' }}>
                                            <XCircle size={20} style={{ marginRight: '0.5rem' }} />
                                            Questions to Review ({selectedAttempt.incorrectQuestions.length})
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {selectedAttempt.incorrectQuestions.map((q, i) => (
                                                <div key={i} style={{ 
                                                    padding: '1rem', 
                                                    background: 'rgba(239, 68, 68, 0.1)', 
                                                    borderRadius: '0.75rem',
                                                    borderLeft: '4px solid var(--error)'
                                                }}>
                                                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{q.question}</p>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--error)', marginBottom: '0.25rem' }}>
                                                        Your answer: {q.your_answer}
                                                    </p>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--success)' }}>
                                                        Correct answer: {q.correct_answer}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                                                        Topic: {q.topic}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Topic Breakdown */}
                                {selectedAttempt.topicMastery?.length > 0 && (
                                    <div>
                                        <h3 style={{ marginBottom: '1rem' }}>Topic Breakdown</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {selectedAttempt.topicMastery.map((t, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{t.topic}</p>
                                                        <div className="progress-bar">
                                                            <div 
                                                                className="progress-fill" 
                                                                style={{ 
                                                                    width: `${t.mastery * 100}%`,
                                                                    background: t.mastery >= 0.7 ? 'var(--success)' : t.mastery >= 0.5 ? 'var(--warning)' : 'var(--error)'
                                                                }} 
                                                            />
                                                        </div>
                                                    </div>
                                                    <span style={{ fontWeight: 700, minWidth: '50px', textAlign: 'right' }}>
                                                        {t.correct}/{t.total}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.section>
                )}
            </div>
        </div>
    );
};

export default QuizHistory;
