import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const apiService = {
  // Document endpoints
  uploadDocument: (formData) => {
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getDocuments: (params = {}) => {
    return api.get('/documents', { params });
  },

  getDocument: (id) => {
    return api.get(`/documents/${id}`);
  },

  deleteDocument: (id) => {
    return api.delete(`/documents/${id}`);
  },

  // Analysis endpoints
  analyzeDocument: (id) => {
    return api.post(`/analysis/${id}/analyze`);
  },

  reAnalyzeDocument: (id) => {
    return api.post(`/analysis/${id}/re-analyze`);
  },

  getAnalysis: (id) => {
    return api.get(`/analysis/${id}`);
  },

  getAnalyticsStats: () => {
    return api.get('/analysis/stats/overview');
  },

  // Health check
  healthCheck: () => {
    return api.get('/health');
  },
};

export default apiService;