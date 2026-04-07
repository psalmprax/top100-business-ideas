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

  // Debug user state changes
  const debugSetUser = (newUser: User | null) => {
    console.log("[Auth] setUser called:", newUser?.email || "null");
    setUser(newUser);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("auth_token");
    console.log("[Auth] checkAuth - token found:", !!token);

    if (!token) {
      console.log("[Auth] checkAuth - no token, user remains null");
      setIsLoading(false);
      return;
    }

    try {
      console.log("[Auth] checkAuth - calling /me API with token");
      const userData = await authApi.me();
      console.log("[Auth] checkAuth - user loaded successfully:", userData.email);
      debugSetUser(userData);
    } catch (error: any) {
      console.error("[Auth] checkAuth failed:", error.message);
      // Only clear if it's a real 401, not a network failure
      if (error.message.includes("401") || error.message.includes("Unauthorized") || error.message.includes("not found")) {
        console.log("[Auth] checkAuth - removing invalid/expired token");
        localStorage.removeItem("auth_token");
        setUser(null);
      } else {
        console.log("[Auth] checkAuth - potential network error, keeping token for retry");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, productId?: string) => {
    console.log("[Auth] login attempt for:", email);
    try {
      const data = await authApi.login(email, password, productId);
      console.log("[Auth] login API success, user:", data.user?.email);

      if (data.requiresProductSelection) {
        console.log("[Auth] product selection required, returning available products");
        return {
          requiresSelection: true,
          availableProducts: data.availableProducts,
        };
      }

      const token = data.accessToken || data.access_token;
      if (token && data.user) {
        console.log("[Auth] token and user confirmed, saving to localStorage");
        localStorage.setItem("auth_token", token);
        debugSetUser(data.user);
      } else {
        console.warn("[Auth] login response missing token or user data:", {
          hasToken: !!token,
          hasUser: !!data.user,
        });
      }
      return {};
    } catch (error: any) {
      console.error("[Auth] login function failed:", error.message);
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
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      debugSetUser(null);
    }
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
        isManagement:
          user?.role === "admin" ||
          user?.role === "management" ||
          user?.role === "enterprise",
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
