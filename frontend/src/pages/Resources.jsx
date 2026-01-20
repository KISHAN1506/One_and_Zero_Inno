import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, FileText, CheckCircle, ArrowLeft, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { resourcesAPI } from '../api/client';

const Resources = () => {
    const { topicId } = useParams();
    const [resources, setResources] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('videos');
    const [activeVideo, setActiveVideo] = useState(0);

    const sampleResources = {
        topic: { id: parseInt(topicId), name: topicId === '1' ? 'Arrays & Strings' : 'Linked Lists' },
        videos: [
            { id: 1, title: 'Arrays Complete Guide', url: 'https://www.youtube.com/embed/QJNwK2uJyGs', duration: '15:30', completed: true },
            { id: 2, title: 'Two Pointers Technique', url: 'https://www.youtube.com/embed/On03HWe2tZM', duration: '12:45', completed: false },
        ],
        notes: [{ id: 1, title: 'Arrays Fundamentals', content: '## Arrays\n\nArrays provide O(1) access by index.\n\n### Two Pointers\nUsed for sorted arrays to find pairs.\n\n### Sliding Window\nUsed for contiguous subarrays.' }],
        problems: [
            { id: 1, title: 'Two Sum', difficulty: 'Easy', completed: true },
            { id: 2, title: 'Container With Most Water', difficulty: 'Medium', completed: false },
        ],
    };

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const { data } = await resourcesAPI.getByTopic(topicId);
                setResources(data);
            } catch { setResources(sampleResources); }
            finally { setLoading(false); }
        };
        fetchResources();
    }, [topicId]);

    if (loading) return (
        <div className="page-container flex items-center justify-center" style={{ minHeight: '70vh' }}>
            <div className="spinner" />
        </div>
    );

    return (
        <div className="page-container">
            <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '2rem' }}>
                <Link to="/roadmap" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                    <ArrowLeft size={18} /> Back
                </Link>
                <h1><span className="grad-text">{resources?.topic?.name}</span></h1>
            </motion.header>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                {['videos', 'notes', 'problems'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: 'none',
                        background: activeTab === tab ? 'var(--primary)' : 'var(--surface)',
                        color: activeTab === tab ? 'white' : 'var(--text-dim)', cursor: 'pointer', fontWeight: 600,
                    }}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'videos' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
                            <iframe src={resources?.videos?.[activeVideo]?.url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <h3>{resources?.videos?.[activeVideo]?.title}</h3>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {resources?.videos?.map((v, i) => (
                            <div key={v.id} onClick={() => setActiveVideo(i)} className="glass-card" style={{ cursor: 'pointer', padding: '1rem', border: activeVideo === i ? '2px solid var(--primary)' : undefined }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {v.completed ? <CheckCircle size={18} style={{ color: 'var(--success)' }} /> : <Play size={18} />}
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{v.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'notes' && (
                <div className="glass-card">
                    <h2>{resources?.notes?.[0]?.title}</h2>
                    <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{resources?.notes?.[0]?.content}</div>
                </div>
            )}

            {activeTab === 'problems' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {resources?.problems?.map((p, i) => (
                        <div key={p.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {p.completed ? <CheckCircle size={18} style={{ color: 'var(--success)' }} /> : <span>{i + 1}</span>}
                                <span style={{ fontWeight: 600 }}>{p.title}</span>
                                <span className={`badge badge-${p.difficulty === 'Easy' ? 'success' : 'warning'}`}>{p.difficulty}</span>
                            </div>
                            <button className="btn-secondary btn-small">Solve</button>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                <Link to="/roadmap" className="btn-secondary"><ArrowLeft size={18} /> Roadmap</Link>
                <Link to="/chat" className="btn-primary">Ask Doubt <ArrowRight size={18} /></Link>
            </div>
        </div>
    );
};

export default Resources;
