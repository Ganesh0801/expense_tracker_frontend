// import axios from 'axios';

// const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// API.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }
//     return Promise.reject(err);
//   }
// );

// export const authAPI = {
//   register: (data) => API.post('/auth/register', data),
//   login: (data) => API.post('/auth/login', data),
//   forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
//   resetPassword: (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
//   verifyEmail: (token) => API.get(`/auth/verify-email/${token}`),
//   getMe: () => API.get('/auth/me'),
// };

// export const transactionAPI = {
//   getDashboard: () => API.get('/transactions/dashboard'),
//   getAll: (params) => API.get('/transactions', { params }),
//   create: (data) => API.post('/transactions', data),
//   update: (id, data) => API.put(`/transactions/${id}`, data),
//   delete: (id) => API.delete(`/transactions/${id}`),
// };

// export const reportAPI = {
//   download: (month, year) => API.get(`/reports/monthly/${month}/${year}`, { responseType: 'blob' }),
// };

// export const userAPI = {
//   updateProfile: (data) => API.put('/user/profile', data),
//   changePassword: (data) => API.put('/user/change-password', data),
// };

// export default API;


import axios from 'axios';

const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) { 
      localStorage.removeItem('token'); 
      localStorage.removeItem('user'); 
      window.location.href = '/login'; 
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  verifyOTP: (data) => API.post('/auth/verify-otp', data),   // ✅ Added
  resendOTP: (data) => API.post('/auth/resend-otp', data),   // ✅ Added
  login: (data) => API.post('/auth/login', data),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => API.get(`/auth/verify-email/${token}`),
  getMe: () => API.get('/auth/me'),
};

export const transactionAPI = {
  getDashboard: () => API.get('/transactions/dashboard'),
  getAll: (params) => API.get('/transactions', { params }),
  create: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
};

export const reportAPI = {
  download: (month, year) => API.get(`/reports/monthly/${month}/${year}`, { responseType: 'blob' }),
};

export const userAPI = {
  updateProfile: (data) => API.put('/user/profile', data),
  changePassword: (data) => API.put('/user/change-password', data),
};

export default API;