import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  Legend, ComposedChart
} from 'recharts';
import { TrendingUp, Flame, Trophy, Zap, Target, Calendar, BarChart2, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

// ── Helpers ──────────────────────────────────────────────────────────────────
function getLocalDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getLast(n, unit = 'day') {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    if (unit === 'day')   d.setDate(d.getDate() - i);
    if (unit === 'week')  d.setDate(d.getDate() - i * 7);
    if (unit === 'month') d.setMonth(d.getMonth() - i);
    dates.push(d);
  }
  return dates;
}
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 12px', fontSize:12, boxShadow:'var(--shadow)' }}>
      <p style={{ color:'var(--text-muted)', margin:'0 0 4px' }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color: p.color || 'var(--primary)', fontWeight:600, margin:0 }}>
          {p.name}: {p.value}{String(p.name).includes('%') ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

// ── Animated stat card ────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'translateY(16px)';
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.transition = 'all 0.5s cubic-bezier(0.22,1,0.36,1)';
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'translateY(0)';
        }
      }, delay);
    }
  }, [delay]);

  return (
    <div ref={ref} className="card p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
           style={{ background: color + '22' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:24, fontWeight:800, lineHeight:1, fontFamily:'var(--font-heading)', color:'var(--text)' }}>{value}</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:1 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color, fontWeight:600, marginTop:1 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Animated chart wrapper ────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.opacity = '0';
    ref.current.style.transform = 'translateY(24px)';
    const t = setTimeout(() => {
      if (ref.current) {
        ref.current.style.transition = 'all 0.6s cubic-bezier(0.22,1,0.36,1)';
        ref.current.style.opacity = '1';
        ref.current.style.transform = 'translateY(0)';
      }
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div ref={ref} className="card p-4">
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ fontSize:15, margin:0, fontFamily:'var(--font-heading)', fontWeight:700 }}>{title}</h3>
        {subtitle && <p style={{ fontSize:12, color:'var(--text-muted)', margin:'2px 0 0' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────────────
function Heatmap({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.completed), 1);
  const col = v => {
    if (v === 0) return 'var(--surface2)';
    const i = v / max;
    if (i < 0.25) return '#b7e4c7';
    if (i < 0.5)  return '#74c69d';
    if (i < 0.75) return '#52b788';
    return '#2d6a4f';
  };
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i+7));
  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-col gap-1" style={{ paddingTop:2 }}>
          {['S','M','T','W','T','F','S'].map((d,i) => (
            <div key={i} style={{ fontSize:9, color:'var(--text-muted)', width:10, textAlign:'center', lineHeight:'12px' }}>{d}</div>
          ))}
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 flex-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div key={di} className="heatmap-cell"
                     title={`${day.date}: ${day.completed}/${day.total}`}
                     style={{ background: col(day.completed) }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span style={{ fontSize:10, color:'var(--text-muted)' }}>Less</span>
        {['var(--surface2)','#b7e4c7','#74c69d','#52b788','#2d6a4f'].map((c,i) => (
          <div key={i} style={{ width:10, height:10, borderRadius:2, background:c }} />
        ))}
        <span style={{ fontSize:10, color:'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}

// ── Main Analytics Page ───────────────────────────────────────────────────────
const TABS = [
  { key:'day',   label:'Day',   icon:'📅' },
  { key:'week',  label:'Week',  icon:'📆' },
  { key:'month', label:'Month', icon:'🗓️' },
  { key:'year',  label:'Year',  icon:'📊' },
];

export default function Analytics() {
  const [stats,  setStats]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,    setTab]    = useState('week');
  const { isDark, isNeon } = useTheme();

  const textColor = isDark ? '#8aab8a' : '#6b8c7b';
  const gridColor = isDark ? '#2d4a2d' : '#dde8dd';

  useEffect(() => {
    setLoading(true);
    api.get('/logs/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-4 space-y-3 max-w-lg mx-auto">
      {[1,2,3,4,5].map(i => <div key={i} className="skeleton rounded-2xl" style={{ height: i === 1 ? 80 : 160 }} />)}
    </div>
  );

  if (!stats || stats.totalCompletions === 0) return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center page-enter">
      <div style={{ fontSize:64, marginBottom:16 }}>📊</div>
      <h2 style={{ fontSize:24 }}>No data yet</h2>
      <p style={{ color:'var(--text-muted)' }}>Complete habits for a few days and your stats will appear here.</p>
    </div>
  );

  const wd = stats.weeklyData || [];

  // ── Day tab data (last 7 days) ──
  const dayData = wd.slice(-7).map(d => ({
    label: DOW[new Date(d.date + 'T12:00:00').getDay()],
    pct:   d.total === 0 ? 0 : Math.round((d.completed / d.total) * 100),
    done:  d.completed,
    total: d.total,
  }));

  // ── Week tab data (4 weeks) ──
  const weekData = [0,1,2,3].map(w => {
    const slice = wd.slice(w*7, w*7+7);
    const done  = slice.reduce((a,b) => a + b.completed, 0);
    const total = slice.reduce((a,b) => a + b.total, 0);
    return { label:`Wk ${w+1}`, pct: total === 0 ? 0 : Math.round((done/total)*100), done, total };
  });

  // ── Month tab data (day-of-week breakdown) ──
  const dowData = DOW.map((day, dow) => {
    const days  = wd.filter(d => new Date(d.date+'T12:00:00').getDay() === dow);
    const done  = days.reduce((a,b) => a + b.completed, 0);
    const total = days.reduce((a,b) => a + b.total, 0);
    return { label: day, pct: total === 0 ? 0 : Math.round((done/total)*100), done, total };
  });
  const bestDow = dowData.reduce((a,b) => b.pct > a.pct ? b : a, dowData[0]);

  // ── Year tab — month-over-month (synthesise from 28-day data) ──
  // Group by calendar month
  const monthMap = {};
  wd.forEach(d => {
    const key = d.date.slice(0, 7); // YYYY-MM
    if (!monthMap[key]) monthMap[key] = { done: 0, total: 0 };
    monthMap[key].done  += d.completed;
    monthMap[key].total += d.total;
  });
  const yearData = Object.entries(monthMap).map(([key, v]) => ({
    label: MON[parseInt(key.slice(5,7)) - 1],
    pct:   v.total === 0 ? 0 : Math.round((v.done / v.total) * 100),
    done:  v.done, total: v.total,
  }));

  // Radar data (per-habit performance)
  const radarData = (stats.habitStats || []).map(h => ({
    habit:   h.emoji + ' ' + h.name.slice(0, 8),
    current: h.completionRate,
    best:    Math.min(100, h.bestStreak * 4),
  }));

  // Pie data
  const pieData = (stats.habitStats || [])
    .filter(h => h.totalCompletions > 0)
    .map(h => ({ name: `${h.emoji} ${h.name}`, value: h.totalCompletions, color: h.color }));

  // Composed chart (done count + pct line)
  const composedData = wd.slice(-14).map(d => ({
    date:  d.date.slice(5),
    done:  d.completed,
    pct:   d.total === 0 ? 0 : Math.round((d.completed/d.total)*100),
  }));

  const COLORS6 = ['#52b788','#d4a853','#7b9ef4','#e07070','#c084fc','#fb923c'];

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-4 page-enter">
      <div>
        <h1 style={{ fontSize:24, margin:0 }}>Analytics</h1>
        <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:2 }}>Your habit journey at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="🔥" label="Current streak"    value={`${stats.currentStreak}d`}    color="#e07070" sub={stats.currentStreak > 0 ? 'Keep going!' : 'Start today'} delay={0} />
        <StatCard icon="🏆" label="Best streak"       value={`${stats.bestStreak}d`}        color="#d4a853" delay={60} />
        <StatCard icon="⚡" label="Total completions" value={stats.totalCompletions}         color="var(--primary)" delay={120} />
        <StatCard icon="🎯" label="Habits tracked"    value={stats.habitStats?.length || 0}  color="#7b9ef4" delay={180} />
      </div>

      {/* Best day insight */}
      {bestDow?.pct > 0 && (
        <div className="card p-4 flex items-center gap-3" style={{ background:'var(--primary-pale)', border:'1px solid var(--primary-light)', animationDelay:'0.2s' }}>
          <span style={{ fontSize:28 }}>⭐</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'var(--primary)' }}>Best day: {bestDow.label}</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>{bestDow.pct}% average — keep that momentum!</div>
          </div>
        </div>
      )}

      {/* Tab selector */}
      <div className="card p-1 flex gap-1">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              flex:1, padding:'8px 4px', borderRadius:12, border:'none', cursor:'pointer',
              background: tab === t.key ? 'var(--primary)' : 'transparent',
              color: tab === t.key ? 'var(--bg)' : 'var(--text-muted)',
              fontSize:12, fontWeight: tab === t.key ? 700 : 400,
              fontFamily:'var(--font-body)', transition:'all 0.2s',
              boxShadow: tab === t.key ? isNeon ? '0 0 8px var(--primary)' : 'none' : 'none',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── DAY TAB ── */}
      {tab === 'day' && (
        <div className="space-y-4">
          <ChartCard title="Last 7 Days" subtitle="Daily completion percentage" delay={0}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayData} margin={{ top:5, right:0, left:-25, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize:11, fill:textColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:textColor }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="pct" name="Completion %" radius={[6,6,0,0]} maxBarSize={40}>
                  {dayData.map((_, i) => <Cell key={i} fill={_ .pct >= 80 ? 'var(--primary)' : _.pct >= 50 ? 'var(--accent)' : 'var(--danger)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Habit Volume" subtitle="Completions vs total targets" delay={100}>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={composedData} margin={{ top:5, right:0, left:-25, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:10, fill:textColor }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize:10, fill:textColor }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="done" name="Completed" fill="var(--primary)" radius={[4,4,0,0]} maxBarSize={24} opacity={0.8} />
                <Line type="monotone" dataKey="pct" name="% Done" stroke="var(--accent)" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="28-Day Heatmap" delay={200}>
            <Heatmap data={wd} />
          </ChartCard>
        </div>
      )}

      {/* ── WEEK TAB ── */}
      {tab === 'week' && (
        <div className="space-y-4">
          <ChartCard title="Weekly Comparison" subtitle="4-week completion trend" delay={0}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData} margin={{ top:5, right:0, left:-25, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize:11, fill:textColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:textColor }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="pct" name="Completion %" fill="var(--primary)" radius={[6,6,0,0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Day-of-Week Performance" subtitle="Which days are you strongest?" delay={100}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dowData} margin={{ top:5, right:0, left:-25, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize:11, fill:textColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:textColor }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="pct" name="Completion %" radius={[4,4,0,0]} maxBarSize={32}>
                  {dowData.map((e,i) => <Cell key={i} fill={e.label === bestDow?.label ? 'var(--accent)' : 'var(--primary)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Habit Radar" subtitle="Performance across all habits" delay={200}>
            {radarData.length >= 3 ? (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="habit" tick={{ fontSize:10, fill:textColor }} />
                  <Radar name="Completion %" dataKey="current" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip content={<Tip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color:'var(--text-muted)', fontSize:13, textAlign:'center', padding:'20px 0' }}>Add 3+ habits to see the radar</p>
            )}
          </ChartCard>
        </div>
      )}

      {/* ── MONTH TAB ── */}
      {tab === 'month' && (
        <div className="space-y-4">
          <ChartCard title="14-Day Area Trend" subtitle="Daily completion rate" delay={0}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={composedData} margin={{ top:5, right:8, left:-25, bottom:0 }}>
                <defs>
                  <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:10, fill:textColor }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize:10, fill:textColor }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="pct" name="% Done" stroke="var(--primary)" strokeWidth={2.5} fill="url(#areaG)" dot={{ r:3, fill:'var(--primary)', strokeWidth:0 }} activeDot={{ r:5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Per-Habit Breakdown" delay={100}>
            <div className="space-y-4">
              {(stats.habitStats || []).map((h, i) => (
                <div key={h.id} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize:18 }}>{h.emoji}</span>
                      <span style={{ fontSize:13, fontWeight:600 }}>{h.name}</span>
                      {h.currentStreak > 0 && <span style={{ fontSize:11, color:'#e07070', fontWeight:700 }}>🔥 {h.currentStreak}d</span>}
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color: h.completionRate >= 80 ? 'var(--primary)' : h.completionRate >= 50 ? 'var(--accent)' : 'var(--danger)' }}>
                      {h.completionRate}%
                    </span>
                  </div>
                  <div style={{ height:8, background:'var(--surface2)', borderRadius:4, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', width:`${h.completionRate}%`,
                      background: h.color, borderRadius:4,
                      transition:'width 0.8s cubic-bezier(0.22,1,0.36,1)',
                      boxShadow: isNeon ? `0 0 6px ${h.color}` : 'none',
                    }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{h.totalCompletions} completions</span>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>Best: {h.bestStreak}d</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* ── YEAR TAB ── */}
      {tab === 'year' && (
        <div className="space-y-4">
          {yearData.length >= 2 ? (
            <>
              <ChartCard title="Month-over-Month" subtitle="Completion % per calendar month" delay={0}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={yearData} margin={{ top:5, right:0, left:-25, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize:11, fill:textColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:10, fill:textColor }} axisLine={false} tickLine={false} domain={[0,100]} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="pct" name="Completion %" fill="var(--primary)" radius={[6,6,0,0]} maxBarSize={48}>
                      {yearData.map((e,i) => <Cell key={i} fill={COLORS6[i % COLORS6.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Completions Over Time" subtitle="Total habit completions per month" delay={100}>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={yearData} margin={{ top:5, right:0, left:-25, bottom:0 }}>
                    <defs>
                      <linearGradient id="yearG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize:11, fill:textColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:10, fill:textColor }} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip />} />
                    <Area type="monotone" dataKey="done" name="Completions" stroke="var(--accent)" strokeWidth={2.5} fill="url(#yearG)" dot={{ r:4, fill:'var(--accent)', strokeWidth:0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </>
          ) : (
            <div className="card p-10 text-center">
              <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
              <p style={{ color:'var(--text-muted)' }}>Keep tracking for a few weeks to unlock year comparison</p>
            </div>
          )}

          {/* Pie distribution */}
          {pieData.length > 1 && (
            <ChartCard title="Habit Distribution" subtitle="Share of all completions" delay={200}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((e,i) => <Cell key={i} fill={e.color || COLORS6[i % COLORS6.length]} />)}
                  </Pie>
                  <Tooltip content={<Tip />} formatter={(v,n) => [`${v} times`, n]} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize:12, color:textColor }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
}