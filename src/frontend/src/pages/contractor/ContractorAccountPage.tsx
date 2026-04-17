import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { SITES } from "@/lib/mockData";
import { formatDate, getRoleDisplayName } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Calendar,
  Edit2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const WORKER_COUNT = 8;
const ASSIGNED_PROJECTS = [
  {
    id: "s1",
    name: "NH-48 Bridge Extension",
    location: "Gurugram, Haryana",
    status: "active",
  },
  {
    id: "s2",
    name: "Sector 54 Flyover",
    location: "Noida, UP",
    status: "upcoming",
  },
];

function EditProfileModal({
  user,
  onClose,
  onSave,
}: {
  user: { name: string; email: string; phone: string; company: string };
  onClose: () => void;
  onSave: (data: typeof user) => void;
}) {
  const [form, setForm] = useState({ ...user });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        role="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div
        className="relative w-full max-w-md bg-card rounded-2xl p-5 space-y-4 shadow-xl border border-border"
        data-ocid="contractor-account.dialog"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-foreground text-lg">
            Edit Profile
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-ocid="contractor-account.close_button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          {(
            [
              { key: "name", label: "Full Name", icon: User },
              { key: "company", label: "Company Name", icon: Building2 },
              { key: "email", label: "Email Address", icon: Mail },
              { key: "phone", label: "Phone Number", icon: Phone },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <div key={key}>
              <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Label>
              <Input
                value={form[key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
                className="border-border focus:ring-primary focus:border-primary"
                data-ocid={`contractor-account.${key}_input`}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 py-2.5 bg-muted border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors duration-200"
            data-ocid="contractor-account.cancel_button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-colors duration-200"
            data-ocid="contractor-account.save_button"
            onClick={() => {
              onSave(form);
              onClose();
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractorAccountPage() {
  const { currentUser, selectedSiteId, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: currentUser?.name ?? "Vikram Patel",
    email: currentUser?.email ?? "contractor@demo.com",
    phone: currentUser?.phone ?? "+91-9810001004",
    company: "Patel Construction Ltd",
  });
  const [showEdit, setShowEdit] = useState(false);

  const activeSite = SITES.find((s) => s.id === selectedSiteId);

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <div
      className="bg-muted min-h-screen p-4 space-y-6"
      data-ocid="contractor-account.page"
    >
      <div>
        <h1 className="font-display font-bold text-xl text-foreground">
          Account
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Your profile and company information
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-display font-bold text-2xl">
              {profile.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-foreground text-lg leading-tight">
              {profile.name}
            </h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {currentUser && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {getRoleDisplayName(currentUser.role)}
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                {profile.company}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border text-foreground rounded-xl text-xs font-medium hover:border-primary/40 hover:text-primary transition-colors duration-200 flex-shrink-0"
            data-ocid="contractor-account.edit_button"
            onClick={() => setShowEdit(true)}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-border space-y-3">
          {[
            { icon: Mail, label: "Email", value: profile.email },
            { icon: Phone, label: "Phone", value: profile.phone },
            { icon: Building2, label: "Company", value: profile.company },
            {
              icon: Calendar,
              label: "Joined",
              value: currentUser ? formatDate(currentUser.joinedAt) : "—",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground truncate">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm"
          data-ocid="contractor-account.workers_stat"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {WORKER_COUNT}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Workers Under You
          </p>
        </div>
        <div
          className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm"
          data-ocid="contractor-account.projects_stat"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {ASSIGNED_PROJECTS.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Assigned Projects
          </p>
        </div>
      </div>

      {/* Active project */}
      {activeSite && (
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Active Site
          </h2>
          <div className="bg-card border-2 border-primary/40 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {activeSite.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activeSite.address}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Assigned projects */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Assigned Projects
        </h2>
        <div className="space-y-2">
          {ASSIGNED_PROJECTS.map((proj, i) => (
            <div
              key={proj.id}
              className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm"
              data-ocid={`contractor-account.project.${i + 1}`}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {proj.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {proj.location}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${proj.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
              >
                {proj.status.charAt(0).toUpperCase() + proj.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Security
        </h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground flex-1">
              Role Permissions
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
              Contractor
            </span>
          </div>
          <button
            type="button"
            className="flex items-center gap-3 px-4 py-3.5 w-full text-left hover:bg-red-50 transition-colors duration-200"
            data-ocid="contractor-account.logout_button"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500 font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground pb-2">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </p>

      {showEdit && (
        <EditProfileModal
          user={profile}
          onClose={() => setShowEdit(false)}
          onSave={(data) => setProfile(data)}
        />
      )}
    </div>
  );
}
