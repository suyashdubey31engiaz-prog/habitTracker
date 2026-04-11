import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('install_dismissed')) return;

    // Detect iOS Safari (no beforeinstallprompt event)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    const standalone = window.navigator.standalone;
    if (ios && !standalone) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    // Android / Desktop Chrome
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('install_dismissed', '1');
  };

  if (!show || dismissed) return null;

  return (
    <div
      className="animate-slideDown"
      style={{
        position: 'fixed', bottom: 80, left: 16, right: 16,
        background: 'var(--primary)', color: 'white',
        borderRadius: 16, padding: '14px 16px',
        boxShadow: '0 8px 32px rgba(45,106,79,0.4)',
        zIndex: 45, display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <div style={{ fontSize: 28, flexShrink: 0 }}>🌿</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Install Habitual</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
          {isIOS
            ? "Tap Share → 'Add to Home Screen'"
            : 'Add to your home screen for the best experience'}
        </div>
      </div>
      {!isIOS && (
        <button
          onClick={handleInstall}
          style={{
            background: 'white', color: 'var(--primary)',
            border: 'none', borderRadius: 10, padding: '8px 14px',
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            fontFamily: 'DM Sans, sans-serif'
          }}
        >
          <Download size={14} /> Install
        </button>
      )}
      <button
        onClick={handleDismiss}
        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', flexShrink: 0, padding: 4 }}
      >
        <X size={18} />
      </button>
    </div>
  );
}