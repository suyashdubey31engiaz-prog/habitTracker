import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

// Requires user@domain.tld — rejects a@b, a@b.c, etc.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!isLogin && form.name.trim().length < 2)
      return 'Name must be at least 2 characters';
    if (!form.email.trim())
      return 'Email address is required';
    if (!EMAIL_REGEX.test(form.email.trim()))
      return 'Please enter a valid email address (e.g. you@example.com)';
    if (form.password.length < 6)
      return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: form.email.trim().toLowerCase(), password: form.password }
        : { name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password };
      const { data } = await api.post(endpoint, payload);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-stretch" style={{ background: 'var(--bg)' }}>
      {/* Left panel — illustration, desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
           style={{ background: 'var(--primary)' }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', right: -80, top: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)'
        }}/>
        <div style={{
          position: 'absolute', right: 40, bottom: 100,
          width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)'
        }}/>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
            <Leaf size={22} color="white" />
          </div>
          <span style={{ color: 'white', fontFamily: 'DM Serif Display, serif', fontSize: 22 }}>
            Habitual
          </span>
        </div>

        <div>
          <h1 style={{ color: 'white', fontSize: 48, lineHeight: 1.2, marginBottom: 16 }}>
            Small steps,<br/><em>big changes.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, lineHeight: 1.6, maxWidth: 360 }}>
            Track your daily habits, visualize your growth, and build the life you want — one day at a time.
          </p>
        </div>

        {/* Habit preview cards */}
        <div className="space-y-3">
          {[
            { emoji: '💧', name: 'Drink 8 glasses', streak: 12 },
            { emoji: '📚', name: 'Read 20 minutes', streak: 7 },
            { emoji: '🏃', name: 'Morning run', streak: 21 },
          ].map(h => (
            <div key={h.name} className="flex items-center justify-between p-3 rounded-xl"
                 style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 22 }}>{h.emoji}</span>
                <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{h.name}</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                🔥 {h.streak}d
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 px-6 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl"
               style={{ background: 'var(--primary)' }}>
            <Leaf size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: 'var(--primary)' }}>
            Habitual
          </span>
        </div>

        <div className="w-full max-w-sm animate-fadeUp">
          <h2 style={{ fontSize: 28, marginBottom: 6 }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 15 }}>
            {isLogin ? 'Login to see your progress' : 'Start your habit journey today'}
          </p>

          {error && (
            <div className="animate-slideDown mb-4 p-3 rounded-xl text-sm"
                 style={{ background: '#fff0f0', color: 'var(--danger)', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Your name
                </label>
                <input
                  name="name"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Suyash"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Email address
              </label>
              <input
                name="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete={isLogin ? 'email' : 'new-email'}
                inputMode="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingRight: 44 }}
                  placeholder={isLogin ? 'Your password' : 'Min 6 characters'}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              ) : (
                <>
                  {isLogin ? 'Log In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              className="font-semibold hover:underline"
              style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isLogin ? 'Sign up free' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}