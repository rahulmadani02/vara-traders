import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOKEN_KEY, USER_KEY, getStoredUser, getToken } from '../api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getToken);
  const navigate = useNavigate();
  const toast = useToast();

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // rahul: api.js clears localStorage and fires this event the moment any
  // request comes back 401 (missing/expired/invalid token) — clear the
  // live React state too and send the person back to login, instead of
  // leaving a stale "logged in" header while the API silently rejects them
  useEffect(() => {
    function onUnauthorized() {
      setToken(null);
      setUser(null);
      toast('Your session has expired — please log in again.', true);
      navigate('/login');
    }
    window.addEventListener('vt:unauthorized', onUnauthorized);
    return () => window.removeEventListener('vt:unauthorized', onUnauthorized);
  }, [navigate, toast]);

  const value = useMemo(() => ({
    user,
    token,
    isLoggedIn: !!token,
    isAdmin: !!user && user.role === 'admin',
    login,
    logout,
  }), [user, token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
