"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";

interface User {
  id: string;
  nome: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored credentials on component mount
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
      
      setLoading(false);
    }
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);