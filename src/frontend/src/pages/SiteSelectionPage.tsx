import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { SITES } from "@/lib/mockData";
import { cn, getRoleBadgeColor, getRoleDisplayName } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  HardHat,
  LogOut,
  MapPin,
  Users,
} from "lucide-react";

export default function SiteSelectionPage() {
  const { currentUser, selectedSiteId, selectSite, logout } = useAuth();
  const navigate = useNavigate();

  function handleSelectSite(siteId: string) {
    selectSite(siteId, (path) => navigate({ to: path }));
  }

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-yellow-200/30 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white border-b border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-sm text-slate-800">
            InfraSetu
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <div className="w-5 h-5 rounded-lg bg-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-700">
              {currentUser.name}
            </span>
            <Badge
              className={cn(
                "text-xs px-1.5 py-0 border",
                getRoleBadgeColor(currentUser.role),
              )}
            >
              {getRoleDisplayName(currentUser.role)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-smooth"
            onClick={handleLogout}
            aria-label="Logout"
            data-ocid="site-selection-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 shadow-amber mb-4">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-800 mb-2">
              Select Your Active Site
            </h1>
            <p className="text-slate-500 text-sm">
              Choose the construction site you're working on today
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Badge
                className={cn(
                  "text-xs px-2 py-1 border",
                  getRoleBadgeColor(currentUser.role),
                )}
              >
                {getRoleDisplayName(currentUser.role)}
              </Badge>
              <span className="text-slate-400 text-xs">{currentUser.name}</span>
            </div>
          </div>

          {/* Site cards */}
          <div
            className="grid grid-cols-1 gap-4"
            data-ocid="site-selection-list"
          >
            {SITES.map((site, i) => {
              const isSelected = selectedSiteId === site.id;
              return (
                <button
                  type="button"
                  key={site.id}
                  onClick={() => handleSelectSite(site.id)}
                  data-ocid={`site-selection.item.${i + 1}`}
                  className={cn(
                    "w-full text-left bg-white rounded-2xl p-5 border-2 transition-smooth group hover:shadow-md",
                    isSelected
                      ? "border-amber-500 bg-amber-50 shadow-sm"
                      : "border-slate-200 hover:border-amber-300",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-smooth",
                        isSelected
                          ? "bg-amber-500"
                          : "bg-slate-100 group-hover:bg-amber-100",
                      )}
                    >
                      <Building2
                        className={cn(
                          "w-6 h-6 transition-smooth",
                          isSelected
                            ? "text-white"
                            : "text-slate-400 group-hover:text-amber-600",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-display font-semibold text-slate-800 text-base">
                          {site.name}
                        </h3>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full border font-medium",
                            site.status === "active"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200",
                          )}
                        >
                          {site.status.charAt(0).toUpperCase() +
                            site.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-2">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{site.address}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {site.totalWorkers} workers
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {site.geoRadius}m GPS radius
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                      {isSelected ? (
                        <CheckCircle2 className="w-6 h-6 text-amber-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-amber-400 transition-smooth" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            You can switch sites later from your profile settings
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="text-amber-600 hover:text-amber-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
