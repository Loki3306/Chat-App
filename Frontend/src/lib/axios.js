// src/lib/axios.js

import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore.js'; // Import useAuthStore

const axiosInstance = axios.create({
    baseURL: "http://localhost:5001/api",
    withCredentials: true,
    timeout: 5000,
});

// Add an interceptor to attach the current socket ID to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const socket = useAuthStore.getState().socket; // Get the current socket instance from auth store
        if (socket && socket.id) {
            config.headers['X-Socket-ID'] = socket.id; // Add socket ID to a custom header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export { axiosInstance };