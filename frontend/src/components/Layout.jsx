import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Grid3X3, BarChart3, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Today'  },
  { to: '/weekly',    icon: CalendarDays,    label: 'Weekly' },
  { to: '/monthly',   icon: Grid3X3,         label: 'Grid'   },
  { to: '/analytics', icon: BarChart3,        label: 'Stats'  },
  { to: '/habits',    icon: Settings,         label: 'Habits' },
];

export default function Layout({ children }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top header */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
              style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg"
               style={{ background: 'var(--primary)' }}>
            <span style={{ fontSize: 16 }}>🌿</span>
          </div>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: 'var(--primary)' }}>
            Habitual
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)' }}
            title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Avatar → profile */}
          <button onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}
            title="Profile">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </button>
        </div>
      </header>

      <main className="pb-nav">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-nav left-0 right-0 z-40 flex items-stretch"
           style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', height: 64 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5"
            style={({ isActive }) => ({
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              textDecoration: 'none',
              borderTop: isActive ? '2px solid var(--primary)' : '2px solid transparent',
            })}>
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400 }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}