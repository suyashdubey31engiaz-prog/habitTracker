import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/client';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_ABBR = ['S','M','T','W','T','F','S'];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// FIX: Build date string from components — never use toISOString() which gives UTC
function makeDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getLocalDateStr(date = new Date()) {
  return makeDateStr(date.getFullYear(), date.getMonth(), date.getDate());
}

function ProgressBar({ value, color }) {
  return (
    <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden', minWidth: 40 }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
    </div>
  );
}

export default function MonthlyGrid() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const numDays = daysInMonth(year, month);
  const today = getLocalDateStr();
  const startDate = makeDateStr(year, month, 1);
  const endDate = makeDateStr(year, month, numDays);

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

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const toggle = async (habitId, date, current) => {
    const key = `${date}_${habitId}`;
    setToggling(key);
    const newVal = !current;
    setLogs(l => ({ ...l, [key]: newVal }));
    try { await api.post('/logs', { habitId, date, completed: newVal }); }
    catch { setLogs(l => ({ ...l, [key]: current })); }
    finally { setToggling(null); }
  };

  const habitStats = (habit) => {
    let done = 0, possible = 0;
    for (let d = 1; d <= numDays; d++) {
      const ds = makeDateStr(year, month, d);
      if (ds > today) break;
      const dow = new Date(year, month, d).getDay();
      if (habit.targetDays?.includes(dow) !== false) {
        possible++;
        if (logs[`${ds}_${habit._id}`]) done++;
      }
    }
    return { done, possible, pct: possible === 0 ? 0 : Math.round((done / possible) * 100) };
  };

  const dayStats = (d) => {
    const ds = makeDateStr(year, month, d);
    const dow = new Date(year, month, d).getDay();
    const applicable = habits.filter(h => h.targetDays?.includes(dow) !== false);
    const done = applicable.filter(h => !!logs[`${ds}_${h._id}`]).length;
    return { done, total: applicable.length };
  };

  const overallPct = (() => {
    let done = 0, total = 0;
    for (let d = 1; d <= numDays; d++) {
      const ds = makeDateStr(year, month, d);
      if (ds > today) break;
      const s = dayStats(d);
      done += s.done; total += s.total;
    }
    return total === 0 ? 0 : Math.round((done / total) * 100);
  })();

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  return (
    <div className="max-w-full px-4 py-5">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 style={{ fontSize: 24, margin: 0 }}>Monthly Grid</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{MONTH_NAMES[month]} {year}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', cursor: 'pointer', color: 'var(--text)' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} disabled={isCurrentMonth} className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', color: isCurrentMonth ? 'var(--border)' : 'var(--text)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Overall progress */}
        <div className="card p-4 mb-4 animate-fadeUp">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Overall Progress</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', fontFamily: 'DM Serif Display, serif' }}>{overallPct}%</span>
          </div>
          <div style={{ height: 10, background: 'var(--surface2)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${overallPct}%`, borderRadius: 5,
              background: 'linear-gradient(90deg, var(--primary-light), var(--primary))',
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-2xl mx-auto space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-2xl" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="max-w-2xl mx-auto card p-10 text-center">
          <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
          <p style={{ color: 'var(--text-muted)' }}>Add habits from the Habits tab to see your monthly grid</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 8 }}>
          <div style={{ minWidth: Math.max(600, 160 + numDays * 28 + 80), background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>

            {/* Header row */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', background: 'var(--surface2)', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
              <div style={{ width: 160, flexShrink: 0, padding: '10px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Habit
              </div>
              {days.map(d => {
                const ds = makeDateStr(year, month, d);
                const dow = new Date(year, month, d).getDay();
                const isT = ds === today;
                const isWknd = dow === 0 || dow === 6;
                return (
                  <div key={d} style={{ width: 28, flexShrink: 0, textAlign: 'center', padding: '6px 0' }}>
                    <div style={{ fontSize: 9, color: isWknd ? 'var(--primary-light)' : 'var(--text-muted)', textTransform: 'uppercase', lineHeight: 1 }}>
                      {DAY_ABBR[dow]}
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', margin: '2px auto 0',
                      fontSize: 10, fontWeight: isT ? 700 : 400, lineHeight: '20px', textAlign: 'center',
                      background: isT ? 'var(--primary)' : 'transparent',
                      color: isT ? 'white' : isWknd ? 'var(--primary-light)' : 'var(--text)',
                    }}>
                      {d}
                    </div>
                  </div>
                );
              })}
              <div style={{ width: 80, flexShrink: 0, padding: '10px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Done %
              </div>
            </div>

            {/* Habit rows */}
            {habits.map((habit, hi) => {
              const { done, possible, pct } = habitStats(habit);
              return (
                <div key={habit._id} style={{ display: 'flex', alignItems: 'center', borderBottom: hi < habits.length - 1 ? '1px solid var(--border)' : 'none', background: hi % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                  <div style={{ width: 160, flexShrink: 0, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{habit.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                      {habit.name}
                    </span>
                  </div>

                  {days.map(d => {
                    const ds = makeDateStr(year, month, d);
                    const dow = new Date(year, month, d).getDay();
                    const key = `${ds}_${habit._id}`;
                    const completed = !!logs[key];
                    const isTarget = habit.targetDays?.includes(dow) !== false;
                    const isFuture = ds > today;
                    return (
                      <div key={d} style={{ width: 28, flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
                        <button
                          onClick={() => !isFuture && isTarget && toggle(habit._id, ds, completed)}
                          disabled={isFuture || !isTarget}
                          title={ds}
                          style={{
                            width: 20, height: 20, borderRadius: 4,
                            border: 'none', cursor: isFuture || !isTarget ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: completed ? habit.color : isTarget ? 'var(--surface2)' : 'transparent',
                            opacity: isFuture ? 0.2 : 1,
                            transition: 'all 0.12s',
                            transform: toggling === key ? 'scale(0.8)' : 'scale(1)',
                            outline: ds === today && isTarget ? `2px solid ${habit.color}60` : 'none',
                          }}
                        >
                          {completed && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  <div style={{ width: 80, flexShrink: 0, padding: '8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: pct >= 80 ? 'var(--primary)' : pct >= 50 ? 'var(--accent)' : 'var(--text-muted)', textAlign: 'center' }}>
                      {pct}%
                    </div>
                    <ProgressBar value={pct} color={habit.color} />
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{done}/{possible}</div>
                  </div>
                </div>
              );
            })}

            {/* Footer totals */}
            <div style={{ display: 'flex', borderTop: '2px solid var(--border)', background: 'var(--surface2)', borderRadius: '0 0 16px 16px', overflow: 'hidden' }}>
              <div style={{ width: 160, flexShrink: 0, padding: '8px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', alignSelf: 'center' }}>
                Day %
              </div>
              {days.map(d => {
                const ds = makeDateStr(year, month, d);
                const { done, total } = dayStats(d);
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                const isFuture = ds > today;
                return (
                  <div key={d} style={{ width: 28, flexShrink: 0, padding: '6px 0', textAlign: 'center' }}>
                    {!isFuture && total > 0 ? (
                      <div style={{
                        width: 20, height: 20, borderRadius: 4, margin: '0 auto',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700,
                        background: pct === 100 ? 'var(--primary)' : pct > 0 ? 'var(--primary-pale)' : 'transparent',
                        color: pct === 100 ? 'white' : pct > 0 ? 'var(--primary)' : 'var(--text-muted)',
                      }}>
                        {pct === 100 ? '✓' : pct > 0 ? pct : '–'}
                      </div>
                    ) : (
                      <div style={{ width: 20, height: 20, margin: '0 auto' }} />
                    )}
                  </div>
                );
              })}
              <div style={{ width: 80, flexShrink: 0, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{overallPct}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {habits.length > 0 && !loading && (
        <div className="flex items-center gap-4 mt-4 max-w-2xl mx-auto flex-wrap">
          {[
            { label: 'Completed', style: { width: 14, height: 14, borderRadius: 3, background: 'var(--primary)' } },
            { label: 'Skipped', style: { width: 14, height: 14, borderRadius: 3, background: 'var(--surface2)', border: '1px solid var(--border)' } },
            { label: 'Today', style: { width: 14, height: 14, borderRadius: 3, border: '2px solid var(--primary)' } },
            { label: 'Future', style: { width: 14, height: 14, borderRadius: 3, background: 'var(--surface2)', opacity: 0.3 } },
          ].map(({ label, style }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div style={style} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}