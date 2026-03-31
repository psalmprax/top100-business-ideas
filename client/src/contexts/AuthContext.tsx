import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, type User } from '../lib/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isDemo: boolean;
    isManagement: boolean;
    login: (email: string, password: string, productId?: string) => Promise<{ requiresSelection?: boolean; availableProducts?: string[] }>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<User>) => void;
    loginDemo: () => void;
    hasProductAccess: (productId: string) => boolean;
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

        if (!token) {
            setIsLoading(false);
            return;
        }

        // Hardening: Always perform a real /me check against the Go Gateway for \"Real-First\" architecture.
        // This ensures the \"demo-token-for-testing\" is validated by the backend bypass.
        try {
            const userData = await authApi.me();
            setUser(userData);
            
            // Sync demo_mode flag if using the test token
            if (token === 'demo-token-for-testing') {
                localStorage.setItem('demo_mode', 'true');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('demo_mode');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string, productId?: string) => {
        try {
            const data = await authApi.login(email, password, productId);

            if (data.requiresProductSelection) {
                return {
                    requiresSelection: true,
                    availableProducts: data.availableProducts
                };
            }

            if (data.accessToken && data.user) {
                localStorage.setItem('auth_token', data.accessToken);
                setUser(data.user);
            }
            return {};
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const data = await authApi.register(email, password, name);
            if (data.accessToken && data.user) {
                localStorage.setItem('auth_token', data.accessToken);
                setUser(data.user);
            }
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
            id: 'd0e1b5c4-f3a1-4d3a-b8e9-7c2d1e0f0a2b',
            email: 'demo@sentinel.dev',
            name: 'Functional Test Admin',
            role: 'admin',
            subscriptionTier: 'enterprise',
            company: 'Sentinel Development',
            allowedProducts: ['*'],
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

    const hasProductAccess = (productId: string) => {
        if (!user) return false;
        if (isManagement) return true;
        return user.allowedProducts?.includes('*') || user.allowedProducts?.includes(productId);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isDemo: localStorage.getItem('demo_mode') === 'true',
                isManagement,
                login,
                signUp,
                logout,
                updateUser,
                loginDemo,
                hasProductAccess,
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
