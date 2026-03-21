import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, type User } from '@/lib/api';

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
            const userData = await authApi.me();
            setUser(userData);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('auth_token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const data = await authApi.login(email, password);
            localStorage.setItem('auth_token', data.accessToken);
            setUser(data.user);
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const data = await authApi.register(email, password, name);
            localStorage.setItem('auth_token', data.accessToken);
            setUser(data.user);
        } catch (error: any) {
            throw new Error(error.message || 'Registration failed');
        }
    };

    const logout = async () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                await authApi.logout();
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
