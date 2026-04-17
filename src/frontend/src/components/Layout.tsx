import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { SITES } from "@/lib/mockData";
import {
  cn,
  getNavItemsForRole,
  getRoleBadgeColor,
  getRoleDisplayName,
} from "@/lib/utils";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CalendarCheck,
  Camera,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Cloud,
  CreditCard,
  DollarSign,
  FileText,
  FlaskConical,
  FolderKanban,
  HardHat,
  Kanban,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircleWarning,
  Package,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserCircle,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { type ComponentType, type ReactNode, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/hooks/useI18n";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  AlertTriangle,
  Users,
  Package,
  DollarSign,
  ClipboardList,
  ClipboardCheck,
  ShoppingCart,
  CalendarCheck,
  Camera,
  FlaskConical,
  Truck,
  UserCircle,
  Calendar,
  MapPin,
  Bell,
  CreditCard,
  MessageCircleWarning,
  FileText,
  Send,
  Cloud,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Wrench,
};

function getBottomNavItems(role: string) {
  const all = getNavItemsForRole(
    role as Parameters<typeof getNavItemsForRole>[0],
  );
  const main = all.slice(0, 4);
  const account = all.find((i) => i.label === "Account");
  return account ? [...main.slice(0, 4), account] : main.slice(0, 5);
}

export function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, selectedSiteId, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) return <>{children}</>;

  const navItems = getNavItemsForRole(currentUser.role);
  const bottomNav = getBottomNavItems(currentUser.role);
  const activeSite = SITES.find((s) => s.id === selectedSiteId);

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-amber-100/80 shadow-sm transition-transform duration-300",
          "lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-100">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-amber">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-slate-800 text-sm leading-tight">
              InfraSetu
            </p>
            <p className="text-slate-400 text-xs truncate">
              Digital Management
            </p>
          </div>
          <button
            type="button"
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active site badge */}
        {activeSite && (
          <div className="px-3 pt-3">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-amber-50 border border-amber-200">
              <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-amber-700 text-xs font-semibold truncate">
                  {activeSite.name}
                </p>
                <p className="text-amber-500 text-[10px] truncate">
                  {t("layout.active_site")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] ?? LayoutDashboard;
            const active =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                data-ocid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth group",
                  active
                    ? "bg-amber-100 text-amber-800 border-l-2 border-amber-500 pl-[10px]"
                    : "text-slate-600 hover:bg-amber-50 hover:text-amber-700",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    active
                      ? "text-amber-600"
                      : "text-slate-400 group-hover:text-amber-600",
                  )}
                />
                <span className="truncate">{item.label}</span>
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="px-3 py-4 border-t border-amber-100">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 text-sm font-medium truncate">
                {currentUser.name}
              </p>
              <Badge
                className={cn(
                  "text-xs px-1.5 py-0 mt-0.5 border",
                  getRoleBadgeColor(currentUser.role),
                )}
              >
                {getRoleDisplayName(currentUser.role)}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-slate-400 hover:text-red-500 flex-shrink-0"
              onClick={handleLogout}
              aria-label={t("layout.logout")}
              data-ocid="nav-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden text-slate-500 hover:text-slate-700 p-1 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            data-ocid="nav-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm text-slate-800">
              InfraSetu
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-sm text-slate-400">
            <span className="text-slate-600">InfraSetu</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <Badge
              className={cn(
                "text-[10px] px-1.5 py-0 border font-bold uppercase tracking-wider",
                getRoleBadgeColor(currentUser.role),
              )}
            >
              {getRoleDisplayName(currentUser.role)}
            </Badge>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 font-medium capitalize">
              {location.pathname
                .split("/")
                .filter(Boolean)
                .slice(1)
                .join(" / ") || t("layout.dashboard")}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {activeSite && (
              <div className="hidden md:flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                <MapPin className="w-3 h-3 text-amber-600" />
                <span className="text-xs text-amber-700 font-medium truncate max-w-[120px]">
                  {activeSite.name}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="relative w-9 h-9 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
              aria-label="Notifications"
              data-ocid="nav-notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            </Button>
            
            <LanguageSwitcher />

            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-slate-700 font-medium">
                {currentUser.name.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">{children}</main>
      </div>

      {/* Bottom tab bar (mobile only) */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white border-t border-slate-200 flex"
        data-ocid="nav-bottom-bar"
      >
        {bottomNav.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard;
          const active =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-smooth",
                active
                  ? "text-amber-600"
                  : "text-slate-400 hover:text-slate-600",
              )}
              data-ocid={`bottom-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Toaster position="top-right" richColors />
    </div>
  );
}
