import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, ChevronRight, StickyNote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { getWeatherRecommendations } from '../api/weather';
import api from '../api/client';
import AddHabitModal from '../components/AddHabitModal';
import NoteModal from '../components/NoteModal';
import Onboarding from '../components/Onboarding';

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

function Confetti({ show }) {
  if (!show) return null;
  const colors = ['#52b788','#d4a853','#7b9ef4','#e07070','#c084fc','#38bdf8'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99, overflow: 'hidden' }}>
      {Array.from({ length: 28 }).map((_, i) => {
        const color = colors[i % colors.length];
        const size = 6 + Math.random() * 8;
        return (
          <div key={i} style={{
            position: 'absolute', top: '-20px',
            left: `${Math.random() * 100}%`,
            width: size, height: size,
            background: color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confettiFall ${1.5 + Math.random()}s ${Math.random() * 0.5}s ease-in forwards`,
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
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="progress-ring-text" style={{ color: pct === 100 ? '#d4a853' : 'var(--primary)', lineHeight: 1 }}>
          {pct === 100 ? '🎉' : `${pct}%`}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{done}/{total}</div>
      </div>
    </div>
  );
}

function useLongPress(onLongPress, onClick, ms = 500) {
  const timerRef = useRef(null);
  const fired = useRef(false);
  const start = (e) => {
    fired.current = false;
    timerRef.current = setTimeout(() => { fired.current = true; onLongPress(e); }, ms);
  };
  const cancel = () => { clearTimeout(timerRef.current); };
  const handleClick = () => { if (!fired.current) onClick(); };
  return {
    onMouseDown: start, onMouseUp: cancel, onMouseLeave: cancel,
    onTouchStart: start, onTouchEnd: cancel,
    onClick: handleClick,
  };
}

function HabitCard({ habit, completed, streak, note, onToggle, onLongPress }) {
  const handlers = useLongPress(
    () => onLongPress(habit),
    () => onToggle(habit._id, !completed)
  );
  return (
    <div
      className="card flex items-center gap-4 p-4"
      style={{
        cursor: 'pointer',
        background: completed ? 'var(--primary-pale)' : 'var(--surface)',
        borderColor: completed ? 'var(--primary-light)' : 'var(--border)',
        transition: 'background 0.2s, border-color 0.2s',
        userSelect: 'none',
      }}
      {...handlers}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
           style={{ background: habit.color + '20', border: `1.5px solid ${habit.color}30` }}>
        {habit.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{
          fontWeight: 600, fontSize: 15,
          textDecoration: completed ? 'line-through' : 'none',
          color: completed ? 'var(--text-muted)' : 'var(--text)',
        }}>
          {habit.name}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {note && (
            <span className="flex items-center gap-1" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <StickyNote size={11} /> {note.length > 30 ? note.slice(0, 30) + '…' : note}
            </span>
          )}
          {!note && habit.description && (
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
           style={{ borderColor: completed ? habit.color : 'var(--border)', background: completed ? habit.color : 'transparent', flexShrink: 0 }}>
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

  // Weather
  const { effect: weatherEffect, tempC, desc: weatherDesc } = useWeather();
  const weatherRecs = weatherEffect ? getWeatherRecommendations(weatherEffect, tempC) : [];

  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [notes, setNotes] = useState({});
  const [stats, setStats] = useState({ currentStreak: 0, bestStreak: 0, totalCompletions: 0, habitStats: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [noteTarget, setNoteTarget] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const prevDone = useRef(0);
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
      const logMap = {}, noteMap = {};
      logsRes.data.forEach(l => {
        logMap[l.habitId] = l.completed;
        if (l.note) noteMap[l.habitId] = l.note;
      });
      setLogs(logMap);
      setNotes(noteMap);
      setStats(statsRes.data);
      if (habitsRes.data.length === 0 && !localStorage.getItem('ht_onboarded')) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggle = async (habitId, completed) => {
    setLogs(l => ({ ...l, [habitId]: completed }));
    try {
      await api.post('/logs', { habitId, date: today, completed, note: notes[habitId] || '' });
      const statsRes = await api.get('/logs/stats');
      setStats(statsRes.data);
    } catch {
      setLogs(l => ({ ...l, [habitId]: !completed }));
    }
  };

  const doneCount = habits.filter(h => logs[h._id]).length;

  useEffect(() => {
    if (habits.length > 0 && doneCount === habits.length && prevDone.current < habits.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
    prevDone.current = doneCount;
  }, [doneCount, habits.length]);

  const streakMap = {};
  (stats.habitStats || []).forEach(h => { streakMap[h.id] = h.currentStreak; });

  const remaining = habits.length - doneCount;
  const motivationText = habits.length === 0
    ? 'Add your first habit below 👇'
    : doneCount === habits.length
      ? '🎉 Perfect day! All done!'
      : `${remaining} habit${remaining !== 1 ? 's' : ''} to go`;

  const handleOnboardingDone = () => {
    localStorage.setItem('ht_onboarded', '1');
    setShowOnboarding(false);
    navigate('/habits');
  };

  if (showOnboarding) return <Onboarding onDone={handleOnboardingDone} />;

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
          {getGreeting()},<br />
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
            {[
              { icon: '🔥', val: stats.currentStreak,     label: 'streak', bg: '#fff3e0' },
              { icon: '🏆', val: stats.bestStreak,         label: 'best',   bg: '#fef9c3' },
              { icon: '⚡', val: stats.totalCompletions,   label: 'total',  bg: 'var(--primary-pale)' },
            ].map(({ icon, val, label, bg }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: bg }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weather recommendation */}
      {weatherEffect && weatherRecs.length > 0 && (
        <div className="card p-4 mt-3 animate-fadeUp flex items-start gap-3"
             style={{ background: 'var(--surface2)', animationDelay: '0.1s' }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>{weatherRecs[0].emoji}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
              {tempC !== null ? `${Math.round(tempC)}° · ` : ''}{weatherDesc}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {weatherRecs[0].text}
            </div>
          </div>
        </div>
      )}

      {/* Long-press hint */}
      {habits.length > 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12, marginBottom: -4 }}>
          Tap to check in · Hold to add a note
        </p>
      )}

      {/* Habits list */}
      <div className="mt-4 flex items-center justify-between mb-3">
        <h2 style={{ fontSize: 17, margin: 0, fontFamily: 'var(--font-body)', fontWeight: 700 }}>
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
          <button className="btn-primary" onClick={() => navigate('/habits')}>+ Add First Habit</button>
        </div>
      ) : (
        <div className="stagger space-y-3">
          {habits.map(h => (
            <div key={h._id} className="animate-fadeUp">
              <HabitCard
                habit={h}
                completed={!!logs[h._id]}
                streak={streakMap[h._id] || 0}
                note={notes[h._id] || ''}
                onToggle={handleToggle}
                onLongPress={(habit) => setNoteTarget(habit)}
              />
            </div>
          ))}
        </div>
      )}

      {habits.length > 0 && (
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 mt-6 mx-auto"
          style={{
            background: 'var(--primary)', color: 'var(--bg)',
            border: 'none', borderRadius: 14, padding: '12px 20px',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(45,106,79,0.35)', display: 'flex',
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

      {noteTarget && (
        <NoteModal
          habit={noteTarget}
          date={today}
          existingNote={notes[noteTarget._id] || ''}
          onClose={() => setNoteTarget(null)}
          onSaved={(note) => {
            setNotes(n => ({ ...n, [noteTarget._id]: note }));
            if (!logs[noteTarget._id]) setLogs(l => ({ ...l, [noteTarget._id]: true }));
            setNoteTarget(null);
          }}
        />
      )}
    </div>
  );
}