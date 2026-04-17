import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { PROJECTS, SITES } from "@/lib/mockData";
import { Edit3, Lock, Mail, MapPin, Phone, Shield, X } from "lucide-react";
import { useState } from "react";

export default function ManagerAccountPage() {
  const { currentUser } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [savedName, setSavedName] = useState(currentUser?.name ?? "");
  const [savedPhone, setSavedPhone] = useState(currentUser?.phone ?? "");

  const [notifs, setNotifs] = useState({
    taskUpdates: true,
    dailyReports: true,
    weeklyReportReminder: true,
    approvalRequests: false,
    systemAlerts: false,
  });

  const managedSites = SITES.filter(
    (s) => s.managerName === savedName || s.managerName === currentUser?.name,
  );
  const assignedProjects = PROJECTS.slice(0, 3);

  function saveProfile() {
    setSavedName(name);
    setSavedPhone(phone);
    setShowEdit(false);
  }

  if (!currentUser) return null;

  const initials = savedName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 bg-muted/20 min-h-screen">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h1 className="text-2xl font-bold text-foreground">Account</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-4">
            Profile, settings &amp; preferences
          </p>
        </div>

        {/* Profile card */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 font-bold text-xl">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {savedName}
                </h2>
                <Badge className="bg-amber-100 text-amber-800 border-0 text-xs mt-1 hover:bg-amber-100">
                  Project Manager
                </Badge>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{currentUser.email}</span>
                </div>
                {savedPhone && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{savedPhone}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setName(savedName);
                setPhone(savedPhone);
                setShowEdit(true);
              }}
              className="border-border text-foreground hover:bg-amber-50"
              data-ocid="account.edit_button"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit Profile
            </Button>
          </div>

          {/* Assigned Projects */}
          <div className="mt-5 pt-5 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Assigned Projects
            </h3>
            <div className="space-y-2">
              {assignedProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-muted/30 border border-border rounded-xl px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                      {p.location}
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs hover:bg-emerald-100">
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Site assignments */}
          {managedSites.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Site Assignments
              </h3>
              <div className="space-y-2">
                {managedSites.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between bg-muted/30 border border-border rounded-xl px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {s.address}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-0 text-xs hover:bg-amber-100">
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Security
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Password</p>
              <p className="text-xs text-muted-foreground">
                Last changed 30 days ago
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowPwd(true)}
              className="border-border text-foreground hover:bg-amber-50"
              data-ocid="account.secondary_button"
            >
              <Lock className="w-3.5 h-3.5 mr-1" />
              Change
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Notification Preferences
          </h3>
          <div className="space-y-4">
            {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(
              ([key, val]) => {
                const labels: Record<keyof typeof notifs, string> = {
                  taskUpdates: "Task Updates",
                  dailyReports: "Daily Reports Received",
                  weeklyReportReminder: "Weekly Report Reminder",
                  approvalRequests: "Approval Requests",
                  systemAlerts: "System Alerts",
                };
                const descs: Record<keyof typeof notifs, string> = {
                  taskUpdates:
                    "Notify when tasks are created, updated, or completed",
                  dailyReports:
                    "Alert when site engineers submit daily reports",
                  weeklyReportReminder:
                    "Remind me to send weekly report to authority",
                  approvalRequests:
                    "When contractors submit requests for approval",
                  systemAlerts: "Platform maintenance and system notifications",
                };
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {labels[key]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {descs[key]}
                      </p>
                    </div>
                    <Switch
                      checked={val}
                      onCheckedChange={(v) =>
                        setNotifs((n) => ({ ...n, [key]: v }))
                      }
                      data-ocid={`account.${key}.switch`}
                    />
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          data-ocid="account.dialog"
        >
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-foreground">
                Edit Profile
              </h2>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="text-muted-foreground hover:text-foreground"
                data-ocid="account.close_button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                  data-ocid="account.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                  placeholder="+91-9810001002"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Email (read-only)
                </Label>
                <Input
                  value={currentUser.email}
                  disabled
                  className="mt-1 border-border bg-muted/40 opacity-70"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEdit(false)}
                className="border-border text-foreground hover:bg-muted"
                data-ocid="account.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveProfile}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-ocid="account.save_button"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPwd && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-foreground">
                Change Password
              </h2>
              <button
                type="button"
                onClick={() => setShowPwd(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Current Password
                </Label>
                <Input
                  type="password"
                  className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  New Password
                </Label>
                <Input
                  type="password"
                  className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Confirm New Password
                </Label>
                <Input
                  type="password"
                  className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-100 rounded-lg p-3">
              Password change is simulated in this demo.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPwd(false)}
                className="border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowPwd(false)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
