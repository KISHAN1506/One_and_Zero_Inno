import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, BookOpen, CheckCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

const VideoPlayer = () => {
    const { user, loading: userLoading } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    // Get video info from URL params or location state
    const params = new URLSearchParams(location.search);
    const videoUrl = params.get('url') || '';
    const videoTitle = params.get('title') || 'Video';
    const subtopicName = params.get('subtopic') || '';
    const topicId = params.get('topicId') || '';

    // Extract YouTube video ID from URL
    const getYouTubeVideoId = (url) => {
        if (!url) return null;

        // Handle different YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    const videoId = getYouTubeVideoId(videoUrl);

    // Redirect to login if not authenticated
    React.useEffect(() => {
        if (!userLoading && !user) {
            navigate('/login');
        }
    }, [user, userLoading, navigate]);

    if (userLoading) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    const handleGoBack = () => {
        if (topicId) {
            navigate(`/resources/${topicId}`);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <button
                    onClick={handleGoBack}
                    className="btn-secondary"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1.5rem',
                        padding: '0.75rem 1.25rem',
                    }}
                >
                    <ArrowLeft size={18} /> Back to Learning
                </button>

                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                    {subtopicName || videoTitle}
                </h1>
                {subtopicName && (
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                        Watch and learn at your own pace
                    </p>
                )}
            </motion.div>

            {/* Video Player */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card"
                style={{
                    padding: 0,
                    overflow: 'hidden',
                    marginBottom: '2rem',
                }}
            >
                {videoId ? (
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        paddingTop: '56.25%', // 16:9 aspect ratio
                        background: '#000',
                    }}>
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                            title={subtopicName || videoTitle}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div style={{
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        background: 'var(--surface)',
                    }}>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>
                            Video not available or invalid URL
                        </p>
                        <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <ExternalLink size={18} /> Open Original Link
                        </a>
                    </div>
                )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ExternalLink size={18} /> Open on YouTube
                </a>

                {topicId && (
                    <button
                        onClick={() => navigate(`/resources/${topicId}`)}
                        className="btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <BookOpen size={18} /> Continue Learning
                    </button>
                )}
            </motion.div>

            {/* Tips Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card"
                style={{ marginTop: '2rem', padding: '1.5rem' }}
            >
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                    Learning Tips
                </h3>
                <ul style={{
                    color: 'var(--text-dim)',
                    fontSize: '0.9rem',
                    paddingLeft: '1.25rem',
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                }}>
                    <li>Watch the video at your own pace - pause and rewind as needed</li>
                    <li>Take notes on key concepts and algorithms</li>
                    <li>Try coding along with the examples shown</li>
                    <li>After watching, practice with related problems</li>
                </ul>
            </motion.div>
        </div>
    );
};

export default VideoPlayer;
