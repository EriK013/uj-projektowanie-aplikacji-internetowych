import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import * as authApi from "../api/auth";
import type { User } from "../api/auth";
import { clearToken, getToken } from "../api/client";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    await authApi.login(email, password);
    setUser(await authApi.me());
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth musi byc uzyte wewnatrz AuthProvider");
  }
  return ctx;
}
