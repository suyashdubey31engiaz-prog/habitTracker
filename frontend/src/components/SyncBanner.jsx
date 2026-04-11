import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { flushOfflineQueue } from '../api/client';
import { getQueue } from '../utils/offlineQueue';

export default function SyncBanner() {
  const [online, setOnline]   = useState(navigator.onLine);
  const [queued, setQueued]   = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    const checkQueue = async () => {
      const q = await getQueue();
      setQueued(q.length);
    };

    const goOnline = async () => {
      setOnline(true);
      await checkQueue();
    };
    const goOffline = () => {
      setOnline(false);
      checkQueue();
    };

    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    checkQueue();

    // Poll queue size every 5s
    const interval = setInterval(checkQueue, 5000);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await flushOfflineQueue();
    const q = await getQueue();
    setQueued(q.length);
    setSyncing(false);
    setJustSynced(true);
    setTimeout(() => setJustSynced(false), 2500);
  };

  // Nothing to show
  if (online && queued === 0 && !justSynced) return null;

  const bgColor  = !online ? '#e07070' : queued > 0 ? 'var(--accent)' : 'var(--primary)';
  const message  = !online
    ? `Offline — ${queued > 0 ? `${queued} change${queued !== 1 ? 's' : ''} queued` : 'changes will sync when reconnected'}`
    : queued > 0
      ? `${queued} change${queued !== 1 ? 's' : ''} waiting to sync`
      : '✅ All changes synced!';

  return (
    <div
      className="animate-slideDown"
      style={{
        position: 'fixed', top: 56, left: 0, right: 0,
        background: bgColor, color: 'white',
        padding: '8px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 35, fontSize: 13, fontWeight: 600,
      }}
    >
      <div className="flex items-center gap-2">
        {online ? <Wifi size={15} /> : <WifiOff size={15} />}
        {message}
      </div>
      {online && queued > 0 && (
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            background: 'rgba(255,255,255,0.25)',
            border: 'none', borderRadius: 8, color: 'white',
            padding: '4px 10px', fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: 'var(--font-body, DM Sans, sans-serif)',
            fontWeight: 700,
          }}
        >
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Sync now'}
        </button>
      )}
    </div>
  );
}