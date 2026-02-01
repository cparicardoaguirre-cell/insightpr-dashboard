import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    user: string | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credentials - In production, this should be in environment variables or backend
const VALID_CREDENTIALS = {
    username: 'nltspr',
    password: 'InsightPR2026!'
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<string | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        const savedAuth = sessionStorage.getItem('nltspr_auth');
        const savedUser = sessionStorage.getItem('nltspr_user');
        if (savedAuth === 'true' && savedUser) {
            setIsAuthenticated(true);
            setUser(savedUser);
        }
    }, []);

    const login = (username: string, password: string): boolean => {
        if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
            setIsAuthenticated(true);
            setUser(username);
            sessionStorage.setItem('nltspr_auth', 'true');
            sessionStorage.setItem('nltspr_user', username);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        sessionStorage.removeItem('nltspr_auth');
        sessionStorage.removeItem('nltspr_user');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
