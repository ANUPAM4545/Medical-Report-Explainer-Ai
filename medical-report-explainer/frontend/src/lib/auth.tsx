import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, registerUser, loginWithGoogle } from "./api";
import type { User } from "../types/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const storageKey = "medical-report-token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(storageKey));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        localStorage.removeItem(storageKey);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (email: string, password: string) => {
        const response = await loginUser(email, password);
        localStorage.setItem(storageKey, response.access_token);
        setToken(response.access_token);
        setUser(response.user);
      },
      register: async (name: string, email: string, password: string) => {
        const response = await registerUser(name, email, password);
        localStorage.setItem(storageKey, response.access_token);
        setToken(response.access_token);
        setUser(response.user);
      },
      loginGoogle: async (idToken: string) => {
        const response = await loginWithGoogle(idToken);
        localStorage.setItem(storageKey, response.access_token);
        setToken(response.access_token);
        setUser(response.user);
      },
      logout: () => {
        localStorage.removeItem(storageKey);
        setToken(null);
        setUser(null);
      },
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
