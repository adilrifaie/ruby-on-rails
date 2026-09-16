import { createContext, useContext, useState, useCallback } from "react";
import { api, setToken, getToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const persistUser = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    persistUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (email, password) => {
    await api.register(email, password);
    return login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    setToken(null);
    persistUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token: getToken(), login, register, logout, setUser: persistUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
