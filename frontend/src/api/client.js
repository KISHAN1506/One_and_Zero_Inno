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
    register: (name, email, password) => api.post('/auth/register', { name, email, password }),
    getProfile: () => api.get('/auth/profile'),
};

// Topics API
export const topicsAPI = {
    getAll: () => api.get('/topics'),
    getById: (id) => api.get(`/topics/${id}`),
};

// Assessment API
export const assessmentAPI = {
    getDiagnostic: (topicIds) => {
        let url = '/assessment/diagnostic';
        if (topicIds && topicIds.length > 0) {
            const params = new URLSearchParams();
            topicIds.forEach(id => params.append('topic_ids', id));
            url += `?${params.toString()}`;
        }
        return api.get(url);
    },
    submit: (answers) => api.post('/assessment/submit', { answers }),
    getTopicQuestions: (topicId) => api.get(`/assessment/topic/${topicId}`),
};

// Roadmap API
export const roadmapAPI = {
    get: () => api.get('/roadmap'),
    update: () => api.post('/roadmap/update'),
};

// Resources API
export const resourcesAPI = {
    getByTopic: (topicId) => api.get(`/resources/topic/${topicId}`),
};

// Chat API
export const chatAPI = {
    send: (message, topicId) => api.post('/chat', { message, topic_id: topicId }),
};

export default api;
