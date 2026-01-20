import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle2, Circle, Lock, ArrowRight, Play, FileText,
    RefreshCw, ChevronDown, ChevronUp, BookOpen, CheckSquare, Square
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { roadmapAPI, topicsAPI, subtopicsAPI } from '../api/client';

const Roadmap = () => {
    const { user, loading: userLoading } = useUser();
    const navigate = useNavigate();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedTopic, setExpandedTopic] = useState(null);
    const [subtopicsData, setSubtopicsData] = useState({});
    const [loadingSubtopics, setLoadingSubtopics] = useState({});

    // Default roadmap with all topics starting at 0% - first topic unlocked, rest locked
    const getInitialRoadmap = useCallback(() => ({
        subject: 'Data Structures & Algorithms',
        topics: [
            {
                id: 1,
                name: 'Arrays & Strings',
                description: 'Foundation of DSA - contiguous memory, indexing, string manipulation',
                mastery: 0,
                status: 'unlocked',
                prerequisites: [],
                resources: { videos: 3, notes: 1, problems: 6 },
            },
            {
                id: 2,
                name: 'Linked Lists',
                description: 'Dynamic data structures with node-based storage',
                mastery: 0,
                status: 'locked',
                prerequisites: [1],
                resources: { videos: 2, notes: 1, problems: 6 },
            },
            {
                id: 3,
                name: 'Stacks & Queues',
                description: 'LIFO and FIFO data structures for ordered operations',
                mastery: 0,
                status: 'locked',
                prerequisites: [1, 2],
                resources: { videos: 2, notes: 1, problems: 6 },
            },
            {
                id: 4,
                name: 'Recursion & Backtracking',
                description: 'Problem-solving through self-referential functions',
                mastery: 0,
                status: 'locked',
                prerequisites: [3],
                resources: { videos: 2, notes: 1, problems: 6 },
            },
            {
                id: 5,
                name: 'Trees & BST',
                description: 'Hierarchical data structures with parent-child relationships',
                mastery: 0,
                status: 'locked',
                prerequisites: [4],
                resources: { videos: 2, notes: 1, problems: 6 },
            },
            {
                id: 6,
                name: 'Graphs',
                description: 'Networks of nodes and edges for complex relationships',
                mastery: 0,
                status: 'locked',
                prerequisites: [5],
                resources: { videos: 2, notes: 1, problems: 6 },
            },
            {
                id: 7,
                name: 'Sorting Algorithms',
                description: 'Efficient ordering of data using various strategies',
                mastery: 0,
                status: 'locked',
                prerequisites: [4],
                resources: { videos: 2, notes: 1, problems: 6 },
            },
            {
                id: 8,
                name: 'Dynamic Programming',
                description: 'Optimization through overlapping subproblems',
                mastery: 0,
                status: 'locked',
                prerequisites: [4, 7],
                resources: { videos: 2, notes: 2, problems: 6 },
            },
        ],
    }), []);

    // Subtopic counts per topic (matches backend DEFAULT_SUBTOPICS)
    const SUBTOPIC_COUNTS = {
        1: 7, // Arrays & Strings
        2: 6, // Linked Lists
        3: 6, // Stacks & Queues
        4: 6, // Recursion & Backtracking
        5: 6, // Trees & BST
        6: 7, // Graphs
        7: 6, // Sorting Algorithms
        8: 7, // Dynamic Programming
    };

    const TOTAL_SUBTOPICS = Object.values(SUBTOPIC_COUNTS).reduce((a, b) => a + b, 0);

    // Recalculate topic statuses based on completion and prerequisites
    const recalculateTopicStatuses = useCallback((topics, subtopicsDataMap) => {
        return topics.map(topic => {
            const topicSubtopics = subtopicsDataMap[topic.id];
            let newStatus = topic.status;
            let newMastery = topic.mastery;

            // Check if topic is completed based on subtopics
            if (topicSubtopics) {
                const completed = topicSubtopics.completed || 0;
                const total = topicSubtopics.total || SUBTOPIC_COUNTS[topic.id] || 1;
                newMastery = total > 0 ? completed / total : 0;

                if (completed === total && total > 0) {
                    newStatus = 'completed';
                } else if (completed > 0) {
                    newStatus = 'in-progress';
                }
            }

            // Check if topic should be unlocked based on prerequisites
            if (newStatus === 'locked' && topic.prerequisites.length > 0) {
                const allPrereqsCompleted = topic.prerequisites.every(prereqId => {
                    const prereqTopic = topics.find(t => t.id === prereqId);
                    const prereqSubtopics = subtopicsDataMap[prereqId];
                    if (prereqSubtopics) {
                        return prereqSubtopics.completed === prereqSubtopics.total && prereqSubtopics.total > 0;
                    }
                    return prereqTopic?.status === 'completed';
                });
                if (allPrereqsCompleted) {
                    newStatus = 'unlocked';
                }
            } else if (newStatus === 'locked' && topic.prerequisites.length === 0) {
                // First topic with no prerequisites should always be unlocked
                newStatus = 'unlocked';
            }

            return { ...topic, status: newStatus, mastery: newMastery };
        });
    }, [SUBTOPIC_COUNTS]);

    useEffect(() => {
        // Wait for UserContext to finish loading before checking auth
        if (userLoading) return;
        
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchRoadmap = async () => {
            try {
                const { data } = await roadmapAPI.get();
                // Still use initial roadmap structure but apply any saved progress
                const initialRoadmap = getInitialRoadmap();
                setRoadmap(initialRoadmap);
            } catch (err) {
                // Check if quiz was skipped - all topics start unlocked from basics
                const skippedQuiz = localStorage.getItem('skippedQuiz');
                const initialRoadmap = getInitialRoadmap();
                
                if (skippedQuiz) {
                    // When skipping quiz, only first topic is unlocked, start from 0%
                    setRoadmap(initialRoadmap);
                    localStorage.removeItem('skippedQuiz');
                } else {
                    setRoadmap(initialRoadmap);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [user, userLoading, navigate, getInitialRoadmap]);

    // Update roadmap when subtopicsData changes
    useEffect(() => {
        if (roadmap && Object.keys(subtopicsData).length > 0) {
            const updatedTopics = recalculateTopicStatuses(roadmap.topics, subtopicsData);
            // Only update if there's an actual change to avoid infinite loops
            const hasChanged = JSON.stringify(updatedTopics) !== JSON.stringify(roadmap.topics);
            if (hasChanged) {
                setRoadmap(prev => ({ ...prev, topics: updatedTopics }));
            }
        }
    }, [subtopicsData, recalculateTopicStatuses]);

    const fetchSubtopics = async (topicId) => {
        if (subtopicsData[topicId]) return;
        
        setLoadingSubtopics(prev => ({ ...prev, [topicId]: true }));
        try {
            const { data } = await subtopicsAPI.getByTopic(topicId);
            setSubtopicsData(prev => ({ ...prev, [topicId]: data }));
        } catch (err) {
            // Fallback - will load from DEFAULT_SUBTOPICS on backend
            console.error('Failed to load subtopics:', err);
        } finally {
            setLoadingSubtopics(prev => ({ ...prev, [topicId]: false }));
        }
    };

    const handleToggleExpand = async (topicId) => {
        if (expandedTopic === topicId) {
            setExpandedTopic(null);
        } else {
            setExpandedTopic(topicId);
            await fetchSubtopics(topicId);
        }
    };

    const handleToggleSubtopic = async (subtopicId, currentCompleted, topicId) => {
        try {
            await subtopicsAPI.toggleComplete(subtopicId, !currentCompleted);
            
            // Update local subtopicsData state
            setSubtopicsData(prev => {
                const updated = { ...prev };
                if (updated[topicId]) {
                    const updatedSubtopics = updated[topicId].subtopics.map(st =>
                        st.id === subtopicId ? { ...st, completed: !currentCompleted } : st
                    );
                    const completedCount = updatedSubtopics.filter(st => st.completed).length;
                    
                    updated[topicId] = {
                        ...updated[topicId],
                        subtopics: updatedSubtopics,
                        completed: completedCount,
                    };
                }
                return updated;
            });
        } catch (err) {
            console.error('Failed to toggle subtopic:', err);
        }
    };

    if (loading || userLoading) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-dim)' }}>Building your roadmap...</p>
                </div>
            </div>
        );
    }

    // Calculate overall progress from completed subtopics across all topics
    const calculateOverallProgress = () => {
        let totalCompleted = 0;
        let totalSubtopics = TOTAL_SUBTOPICS;

        Object.values(subtopicsData).forEach(topicData => {
            totalCompleted += topicData.completed || 0;
        });

        return totalSubtopics > 0 ? (totalCompleted / totalSubtopics) * 100 : 0;
    };

    const completedTopicsCount = roadmap?.topics?.filter(t => t.status === 'completed').length || 0;
    const totalTopicsCount = roadmap?.topics?.length || 0;
    const overallProgress = calculateOverallProgress();

    return (
        <div className="page-container">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-header"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
                <div>
                    <h1>
                        Your <span className="grad-text">Roadmap</span>
                    </h1>
                    <p>{roadmap?.subject}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '2rem', fontWeight: 900 }}>{completedTopicsCount}/{totalTopicsCount}</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Topics Mastered</p>
                </div>
            </motion.header>

            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: '3rem' }}
            >
                <div className="progress-bar" style={{ height: '12px' }}>
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    />
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {Math.round(overallProgress)}% Complete
                </p>
            </motion.div>

            {/* Timeline */}
            <div style={{ position: 'relative' }}>
                {/* Vertical Line */}
                <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '40px',
                    bottom: '40px',
                    width: '2px',
                    background: 'linear-gradient(to bottom, var(--primary), var(--secondary))',
                    opacity: 0.3,
                }} />

                {roadmap?.topics?.map((topic, i) => (
                    <TopicCard
                        key={topic.id}
                        topic={topic}
                        index={i}
                        expanded={expandedTopic === topic.id}
                        onToggle={() => handleToggleExpand(topic.id)}
                        subtopicsData={subtopicsData[topic.id]}
                        loadingSubtopics={loadingSubtopics[topic.id]}
                        onToggleSubtopic={(subtopicId, completed) => handleToggleSubtopic(subtopicId, completed, topic.id)}
                    />
                ))}
            </div>
        </div>
    );
};

const TopicCard = ({ topic, index, expanded, onToggle, subtopicsData, loadingSubtopics, onToggleSubtopic }) => {
    const isLocked = topic.status === 'locked';
    const isCompleted = topic.status === 'completed';
    const isInProgress = topic.status === 'in-progress';

    const getStatusIcon = () => {
        if (isCompleted) return <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />;
        if (isLocked) return <Lock size={24} style={{ color: 'var(--text-dim)' }} />;
        if (isInProgress) return <Circle size={24} style={{ color: 'var(--primary)' }} className="animate-pulse" />;
        return <Circle size={24} style={{ color: 'var(--secondary)' }} />;
    };

    const getStatusBadge = () => {
        if (isCompleted) return <span className="badge badge-success">Completed</span>;
        if (isInProgress) return <span className="badge badge-primary">In Progress</span>;
        if (isLocked) return <span className="badge badge-warning">Locked</span>;
        return <span className="badge badge-success">Unlocked</span>;
    };

    const subtopicProgress = subtopicsData 
        ? `${subtopicsData.completed || 0}/${subtopicsData.total || 0}` 
        : '';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
                marginBottom: '1.5rem',
                marginLeft: '50px',
                opacity: isLocked ? 0.6 : 1,
            }}
        >
            {/* Status Icon */}
            <div style={{
                position: 'absolute',
                left: '8px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--background)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--border)',
            }}>
                {getStatusIcon()}
            </div>

            <div
                className="glass-card"
                style={{
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                }}
                onClick={!isLocked ? onToggle : undefined}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>{topic.name}</h3>
                            {getStatusBadge()}
                        </div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            {topic.description}
                        </p>

                        {!isLocked && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div className="progress-bar" style={{ width: '100px' }}>
                                        <div className="progress-fill" style={{ width: `${topic.mastery * 100}%` }} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                        {Math.round(topic.mastery * 100)}%
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                    <Play size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    {topic.resources?.videos} videos
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                    <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    {topic.resources?.problems} problems
                                </span>
                            </div>
                        )}
                    </div>

                    {!isLocked && (
                        <button style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-dim)',
                            padding: '0.5rem',
                        }}>
                            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    )}
                </div>

                {/* Expanded Content with Subtopics */}
                {expanded && !isLocked && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            marginTop: '1.5rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid var(--border)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                                SUBTOPICS {subtopicProgress && `(${subtopicProgress} completed)`}
                            </h4>
                        </div>

                        {loadingSubtopics ? (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px', margin: '0 auto' }} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {subtopicsData?.subtopics?.map((st) => (
                                    <div
                                        key={st.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleSubtopic(st.id, st.completed);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            background: st.completed ? 'rgba(34, 197, 94, 0.1)' : 'var(--surface-hover)',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            border: st.completed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid transparent',
                                        }}
                                    >
                                        {st.completed ? (
                                            <CheckSquare size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                        ) : (
                                            <Square size={20} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                                        )}
                                        <div>
                                            <span style={{ 
                                                fontWeight: 500,
                                                textDecoration: st.completed ? 'line-through' : 'none',
                                                opacity: st.completed ? 0.7 : 1,
                                            }}>
                                                {st.name}
                                            </span>
                                            {st.description && (
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                                                    {st.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link
                                to={`/resources/${topic.id}`}
                                className="btn-primary"
                                style={{ flex: 1 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <BookOpen size={18} /> Start Learning
                            </Link>
                            <Link
                                to={`/assessment?topic=${topic.id}`}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <RefreshCw size={18} /> Practice
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Roadmap;
