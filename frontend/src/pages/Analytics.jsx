import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, Flame, Trophy, Zap, Target, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: color + '22' }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, fontFamily: 'DM Serif Display, serif', color: 'var(--text)' }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Heatmap({ data }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.completed), 1);
  const getColor = (val) => {
    if (val === 0) return 'var(--surface2)';
    const i = val / maxVal;
    if (i < 0.25) return '#b7e4c7';
    if (i < 0.50) return '#74c69d';
    if (i < 0.75) return '#52b788';
    return '#2d6a4f';
  };
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7));
  const dayLabels = ['S','M','T','W','T','F','S'];

  return (
    <div>
      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 justify-around" style={{ paddingTop: 2 }}>
          {dayLabels.map((d, i) => (
            <div key={i} style={{ fontSize: 9, color: 'var(--text-muted)', width: 10, textAlign: 'center', lineHeight: '12px' }}>{d}</div>
          ))}
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 flex-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div key={di} className="heatmap-cell"
                     title={`${day.date}: ${day.completed}/${day.total} habits`}
                     style={{ background: getColor(day.completed) }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Less</span>
        {['var(--surface2)', '#b7e4c7', '#74c69d', '#52b788', '#2d6a4f'].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}

// Dark-mode aware custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '8px 12px', fontSize: 12,
      boxShadow: 'var(--shadow)'
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 4, margin: '0 0 4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600, margin: 0 }}>
          {p.name}: {p.value}{String(p.name).includes('%') ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  // Theme-aware chart colors
  const textColor  = isDark ? '#8aab8a' : '#6b8c7b';
  const gridColor  = isDark ? '#2d4a2d' : '#dde8dd';

  useEffect(() => {
    api.get('/logs/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-3 max-w-lg mx-auto">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    );
  }

  if (!stats || stats.totalCompletions === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
        <h2>No data yet</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Complete some habits over a few days and your stats will appear here.
        </p>
      </div>
    );
  }

  // Weekly bar chart data (4 weeks)
  const weeklyChartData = (() => {
    const d = stats.weeklyData || [];
    return Array.from({ length: 4 }, (_, w) => {
      const week = d.slice(w * 7, w * 7 + 7);
      const done  = week.reduce((a, b) => a + b.completed, 0);
      const total = week.reduce((a, b) => a + b.total, 0);
      return {
        week: `Wk ${w + 1}`,
        'Completion %': total === 0 ? 0 : Math.round((done / total) * 100),
      };
    });
  })();

  // Daily area chart (last 14 days)
  const dailyData = (stats.weeklyData || []).slice(-14).map(d => ({
    date: d.date?.slice(5),
    pct: d.total === 0 ? 0 : Math.round((d.completed / d.total) * 100),
  }));

  // Day-of-week breakdown
  const DOW_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dowData = DOW_NAMES.map((day, dow) => {
    const days = (stats.weeklyData || []).filter(d => new Date(d.date + 'T12:00:00').getDay() === dow);
    const done  = days.reduce((a, b) => a + b.completed, 0);
    const total = days.reduce((a, b) => a + b.total, 0);
    return { day, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  });
  const bestDow = dowData.reduce((a, b) => b.pct > a.pct ? b : a, dowData[0]);

  // Pie chart
  const pieData = (stats.habitStats || [])
    .filter(h => h.totalCompletions > 0)
    .map(h => ({ name: `${h.emoji} ${h.name}`, value: h.totalCompletions, color: h.color || '#52b788' }));

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
      <div className="animate-fadeUp">
        <h1 style={{ fontSize: 24, margin: 0 }}>Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Your habit journey at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 stagger">
        <StatCard icon={Flame}  label="Current streak"    value={`${stats.currentStreak}d`}   color="#e07070" sub={stats.currentStreak > 0 ? 'Keep it up!' : 'Start today'} />
        <StatCard icon={Trophy} label="Best streak"       value={`${stats.bestStreak}d`}       color="#d4a853" />
        <StatCard icon={Zap}    label="Total completions" value={stats.totalCompletions}        color="var(--primary)" />
        <StatCard icon={Target} label="Habits tracked"    value={stats.habitStats?.length || 0} color="#7b9ef4" />
      </div>

      {/* Best day insight */}
      {bestDow.pct > 0 && (
        <div className="card p-4 animate-fadeUp flex items-center gap-3"
             style={{ background: 'var(--primary-pale)', border: '1px solid var(--primary-light)' }}>
          <div style={{ fontSize: 28 }}>⭐</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>
              Your best day is {bestDow.day}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {bestDow.pct}% average completion — keep that momentum going!
            </div>
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="card p-4 animate-fadeUp">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} color="var(--primary)" />
          <h3 style={{ fontSize: 15, margin: 0, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>28-Day Activity</h3>
        </div>
        <Heatmap data={stats.weeklyData} />
      </div>

      {/* Day-of-week chart */}
      <div className="card p-4 animate-fadeUp">
        <h3 style={{ fontSize: 15, margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>Day of Week Performance</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>Which days you complete the most habits</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dowData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pct" name="Completion %" radius={[4,4,0,0]} maxBarSize={36}>
              {dowData.map((entry, i) => (
                <Cell key={i} fill={entry.day === bestDow.day ? '#d4a853' : 'var(--primary)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly completion bars */}
      <div className="card p-4 animate-fadeUp">
        <h3 style={{ fontSize: 15, margin: '0 0 16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>Weekly Completion</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyChartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Completion %" fill="var(--primary)" radius={[4,4,0,0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily trend area chart */}
      <div className="card p-4 animate-fadeUp">
        <h3 style={{ fontSize: 15, margin: '0 0 16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>14-Day Trend</h3>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={dailyData} margin={{ top: 0, right: 8, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: textColor }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="pct" name="% Done"
              stroke="var(--primary)" strokeWidth={2.5}
              fill="url(#areaGrad)"
              dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-habit breakdown */}
      {stats.habitStats?.length > 0 && (
        <div className="card p-4 animate-fadeUp">
          <h3 style={{ fontSize: 15, margin: '0 0 16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>Per-Habit Breakdown</h3>
          <div className="space-y-4">
            {stats.habitStats.map(h => (
              <div key={h.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 18 }}>{h.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{h.name}</span>
                    {h.currentStreak > 0 && (
                      <span style={{ fontSize: 11, color: '#e07070', fontWeight: 700 }}>🔥 {h.currentStreak}d</span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: h.completionRate >= 80 ? 'var(--primary)' : h.completionRate >= 50 ? 'var(--accent)' : 'var(--danger)' }}>
                    {h.completionRate}%
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${h.completionRate}%`, background: h.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{h.totalCompletions} completions</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Best: {h.bestStreak}d</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pie chart */}
      {pieData.length > 1 && (
        <div className="card p-4 animate-fadeUp">
          <h3 style={{ fontSize: 15, margin: '0 0 4px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>Habit Distribution</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px' }}>Share of total completions</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} times`, n]} content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, color: textColor }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}