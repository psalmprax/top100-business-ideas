import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    subscriptionTier: string;
    company?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isManagement: boolean;
    login: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<User>) => void;
    loginDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('auth_token');
        const isDemo = localStorage.getItem('demo_mode') === 'true';

        if (!token) {
            setIsLoading(false);
            return;
        }

        if (isDemo) {
            const demoUser: User = {
                id: 'demo-user-123',
                email: 'demo@alphaai.example.com',
                name: 'Demo User',
                role: 'client',
                subscriptionTier: 'enterprise',
                company: 'Demo Corporation',
            };
            setUser(demoUser);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/v1/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                localStorage.removeItem('auth_token');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('auth_token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('auth_token', data.accessToken || data.token);
        setUser(data.user);
    };

    const signUp = async (email: string, password: string, name: string) => {
        const response = await fetch(`${API_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        localStorage.setItem('auth_token', data.accessToken || data.token);
        setUser(data.user);
    };

    const logout = async () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                await fetch(`${API_URL}/api/v1/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('demo_mode');
        setUser(null);
    };

    const loginDemo = () => {
        // Auto-login as demo user for testing all features
        const demoUser: User = {
            id: 'demo-user-123',
            email: 'demo@alphaai.example.com',
            name: 'Demo User',
            role: 'client',
            subscriptionTier: 'pro',
            company: 'Demo Corporation',
        };
        localStorage.setItem('auth_token', 'demo-token-for-testing');
        localStorage.setItem('demo_mode', 'true');
        setUser(demoUser);
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...updates });
        }
    };

    const isManagement = user?.role === 'management' || user?.role === 'admin' || user?.role === 'enterprise';

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isManagement,
                login,
                signUp,
                logout,
                updateUser,
                loginDemo,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
