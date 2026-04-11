import { useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Grid3X3, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWeather } from '../context/WeatherContext';
import { getTempDescription } from '../api/weather';
import SyncBanner from './SyncBanner';

const navItems = [
  { to:'/dashboard', icon:LayoutDashboard, label:'Today'  },
  { to:'/weekly',    icon:CalendarDays,    label:'Weekly' },
  { to:'/monthly',   icon:Grid3X3,         label:'Grid'   },
  { to:'/analytics', icon:BarChart3,        label:'Stats'  },
  { to:'/habits',    icon:Settings,         label:'Habits' },
];

// Sakura petals for sakura theme
function SakuraPetals() {
  const petals = Array.from({ length: 12 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 6}s`,
    size: 6 + Math.random() * 6,
  }));
  return (
    <>
      {petals.map((p, i) => (
        <div key={i} style={{
          position: 'fixed', top: -20, left: p.left,
          width: p.size, height: p.size,
          borderRadius: '50% 0 50% 0',
          background: 'rgba(231,84,128,0.6)',
          pointerEvents: 'none', zIndex: 9992,
          animation: `sakuraPetal ${p.duration} ${p.delay} ease-in infinite`,
        }} />
      ))}
    </>
  );
}

// Weather chip for header
function WeatherChip() {
  const { tempC, desc, icon, effect } = useWeather();
  if (tempC === null) return null;

  const td = getTempDescription(tempC);
  const emoji = { sunny:'☀️', rain:'🌧️', snow:'❄️', fog:'🌫️', storm:'⛈️', night:'🌙', cloudy:'☁️', clear:'🌤️' }[effect] || '🌤️';

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:4,
      background:'var(--surface2)', border:'1px solid var(--border)',
      borderRadius:10, padding:'4px 10px', fontSize:12, fontWeight:600,
      color:'var(--text-muted)', cursor:'default',
    }} title={desc}>
      <span>{emoji}</span>
      <span style={{ color: td.color }}>{Math.round(tempC)}°</span>
    </div>
  );
}

export default function Layout({ children }) {
  const { user }          = useAuth();
  const { isNeon, themeKey } = useTheme();
  const navigate          = useNavigate();
  const location          = useLocation();

  // Add page-enter class on route change
  const mainRef = useRef(null);
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.classList.remove('page-enter');
      void mainRef.current.offsetWidth; // force reflow
      mainRef.current.classList.add('page-enter');
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen" style={{ background:'var(--bg)' }}>
      {/* Sakura petals */}
      {themeKey === 'sakura' && <SakuraPetals />}

      {/* Top header */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
              style={{
                background:'var(--bg)', borderBottom:`1px solid var(--border)`,
                boxShadow: isNeon ? '0 1px 20px rgba(0,255,136,0.1)' : 'none',
              }}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div style={{
            width:32, height:32, borderRadius:10,
            background:'var(--primary)', fontSize:16,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: isNeon ? '0 0 12px var(--primary)' : 'none',
          }}>🌿</div>
          <span style={{
            fontFamily:'var(--font-heading)', fontSize:20, color:'var(--primary)',
            textShadow: isNeon ? '0 0 10px var(--primary)' : 'none',
          }}>Habitual</span>
        </div>

        <div className="flex items-center gap-2">
          <WeatherChip />
          <button onClick={() => navigate('/profile')}
            style={{
              width:34, height:34, borderRadius:10,
              background:'var(--primary)', color:'var(--bg)',
              border:'none', cursor:'pointer',
              fontWeight:800, fontSize:14, fontFamily:'var(--font-heading)',
              boxShadow: isNeon ? '0 0 10px var(--primary)' : 'none',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </button>
        </div>
      </header>

      <SyncBanner />

      <main ref={mainRef} className="pb-nav">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-nav left-0 right-0 z-40 flex items-stretch"
           style={{
             background:'var(--surface)', borderTop:`1px solid var(--border)`,
             boxShadow: isNeon ? '0 -4px 20px rgba(0,255,136,0.15)' : '0 -4px 20px rgba(0,0,0,0.1)',
             height:64,
           }}>
        {navItems.map(({ to, icon:Icon, label }) => (
          <NavLink key={to} to={to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5"
            style={({ isActive }) => ({
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              textDecoration:'none',
              borderTop: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              textShadow: isActive && isNeon ? '0 0 8px var(--primary)' : 'none',
              filter: isActive && isNeon ? 'drop-shadow(0 0 4px var(--primary))' : 'none',
              transition:'all 0.2s',
            })}>
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize:11, fontWeight: isActive ? 700 : 400, fontFamily:'var(--font-body)' }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}