import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ht_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: clear tokens but DO NOT do window.location.href redirect here.
// AuthContext handles the redirect via user state becoming null → ProtectedRoute redirects.
// Doing a full-page redirect here AND having AuthContext catch the error causes a race condition.
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Only clear storage — let React router handle the redirect
      localStorage.removeItem('ht_token');
      localStorage.removeItem('ht_user');
    }
    return Promise.reject(err);
  }
);

export default api;