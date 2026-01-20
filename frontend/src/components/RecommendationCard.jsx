import React from 'react';
import { motion } from 'framer-motion';
import { Play, Code, Lightbulb, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendationCard = ({ recommendation }) => {
    const { type, title, description, action_url, source, priority } = recommendation;

    const getIcon = () => {
        switch (type) {
            case 'video': return <Play size={20} className="text-secondary" />;
            case 'question': return <Code size={20} className="text-primary" />;
            case 'tip': return <Lightbulb size={20} className="text-warning" />;
            default: return <ArrowRight size={20} />;
        }
    };

    const getBadgeColor = () => {
        if (source === 'ai') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    };

    const isExternal = action_url && action_url.startsWith('http');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ 
                padding: '1.25rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.75rem',
                borderLeft: `4px solid ${type === 'tip' ? 'var(--warning)' : type === 'video' ? 'var(--secondary)' : 'var(--primary)'}` 
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ 
                        padding: '0.5rem', 
                        borderRadius: '0.5rem', 
                        background: 'var(--surface-hover)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                        {getIcon()}
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.125rem' }}>{title}</h4>
                        <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.125rem 0.5rem', 
                            borderRadius: '99px',
                            border: '1px solid',
                            ...{
                                className: getBadgeColor()
                            }
                        }} className={`badge ${source === 'ai' ? 'badge-primary' : 'badge-secondary'}`}>
                            {source === 'ai' ? 'AI Recommended' : 'Next Step'}
                        </span>
                    </div>
                </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {description}
            </p>

            {action_url && (
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                    {isExternal ? (
                        <a 
                            href={action_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-secondary btn-small"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                             Watch Video <ExternalLink size={14} />
                        </a>
                    ) : (
                        <Link 
                            to={action_url} 
                            className="btn-primary btn-small"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            Start Practice <ArrowRight size={14} />
                        </Link>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default RecommendationCard;
