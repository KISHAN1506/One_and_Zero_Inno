import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Play, FileText, ArrowLeft, CheckCircle, Circle, ExternalLink, 
    BookOpen, Edit3, Save, X, Plus, Trash2, Code
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { resourcesAPI, topicsAPI, notesAPI } from '../api/client';
import ReactMarkdown from 'react-markdown';

const Resources = () => {
    const { topicId } = useParams();
    const { user } = useUser();
    const [resources, setResources] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('videos');
    const [leetcodeProblems, setLeetcodeProblems] = useState([]);
    const [notesData, setNotesData] = useState({ summary: '', user_notes: [] });
    const [newNote, setNewNote] = useState('');
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingContent, setEditingContent] = useState('');

    // Get user's language preference
    const userLanguage = user?.language_preference || localStorage.getItem('language') || 'en';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch resources with language preference
                const { data: resourceData } = await resourcesAPI.getByTopic(topicId, userLanguage);
                setResources(resourceData);

                // Fetch LeetCode problems
                const { data: leetcodeData } = await topicsAPI.getLeetcode(topicId);
                setLeetcodeProblems(leetcodeData.problems || []);

                // Fetch notes
                const { data: notesResult } = await notesAPI.getByTopic(topicId);
                setNotesData(notesResult);
            } catch (err) {
                // Fallback data
                setResources({
                    topic: { id: topicId, name: 'Topic', description: '' },
                    videos: [],
                    summary: 'No summary available.',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [topicId, userLanguage]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            const { data } = await notesAPI.create(parseInt(topicId), newNote);
            setNotesData(prev => ({
                ...prev,
                user_notes: [data, ...prev.user_notes]
            }));
            setNewNote('');
        } catch (err) {
            console.error('Failed to add note:', err);
        }
    };

    const handleUpdateNote = async (noteId) => {
        try {
            await notesAPI.update(noteId, editingContent);
            setNotesData(prev => ({
                ...prev,
                user_notes: prev.user_notes.map(n => 
                    n.id === noteId ? { ...n, content: editingContent } : n
                )
            }));
            setEditingNoteId(null);
        } catch (err) {
            console.error('Failed to update note:', err);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await notesAPI.delete(noteId);
            setNotesData(prev => ({
                ...prev,
                user_notes: prev.user_notes.filter(n => n.id !== noteId)
            }));
        } catch (err) {
            console.error('Failed to delete note:', err);
        }
    };

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-dim)' }}>Loading resources...</p>
                </div>
            </div>
        );
    }

    const easyProblems = leetcodeProblems.filter(p => p.difficulty === 'Easy');
    const mediumProblems = leetcodeProblems.filter(p => p.difficulty === 'Medium');

    return (
        <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <Link to="/roadmap" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: 'var(--text-dim)',
                    marginBottom: '1rem',
                }}>
                    <ArrowLeft size={16} /> Back to Roadmap
                </Link>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {resources?.topic?.name}
                </h1>
                <p style={{ color: 'var(--text-dim)' }}>{resources?.topic?.description}</p>
            </motion.header>

            {/* Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '2rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '1rem',
            }}>
                {['videos', 'notes', 'problems'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: activeTab === tab ? 'var(--primary)' : 'var(--surface)',
                            color: activeTab === tab ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        {tab === 'videos' && <Play size={16} />}
                        {tab === 'notes' && <FileText size={16} />}
                        {tab === 'problems' && <Code size={16} />}
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Videos Tab */}
            {activeTab === 'videos' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {resources?.videos?.map((video, i) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card"
                            >
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    <div style={{ 
                                        width: '100%', 
                                        maxWidth: '400px',
                                        aspectRatio: '16/9',
                                        borderRadius: '0.75rem',
                                        overflow: 'hidden',
                                        background: '#000',
                                    }}>
                                        <iframe
                                            src={video.url}
                                            title={video.title}
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                            allowFullScreen
                                        />
                                    </div>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <h3 style={{ marginBottom: '0.5rem' }}>{video.title}</h3>
                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                                            Duration: {video.duration}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {(!resources?.videos || resources.videos.length === 0) && (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <Play size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-dim)' }}>No videos available yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {/* Topic Summary */}
                    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <BookOpen size={20} style={{ color: 'var(--primary)' }} />
                            <h3>Topic Summary</h3>
                        </div>
                        <div style={{ 
                            background: 'var(--surface-hover)', 
                            padding: '1.5rem', 
                            borderRadius: '0.75rem',
                            fontSize: '0.9rem',
                            lineHeight: 1.7,
                        }}>
                            <ReactMarkdown>{notesData.summary || resources?.summary || 'No summary available.'}</ReactMarkdown>
                        </div>
                    </div>

                    {/* User Notes */}
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Edit3 size={20} style={{ color: 'var(--secondary)' }} />
                                <h3>Your Notes</h3>
                            </div>
                        </div>

                        {/* Add Note */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add your notes here..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface)',
                                    color: 'var(--text)',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={!newNote.trim()}
                                className="btn-primary btn-small"
                                style={{ marginTop: '0.75rem' }}
                            >
                                <Plus size={16} /> Add Note
                            </button>
                        </div>

                        {/* Notes List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notesData.user_notes?.map((note) => (
                                <div
                                    key={note.id}
                                    style={{
                                        background: 'var(--surface-hover)',
                                        padding: '1rem',
                                        borderRadius: '0.75rem',
                                    }}
                                >
                                    {editingNoteId === note.id ? (
                                        <>
                                            <textarea
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    minHeight: '80px',
                                                    padding: '0.75rem',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid var(--border)',
                                                    background: 'var(--surface)',
                                                    color: 'var(--text)',
                                                    resize: 'vertical',
                                                    fontFamily: 'inherit',
                                                }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleUpdateNote(note.id)}
                                                    className="btn-primary btn-small"
                                                >
                                                    <Save size={14} /> Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingNoteId(null)}
                                                    className="btn-secondary btn-small"
                                                >
                                                    <X size={14} /> Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                <button
                                                    onClick={() => {
                                                        setEditingNoteId(note.id);
                                                        setEditingContent(note.content);
                                                    }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--primary)',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem',
                                                    }}
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--error)',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem',
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {(!notesData.user_notes || notesData.user_notes.length === 0) && (
                                <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1rem' }}>
                                    No notes yet. Add your first note above!
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Problems Tab - LeetCode Questions */}
            {activeTab === 'problems' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {/* Easy Problems */}
                    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <span className="badge badge-success">Easy</span>
                            <h3>Easy Problems ({easyProblems.length})</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {easyProblems.map((problem) => (
                                <a
                                    key={problem.id}
                                    href={problem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        background: 'var(--surface-hover)',
                                        borderRadius: '0.75rem',
                                        textDecoration: 'none',
                                        color: 'var(--text)',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <span style={{ fontWeight: 500 }}>{problem.title}</span>
                                    <ExternalLink size={16} style={{ color: 'var(--text-dim)' }} />
                                </a>
                            ))}
                            {easyProblems.length === 0 && (
                                <p style={{ color: 'var(--text-dim)', padding: '1rem' }}>No easy problems available</p>
                            )}
                        </div>
                    </div>

                    {/* Medium Problems */}
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <span className="badge badge-warning">Medium</span>
                            <h3>Medium Problems ({mediumProblems.length})</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {mediumProblems.map((problem) => (
                                <a
                                    key={problem.id}
                                    href={problem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        background: 'var(--surface-hover)',
                                        borderRadius: '0.75rem',
                                        textDecoration: 'none',
                                        color: 'var(--text)',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <span style={{ fontWeight: 500 }}>{problem.title}</span>
                                    <ExternalLink size={16} style={{ color: 'var(--text-dim)' }} />
                                </a>
                            ))}
                            {mediumProblems.length === 0 && (
                                <p style={{ color: 'var(--text-dim)', padding: '1rem' }}>No medium problems available</p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Resources;
