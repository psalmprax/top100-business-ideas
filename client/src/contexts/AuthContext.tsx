import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, type User } from "../lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;
  isManagement: boolean;
  login: (
    email: string,
    password: string,
    productId?: string
  ) => Promise<{ requiresSelection?: boolean; availableProducts?: string[] }>;
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
    const token = localStorage.getItem("auth_token");
    console.log("[Auth] checkAuth - token exists:", !!token);

    if (!token) {
      console.log("[Auth] checkAuth - no token, setting loading to false");
      setIsLoading(false);
      return;
    }

    try {
      console.log("[Auth] checkAuth - calling /me API");
      const userData = await authApi.me();
      console.log("[Auth] checkAuth - user loaded:", userData.email);
      setUser(userData);
    } catch (error) {
      console.error("[Auth] checkAuth failed:", error);
      console.log("[Auth] checkAuth - removing invalid token");
      localStorage.removeItem("auth_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, productId?: string) => {
    console.log("[Auth] login called for:", email);
    try {
      const data = await authApi.login(email, password, productId);
      console.log("[Auth] login response:", data.user?.email);

      if (data.requiresProductSelection) {
        return {
          requiresSelection: true,
          availableProducts: data.availableProducts,
        };
      }

      if (data.accessToken && data.user) {
        console.log("[Auth] Saving camelCase token");
        localStorage.setItem("auth_token", data.accessToken);
        setUser(data.user);
        console.log("[Auth] User set:", data.user.email);
      } else if (data.access_token && data.user) {
        // Handle snake_case response from backend
        console.log("[Auth] Saving snake_case token");
        localStorage.setItem("auth_token", data.access_token);
        setUser(data.user);
        console.log("[Auth] User set:", data.user.email);
      } else {
        console.log("[Auth] No token or user in response:", {
          hasToken: !!(data.accessToken || data.access_token),
          hasUser: !!data.user,
        });
      }
      return {};
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const data = await authApi.register(email, password, name);
      if (data.accessToken && data.user) {
        localStorage.setItem("auth_token", data.accessToken);
        setUser(data.user);
      } else if (data.access_token && data.user) {
        // Handle snake_case response from backend
        localStorage.setItem("auth_token", data.access_token);
        setUser(data.user);
      }
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        await authApi.logout();
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  const loginDemo = () => {
    // REAL-FIRST: Demo mode is strictly disabled in production.
    if (import.meta.env.PROD) {
      throw new Error(
        "Demo mode is disabled in production. Please use real authentication credentials."
      );
    }

    // Auto-login as demo user for local development/testing ONLY
    const demoUser: User = {
      id: "d0e1b5c4-f3a1-4d3a-b8e9-7c2d1e0f0a2b",
      email: "demo@sentinel.dev",
      name: "Functional Test Admin",
      role: "admin",
      subscriptionTier: "enterprise",
      company: "Sentinel Development",
      allowedProducts: ["*"],
    };
    localStorage.setItem("auth_token", "demo-token-for-testing");
    localStorage.setItem("demo_mode", "true");
    setUser(demoUser);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const isManagement =
    user?.role === "management" ||
    user?.role === "admin" ||
    user?.role === "enterprise";

  const hasProductAccess = (productId: string) => {
    if (!user) return false;
    if (isManagement) return true;
    return (
      user.allowedProducts?.includes("*") ||
      user.allowedProducts?.includes(productId)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isDemo: false,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
