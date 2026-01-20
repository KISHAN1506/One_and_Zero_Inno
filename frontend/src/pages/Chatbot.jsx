import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, BookOpen } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { chatAPI } from '../api/client';

const Chatbot = () => {
    const { user } = useUser();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your DSA learning assistant. Ask me anything about Arrays, Linked Lists, Trees, or any topic you're studying. I'll help you understand concepts using our curated notes and resources." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const { data } = await chatAPI.send(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: data.response, sources: data.sources }]);
        } catch {
            // Fallback response for demo
            const responses = {
                'array': "Arrays are contiguous memory blocks with O(1) index access. Key patterns include Two Pointers and Sliding Window. For sorted arrays, use binary search for O(log n) lookups.",
                'linked list': "Linked Lists use nodes with pointers. Key operations: insert at head O(1), search O(n). Common problems: cycle detection (Floyd's), reversal, merge two lists.",
                'stack': "Stacks follow LIFO (Last In First Out). Used in recursion, expression evaluation, and monotonic stack problems. Push/pop are O(1).",
                'tree': "Trees are hierarchical with parent-child relationships. BST property: left < root < right. Key traversals: inorder, preorder, postorder (DFS) and level-order (BFS).",
                'graph': "Graphs have nodes (vertices) and edges. BFS for shortest path in unweighted graphs. DFS for exploring all paths. Track visited nodes to avoid cycles.",
                'recursion': "Recursion needs a base case and recursive case. Think: 1) What's the smallest input? 2) How does solving smaller input help solve bigger one?",
                'dynamic programming': "DP = Recursion + Memoization. Identify overlapping subproblems. Common patterns: 1D DP (climbing stairs), 2D DP (grid paths).",
                'sort': "Merge Sort: O(n log n), stable, extra space. Quick Sort: O(n log n) avg, in-place. For nearly sorted data, consider Insertion Sort.",
            };
            const key = Object.keys(responses).find(k => userMessage.toLowerCase().includes(k));
            const reply = key ? responses[key] : "That's a great question! Based on your learning path, I'd recommend reviewing the fundamentals first. Check the resources section for curated videos and notes on this topic.";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '1rem' }}>
                <h1><span className="grad-text">Ask</span> Your Doubts</h1>
                <p style={{ color: 'var(--text-dim)' }}>AI-powered answers grounded in your learning content</p>
            </motion.header>

            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
                    {messages.map((msg, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: msg.role === 'user' ? 'var(--primary)' : 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {msg.role === 'user' ? <User size={18} color="white" /> : <Bot size={18} color="white" />}
                            </div>
                            <div style={{ maxWidth: '70%', background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-hover)', padding: '1rem 1.25rem', borderRadius: '1rem', color: msg.role === 'user' ? 'white' : 'var(--text)' }}>
                                <p style={{ lineHeight: 1.6 }}>{msg.content}</p>
                                {msg.sources && (
                                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                        <BookOpen size={12} style={{ display: 'inline', marginRight: '4px' }} /> Sources: {msg.sources.join(', ')}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sparkles size={18} color="white" className="animate-pulse" />
                            </div>
                            <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {[0, 1, 2].map(i => <span key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-dim)', animation: `pulse 1.5s ${i * 0.2}s infinite` }} />)}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask about any DSA concept..." style={{ flex: 1 }} />
                    <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
