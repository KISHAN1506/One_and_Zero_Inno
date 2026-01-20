import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Target, BookOpen, MessageCircle, Shield, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Home = () => {
    const { user } = useUser();

    const features = [
        { icon: Target, title: 'Adaptive Learning', desc: 'AI adjusts your roadmap based on performance' },
        { icon: BookOpen, title: 'Curated Resources', desc: 'High-quality YouTube videos & notes for free' },
        { icon: MessageCircle, title: 'Doubt Solver', desc: 'AI chatbot grounded in your learning content' },
        { icon: Shield, title: 'Privacy First', desc: 'Minimal data, no tracking, fully secure' },
    ];

    return (
        <div className="page-container" style={{ paddingTop: '4rem' }}>
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto', marginBottom: '6rem' }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'var(--surface)',
                        padding: '0.5rem 1rem',
                        borderRadius: '999px',
                        marginBottom: '2rem',
                        border: '1px solid var(--border)',
                    }}
                >
                    <Zap size={16} style={{ color: 'var(--warning)' }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                        Free AI Learning Assistant for Engineering Students
                    </span>
                </motion.div>

                <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                    Master <span className="grad-text">DSA</span> with<br />
                    Personalized Roadmaps
                </h1>

                <p style={{ fontSize: '1.25rem', color: 'var(--text-dim)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                    Stop wandering through scattered tutorials. Get a structured, adaptive learning path
                    built just for you — completely free.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {user ? (
                        <Link to="/dashboard" className="btn-primary" style={{ fontSize: '1.125rem', padding: '1.25rem 2.5rem' }}>
                            Go to Dashboard <ArrowRight size={20} />
                        </Link>
                    ) : (
                        <>
                            <Link to="/register" className="btn-primary" style={{ fontSize: '1.125rem', padding: '1.25rem 2.5rem' }}>
                                Start Learning Free <ArrowRight size={20} />
                            </Link>
                            <Link to="/login" className="btn-secondary" style={{ fontSize: '1.125rem', padding: '1.25rem 2.5rem' }}>
                                I have an account
                            </Link>
                        </>
                    )}
                </div>
            </motion.section>

            {/* Features Grid */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ marginBottom: '6rem' }}
            >
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem' }}>
                    Why <span className="grad-text">ZeroToOne</span>?
                </h2>
                <div className="grid-4">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="glass-card"
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '1rem',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                            }}>
                                <feature.icon size={28} color="white" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* How It Works */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="glass-card"
                style={{ maxWidth: '900px', margin: '0 auto 6rem' }}
            >
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem' }}>
                    How It <span className="grad-text">Works</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {[
                        { num: '01', title: 'Take a Quick Assessment', desc: 'Answer topic-tagged questions so we understand your current level' },
                        { num: '02', title: 'Get Your Personalized Roadmap', desc: 'AI generates a learning path based on your strengths and gaps' },
                        { num: '03', title: 'Learn with Curated Resources', desc: 'Watch top YouTube videos and read concise notes — all free' },
                        { num: '04', title: 'Practice & Adapt', desc: 'As you progress, your roadmap updates to keep you on track' },
                    ].map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '0.75rem',
                                background: 'var(--surface-hover)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 800,
                                color: 'var(--primary)',
                                flexShrink: 0,
                            }}>
                                {step.num}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{step.title}</h4>
                                <p style={{ color: 'var(--text-dim)' }}>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* CTA */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
                <div className="glass-card" style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.1))',
                    maxWidth: '700px',
                    margin: '0 auto',
                }}>
                    <Brain size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to master DSA?</h2>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                        Join thousands of engineering students learning smarter, not harder.
                    </p>
                    {!user && (
                        <Link to="/register" className="btn-primary">
                            Start Your Journey <ArrowRight size={20} />
                        </Link>
                    )}
                </div>
            </motion.section>

            {/* Footer */}
            <footer style={{
                textAlign: 'center',
                padding: '2rem',
                borderTop: '1px solid var(--border)',
                color: 'var(--text-dim)',
                fontSize: '0.875rem',
            }}>
                <p>Built with ❤️ for engineering students across India</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    Privacy-first • Open-source friendly • Always free
                </p>
            </footer>
        </div>
    );
};

export default Home;
