import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchAccountProfile,
  loginRequest,
  refreshAccessToken,
  resendTwoFactorCode,
  validateTwoFactorCode,
} from '@/api/printpostClient';
import { externalLogin } from '@/api/printpostExternalAuth';
import { createPageUrl } from '@/utils';

// Provide explicit default to satisfy lint/type expectations
const AuthContext = createContext(null);

const STORAGE_KEY = 'printpost_auth_session';

const initialState = {
  token: null,
  refreshToken: null,
  refreshTokenTTL: null,
  refreshTokenDate: null,
  ttl: null,
  created: null,
  userId: null,
  account: null,
  menuRoles: [],
  appVersion: null,
};

function parseStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.userId) return null;
    return parsed;
  } catch (error) {
    console.error('[Auth] Failed to parse stored session', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function computeExpiresAt(authData) {
  if (!authData?.created || !authData?.ttl) return null;
  const createdAt = new Date(authData.created).getTime();
  if (Number.isNaN(createdAt)) return null;
  return createdAt + authData.ttl * 1000;
}

function isTokenExpired(authData) {
  const expiresAt = computeExpiresAt(authData);
  if (!expiresAt) return false;
  return Date.now() >= expiresAt - 1000; // add small buffer
}

function normalizeAuthPayload(payload) {
  if (!payload) {
    throw new Error('Resposta de autenticação inválida');
  }

  const plainAccount = payload.account
    ? JSON.parse(JSON.stringify(payload.account))
    : null;

  const plainMenuRoles = payload.menuRoles
    ? JSON.parse(JSON.stringify(payload.menuRoles))
    : [];

  return {
    token: payload.id,
    refreshToken: payload.refreshTokenId || null,
    refreshTokenTTL: payload.refreshTokenTTL || null,
    refreshTokenDate: payload.refreshTokenDate || null,
    ttl: payload.ttl || null,
    created: payload.created || new Date().toISOString(),
    userId: payload.userId,
    account: plainAccount,
    menuRoles: plainMenuRoles,
    appVersion: payload.appVersion || null,
  };
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState(null);

  const refreshTimeoutRef = useRef(null);
  const refreshSessionRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const clearSession = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    localStorage.removeItem(STORAGE_KEY);
    setAuthState(initialState);
    setIsAuthenticated(false);
    setTwoFactorChallenge(null);
  }, []);

  const scheduleTokenRefresh = useCallback((session) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    if (!session?.refreshToken || !session?.refreshTokenTTL) {
      return;
    }

    const expiresAt = computeExpiresAt({
      created: session.refreshTokenDate || session.created,
      ttl: session.refreshTokenTTL,
    });

    if (!expiresAt) return;

    const refreshLead = 30 * 1000; // refresh 30s before expiry
    const delay = Math.max(expiresAt - Date.now() - refreshLead, 0);

    refreshTimeoutRef.current = window.setTimeout(() => {
      const fn = refreshSessionRef.current;
      if (!fn) return;
      fn(session).catch((error) => {
        console.error('[Auth] Falha ao atualizar token', error);
        clearSession();
      });
    }, delay);
  }, [clearSession]);

  const persistSession = useCallback((session) => {
    const normalized = normalizeAuthPayload(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    setAuthState(normalized);
    setIsAuthenticated(true);
    setAuthError(null);
    setTwoFactorChallenge(null);
    scheduleTokenRefresh(normalized);
  }, [scheduleTokenRefresh]);

  const refreshSession = useCallback(async (currentSession) => {
    if (!currentSession?.refreshToken) {
      throw new Error('Refresh token não disponível');
    }

    const payload = await refreshAccessToken({
      accessToken: currentSession.token,
      refreshToken: currentSession.refreshToken,
    });

    const profile = await fetchAccountProfile({
      token: payload.id,
      userId: payload.userId,
    });

    persistSession({
      ...payload,
      account: profile,
      menuRoles: currentSession.menuRoles,
      appVersion: currentSession.appVersion,
    });
  }, [persistSession]);

  useEffect(() => {
    refreshSessionRef.current = refreshSession;
  }, [refreshSession]);

  const hydrateFromStorage = useCallback(async () => {
    try {
      const stored = parseStoredSession();

      if (!stored) {
        setIsLoadingAuth(false);
        return;
      }

      if (isTokenExpired(stored) && stored.refreshToken) {
        try {
          await refreshSession(stored);
          setIsLoadingAuth(false);
          return;
        } catch (error) {
          console.warn('[Auth] Falha ao atualizar sessão armazenada', error);
          clearSession();
          setIsLoadingAuth(false);
          return;
        }
      }

      if (isTokenExpired(stored)) {
        clearSession();
        setIsLoadingAuth(false);
        return;
      }

      try {
        const profile = await fetchAccountProfile({
          token: stored.token,
          userId: stored.userId,
        });

        persistSession({
          id: stored.token,
          ttl: stored.ttl,
          created: stored.created,
          userId: stored.userId,
          refreshTokenId: stored.refreshToken,
          refreshTokenTTL: stored.refreshTokenTTL,
          refreshTokenDate: stored.refreshTokenDate,
          account: profile,
          menuRoles: stored.menuRoles,
          appVersion: stored.appVersion,
        });
      } catch (error) {
        console.warn('[Auth] Não foi possível validar sessão armazenada', error);
        clearSession();
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingAuth(false);
      }
    }
  }, [clearSession, persistSession, refreshSession]);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const login = useCallback(async ({ email, password, useExternal = false }) => {
    setAuthError(null);

    try {
      const payload = useExternal
        ? await externalLogin({ email, password })
        : await loginRequest({ email, password });

      if (payload?.twoFactor) {
        const masked = payload?.account?.emailMask || null;
        setTwoFactorChallenge({
          userId: payload.userId,
          emailMask: masked,
          lastSentAt: payload?.account?.emailSended || null,
        });

        return {
          requiresTwoFactor: true,
          emailMask: masked,
        };
      }

      // External API may return a slightly different shape; normalize minimal fields
      persistSession(payload);
      return { success: true };
    } catch (error) {
      console.error('[Auth] Login falhou', error);
      setAuthError({
        type: error?.type || 'invalid_credentials',
        message: error?.message || 'Credenciais inválidas',
      });
      throw error;
    }
  }, [persistSession]);

  const verifyTwoFactor = useCallback(async (code) => {
    if (!twoFactorChallenge?.userId) {
      throw new Error('Solicitação de verificação expirada');
    }

    try {
      const payload = await validateTwoFactorCode({
        userId: twoFactorChallenge.userId,
        code,
      });

      persistSession(payload);
      return { success: true };
    } catch (error) {
      console.error('[Auth] Validação de 2FA falhou', error);
      setAuthError({
        type: error?.type || 'invalid_two_factor_code',
        message: error?.message || 'Código inválido ou expirado',
      });
      throw error;
    }
  }, [persistSession, twoFactorChallenge]);

  const resendTwoFactor = useCallback(async () => {
    if (!twoFactorChallenge?.userId) {
      throw new Error('Não há desafio ativo para reenviar código');
    }

    await resendTwoFactorCode({ userId: twoFactorChallenge.userId });

    setTwoFactorChallenge((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lastSentAt: new Date().toISOString(),
      };
    });
  }, [twoFactorChallenge]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const navigateToLogin = useCallback(() => {
    window.location.href = createPageUrl('Login');
  }, []);

  const contextValue = useMemo(() => ({
    user: authState.account,
    token: authState.token,
    menuRoles: authState.menuRoles,
    appVersion: authState.appVersion,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings: false,
    authError,
    twoFactorChallenge,
    login,
    logout,
    resendTwoFactor,
    verifyTwoFactor,
    navigateToLogin,
  }), [
    authState.account,
    authState.appVersion,
    authState.menuRoles,
    authState.token,
    authError,
    isAuthenticated,
    isLoadingAuth,
    login,
    logout,
    navigateToLogin,
    resendTwoFactor,
    twoFactorChallenge,
    verifyTwoFactor,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
