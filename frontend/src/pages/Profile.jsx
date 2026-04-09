import { useState } from 'react';
import { User, Lock, Sun, Moon, Trash2, Check, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

export default function Profile() {
  const { user, login, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim() || name === user?.name) return;
    setNameLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name: name.trim() });
      login(localStorage.getItem('ht_token'), data.user);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPassError('');
    if (passwords.next !== passwords.confirm) { setPassError('New passwords do not match'); return; }
    if (passwords.next.length < 6) { setPassError('Password must be at least 6 characters'); return; }
    setPassLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: passwords.current, newPassword: passwords.next });
      setPasswords({ current: '', next: '', confirm: '' });
      setPassSaved(true);
      setTimeout(() => setPassSaved(false), 2000);
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleClearData = async () => {
    setClearLoading(true);
    try {
      await api.delete('/auth/data');
      logout();
    } catch (err) {
      console.error(err);
      setClearLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
      <div className="animate-fadeUp">
        <h1 style={{ fontSize: 24, margin: 0 }}>Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{user?.email}</p>
      </div>

      {/* Avatar + name */}
      <div className="card p-5 animate-fadeUp">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
               style={{ background: 'var(--primary)', color: 'white', fontSize: 26 }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
        </div>

        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Display name</label>
        <div className="flex gap-2">
          <input
            className="input-field"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
          />
          <button
            onClick={handleSaveName}
            disabled={nameLoading || name === user?.name || !name.trim()}
            className="btn-primary flex-shrink-0 flex items-center gap-1.5"
            style={{ padding: '10px 16px', fontSize: 14 }}
          >
            {nameSaved ? <><Check size={15} /> Saved</> : nameLoading ? '...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Theme toggle */}
      <div className="card p-5 animate-fadeUp">
        <h3 style={{ fontSize: 15, margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>Appearance</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>Choose your preferred theme</p>
        <div className="flex gap-3">
          {[
            { label: 'Light', icon: Sun, active: !isDark },
            { label: 'Dark',  icon: Moon, active: isDark },
          ].map(({ label, icon: Icon, active }) => (
            <button key={label} onClick={toggleTheme}
              className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl transition-all"
              style={{
                background: active ? 'var(--primary-pale)' : 'var(--surface2)',
                border: active ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer', color: active ? 'var(--primary)' : 'var(--text-muted)'
              }}>
              <Icon size={20} />
              <span style={{ fontSize: 13, fontWeight: active ? 700 : 400 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="card p-5 animate-fadeUp">
        <h3 style={{ fontSize: 15, margin: '0 0 16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>Change Password</h3>
        <div className="space-y-3">
          {passError && (
            <div className="p-3 rounded-xl text-sm animate-slideDown"
                 style={{ background: '#fff0f0', color: 'var(--danger)', border: '1px solid #fecaca' }}>
              {passError}
            </div>
          )}
          {[
            { key: 'current', placeholder: 'Current password' },
            { key: 'next',    placeholder: 'New password (min 6 chars)' },
            { key: 'confirm', placeholder: 'Confirm new password' },
          ].map(({ key, placeholder }) => (
            <input key={key} type="password" className="input-field"
              placeholder={placeholder} value={passwords[key]}
              onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))} />
          ))}
          <button
            onClick={handleChangePassword}
            disabled={passLoading || !passwords.current || !passwords.next || !passwords.confirm}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {passSaved ? <><Check size={15} /> Password changed!</> : passLoading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-5 animate-fadeUp" style={{ border: '1px solid var(--danger)30' }}>
        <h3 style={{ fontSize: 15, margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: 'var(--danger)' }}>
          Danger Zone
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
          Delete all your habits and log data. This cannot be undone.
        </p>
        {!showClearConfirm ? (
          <button onClick={() => setShowClearConfirm(true)}
            style={{ background: 'transparent', border: '1.5px solid var(--danger)', color: 'var(--danger)', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Clear All Data
          </button>
        ) : (
          <div className="p-3 rounded-xl animate-slideDown space-y-3"
               style={{ background: '#fff0f0', border: '1px solid #fecaca' }}>
            <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0, fontWeight: 600 }}>
              Are you absolutely sure? All habits and logs will be permanently deleted.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                Cancel
              </button>
              <button onClick={handleClearData} disabled={clearLoading}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'var(--danger)', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {clearLoading ? 'Deleting...' : 'Yes, delete everything'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="w-full py-3 rounded-xl font-semibold text-sm animate-fadeUp"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
        Sign Out
      </button>
    </div>
  );
}