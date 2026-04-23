import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, type User } from "../lib/api";
import { storage } from "../lib/storage";

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
    const token = storage.get<string | null>("auth_token", null);

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch (error: any) {
      console.error("[Auth] checkAuth failed:", error.message);
      // Only clear if it's a real 401, not a network failure
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized") ||
        error.message.includes("not found")
      ) {
        storage.remove("auth_token");
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    productId?: string,
    depth = 0
  ) => {
    // MAX_RECURSION_DEPTH: Prevent infinite login loops
    if (depth > 2) {
      console.error("[Auth] Max login recursion depth reached");
      throw new Error(
        "Too many login attempts. Please select a product manually."
      );
    }

    try {
      // If productId is provided, we execute the normal login flow
      if (productId) {
        const data = await authApi.login(email, password, productId);

        const requiresSelection = data.requires_product_selection;
        if (requiresSelection) {
          return {
            requiresSelection: true,
            availableProducts: data.available_products,
          };
        }

        const token = data.access_token;
        if (token && data.user) {
          storage.set("auth_token", token);
          setUser(data.user);
        }
        return {};
      }

      // Initial login without productId
      const data = await authApi.login(email, password);

      const requiresSelection = data.requires_product_selection;
      if (requiresSelection) {
        const availableProducts = data.available_products;

        // Auto-select first product if only one is available
        if (availableProducts && availableProducts.length === 1) {
          const firstProduct = availableProducts[0];
          console.log("[Auth] Auto-selecting unique product:", firstProduct);
          return login(email, password, firstProduct, depth + 1);
        }

        return {
          requiresSelection: true,
          availableProducts,
        };
      }

      const token = data.access_token;
      if (token && data.user) {
        storage.set("auth_token", token);
        setUser(data.user);
      }
      return {};
    } catch (error: any) {
      console.error("[Auth] login failed:", error.message);
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        storage.remove("auth_token");
        setUser(null);
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const data = await authApi.register(email, password, name);
      if (data.access_token && data.user) {
        storage.set("auth_token", data.access_token);
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
      storage.remove("auth_token");
      setUser(null);
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
      subscription_tier: "enterprise",
      company: "Sentinel Development",
      allowed_products: ["*"],
    };
    storage.set("auth_token", "demo-token-for-testing");
    storage.set("demo_mode", "true");
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
      user.allowed_products?.includes("*") ||
      user.allowed_products?.includes(productId)
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
