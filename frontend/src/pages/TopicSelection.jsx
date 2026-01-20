import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight, SkipForward, BookOpen } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { topicsAPI } from '../api/client';

const TopicSelection = () => {
    const { user, loading: userLoading } = useUser();
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Wait for UserContext to finish loading before checking auth
        if (userLoading) return;
        
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchTopics = async () => {
            try {
                const { data } = await topicsAPI.getAll();
                setTopics(data);
            } catch (err) {
                // Fallback topics
                setTopics([
                    { id: 1, name: 'Arrays & Strings', description: 'Foundation of DSA' },
                    { id: 2, name: 'Linked Lists', description: 'Dynamic data structures' },
                    { id: 3, name: 'Stacks & Queues', description: 'LIFO and FIFO structures' },
                    { id: 4, name: 'Recursion & Backtracking', description: 'Self-referential functions' },
                    { id: 5, name: 'Trees & BST', description: 'Hierarchical structures' },
                    { id: 6, name: 'Graphs', description: 'Networks of nodes' },
                    { id: 7, name: 'Sorting Algorithms', description: 'Ordering data efficiently' },
                    { id: 8, name: 'Dynamic Programming', description: 'Overlapping subproblems' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, [user, userLoading, navigate]);

    const toggleTopic = (topicId) => {
        setSelectedTopics(prev => 
            prev.includes(topicId) 
                ? prev.filter(id => id !== topicId)
                : [...prev, topicId]
        );
    };

    const handleContinueToQuiz = () => {
        // Store selected topics and navigate to assessment
        localStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));
        navigate('/assessment');
    };

    const handleSkipAndStartBasics = () => {
        // Skip quiz entirely, start from basics
        localStorage.setItem('skippedQuiz', 'true');
        localStorage.removeItem('selectedTopics');
        navigate('/roadmap');
    };

    if (loading || userLoading) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-dim)' }}>Loading topics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-header"
                style={{ textAlign: 'center', marginBottom: '2rem' }}
            >
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    What do you <span className="grad-text">already know?</span>
                </h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Select the topics you're already familiar with. We'll quiz you on these to assess your level.
                </p>
            </motion.header>

            {/* Skip option banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card"
                style={{ 
                    marginBottom: '2rem', 
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderColor: 'rgba(139, 92, 246, 0.3)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen size={20} style={{ color: 'var(--primary)' }} />
                    <span>New to DSA? Start from the basics!</span>
                </div>
                <button 
                    onClick={handleSkipAndStartBasics}
                    className="btn-secondary btn-small"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <SkipForward size={16} /> Skip Quiz & Start Learning
                </button>
            </motion.div>

            {/* Topic Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {topics.map((topic, i) => {
                    const isSelected = selectedTopics.includes(topic.id);
                    return (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleTopic(topic.id)}
                            className="glass-card"
                            style={{
                                cursor: 'pointer',
                                padding: '1.25rem',
                                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'var(--surface)',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{topic.name}</h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>{topic.description}</p>
                                </div>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: isSelected ? 'var(--primary)' : 'var(--surface-hover)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {isSelected ? (
                                        <CheckCircle size={18} style={{ color: 'white' }} />
                                    ) : (
                                        <Circle size={18} style={{ color: 'var(--text-dim)' }} />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '1rem',
                    position: 'sticky',
                    bottom: '2rem',
                    padding: '1rem',
                    background: 'linear-gradient(transparent, var(--background) 30%)',
                }}
            >
                <button
                    onClick={handleContinueToQuiz}
                    disabled={selectedTopics.length === 0}
                    className="btn-primary"
                    style={{ 
                        padding: '1rem 2rem',
                        fontSize: '1rem',
                        opacity: selectedTopics.length === 0 ? 0.5 : 1,
                    }}
                >
                    {selectedTopics.length === 0 
                        ? 'Select topics to continue' 
                        : `Take Quiz on ${selectedTopics.length} topic${selectedTopics.length > 1 ? 's' : ''}`
                    }
                    <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                </button>
            </motion.div>

            <p style={{ 
                textAlign: 'center', 
                color: 'var(--text-dim)', 
                fontSize: '0.875rem',
                marginTop: '1rem' 
            }}>
                {selectedTopics.length} of {topics.length} topics selected
            </p>
        </div>
    );
};

export default TopicSelection;
