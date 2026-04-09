import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/client';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// FIX: Use local date string to avoid UTC timezone offset issues
function getLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const start = new Date(now);
  start.setDate(now.getDate() - day + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isToday(d) {
  return getLocalDateStr(d) === getLocalDateStr(new Date());
}

export default function WeeklyView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const weekDates = getWeekDates(weekOffset);
  const startDate = getLocalDateStr(weekDates[0]);
  const endDate = getLocalDateStr(weekDates[6]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [habitsRes, logsRes] = await Promise.all([
        api.get('/habits'),
        api.get(`/logs?startDate=${startDate}&endDate=${endDate}`)
      ]);
      setHabits(habitsRes.data);
      const logMap = {};
      logsRes.data.forEach(l => { logMap[`${l.date}_${l.habitId}`] = l.completed; });
      setLogs(logMap);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [startDate, endDate]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggle = async (habitId, date, current) => {
    const key = `${date}_${habitId}`;
    setToggling(key);
    const newVal = !current;
    setLogs(l => ({ ...l, [key]: newVal }));
    try {
      await api.post('/logs', { habitId, date, completed: newVal });
    } catch {
      setLogs(l => ({ ...l, [key]: current }));
    } finally {
      setToggling(null);
    }
  };

  const habitCompletion = (habit) => {
    const relevant = weekDates.filter(d => habit.targetDays?.includes(d.getDay()) !== false);
    const done = relevant.filter(d => !!logs[`${getLocalDateStr(d)}_${habit._id}`]).length;
    return { done, total: relevant.length };
  };

  const weekLabel = () => {
    const s = weekDates[0], e = weekDates[6];
    if (s.getMonth() === e.getMonth()) {
      return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
    }
    return `${MONTH_NAMES[s.getMonth()]} ${s.getDate()} – ${MONTH_NAMES[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  };

  const todayStr = getLocalDateStr(new Date());

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 style={{ fontSize: 24, margin: 0 }}>Weekly View</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{weekLabel()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setWeekOffset(w => w - 1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', cursor: 'pointer', color: 'var(--text)' }}>
            <ChevronLeft size={18} />
          </button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)}
              className="px-3 h-9 rounded-xl text-sm font-medium"
              style={{ background: 'var(--primary-pale)', color: 'var(--primary)', border: 'none', cursor: 'pointer' }}>
              Today
            </button>
          )}
          <button onClick={() => setWeekOffset(w => w + 1)}
            disabled={weekOffset >= 0}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', cursor: weekOffset >= 0 ? 'not-allowed' : 'pointer', color: weekOffset >= 0 ? 'var(--border)' : 'var(--text)' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="card p-10 text-center">
          <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
          <p style={{ color: 'var(--text-muted)' }}>Add habits from the Habits tab first</p>
        </div>
      ) : (
        <div className="card overflow-hidden animate-fadeUp">
          {/* Day header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(7, 40px)', gap: 4, padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>HABIT</div>
            {weekDates.map((d, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {DAY_LABELS[d.getDay()]}
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', margin: '2px auto 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: isToday(d) ? 700 : 400,
                  background: isToday(d) ? 'var(--primary)' : 'transparent',
                  color: isToday(d) ? 'white' : 'var(--text)',
                }}>
                  {d.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Habit rows */}
          {habits.map((habit, hi) => {
            const { done, total } = habitCompletion(habit);
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            return (
              <div key={habit._id}
                   style={{
                     display: 'grid', gridTemplateColumns: '1fr repeat(7, 40px)',
                     gap: 4, padding: '10px 16px', alignItems: 'center',
                     borderBottom: hi < habits.length - 1 ? '1px solid var(--border)' : 'none',
                     background: hi % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'
                   }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{habit.emoji}</span>
                  <div className="min-w-0">
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {habit.name}
                    </div>
                    <div style={{ fontSize: 10, color: pct === 100 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {done}/{total} · {pct}%
                    </div>
                  </div>
                </div>

                {weekDates.map((d, di) => {
                  const ds = getLocalDateStr(d);
                  const key = `${ds}_${habit._id}`;
                  const completed = !!logs[key];
                  const isTargetDay = habit.targetDays?.includes(d.getDay()) !== false;
                  const isFuture = ds > todayStr;
                  return (
                    <div key={di} style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        disabled={isFuture || !isTargetDay}
                        onClick={() => !isFuture && isTargetDay && toggle(habit._id, ds, completed)}
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          border: 'none', cursor: isFuture || !isTargetDay ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: completed ? habit.color : isTargetDay ? 'var(--surface2)' : 'transparent',
                          opacity: isFuture ? 0.3 : 1,
                          transition: 'all 0.15s',
                          transform: toggling === key ? 'scale(0.85)' : 'scale(1)',
                        }}
                      >
                        {completed && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {!completed && isTargetDay && !isFuture && (
                          <div style={{ width: 6, height: 6, borderRadius: 2, background: 'var(--border)' }} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Footer totals */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(7, 40px)', gap: 4, padding: '10px 16px', borderTop: '2px solid var(--border)', background: 'var(--surface2)', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Day Total
            </div>
            {weekDates.map((d, di) => {
              const ds = getLocalDateStr(d);
              const dayDone = habits.filter(h => !!logs[`${ds}_${h._id}`]).length;
              const dayTotal = habits.filter(h => h.targetDays?.includes(d.getDay()) !== false).length;
              const allDone = dayTotal > 0 && dayDone === dayTotal;
              return (
                <div key={di} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, margin: '0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: allDone ? 'var(--primary)' : 'transparent',
                    fontSize: 11, fontWeight: 700,
                    color: allDone ? 'white' : dayDone > 0 ? 'var(--primary)' : 'var(--text-muted)',
                  }}>
                    {dayDone > 0 ? dayDone : '–'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {habits.length > 0 && !loading && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {habits.slice(0, 4).map(habit => {
            const { done, total } = habitCompletion(habit);
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            return (
              <div key={habit._id} className="card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: 20 }}>{habit.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {habit.name}
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: habit.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{done}/{total} days · {pct}%</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}