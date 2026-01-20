import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, SkipForward, AlertCircle, Brain, Target, BookOpen } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { assessmentAPI, topicsAPI } from '../api/client';

const Assessment = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    // Quiz State
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [skippedQuestions, setSkippedQuestions] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const useQuery = () => new URLSearchParams(window.location.search);
    const query = useQuery();
    const topicIdParam = query.get('topic');
    const isReassessMode = query.get('mode') === 'reassess';

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                if (isReassessMode) {
                    const { data } = await assessmentAPI.getReassess();
                    setQuestions(data.questions || []);
                } else {
                    // Check if specific topics were selected
                    const selectedTopics = localStorage.getItem('selectedTopics');
                    let userSelectedTopics = null;

                    if (topicIdParam) {
                        userSelectedTopics = [parseInt(topicIdParam)];
                    } else if (selectedTopics) {
                        userSelectedTopics = JSON.parse(selectedTopics);
                    }

                    const { data } = await assessmentAPI.getDiagnostic(userSelectedTopics);
                    setQuestions(data.questions || []);
                }
            } catch (err) {
                // Fallback questions
                setQuestions([
                    { id: 1, topic_id: 1, topic: 'Arrays & Strings', text: 'What is the time complexity of accessing an array by index?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 0, difficulty: 'easy' },
                    { id: 2, topic_id: 1, topic: 'Arrays & Strings', text: 'Two Pointers technique is best for?', options: ['Unsorted arrays', 'Sorted arrays', 'Linked lists', 'Trees'], correct: 1, difficulty: 'medium' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, [topicIdParam, isReassessMode]);

    const handleAnswer = (optionIndex) => {
        setAnswers({ ...answers, [questions[currentIndex].id]: optionIndex });
    };

    const handleSkipQuestion = () => {
        const currentId = questions[currentIndex].id;
        if (!skippedQuestions.includes(currentId)) {
            setSkippedQuestions([...skippedQuestions, currentId]);
        }
        handleNext();
    };

    const handleSkipEntireQuiz = () => {
        localStorage.setItem('skippedQuiz', 'true');
        navigate('/roadmap');
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
            // For reassess mode, we calculate locally first to determine success immediatey
            let calculatedResults = null;

            if (isReassessMode) {
                const answered = questions.length - skippedQuestions.length;
                const correct = Object.values(answers).filter((a, i) => {
                    const q = questions[i];
                    return q && a === q.correct && !skippedQuestions.includes(q.id);
                }).length;

                const score = answered > 0 ? correct / answered : 0;

                // If score >= 80%, mark all complete
                if (score >= 0.8) {
                    try {
                        await subtopicsAPI.completeAll();
                    } catch (e) {
                        console.error("Failed to mark all as complete");
                    }
                }
            }

            const { data } = await assessmentAPI.submit({ answers, skipped: skippedQuestions });
            setResults(data);
            setShowResult(true);
        } catch (err) {
            // Calculate results locally if API fails
            const topicScores = {};
            questions.forEach((q) => {
                if (skippedQuestions.includes(q.id)) return;
                const isCorrect = answers[q.id] === q.correct;
                if (!topicScores[q.topic]) {
                    topicScores[q.topic] = { correct: 0, total: 0, skipped: 0 };
                }
                topicScores[q.topic].total++;
                if (isCorrect) topicScores[q.topic].correct++;
            });

            const masteryByTopic = Object.entries(topicScores).map(([topic, scores]) => ({
                topic,
                mastery: scores.total > 0 ? scores.correct / scores.total : 0,
                correct: scores.correct,
                total: scores.total,
                skipped: skippedQuestions.filter(id => questions.find(q => q.id === id && q.topic === topic)).length,
            }));

            const answered = questions.length - skippedQuestions.length;
            const correct = Object.values(answers).filter((a, i) => {
                const q = questions[i];
                return q && a === q.correct && !skippedQuestions.includes(q.id);
            }).length;

            const finalResults = {
                overallScore: answered > 0 ? correct / answered : 0,
                topicMastery: masteryByTopic,
                totalQuestions: questions.length,
                answered,
                skipped: skippedQuestions.length,
            };

            setResults(finalResults);

            // Check success logic locally if API failed
            if (isReassessMode && finalResults.overallScore >= 0.8) {
                try {
                    await subtopicsAPI.completeAll();
                } catch (e) {
                    console.error("Failed to mark all as complete");
                }
            }

            setShowResult(true);
        } finally {
            setSubmitting(false);
            localStorage.removeItem('selectedTopics');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    // Results screen
    if (showResult && results) {
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
                        {isReassessMode
                            ? (results.overallScore >= 0.8 ? "Mastery Achieved!" : "Keep Learning!")
                            : "Assessment Complete!"}
                    </h1>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                        Your personalized roadmap has been generated
                    </p>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success)' }}>
                                {Math.round(results.overallScore * 100)}%
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Score</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '2rem', fontWeight: 900 }}>{results.answered || 0}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Answered</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--warning)' }}>{results.skipped || 0}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Skipped</p>
                        </div>
                    </div>

                    {/* Topic Breakdown */}
                    <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Topic Mastery</h3>
                        {results.topicMastery?.map((tm, i) => (
                            <div key={i} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span>{tm.topic}</span>
                                    <span style={{
                                        color: tm.mastery > 0.6 ? 'var(--success)' : tm.mastery > 0.3 ? 'var(--warning)' : 'var(--error)',
                                        fontWeight: 700,
                                    }}>
                                        {tm.correct}/{tm.total} ({Math.round(tm.mastery * 100)}%)
                                        {tm.skipped > 0 && <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}> • {tm.skipped} skipped</span>}
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${tm.mastery * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={() => navigate('/roadmap')} className="btn-primary">
                        View Your Roadmap <ArrowRight size={20} />
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isSkipped = skippedQuestions.includes(currentQuestion?.id);

    return (
        <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Skip Entire Quiz Banner */}
            {currentIndex === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{
                        marginBottom: '1.5rem',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(234, 179, 8, 0.1)',
                        borderColor: 'rgba(234, 179, 8, 0.3)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BookOpen size={20} style={{ color: 'var(--warning)' }} />
                        <span>Want to skip the assessment and start from basics?</span>
                    </div>
                    <button
                        onClick={handleSkipEntireQuiz}
                        className="btn-secondary btn-small"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <SkipForward size={16} /> Skip All
                    </button>
                </motion.div>
            )}

            {/* Progress Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                        Question {currentIndex + 1} of {questions.length}
                        {skippedQuestions.length > 0 && (
                            <span style={{ marginLeft: '0.5rem', color: 'var(--warning)' }}>
                                ({skippedQuestions.length} skipped)
                            </span>
                        )}
                    </span>
                    <span className="badge badge-primary">
                        <Target size={12} /> {currentQuestion?.topic}
                    </span>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <span className={`badge ${currentQuestion?.difficulty === 'easy' ? 'badge-success' : 'badge-warning'}`}>
                            {currentQuestion?.difficulty}
                        </span>
                    </div>

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

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            onClick={handleSkipQuestion}
                            className="btn-secondary"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <SkipForward size={18} /> Skip Question
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={answers[currentQuestion?.id] === undefined || submitting}
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
};

export default Assessment;
