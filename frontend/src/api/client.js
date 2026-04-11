import axios from 'axios';
import { enqueue, getQueue, removeFromQueue } from '../utils/offlineQueue';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('ht_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    const isNetworkError = !err.response;
    const is401 = err.response?.status === 401;

    if (is401) {
      localStorage.removeItem('ht_token');
      localStorage.removeItem('ht_user');
    }

    // Queue write operations when offline
    if (isNetworkError && err.config) {
      const { method, url, data } = err.config;
      const isMutation = ['post','put','patch','delete'].includes(method?.toLowerCase());
      if (isMutation) {
        await enqueue(method, url, data ? JSON.parse(data) : null);
        console.log('[Offline] Queued:', method?.toUpperCase(), url);
        // Return a fake success so the UI optimistic update stays
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

  console.log(`[Sync] Flushing ${queue.length} offline operations...`);

  for (const item of queue) {
    try {
      const token = localStorage.getItem('ht_token');
      await axios({
        method: item.method,
        url: item.url,
        data: item.data,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      await removeFromQueue(item.id);
      console.log(`[Sync] ✅ Replayed: ${item.method?.toUpperCase()} ${item.url}`);
    } catch (err) {
      console.warn(`[Sync] ❌ Failed to replay:`, item, err.message);
    }
  }
}

// Listen for reconnection and auto-flush
window.addEventListener('online', () => {
  console.log('[Network] Back online — syncing...');
  flushOfflineQueue();
});

export default api;