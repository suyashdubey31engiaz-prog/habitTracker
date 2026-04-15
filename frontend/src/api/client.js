import axios from 'axios';
import { enqueue, getQueue, removeFromQueue } from '../utils/offlineQueue';

// FIXED: Base URL now properly checks for your Vite environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // Increased slightly for slower network conditions
});

// Request Interceptor: Injects your auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ht_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor: Handles 401s and your Offline Queue logic
api.interceptors.response.use(
  res => res,
  async err => {
    const isNetworkError = !err.response;
    const is401 = err.response?.status === 401;

    // Handle session expiration
    if (is401) {
      localStorage.removeItem('ht_token');
      localStorage.removeItem('ht_user');
      // Optional: window.location.href = '/login';
    }

    // ORIGINAL OFFLINE SYNC LOGIC: preserved and integrated
    if (isNetworkError && err.config) {
      const { method, url, data } = err.config;
      const isMutation = ['post','put','patch','delete'].includes(method?.toLowerCase());
      
      if (isMutation) {
        // We parse data back to object if it was stringified by axios
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        await enqueue(method, url, payload);
        
        console.log('[Offline] Queued for later:', method?.toUpperCase(), url);
        
        // Return a fake success so your UI components can still do optimistic updates
        return Promise.resolve({ data: null, __queued: true });
      }
    }

    return Promise.reject(err);
  }
);

// Replay queued operations when back online
export async function flushOfflineQueue() {
  const queue = await getQueue();
  if (!queue.length) return;

  console.log(`[Sync] Attempting to sync ${queue.length} pending actions...`);

  for (const item of queue) {
    try {
      const token = localStorage.getItem('ht_token');
      // Using a fresh axios call to avoid the interceptor loop
      await axios({
        method: item.method,
        url: (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + item.url.replace('/api', ''),
        data: item.data,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      await removeFromQueue(item.id);
      console.log(`[Sync] ✅ Replayed: ${item.method?.toUpperCase()} ${item.url}`);
    } catch (err) {
      console.warn(`[Sync] ❌ Failed to replay:`, item.url, err.message);
      // We stop flushing if we hit a persistent network error to maintain order
      if (!err.response) break; 
    }
  }
}

// Auto-sync listener
window.addEventListener('online', () => {
  console.log('[Network] Connection restored — flushing queue');
  flushOfflineQueue();
});

export default api;