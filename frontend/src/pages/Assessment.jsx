import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Clock, Brain, Target } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { assessmentAPI } from '../api/client';

const Assessment = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Sample questions for MVP (will be fetched from API)
    const sampleQuestions = [
        {
            id: 1,
            topic_id: 1,
            topic: 'Arrays & Strings',
            text: 'What is the time complexity of accessing an element in an array by index?',
            options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
            correct: 0,
            difficulty: 'easy',
        },
        {
            id: 2,
            topic_id: 1,
            topic: 'Arrays & Strings',
            text: 'Which technique is used to find pairs in a sorted array that sum to a target?',
            options: ['Binary Search', 'Two Pointers', 'Sliding Window', 'Recursion'],
            correct: 1,
            difficulty: 'medium',
        },
        {
            id: 3,
            topic_id: 2,
            topic: 'Linked Lists',
            text: 'What is the time complexity of inserting at the beginning of a singly linked list?',
            options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
            correct: 1,
            difficulty: 'easy',
        },
        {
            id: 4,
            topic_id: 2,
            topic: 'Linked Lists',
            text: 'How do you detect a cycle in a linked list efficiently?',
            options: ['Hash Set', 'Floyd\'s Cycle Detection', 'BFS', 'DFS'],
            correct: 1,
            difficulty: 'medium',
        },
        {
            id: 5,
            topic_id: 3,
            topic: 'Stacks & Queues',
            text: 'Which data structure is used to implement function calls in recursion?',
            options: ['Queue', 'Stack', 'Array', 'Tree'],
            correct: 1,
            difficulty: 'easy',
        },
        {
            id: 6,
            topic_id: 3,
            topic: 'Stacks & Queues',
            text: 'What is the output of pushing 1, 2, 3 and then popping twice from a stack?',
            options: ['1, 2', '3, 2', '2, 3', '1, 3'],
            correct: 1,
            difficulty: 'easy',
        },
        {
            id: 7,
            topic_id: 4,
            topic: 'Recursion',
            text: 'What is the base case in calculating factorial recursively?',
            options: ['n == 1', 'n == 0 or n == 1', 'n < 0', 'No base case needed'],
            correct: 1,
            difficulty: 'easy',
        },
        {
            id: 8,
            topic_id: 5,
            topic: 'Trees & BST',
            text: 'In a Binary Search Tree, where are smaller elements stored?',
            options: ['Right subtree', 'Left subtree', 'Root', 'Anywhere'],
            correct: 1,
            difficulty: 'easy',
        },
        {
            id: 9,
            topic_id: 6,
            topic: 'Graphs',
            text: 'Which algorithm is used for shortest path in an unweighted graph?',
            options: ['DFS', 'BFS', 'Dijkstra', 'Bellman-Ford'],
            correct: 1,
            difficulty: 'medium',
        },
        {
            id: 10,
            topic_id: 7,
            topic: 'Sorting',
            text: 'What is the average time complexity of Quick Sort?',
            options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
            correct: 1,
            difficulty: 'easy',
        },
    ];

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const { data } = await assessmentAPI.getDiagnostic();
                setQuestions(data.questions);
            } catch (err) {
                // Use sample questions if API fails
                setQuestions(sampleQuestions);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleAnswer = (optionIndex) => {
        setAnswers({ ...answers, [questions[currentIndex].id]: optionIndex });
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
        } catch (err) {
            // Calculate results locally if API fails
            const topicScores = {};
            questions.forEach((q) => {
                const isCorrect = answers[q.id] === q.correct;
                if (!topicScores[q.topic]) {
                    topicScores[q.topic] = { correct: 0, total: 0 };
                }
                topicScores[q.topic].total++;
                if (isCorrect) topicScores[q.topic].correct++;
            });

            const masteryByTopic = Object.entries(topicScores).map(([topic, scores]) => ({
                topic,
                mastery: scores.correct / scores.total,
                correct: scores.correct,
                total: scores.total,
            }));

            setResults({
                overallScore: Object.values(answers).filter((a, i) => a === questions[i]?.correct).length / questions.length,
                topicMastery: masteryByTopic,
            });
        } finally {
            setSubmitting(false);
            setShowResult(true);
        }
    };

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-dim)' }}>Loading assessment...</p>
                </div>
            </div>
        );
    }

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

                    <button
                        onClick={handleNext}
                        disabled={answers[currentQuestion?.id] === undefined || submitting}
                        className="btn-primary w-full"
                        style={{ marginTop: '2rem' }}
                    >
                        {submitting ? (
                            <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                        ) : currentIndex === questions.length - 1 ? (
                            <>Submit Assessment</>
                        ) : (
                            <>Next Question <ArrowRight size={20} /></>
                        )}
                    </button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Assessment;
