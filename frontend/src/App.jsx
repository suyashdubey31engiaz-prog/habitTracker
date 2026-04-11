import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WeatherProvider } from './context/WeatherContext';
import WeatherEffects from './components/WeatherEffects';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import WeeklyView from './pages/WeeklyView';
import MonthlyGrid from './pages/MonthlyGrid';
import Analytics from './pages/Analytics';
import ManageHabits from './pages/ManageHabits';
import Profile from './pages/Profile';
import InstallPrompt from './components/InstallPrompt';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>Loading your habits...</div>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>Loading...</div>
        </div>
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/"          element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/weekly"    element={<ProtectedRoute><WeeklyView /></ProtectedRoute>} />
      <Route path="/monthly"   element={<ProtectedRoute><MonthlyGrid /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/habits"    element={<ProtectedRoute><ManageHabits /></ProtectedRoute>} />
      <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <WeatherProvider>
          <AuthProvider>
            <AppRoutes />
            <WeatherEffects />
            <InstallPrompt />
          </AuthProvider>
        </WeatherProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}