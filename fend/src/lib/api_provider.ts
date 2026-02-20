import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (where Zustand persist stores it)
    const authStorage = localStorage.getItem('auth-storage');
    
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem('auth-storage');
      
      // Optionally redirect to home or show login modal
      // You can dispatch a custom event or use a callback here
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      
      // You might want to redirect or show a message
      console.warn('Authentication expired. Please login again.');
    }
    
    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.warn('Access denied. Insufficient permissions.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;