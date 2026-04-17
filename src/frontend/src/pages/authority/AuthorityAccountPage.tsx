import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useSites } from "@/hooks/useBackend";
import { getRoleBadgeColor, getRoleDisplayName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NOTIFICATION_PREFS = [
  {
    id: "approval_requests",
    label: "New Approval Requests",
    description: "Get notified when requests need your action",
  },
  {
    id: "budget_alerts",
    label: "Budget Threshold Alerts",
    description: "Alert when spend exceeds 80% of budget",
  },
  {
    id: "compliance_updates",
    label: "Compliance Updates",
    description: "Test reports and audit findings",
  },
  {
    id: "critical_issues",
    label: "Critical Issues",
    description: "High-priority site issues and escalations",
  },
  {
    id: "project_milestones",
    label: "Project Milestones",
    description: "Phase completions and key dates",
  },
  {
    id: "weekly_digest",
    label: "Weekly Digest",
    description: "Summary of all activity across projects",
  },
];

export default function AuthorityAccountPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { data: sites } = useSites();

  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_PREFS.map((n) => [n.id, true])),
  );

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
    toast.success("Logged out successfully");
  }

  function togglePref(id: string) {
    setNotifPrefs((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      toast.success("Notification preference updated");
      return next;
    });
  }

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="p-4 lg:p-6 space-y-6 max-w-2xl bg-slate-50 min-h-screen"
      data-ocid="authority.account.page"
    >
      <div>
        <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
          Account
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Profile and preferences</p>
      </div>

      {/* Profile Card */}
      <div
        className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4"
        data-ocid="authority.account.profile.section"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-2xl text-amber-600">
              {initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-xl text-slate-800">
              {currentUser.name}
            </p>
            <Badge
              className={cn(
                "text-xs mt-1 border",
                getRoleBadgeColor(currentUser.role),
              )}
            >
              {getRoleDisplayName(currentUser.role)}
            </Badge>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-800 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Phone</p>
              <p className="text-sm font-medium text-slate-800">
                {currentUser.phone ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <Shield className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Role</p>
              <p className="text-sm font-medium text-slate-800">
                Government Authority
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Member Since</p>
              <p className="text-sm font-medium text-slate-800">
                {new Date(currentUser.joinedAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Site Assignments */}
      <div
        className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3"
        data-ocid="authority.account.sites.section"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Site Assignments
          </h2>
        </div>
        <div className="space-y-2">
          {(sites ?? []).map((site, i) => (
            <div
              key={site.id}
              className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3"
              data-ocid={`authority.account.site.item.${i + 1}`}
            >
              <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {site.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {site.address}
                </p>
              </div>
              <Badge
                className={cn(
                  "text-xs flex-shrink-0",
                  site.status === "active"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-slate-100 text-slate-600 border-slate-200",
                )}
              >
                {site.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div
        className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3"
        data-ocid="authority.account.notifications.section"
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Notification Preferences
          </h2>
        </div>
        <div className="space-y-1">
          {NOTIFICATION_PREFS.map((pref, i) => (
            <div
              key={pref.id}
              className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-0"
              data-ocid={`authority.account.notif.item.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  {pref.label}
                </p>
                <p className="text-xs text-slate-500">{pref.description}</p>
              </div>
              <Switch
                checked={notifPrefs[pref.id] ?? true}
                onCheckedChange={() => togglePref(pref.id)}
                data-ocid={`authority.account.notif.switch.${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="pb-4">
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white"
          onClick={handleLogout}
          data-ocid="authority.account.logout_button"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
