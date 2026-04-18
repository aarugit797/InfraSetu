import { DEMO_USERS } from "@/lib/mockData";
import { getRoleDashboardPath } from "@/lib/utils";
import type { User, UserRole } from "@/types";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";

const STORAGE_KEY = "infrasetu_auth_token";
const SITE_KEY = "infrasetu_site";

// Demo email → role mapping for prototype fallback
const DEMO_EMAILS: Record<UserRole, string> = {
  governmentAuthority: "smeetd29@gmail.com",
  projectManager: "manager@example.com",
  siteEngineer: "engineer@infrasetu.in",
  contractor: "contractor@infrasetu.in",
  worker: "worker@infrasetu.in",
  auditor: "investor@example.com",
  community: "community@infrasetu.in",
  public: "public@infrasetu.in",
};

interface AuthContextValue {
  currentUser: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  selectedSiteId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  selectSite: (siteId: string, navigate: (path: string) => void) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SITE_KEY);
    } catch {
      return null;
    }
  });

  // On mount, restore session from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) { setAuthLoading(false); return; }

      try {
        const parsed = JSON.parse(stored);
        // If it's a demo user object saved directly
        if (parsed?.role && parsed?.email) {
          setCurrentUser(parsed);
          setAuthLoading(false);
          return;
        }
        // If it's a JWT token, try to restore from API
        const profileRes = await fetch("/api/accounts/profile/", {
          headers: { Authorization: `Bearer ${stored}` },
        });
        if (profileRes.ok) {
          const d = await profileRes.json();
          setCurrentUser({
            id: String(d.id),
            name: d.name || d.user?.username || "User",
            role: (d.role?.toLowerCase() as UserRole) || "public",
            email: d.email || d.user?.email || "",
            phone: d.phone_number || "",
            joinedAt: Date.now(),
          });
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setAuthLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // 1. Try real Django JWT login
    try {
      const tokenRes = await fetch("/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (tokenRes.ok) {
        const { access } = await tokenRes.json();
        localStorage.setItem(STORAGE_KEY, access);

        const profileRes = await fetch("/api/accounts/profile/", {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (profileRes.ok) {
          const d = await profileRes.json();
          const user: User = {
            id: String(d.id),
            name: d.name || d.user?.username || email.split("@")[0],
            role: (d.role?.toLowerCase() as UserRole) || "public",
            email: d.email || email,
            phone: d.phone_number || "",
            joinedAt: Date.now(),
          };
          setCurrentUser(user);
          localStorage.removeItem(SITE_KEY);
          setSelectedSiteId(null);
          return;
        }
      }
    } catch {
      // API unreachable — fall through to demo mode
    }

    // 2. Prototype demo fallback — map email → role
    const roleEntry = Object.entries(DEMO_EMAILS).find(([_, e]) => e === email.toLowerCase());
    const role = roleEntry ? (roleEntry[0] as UserRole) : null;
    
    if (role) {
      const demoUser = DEMO_USERS.find((u) => u.role === role) ?? DEMO_USERS[0];
      const user: User = { ...demoUser, email };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.removeItem(SITE_KEY);
      setSelectedSiteId(null);
      setCurrentUser(user);
      return;
    }

    // 3. Any email / any password → pick role from DEMO_USERS based on email pattern or use first user
    const guessedRole: UserRole = email.includes("gov") || email.includes("authority") || email.includes("admin")
      ? "governmentAuthority"
      : email.includes("manager") || email.includes("pm")
        ? "projectManager"
        : email.includes("engineer")
          ? "siteEngineer"
          : email.includes("contractor")
            ? "contractor"
            : email.includes("worker")
              ? "worker"
              : email.includes("audit")
                ? "auditor"
                : "projectManager"; // default for prototype

    const fallbackUser = DEMO_USERS.find((u) => u.role === guessedRole) ?? DEMO_USERS[0];
    const user: User = { ...fallbackUser, email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.removeItem(SITE_KEY);
    setSelectedSiteId(null);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SITE_KEY);
    setCurrentUser(null);
    setSelectedSiteId(null);
  }, []);

  const selectSite = useCallback(
    (siteId: string, navigate: (path: string) => void) => {
      localStorage.setItem(SITE_KEY, siteId);
      setSelectedSiteId(siteId);
      if (currentUser) {
        navigate(getRoleDashboardPath(currentUser.role));
      }
    },
    [currentUser],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        authLoading,
        selectedSiteId,
        login,
        logout,
        selectSite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
