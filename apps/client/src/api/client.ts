import axios, { AxiosInstance } from 'axios';

const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
});

// Interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
