import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart3, BookOpen, Target, MessageCircle, ArrowRight,
    CheckCircle2, Circle, Lock, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { roadmapAPI } from '../api/client';

const Dashboard = () => {
    const { user, loading: authLoading } = useUser();
    const navigate = useNavigate();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const { data } = await roadmapAPI.get();
                setRoadmap(data);
            } catch (err) {
                // Use default data if API fails
                setRoadmap({
                    topics: [
                        { id: 1, name: 'Arrays & Strings', mastery: 0.75, status: 'completed' },
                        { id: 2, name: 'Linked Lists', mastery: 0.45, status: 'in-progress' },
                        { id: 3, name: 'Stacks & Queues', mastery: 0, status: 'locked' },
                        { id: 4, name: 'Recursion', mastery: 0, status: 'locked' },
                    ],
                    gaps: [
                        { topic: 'Two Pointers', deficiency: 65 },
                        { topic: 'Sliding Window', deficiency: 45 },
                        { topic: 'Hash Maps', deficiency: 30 },
                    ],
                    overallProgress: 35,
                    xp: 1250,
                    streak: 5,
                });
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

    const stats = [
        { label: 'Overall Mastery', value: `${roadmap?.overallProgress || 0}%`, color: 'var(--primary)' },
        { label: 'Learning XP', value: roadmap?.xp?.toLocaleString() || '0', color: 'var(--secondary)' },
        { label: 'Day Streak', value: `${roadmap?.streak || 0} 🔥`, color: 'var(--accent)' },
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {roadmap?.topics?.slice(0, 4).map((topic, i) => (
                                <TopicRow key={topic.id} topic={topic} index={i} />
                            ))}
                        </div>
                    </motion.section>

                    {/* Quick Actions */}
                    <div className="grid-2">
                        <Link to="/assessment" style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="glass-card"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1))',
                                    cursor: 'pointer',
                                }}
                            >
                                <Target size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Take Assessment</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                                    Test your knowledge and update your roadmap
                                </p>
                            </motion.div>
                        </Link>
                        <Link to="/chat" style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="glass-card"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.1))',
                                    cursor: 'pointer',
                                }}
                            >
                                <MessageCircle size={32} style={{ color: 'var(--secondary)', marginBottom: '1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Ask a Doubt</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                                    Get instant answers from our AI assistant
                                </p>
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
                            <h3>Knowledge Gaps</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {roadmap?.gaps?.map((gap, i) => (
                                <GapBar key={i} gap={gap} />
                            ))}
                        </div>
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
                                "Focus on Two Pointers technique before moving to Sliding Window problems."
                            </p>
                        </div>
                    </motion.section>

                    {/* Next Up */}
                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card"
                        style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(0, 0, 0, 0.5))' }}
                    >
                        <TrendingUp size={24} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>Continue Learning</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            Pick up where you left off with Linked Lists
                        </p>
                        <Link to="/resources/2" className="btn-primary w-full">
                            Resume <ArrowRight size={18} />
                        </Link>
                    </motion.section>
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
                            {Math.round(topic.mastery * 100)}%
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
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{gap.deficiency}% gap</span>
            </div>
            <div className="progress-bar">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${gap.deficiency}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                        height: '100%',
                        background: color,
                        borderRadius: '999px',
                    }}
                />
            </div>
        </div>
    );
};

export default Dashboard;
