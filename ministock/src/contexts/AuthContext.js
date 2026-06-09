import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginService } from '../services/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // carregando sessão salva

  // ── Restaura sessão ao abrir o app ──────────────────────────────────────────
  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet([
          '@ministock:token',
          '@ministock:user',
        ]);
        if (storedToken[1] && storedUser[1]) {
          setToken(storedToken[1]);
          setUser(JSON.parse(storedUser[1]));
        }
      } catch {
        // sessão inválida, ignora
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const data = await loginService(username, password);
    await AsyncStorage.multiSet([
      ['@ministock:token', data.token],
      ['@ministock:user', JSON.stringify(data)],
    ]);
    setToken(data.token);
    setUser(data);
    return data;
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['@ministock:token', '@ministock:user']);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
