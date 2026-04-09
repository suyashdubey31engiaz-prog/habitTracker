import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Flame, Trophy, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import AddHabitModal from '../components/AddHabitModal';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Confetti burst component
function Confetti({ show }) {
  if (!show) return null;
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  const colors = ['#52b788', '#d4a853', '#7b9ef4', '#e07070', '#c084fc', '#38bdf8'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99, overflow: 'hidden' }}>
      {pieces.map(i => {
        const color = colors[i % colors.length];
        const left = `${Math.random() * 100}%`;
        const delay = `${Math.random() * 0.5}s`;
        const size = 6 + Math.random() * 8;
        return (
          <div key={i} style={{
            position: 'absolute', top: '-20px', left,
            width: size, height: size,
            background: color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confettiFall ${1.5 + Math.random()}s ${delay} ease-in forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }} />
        );
      })}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function ProgressRing({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
      <svg width="128" height="128" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface2)" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={pct === 100 ? '#d4a853' : 'var(--primary)'}
          strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="progress-ring-text" style={{ color: pct === 100 ? '#d4a853' : 'var(--primary)', lineHeight: 1 }}>
          {pct === 100 ? '🎉' : `${pct}%`}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{done}/{total}</div>
      </div>
    </div>
  );
}

function HabitCard({ habit, completed, streak, onToggle, animating }) {
  return (
    <div
      className="card flex items-center gap-4 p-4"
      style={{
        cursor: 'pointer',
        transform: animating ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.15s, background 0.2s, border-color 0.2s',
        background: completed ? 'var(--primary-pale)' : 'var(--surface)',
        borderColor: completed ? 'var(--primary-light)' : 'var(--border)',
      }}
      onClick={() => onToggle(habit._id, !completed)}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
           style={{ background: habit.color + '20', border: `1.5px solid ${habit.color}30` }}>
        {habit.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div style={{
          fontWeight: 600, fontSize: 15,
          textDecoration: completed ? 'line-through' : 'none',
          color: completed ? 'var(--text-muted)' : 'var(--text)'
        }}>
          {habit.name}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {habit.description && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {habit.description}
            </span>
          )}
          {streak > 0 && (
            <span style={{ fontSize: 11, color: '#e07070', fontWeight: 700, flexShrink: 0 }}>
              🔥 {streak}d
            </span>
          )}
        </div>
      </div>

      <div className={`habit-check ${completed ? 'checked' : ''}`}
           style={{ borderColor: completed ? habit.color : 'var(--border)', background: completed ? habit.color : 'transparent' }}>
        {completed && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [stats, setStats] = useState({ currentStreak: 0, bestStreak: 0, totalCompletions: 0, habitStats: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [animating, setAnimating] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevDoneCount = useRef(0);
  const today = getLocalDateStr();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [habitsRes, logsRes, statsRes] = await Promise.all([
        api.get('/habits'),
        api.get(`/logs?startDate=${today}&endDate=${today}`),
        api.get('/logs/stats'),
      ]);
      setHabits(habitsRes.data);
      const logMap = {};
      logsRes.data.forEach(l => { logMap[l.habitId] = l.completed; });
      setLogs(logMap);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggle = async (habitId, completed) => {
    setAnimating(habitId);
    setLogs(l => ({ ...l, [habitId]: completed }));
    try {
      await api.post('/logs', { habitId, date: today, completed });
      const statsRes = await api.get('/logs/stats');
      setStats(statsRes.data);
    } catch {
      setLogs(l => ({ ...l, [habitId]: !completed }));
    } finally {
      setTimeout(() => setAnimating(null), 300);
    }
  };

  const doneCount = habits.filter(h => logs[h._id]).length;

  // Trigger confetti when all habits completed
  useEffect(() => {
    if (habits.length > 0 && doneCount === habits.length && prevDoneCount.current < habits.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
    prevDoneCount.current = doneCount;
  }, [doneCount, habits.length]);

  // Build streak map from stats
  const streakMap = {};
  (stats.habitStats || []).forEach(h => { streakMap[h.id] = h.currentStreak; });

  const remaining = habits.length - doneCount;
  const motivationText = habits.length === 0
    ? 'Add your first habit below'
    : doneCount === habits.length
      ? '🎉 Perfect day! All done!'
      : `${remaining} habit${remaining !== 1 ? 's' : ''} to go`;

  if (loading) {
    return (
      <div className="p-4 space-y-3 max-w-lg mx-auto">
        <div className="skeleton h-32 w-full rounded-2xl" />
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-20 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <Confetti show={showConfetti} />

      <div className="animate-fadeUp">
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 2 }}>{formatDate()}</p>
        <h1 style={{ fontSize: 26, marginBottom: 0, lineHeight: 1.2 }}>
          {getGreeting()},<br/>
          <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0] || 'Friend'}</span> 👋
        </h1>
      </div>

      {/* Stats card */}
      <div className="card flex items-center gap-4 p-5 mt-4 animate-fadeUp" style={{ animationDelay: '0.05s' }}>
        <ProgressRing done={doneCount} total={habits.length} />
        <div className="flex-1">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: doneCount === habits.length && habits.length > 0 ? '#d4a853' : 'var(--text)' }}>
            {motivationText}
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#fff3e0' }}>
                <Flame size={16} color="#e07070" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{stats.currentStreak}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>streak</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#fef9c3' }}>
                <Trophy size={16} color="#d4a853" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{stats.bestStreak}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>best</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-pale)' }}>
                <Zap size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{stats.totalCompletions}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Habits list */}
      <div className="mt-5 flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 17, margin: 0, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>
          Today's Habits
        </h2>
        <button onClick={() => navigate('/habits')}
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
          Manage <ChevronRight size={15} />
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="card p-8 text-center animate-fadeUp">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
          <h3 style={{ fontSize: 18, marginBottom: 6 }}>No habits yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
            Add your first habit to start tracking
          </p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add First Habit</button>
        </div>
      ) : (
        <div className="stagger space-y-3">
          {habits.map(h => (
            <div key={h._id} className="animate-fadeUp">
              <HabitCard
                habit={h}
                completed={!!logs[h._id]}
                streak={streakMap[h._id] || 0}
                onToggle={handleToggle}
                animating={animating === h._id}
              />
            </div>
          ))}
        </div>
      )}

      {habits.length > 0 && (
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 mt-6 mx-auto"
          style={{
            background: 'var(--primary)', color: 'white',
            border: 'none', borderRadius: 14, padding: '12px 20px',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(45,106,79,0.35)', display: 'flex'
          }}>
          <Plus size={18} /> Add Habit
        </button>
      )}

      {showModal && (
        <AddHabitModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(); }}
        />
      )}
    </div>
  );
}