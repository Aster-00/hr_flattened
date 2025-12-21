// Axios HTTP client configuration
// src/app/leaves/api/leaves.client.ts
import axios, { InternalAxiosRequestConfig } from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const leavesApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send cookies with every request for JWT auth
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
leavesApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`🔵 Leaves API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
leavesApiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Leaves API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ Leaves API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      
      // Redirect to login on 401 Unauthorized
      if (error.response.status === 401) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          console.log('🔴 Unauthorized - Redirecting to login');
          window.location.href = '/login';
        }
      }
    } else {
      console.error(`❌ Network Error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);
