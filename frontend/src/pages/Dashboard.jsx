import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart3, BookOpen, Target, MessageCircle, ArrowRight,
    CheckCircle2, Circle, Lock, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { subtopicsAPI, recommendationsAPI } from '../api/client';
import RecommendationCard from '../components/RecommendationCard';

// Default topics structure
const DEFAULT_TOPICS = [
    { id: 1, name: 'Arrays & Strings', subtopicCount: 7, prerequisites: [] },
    { id: 2, name: 'Linked Lists', subtopicCount: 6, prerequisites: [1] },
    { id: 3, name: 'Stacks & Queues', subtopicCount: 6, prerequisites: [1, 2] },
    { id: 4, name: 'Recursion & Backtracking', subtopicCount: 6, prerequisites: [3] },
    { id: 5, name: 'Trees & BST', subtopicCount: 6, prerequisites: [4] },
    { id: 6, name: 'Graphs', subtopicCount: 7, prerequisites: [5] },
    { id: 7, name: 'Sorting Algorithms', subtopicCount: 6, prerequisites: [4] },
    { id: 8, name: 'Dynamic Programming', subtopicCount: 7, prerequisites: [4, 7] },
];

const TOTAL_SUBTOPICS = DEFAULT_TOPICS.reduce((sum, t) => sum + t.subtopicCount, 0);

const Dashboard = () => {
    const { user, loading: authLoading } = useUser();
    const navigate = useNavigate();
    const [topicsProgress, setTopicsProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [overallProgress, setOverallProgress] = useState(0);
    const [completedSubtopics, setCompletedSubtopics] = useState(0);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch progress for each topic
                const progressPromises = DEFAULT_TOPICS.map(async (topic) => {
                    try {
                        const { data } = await subtopicsAPI.getByTopic(topic.id);
                        return {
                            id: topic.id,
                            name: topic.name,
                            completed: data.completed || 0,
                            total: data.total || topic.subtopicCount,
                            mastery: data.progress || 0,
                            prerequisites: topic.prerequisites,
                        };
                    } catch (err) {
                        return {
                            id: topic.id,
                            name: topic.name,
                            completed: 0,
                            total: topic.subtopicCount,
                            mastery: 0,
                            prerequisites: topic.prerequisites,
                        };
                    }
                });

                const topicsData = await Promise.all(progressPromises);

                // Fetch Recommendations (lazy load)
                recommendationsAPI.get().then(({ data }) => {
                    setRecommendations(data);
                    if (data.length === 0) {
                        recommendationsAPI.generate().then(() => {
                            recommendationsAPI.get().then(({ data: newData }) => setRecommendations(newData));
                        });
                    }
                }).catch(err => console.error("Recs error", err));

                // Calculate overall progress
                const totalCompleted = topicsData.reduce((sum, t) => sum + t.completed, 0);
                const progress = TOTAL_SUBTOPICS > 0 ? Math.round((totalCompleted / TOTAL_SUBTOPICS) * 100) : 0;

                // Determine topic status based on completion and prerequisites
                const topicsWithStatus = topicsData.map(topic => {
                    let status = 'locked';

                    if (topic.completed === topic.total && topic.total > 0) {
                        status = 'completed';
                    } else if (topic.completed > 0) {
                        status = 'in-progress';
                    } else if (topic.prerequisites.length === 0) {
                        status = 'unlocked';
                    } else {
                        // Check if all prerequisites are completed
                        const allPrereqsCompleted = topic.prerequisites.every(prereqId => {
                            const prereq = topicsData.find(t => t.id === prereqId);
                            return prereq && prereq.completed === prereq.total && prereq.total > 0;
                        });
                        if (allPrereqsCompleted) {
                            status = 'unlocked';
                        }
                    }

                    return { ...topic, status };
                });

                setTopicsProgress(topicsWithStatus);
                setOverallProgress(progress);
                setCompletedSubtopics(totalCompleted);
            } catch (err) {
                // Default to empty progress for new users
                const emptyTopics = DEFAULT_TOPICS.map((topic, index) => ({
                    id: topic.id,
                    name: topic.name,
                    completed: 0,
                    total: topic.subtopicCount,
                    mastery: 0,
                    status: index === 0 ? 'unlocked' : 'locked',
                    prerequisites: topic.prerequisites,
                }));
                setTopicsProgress(emptyTopics);
                setOverallProgress(0);
                setCompletedSubtopics(0);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user, authLoading, navigate]);

    if (authLoading || loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-dim)' }}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Find the current topic to continue (first in-progress or first unlocked)
    const currentTopic = topicsProgress.find(t => t.status === 'in-progress')
        || topicsProgress.find(t => t.status === 'unlocked');

    // Calculate knowledge gaps based on incomplete topics
    const gaps = topicsProgress
        .filter(t => t.status !== 'completed' && t.status !== 'locked')
        .map(t => ({
            topic: t.name,
            deficiency: Math.round((1 - t.mastery) * 100)
        }))
        .filter(g => g.deficiency > 0)
        .slice(0, 3);

    const stats = [
        { label: 'Overall Mastery', value: `${overallProgress}%`, color: 'var(--primary)' },
        { label: 'Subtopics Done', value: `${completedSubtopics}/${TOTAL_SUBTOPICS}`, color: 'var(--secondary)' },
        { label: 'Topics Completed', value: `${topicsProgress.filter(t => t.status === 'completed').length}/${DEFAULT_TOPICS.length}`, color: 'var(--accent)' },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="page-header"
            >
                <h1>
                    Welcome, <span className="grad-text">{user?.name}</span>
                </h1>
                <p>Your personalized DSA learning journey</p>
            </motion.header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Stats Row */}
                    <div className="grid-3">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card"
                                style={{ position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '4px',
                                    height: '100%',
                                    background: stat.color,
                                }} />
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-dim)',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: '0.5rem'
                                }}>
                                    {stat.label}
                                </p>
                                <p style={{ fontSize: '2rem', fontWeight: 900 }}>{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Learning Path */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <BookOpen size={24} style={{ color: 'var(--primary)' }} />
                                <h2 style={{ fontSize: '1.5rem' }}>Your Learning Path</h2>
                            </div>
                            <Link to="/roadmap" className="btn-secondary btn-small">
                                View Full Roadmap <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {topicsProgress.map((topic, i) => (
                                <TopicRow key={topic.id} topic={topic} index={i} />
                            ))}
                        </div>
                    </motion.section>

                    {/* Quick Actions */}
                    <div className="grid-2">
                        <Link to="/assessment" style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="action-card"
                            >
                                <div>
                                    <Target size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                    <h3>Take Assessment</h3>
                                    <p>Test your knowledge and update your roadmap</p>
                                </div>
                                <div className="action-btn-indicator">
                                    Start Now <ArrowRight size={16} />
                                </div>
                            </motion.div>
                        </Link>
                        <Link to="/chat" style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="action-card"
                            >
                                <div>
                                    <MessageCircle size={32} style={{ color: 'var(--secondary)', marginBottom: '1rem' }} />
                                    <h3>Ask a Doubt</h3>
                                    <p>Get instant answers from our AI assistant</p>
                                </div>
                                <div className="action-btn-indicator" style={{ color: 'var(--secondary)' }}>
                                    Chat Now <ArrowRight size={16} />
                                </div>
                            </motion.div>
                        </Link>
                        <Link to="/quiz-history" style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="action-card"
                            >
                                <div>
                                    <BarChart3 size={32} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
                                    <h3>Quiz History</h3>
                                    <p>Review your past quiz attempts and reports</p>
                                </div>
                                <div className="action-btn-indicator" style={{ color: 'var(--warning)' }}>
                                    View History <ArrowRight size={16} />
                                </div>
                            </motion.div>
                        </Link>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Knowledge Gaps */}
                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <BarChart3 size={20} style={{ color: 'var(--warning)' }} />
                            <h3>Focus Areas</h3>
                        </div>
                        {gaps.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {gaps.map((gap, i) => (
                                    <GapBar key={i} gap={gap} />
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                                Start learning to see your focus areas!
                            </p>
                        )}
                        {overallProgress > 0 && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'var(--surface-hover)',
                                borderRadius: '0.75rem',
                            }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.25rem' }}>
                                    AI RECOMMENDATION
                                </p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                                    {currentTopic
                                        ? `Continue with "${currentTopic.name}" to maintain your progress.`
                                        : 'Great job! Keep up the learning momentum!'
                                    }
                                </p>
                            </div>
                        )}
                    </motion.section>

                    {/* Personalized Recommendations */}
                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Target size={20} style={{ color: 'var(--accent)' }} />
                            <h3>Recommended for You</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recommendations.length > 0 ? (
                                recommendations.map(rec => (
                                    <RecommendationCard key={rec.id} recommendation={rec} />
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                                    Complete assessments to get personalized recommendations!
                                </p>
                            )}
                        </div>
                    </motion.section>

                    {/* Next Up */}
                    {currentTopic && (
                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card continue-learning-card"
                        >
                            <TrendingUp size={24} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                            <h3 style={{ marginBottom: '0.5rem' }}>Continue Learning</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                {currentTopic.completed > 0
                                    ? `Pick up where you left off with ${currentTopic.name}`
                                    : `Start learning ${currentTopic.name}`
                                }
                            </p>
                            <Link to={`/resources/${currentTopic.id}`} className="btn-primary w-full">
                                {currentTopic.completed > 0 ? 'Resume' : 'Start'} <ArrowRight size={18} />
                            </Link>
                        </motion.section>
                    )}
                </div>
            </div>
        </div>
    );
};

const TopicRow = ({ topic, index }) => {
    const isLocked = topic.status === 'locked';
    const isCompleted = topic.status === 'completed';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '1rem',
                background: isLocked ? 'transparent' : 'var(--surface-hover)',
                border: `1px solid ${isLocked ? 'var(--border)' : 'transparent'}`,
                opacity: isLocked ? 0.5 : 1,
            }}
        >
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '0.75rem',
                background: isCompleted ? 'rgba(34, 197, 94, 0.2)' : isLocked ? 'var(--surface)' : 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {isCompleted ? (
                    <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                ) : isLocked ? (
                    <Lock size={20} style={{ color: 'var(--text-dim)' }} />
                ) : (
                    <Circle size={20} style={{ color: 'var(--primary)' }} className="animate-pulse" />
                )}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{topic.name}</p>
                {!isLocked && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="progress-bar" style={{ flex: 1, maxWidth: '120px' }}>
                            <div className="progress-fill" style={{ width: `${topic.mastery * 100}%` }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {topic.completed}/{topic.total}
                        </span>
                    </div>
                )}
            </div>
            {!isLocked && (
                <Link
                    to={`/resources/${topic.id}`}
                    className="btn-secondary btn-small"
                    style={{ textDecoration: 'none' }}
                >
                    {isCompleted ? 'Review' : 'Continue'}
                </Link>
            )}
        </motion.div>
    );
};

const GapBar = ({ gap }) => {
    const color = gap.deficiency > 50 ? 'var(--error)' : gap.deficiency > 30 ? 'var(--warning)' : 'var(--primary)';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>{gap.topic}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{gap.deficiency}% remaining</span>
            </div>
            <div className="progress-bar">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - gap.deficiency}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                        height: '100%',
                        background: 'var(--success)',
                        borderRadius: '999px',
                    }}
                />
            </div>
        </div>
    );
};

export default Dashboard;
