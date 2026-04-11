import { useState } from 'react';
import { Check, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES, FONTS } from '../context/ThemeContext';
import api from '../api/client';
import { flushOfflineQueue } from '../api/client';
import { getQueue } from '../utils/offlineQueue';

function ThemePreview({ themeKey, theme, active, onClick }) {
  const v = theme.vars;
  const isNeonPreview      = themeKey === 'neon';
  const isAuroraPreview    = themeKey === 'aurora';
  const isCyberpunkPreview = themeKey === 'cyberpunk';

  return (
    <button
      onClick={onClick}
      style={{
        background: v['--bg'],
        border: active ? `2.5px solid ${v['--primary']}` : `1.5px solid ${v['--border']}`,
        borderRadius: isCyberpunkPreview ? 4 : 14,
        padding: 12, cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        boxShadow: active
          ? (isNeonPreview || isAuroraPreview ? `0 0 16px ${v['--primary']}80` : v['--shadow-lg'])
          : 'none',
        transition: 'all 0.2s', minHeight: 88,
      }}
    >
      {/* Neon scanlines */}
      {isNeonPreview && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,136,0.06) 3px, rgba(0,255,136,0.06) 4px)',
        }} />
      )}
      {/* Aurora shimmer */}
      {isAuroraPreview && active && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none', opacity: 0.15,
          background: 'linear-gradient(135deg, #a78bfa, #34d399, #60a5fa)',
          backgroundSize: '200% 200%',
          animation: 'auroraShift 4s ease infinite',
        }} />
      )}
      {/* Cyberpunk clip */}
      {isCyberpunkPreview && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 0, height: 0,
          borderTop: `12px solid ${v['--primary']}`,
          borderLeft: '12px solid transparent',
        }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            background: v['--surface'], border: `1px solid ${v['--border']}`,
            borderRadius: isCyberpunkPreview ? 2 : 8,
            padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: (isNeonPreview || isAuroraPreview) && i === 0 ? `0 0 6px ${v['--primary']}50` : 'none',
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
              background: i === 0 ? v['--primary'] : v['--border'],
              boxShadow: (isNeonPreview || isAuroraPreview) && i === 0 ? `0 0 5px ${v['--primary']}` : 'none',
            }} />
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: i === 0 ? v['--primary'] + '40' : v['--surface2'] }} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: v['--text'], display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>{theme.emoji}</span>
        <span>{theme.label}</span>
      </div>

      {active && (
        <div style={{
          position: 'absolute', top: 8, right: 8, width: 18, height: 18,
          borderRadius: '50%', background: v['--primary'],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: (isNeonPreview || isAuroraPreview) ? `0 0 8px ${v['--primary']}` : 'none',
        }}>
          <Check size={11} color={theme.dark ? '#000' : '#fff'} strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

export default function Profile() {
  const { user, login, logout } = useAuth();
  const { themeKey, setThemeKey, fontKey, setFontKey, isNeon } = useTheme();

  const [name, setName]               = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSaved, setNameSaved]     = useState(false);

  const [passwords, setPasswords]     = useState({ current: '', next: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError]     = useState('');
  const [passSaved, setPassSaved]     = useState(false);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearLoading, setClearLoading]         = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  // Theme-aware card class — aurora and cyberpunk get special treatment
  const cardClass = (() => {
    if (themeKey === 'neon')      return 'card-neon';
    if (themeKey === 'aurora')    return 'card-aurora';
    if (themeKey === 'cyberpunk') return 'cyberpunk-card';
    return 'card';
  })();

  const handleSaveName = async () => {
    if (!name.trim() || name === user?.name) return;
    setNameLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name: name.trim() });
      login(localStorage.getItem('ht_token'), data.user);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (err) { console.error(err); }
    finally { setNameLoading(false); }
  };

  const handleChangePassword = async () => {
    setPassError('');
    if (passwords.next !== passwords.confirm) { setPassError("Passwords don't match"); return; }
    if (passwords.next.length < 6) { setPassError('Min 6 characters'); return; }
    setPassLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: passwords.current, newPassword: passwords.next });
      setPasswords({ current: '', next: '', confirm: '' });
      setPassSaved(true);
      setTimeout(() => setPassSaved(false), 2000);
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed');
    } finally { setPassLoading(false); }
  };

  const handleClearData = async () => {
    setClearLoading(true);
    try {
      await api.delete('/auth/data');
      logout();
    } catch { setClearLoading(false); }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    await flushOfflineQueue();
    const q = await getQueue();
    setSyncMsg(q.length === 0 ? '✅ All synced!' : `${q.length} items still pending`);
    setSyncing(false);
    setTimeout(() => setSyncMsg(''), 3000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
      <div className="animate-fadeUp">
        <h1 style={{ fontSize: 24, margin: 0 }} className={isNeon ? 'neon-text' : ''}>
          Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{user?.email}</p>
      </div>

      {/* Avatar + name */}
      <div className={`${cardClass} p-5 animate-fadeUp`}>
        <div className="flex items-center gap-4 mb-5">
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'var(--primary)', color: 'var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-heading)',
            boxShadow: isNeon || themeKey === 'aurora' ? '0 0 16px var(--primary)' : 'none',
          }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
        </div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Display name
        </label>
        <div className="flex gap-2">
          <input className="input-field" value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
          <button onClick={handleSaveName}
            disabled={nameLoading || name === user?.name || !name.trim()}
            className={`btn-primary flex-shrink-0 ${isNeon ? 'neon-btn' : ''}`}
            style={{ padding: '10px 16px', fontSize: 14 }}>
            {nameSaved ? '✅ Saved' : nameLoading ? '…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Theme gallery */}
      <div className={`${cardClass} p-5 animate-fadeUp`}>
        <h3 style={{ fontSize: 16, margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>Theme</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>Choose your vibe</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {Object.entries(THEMES).map(([key, theme]) => (
            <ThemePreview
              key={key} themeKey={key} theme={theme}
              active={themeKey === key}
              onClick={() => setThemeKey(key)}
            />
          ))}
        </div>
      </div>

      {/* Font picker */}
      <div className={`${cardClass} p-5 animate-fadeUp`}>
        <h3 style={{ fontSize: 16, margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>Font</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>Personalise your typography</p>
        <div className="flex flex-col gap-2">
          {Object.entries(FONTS).map(([key, font]) => (
            <button key={key} onClick={() => setFontKey(key)}
              style={{
                background: fontKey === key ? 'var(--primary-pale)' : 'var(--surface2)',
                border: fontKey === key ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: fontKey === key && (isNeon || themeKey === 'aurora') ? '0 0 10px var(--primary)' : 'none',
                transition: 'all 0.2s',
              }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{font.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', fontFamily: `'${font.heading}', serif` }}>
                    {font.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: `'${font.body}', sans-serif` }}>
                    Aa Bb Cc 123 — {font.heading}
                  </div>
                </div>
              </div>
              {fontKey === key && (
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: (isNeon || themeKey === 'aurora') ? '0 0 8px var(--primary)' : 'none',
                }}>
                  <Check size={12} color={THEMES[themeKey]?.dark ? '#000' : '#fff'} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Offline sync */}
      <div className={`${cardClass} p-5 animate-fadeUp`}>
        <h3 style={{ fontSize: 16, margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>Offline Sync</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
          Changes made offline are stored on your device and synced automatically when you reconnect.
        </p>
        <div className="flex items-center gap-3">
          <button onClick={handleManualSync} disabled={syncing}
            className={`btn-primary flex items-center gap-2 ${isNeon ? 'neon-btn' : ''}`}
            style={{ padding: '10px 18px', fontSize: 14 }}>
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
          {syncMsg && (
            <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{syncMsg}</span>
          )}
        </div>
      </div>

      {/* Change password */}
      <div className={`${cardClass} p-5 animate-fadeUp`}>
        <h3 style={{ fontSize: 16, margin: '0 0 16px', fontFamily: 'var(--font-heading)' }}>Change Password</h3>
        <div className="space-y-3">
          {passError && (
            <div className="p-3 rounded-xl text-sm animate-slideDown"
                 style={{ background: '#fff0f0', color: 'var(--danger)', border: '1px solid #fecaca' }}>
              {passError}
            </div>
          )}
          {[
            { key: 'current', placeholder: 'Current password' },
            { key: 'next',    placeholder: 'New password (min 6)' },
            { key: 'confirm', placeholder: 'Confirm new password' },
          ].map(({ key, placeholder }) => (
            <input key={key} type="password" className="input-field"
              placeholder={placeholder} value={passwords[key]}
              onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))} />
          ))}
          <button onClick={handleChangePassword}
            disabled={passLoading || !passwords.current || !passwords.next || !passwords.confirm}
            className={`btn-primary w-full ${isNeon ? 'neon-btn' : ''}`}>
            {passSaved ? '✅ Password changed!' : passLoading ? 'Changing…' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className={`${cardClass} p-5 animate-fadeUp`}
           style={{ borderColor: 'var(--danger)' }}>
        <h3 style={{ fontSize: 15, margin: '0 0 4px', color: 'var(--danger)', fontFamily: 'var(--font-heading)' }}>
          Danger Zone
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
          Permanently delete all your habits and log data.
        </p>
        {!showClearConfirm ? (
          <button onClick={() => setShowClearConfirm(true)}
            style={{ background: 'transparent', border: '1.5px solid var(--danger)', color: 'var(--danger)', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Clear All Data
          </button>
        ) : (
          <div className="p-3 rounded-xl animate-slideDown"
               style={{ background: '#fff0f0', border: '1px solid #fecaca' }}>
            <p style={{ fontSize: 13, color: 'var(--danger)', margin: '0 0 12px', fontWeight: 600 }}>
              This cannot be undone. All habits and logs deleted forever.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
                Cancel
              </button>
              <button onClick={handleClearData} disabled={clearLoading}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'var(--danger)', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                {clearLoading ? 'Deleting…' : 'Yes, delete everything'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="w-full py-3 rounded-xl font-semibold text-sm animate-fadeUp"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
        Sign Out
      </button>
    </div>
  );
}