import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isHomeAuthorized: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loginHome: () => void;
  logoutHome: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [isHomeAuthorized, setIsHomeAuthorized] = useState<boolean>(sessionStorage.getItem("home_authorized") === "true");

  const login = (newToken: string) => {
    localStorage.setItem("admin_token", newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setIsAuthenticated(false);
  };

  const loginHome = () => {
    sessionStorage.setItem("home_authorized", "true");
    setIsHomeAuthorized(true);
  };

  const logoutHome = () => {
    sessionStorage.removeItem("home_authorized");
    setIsHomeAuthorized(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isHomeAuthorized, token, login, logout, loginHome, logoutHome }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
