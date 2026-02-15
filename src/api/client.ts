import axios from 'axios';

// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3600', // Match backend port
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for additional configuration if needed
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error codes globally
    if (error.response) {
      // 401 Unauthorized: Redirect to login or refresh token
      if (error.response.status === 401) {
        // You might want to dispatch a logout action here or clear storage
        // localStorage.removeItem('auth_token');
        // window.location.href = '/auth/login';
        console.warn('Unauthorized access. Please login again.');
      }

      // 403 Forbidden
      if (error.response.status === 403) {
        console.warn('Access forbidden.');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
