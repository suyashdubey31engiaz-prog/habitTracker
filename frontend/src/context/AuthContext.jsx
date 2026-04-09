import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('ht_token');
    localStorage.removeItem('ht_user');
    setUser(null);
  }, []);

  // On mount: restore session from localStorage and verify with server
  useEffect(() => {
    const token = localStorage.getItem('ht_token');
    const stored = localStorage.getItem('ht_user');

    if (token && stored) {
      // Optimistically set user so UI isn't blank while verifying
      try {
        setUser(JSON.parse(stored));
      } catch {
        logout();
        setLoading(false);
        return;
      }

      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => {
          // Token invalid or expired — log out silently
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback((token, userData) => {
    localStorage.setItem('ht_token', token);
    localStorage.setItem('ht_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);