import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const { token } = JSON.parse(user);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                // Invalid user data
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email, password, language_preference = 'en') =>
        api.post('/auth/register', { name, email, password, language_preference }),
    getProfile: () => api.get('/auth/profile'),
};

// Topics API
export const topicsAPI = {
    getAll: () => api.get('/topics'),
    getById: (id) => api.get(`/topics/${id}`),
    getForSelection: () => api.get('/topics/selection'),
    getLeetcode: (topicId) => api.get(`/topics/${topicId}/leetcode`),
    getSubtopics: (topicId) => api.get(`/topics/${topicId}/subtopics`),
};

// Assessment API
export const assessmentAPI = {
    getDiagnostic: (topicIds = null) => {
        const params = topicIds ? `?topic_ids=${topicIds.join(',')}` : '';
        return api.get(`/assessment/diagnostic${params}`);
    },
    submit: (data) => api.post('/assessment/submit', data),
    getTopicQuestions: (topicId) => api.get(`/assessment/topic/${topicId}`),
    skipQuestion: (questionId) => api.post('/assessment/skip-question', { question_id: questionId }),
    skipAll: (startFromBasics = true) => api.post('/assessment/skip-all', { start_from_basics: startFromBasics }),
    getReassess: () => api.get('/assessment/reassess'),
};

// Roadmap API
export const roadmapAPI = {
    get: () => api.get('/roadmap'),
    update: () => api.post('/roadmap/update'),
};

// Resources API
export const resourcesAPI = {
    getByTopic: (topicId, language = 'en') => api.get(`/resources/topic/${topicId}?language=${language}`),
};

// Subtopics API
export const subtopicsAPI = {
    getByTopic: (topicId) => api.get(`/subtopics/${topicId}`),
    toggleComplete: (subtopicId, completed) => api.post(`/subtopics/${subtopicId}/complete`, { completed }),
    getUserProgress: () => api.get('/subtopics/user/progress'),
    completeAll: () => api.post('/subtopics/complete-all'),
};

// Notes API
export const notesAPI = {
    getByTopic: (topicId) => api.get(`/notes/topic/${topicId}`),
    create: (topicId, content) => api.post('/notes', { topic_id: topicId, content }),
    update: (noteId, content) => api.put(`/notes/${noteId}`, { content }),
    delete: (noteId) => api.delete(`/notes/${noteId}`),
};

// Chat API
export const chatAPI = {
    send: (message, topicId) => api.post('/chat', { message, topic_id: topicId }),
};

export const recommendationsAPI = {
    get: () => api.get('/recommendations'),
    generate: () => api.post('/recommendations/generate'),
};

export default api;
