import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Sun, Moon, LogOut, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: '1rem 2rem',
                background: 'var(--surface)',
                backdropFilter: 'var(--glass-blur)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Brain size={24} color="white" />
                    </div>
                    <span style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'var(--text)',
                    }}>
                        Learn<span className="grad-text">Path</span>
                    </span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="btn-secondary btn-small">
                                Dashboard
                            </Link>
                            <Link to="/roadmap" className="btn-secondary btn-small">
                                My Roadmap
                            </Link>
                            <Link to="/chat" className="btn-secondary btn-small">
                                Ask Doubt
                            </Link>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'var(--surface-hover)',
                                borderRadius: '0.75rem',
                                color: 'var(--text-dim)',
                            }}>
                                <User size={16} />
                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    color: 'var(--text-dim)',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-secondary btn-small">
                                Login
                            </Link>
                            <Link to="/register" className="btn-primary btn-small">
                                Get Started
                            </Link>
                        </>
                    )}
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text)',
                            transition: 'all 0.3s ease',
                        }}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
