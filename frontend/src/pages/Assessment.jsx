import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Clock, Brain, Target, SkipForward, BookOpen } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { assessmentAPI, topicsAPI } from '../api/client';

const Assessment = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    // States: 'selection' | 'quiz' | 'result'
    const [step, setStep] = useState('selection');

    // Data
    const [allTopics, setAllTopics] = useState([]);
    const [selectedTopicIds, setSelectedTopicIds] = useState([]);
    const [questions, setQuestions] = useState([]);

    // Quiz State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fetch topics on mount
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const { data } = await topicsAPI.getAll();
                setAllTopics(data);
            } catch (err) {
                console.error("Failed to fetch topics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, []);

    const toggleTopic = (id) => {
        if (selectedTopicIds.includes(id)) {
            setSelectedTopicIds(selectedTopicIds.filter(tid => tid !== id));
        } else {
            setSelectedTopicIds([...selectedTopicIds, id]);
        }
    };

    const startAssessment = async () => {
        setLoading(true);
        try {
            // Fetch questions for selected topics
            // If no topics selected explicitly but user clicked "Start", we might either warn or select all. 
            // Design decision: If none selected, assume "General Knowledge" or ask to select. 
            // However, user prompt says "input of what all topics user know, for that topic take quiz". 
            // If they select nothing, maybe they know nothing -> Beginner flow.

            if (selectedTopicIds.length === 0) {
                // Treat as beginner/skip
                handleBeginner();
                return;
            }

            const { data } = await assessmentAPI.getDiagnostic(selectedTopicIds);
            setQuestions(data.questions);
            setStep('quiz');
        } catch (err) {
            console.error("Failed to fetch questions", err);
            // Fallback?
        } finally {
            setLoading(false);
        }
    };

    const handleBeginner = async () => {
        // Skip quiz, assume 0 knowledge
        // We could just submit empty answers to backend to generate a fresh roadmap
        setSubmitting(true);
        try {
            // Emulate a submission with no answers
            const { data } = await assessmentAPI.submit({});
            setResults(data);
            setStep('result');
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAnswer = (optionIndex) => {
        setAnswers({ ...answers, [questions[currentIndex].id]: optionIndex });
    };

    const handleSkipQuestion = () => {
        // Mark as skipped (conceptually, by not being in 'answers' or explictly null)
        // We just move to next. The backend interprets missing answer as 0 score for that question.
        handleNext();
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const { data } = await assessmentAPI.submit(answers);
            setResults(data);
            setStep('result');
        } catch (err) {
            console.error("Submission failed", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && step === 'selection') {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    // --- STEP 1: TOPIC SELECTION ---
    if (step === 'selection') {
        return (
            <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                >
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 className="grad-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                            Customize Your Assessment
                        </h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
                            Select the topics you're familiar with to tailor the diagnostic quiz.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '3rem'
                    }}>
                        {allTopics.map(topic => (
                            <motion.div
                                key={topic.id}
                                whileHover={{ scale: 1.02, translateY: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => toggleTopic(topic.id)}
                                style={{
                                    padding: '1.5rem',
                                    borderRadius: '1rem',
                                    background: selectedTopicIds.includes(topic.id)
                                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))'
                                        : 'var(--surface)',
                                    border: selectedTopicIds.includes(topic.id)
                                        ? '2px solid var(--primary)'
                                        : '1px solid var(--border)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{topic.name}</h3>
                                    {selectedTopicIds.includes(topic.id) && (
                                        <CheckCircle size={20} color="var(--primary)" />
                                    )}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>{topic.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            className="btn-ghost"
                            onClick={handleBeginner}
                            disabled={submitting}
                            style={{ color: 'var(--text-dim)' }}
                        >
                            <SkipForward size={18} style={{ marginRight: '0.5rem' }} />
                            Skip Quiz (Start from Basics)
                        </button>

                        <button
                            className="btn-primary"
                            onClick={startAssessment}
                            disabled={submitting}
                            style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
                        >
                            {selectedTopicIds.length === 0 ? "I'm a Beginner" : "Start Assessment"}
                            <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // --- STEP 2: QUIZ ---
    if (step === 'quiz') {
        const currentQuestion = questions[currentIndex];
        const progress = ((currentIndex + 1) / questions.length) * 100;

        return (
            <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Progress Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <span className="badge badge-primary">
                                <Target size={12} /> {currentQuestion?.topic}
                            </span>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                {currentQuestion?.difficulty}
                            </span>
                        </div>
                    </div>
                    <div className="progress-bar">
                        <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </motion.div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="glass-card"
                    >
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: 1.4 }}>
                            {currentQuestion?.text}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {currentQuestion?.options.map((option, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => handleAnswer(i)}
                                    style={{
                                        padding: '1.25rem',
                                        borderRadius: '1rem',
                                        border: answers[currentQuestion.id] === i
                                            ? '2px solid var(--primary)'
                                            : '1px solid var(--border)',
                                        background: answers[currentQuestion.id] === i
                                            ? 'rgba(139, 92, 246, 0.15)'
                                            : 'var(--surface)',
                                        color: 'var(--text)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                    }}
                                >
                                    <span style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: answers[currentQuestion.id] === i ? 'var(--primary)' : 'var(--surface-hover)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '0.875rem',
                                        color: answers[currentQuestion.id] === i ? 'white' : 'var(--text-dim)',
                                    }}>
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    <span style={{ fontWeight: 500 }}>{option}</span>
                                </motion.button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                onClick={handleSkipQuestion}
                                className="btn-ghost"
                                style={{ flex: 1, color: 'var(--text-dim)' }}
                            >
                                Skip Question
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={answers[currentQuestion?.id] === undefined && !submitting}
                                className="btn-primary"
                                style={{ flex: 2 }}
                            >
                                {submitting ? (
                                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                                ) : currentIndex === questions.length - 1 ? (
                                    <>Submit Assessment</>
                                ) : (
                                    <>Next Question <ArrowRight size={20} /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    // --- STEP 3: RESULTS ---
    if (step === 'result' && results) {
        return (
            <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ textAlign: 'center' }}
                >
                    <Brain size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        Assessment <span className="grad-text">Complete!</span>
                    </h1>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                        Your personalized roadmap has been generated
                    </p>

                    {/* Overall Score */}
                    <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        background: `conic-gradient(var(--primary) ${results.overallScore * 360}deg, var(--surface-hover) 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                    }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'var(--surface-solid)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                        }}>
                            <span style={{ fontSize: '2rem', fontWeight: 900 }}>{Math.round(results.overallScore * 100)}%</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Overall</span>
                        </div>
                    </div>

                    {/* Topic Breakdown */}
                    {results.topicMastery && results.topicMastery.length > 0 ? (
                        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Topic Mastery</h3>
                            {results.topicMastery.map((tm, i) => (
                                <div key={i} style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span>{tm.topic}</span>
                                        <span style={{
                                            color: tm.mastery > 0.6 ? 'var(--success)' : tm.mastery > 0.3 ? 'var(--warning)' : 'var(--error)',
                                            fontWeight: 700,
                                        }}>
                                            {tm.correct}/{tm.total} ({Math.round(tm.mastery * 100)}%)
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${tm.mastery * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ marginBottom: '2rem', color: 'var(--text-dim)' }}>
                            <p>No topics assessed. Starting fresh!</p>
                        </div>
                    )}

                    <button onClick={() => navigate('/roadmap')} className="btn-primary">
                        View Your Roadmap <ArrowRight size={20} />
                    </button>
                </motion.div>
            </div>
        );
    }

    return null;
};

export default Assessment;
