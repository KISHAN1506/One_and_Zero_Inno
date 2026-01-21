import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TopicSelection from './pages/TopicSelection';
import Assessment from './pages/Assessment';
import Roadmap from './pages/Roadmap';
import Resources from './pages/Resources';
import Chatbot from './pages/Chatbot';
import QuizHistory from './pages/QuizHistory';
import VideoPlayer from './pages/VideoPlayer';

function App() {
    return (
        <ThemeProvider>
            <UserProvider>
                <Router>
                    <Navbar />
                    <div className="ai-bg">
                        <div className="ai-bg-orb"></div>
                    </div>
                    <div className="app-container">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/topic-selection" element={<TopicSelection />} />
                            <Route path="/assessment" element={<Assessment />} />
                            <Route path="/quiz-history" element={<QuizHistory />} />
                            <Route path="/roadmap" element={<Roadmap />} />
                            <Route path="/resources/:topicId" element={<Resources />} />
                            <Route path="/video" element={<VideoPlayer />} />
                            <Route path="/chat" element={<Chatbot />} />
                        </Routes>
                    </div>
                </Router>
            </UserProvider>
        </ThemeProvider>
    );
}

export default App;
