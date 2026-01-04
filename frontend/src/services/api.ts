import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Handle 401 Unauthorized
    if (err.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    // Handle Retry Logic (Status 5xx or Network Error)
    if (
      !originalRequest._retry &&
      (err.response?.status >= 500 || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED')
    ) {
      originalRequest._retry = true;
      const retryCount = originalRequest._retryCount || 0;
      
      if (retryCount < 3) {
        originalRequest._retryCount = retryCount + 1;
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return axiosInstance(originalRequest);
      }
    }

    return Promise.reject(err);
  }
);

// API endpoints
export const api = {
  // Health check
  health: () => axiosInstance.get('/api/health'),

  // Stats
  stats: () => axiosInstance.get('/api/stats'),

  // Threats
  threats: (limit: number = 50) =>
    axiosInstance.get(`/api/threats/history?limit=${limit}`),

  // Threat search
  searchThreats: (query: string) =>
    axiosInstance.get(`/api/threats/search?q=${query}`),

  // Threat by ID
  getThreatById: (id: string) =>
    axiosInstance.get(`/api/threats/${id}`),

  // Anomaly detection
  detectAnomaly: (features: number[]) =>
    axiosInstance.post('/api/anomaly/detect', { features }),

  // Batch processing
  batchProcess: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/api/anomaly/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Dashboard stats
  dashboardStats: () =>
    axiosInstance.get('/api/dashboard/stats'),

  // Dashboard threats
  dashboardThreats: () =>
    axiosInstance.get('/api/dashboard/threats'),

  // Monitoring metrics
  monitoringMetrics: () =>
    axiosInstance.get('/api/monitoring/metrics'),

  // Admin metrics
  adminMetrics: () =>
    axiosInstance.get('/api/monitoring/admin/metrics'),

  // Models stats
  modelsStats: () =>
    axiosInstance.get('/api/monitoring/models/stats'),

  // Generate report
  generateReport: (data: any) =>
    axiosInstance.post('/api/reports/generate', data),

  // Download report
  downloadReport: (id: string) =>
    axiosInstance.get(`/api/reports/${id}`, {
      responseType: 'blob',
    }),

  // Direct axios access for custom calls
  get: (url: string, config?: any) =>
    axiosInstance.get(url, config),

  post: (url: string, data?: any, config?: any) =>
    axiosInstance.post(url, data, config),

  put: (url: string, data?: any, config?: any) =>
    axiosInstance.put(url, data, config),

  delete: (url: string, config?: any) =>
    axiosInstance.delete(url, config),
};

export default axiosInstance;
