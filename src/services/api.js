import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
};

// Car API
export const carAPI = {
    getAll: () => api.get('/cars'),
    getOne: (id) => api.get(`/cars/${id}`),
    create: (carData) => api.post('/cars', carData),
    update: (id, carData) => api.put(`/cars/${id}`, carData),
    delete: (id) => api.delete(`/cars/${id}`),
};

// Package API
export const packageAPI = {
    getAll: () => api.get('/packages'),
    getOne: (id) => api.get(`/packages/${id}`),
    create: (packageData) => api.post('/packages', packageData),
    update: (id, packageData) => api.put(`/packages/${id}`, packageData),
    delete: (id) => api.delete(`/packages/${id}`),
};

// Service Package API
export const servicePackageAPI = {
    getAll: () => api.get('/service-packages'),
    getOne: (id) => api.get(`/service-packages/${id}`),
    create: (serviceData) => api.post('/service-packages', serviceData),
    update: (id, serviceData) => api.put(`/service-packages/${id}`, serviceData),
    delete: (id) => api.delete(`/service-packages/${id}`),
};

// Payment API
export const paymentAPI = {
    getAll: () => api.get('/payments'),
    getOne: (id) => api.get(`/payments/${id}`),
    create: (paymentData) => api.post('/payments', paymentData),
    getBill: (servicePackageId) => api.get(`/payments/bill/${servicePackageId}`),
};

// Report API
export const reportAPI = {
    getDaily: (date) => api.get('/reports/daily', { params: { date } }),
    getSummary: (startDate, endDate) => api.get('/reports/summary', { params: { startDate, endDate } }),
};

export default api;