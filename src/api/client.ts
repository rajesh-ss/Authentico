import axios from 'axios';
import { authApi } from '@/api/endpoints/auth';

// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3600', // Match backend port
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 500000, // 100 seconds timeout
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

// Variables for handling refresh token concurrency
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized with specific error message
    // If the error is COOKIE_MISSING, try to refresh the token
    if (
      error.response?.status === 401 &&
      error.response?.data?.error_message === 'COOKIE_MISSING' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        // We use the base axios instance to avoid circular interceptor calls
        const response = await axios.post(
          `${apiClient.defaults.baseURL}${authApi.refresh}`,
          {},
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          // Refresh successful
          // If the backend sets cookies, they are automatically handled.
          // If you need to use the token from response.data.data.accessToken, you might need to attach it here.
          // Assuming cookie-based auth flow as standard across the app.

          processQueue(null, response.data.data.accessToken);
          isRefreshing = false;

          return apiClient(originalRequest);
        } else {
          // Refresh failed logically
          processQueue(new Error('Refresh failed'), null);
          isRefreshing = false;
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed (network error or 401/403 on refresh endpoint)
        processQueue(refreshError, null);
        isRefreshing = false;

        // Optional: Redirect to login or dispatch logout action
        // window.location.href = '/auth/login';

        return Promise.reject(refreshError);
      }
    }

    // Default error handling for other cases
    if (error.response) {
      // 401 Unauthorized (other than COOKIE_MISSING or retry failed)
      if (error.response.status === 401) {
        console.warn('Unauthorized access. Please login again.');
        // Consider redirecting to login if this wasn't a handled refresh attempt
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
