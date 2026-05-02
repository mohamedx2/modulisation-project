"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  loading: true,
  login: async () => ({ id: '', name: '', email: '', role: '' }),
  signup: async () => { },
  logout: async () => { },
});

export function useAuth() {
  return useContext(SessionContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/session", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      throw new Error("Login failed");
    }

    const data = await res.json();
    setUser(data.user);
    return data.user;
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Signup failed");
    }
  };

  const logout = async () => {
    await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="w-16 h-16 animate-spin text-primary mb-8 relative z-10">
          <svg className="w-full h-full" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="font-black uppercase italic tracking-[0.5em] text-xs text-primary animate-pulse relative z-10">Authenticating Axis Node</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </SessionContext.Provider>
  );
}