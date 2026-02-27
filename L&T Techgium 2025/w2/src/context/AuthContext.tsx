import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "instructor" | "student";

export interface User {
    username: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, role: UserRole) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const stored = localStorage.getItem("mindflow_user");
            if (stored) return JSON.parse(stored);
        } catch {
            // ignore
        }
        return null;
    });

    useEffect(() => {
        try {
            if (user) {
                localStorage.setItem("mindflow_user", JSON.stringify(user));
            } else {
                localStorage.removeItem("mindflow_user");
            }
        } catch {
            // ignore
        }
    }, [user]);

    const login = (username: string, role: UserRole) => {
        setUser({ username, role });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
