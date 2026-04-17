import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { PROJECTS, SITES } from "@/lib/mockData";
import {
  cn,
  formatDate,
  getRoleBadgeColor,
  getRoleDisplayName,
} from "@/lib/utils";
import {
  Building2,
  Edit3,
  FileSearch,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AUDIT_SCOPE_PROJECTS = PROJECTS;
const AUDIT_SCOPE_SITES = SITES;

export default function AuditorAccountPage() {
  const { currentUser } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [org, setOrg] = useState("Central Public Works Audit Bureau");
  const [auditorId, setAuditorId] = useState("AUD-2024-0042");

  if (!currentUser) return null;

  function handleSave() {
    toast.success("Profile updated successfully");
    setShowEdit(false);
  }

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5"
      data-ocid="auditor-account.page"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Account</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Auditor profile and scope
        </p>
      </div>

      {/* Profile Card */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm"
        data-ocid="auditor-account.profile-card"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-600 font-bold text-2xl">
              {name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-lg leading-tight truncate">
              {name}
            </p>
            <Badge
              className={cn(
                "text-xs border mt-1",
                getRoleBadgeColor(currentUser.role),
              )}
            >
              {getRoleDisplayName(currentUser.role)}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 bg-white gap-1.5 flex-shrink-0 hover:bg-slate-50"
            onClick={() => setShowEdit(true)}
            data-ocid="auditor-account.edit_button"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 gap-2">
          {[
            {
              icon: FileSearch,
              label: "Auditor ID",
              value: auditorId,
              color: "text-amber-600",
            },
            {
              icon: Building2,
              label: "Organization",
              value: org,
              color: "text-slate-700",
            },
            {
              icon: Mail,
              label: "Email",
              value: email,
              color: "text-slate-700",
            },
            {
              icon: Phone,
              label: "Phone",
              value: phone || "+91-9810001006",
              color: "text-slate-700",
            },
            {
              icon: User,
              label: "User ID",
              value: currentUser.id,
              color: "text-slate-500",
            },
            {
              icon: ShieldCheck,
              label: "Member Since",
              value: formatDate(String(currentUser.joinedAt)),
              color: "text-slate-500",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3"
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", color)} />
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-[10px] font-medium uppercase">
                  {label}
                </p>
                <p className={cn("text-sm font-semibold truncate", color)}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Scope — Projects */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
        data-ocid="auditor-account.scope-projects"
      >
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Audit Scope — Projects
          </h2>
          <span className="ml-auto text-xs text-slate-400">
            {AUDIT_SCOPE_PROJECTS.length} assigned
          </span>
        </div>
        <div className="space-y-2">
          {AUDIT_SCOPE_PROJECTS.map((project, idx) => (
            <div
              key={project.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3"
              data-ocid={`auditor-account.scope-project.${idx + 1}`}
            >
              <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 text-sm font-semibold truncate">
                  {project.name}
                </p>
                <p className="text-slate-500 text-xs truncate">
                  {project.location}
                </p>
              </div>
              <Badge
                className={cn(
                  "text-[10px] border flex-shrink-0",
                  project.status === "active"
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-slate-100 text-slate-500 border-slate-200",
                )}
              >
                {project.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Scope — Sites */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
        data-ocid="auditor-account.scope-sites"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Audit Scope — Sites
          </h2>
          <span className="ml-auto text-xs text-slate-400">
            {AUDIT_SCOPE_SITES.length} assigned
          </span>
        </div>
        <div className="space-y-2">
          {AUDIT_SCOPE_SITES.map((site, idx) => (
            <div
              key={site.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3"
              data-ocid={`auditor-account.scope-site.${idx + 1}`}
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 text-sm font-semibold truncate">
                  {site.name}
                </p>
                <p className="text-slate-500 text-xs truncate">
                  {site.address}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge
                  className={cn(
                    "text-[10px] border",
                    site.status === "active"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-slate-100 text-slate-500 border-slate-200",
                  )}
                >
                  {site.status}
                </Badge>
                <span className="text-[10px] text-slate-400">
                  {site.totalWorkers} workers
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full h-12 border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
        onClick={() =>
          toast.info("Sign out functionality available from Settings")
        }
        data-ocid="auditor-account.logout-button"
      >
        Sign Out
      </Button>

      {/* Edit Modal */}
      {showEdit && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          data-ocid="auditor-account.dialog"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowEdit(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close"
            onKeyDown={(e) => e.key === "Escape" && setShowEdit(false)}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Close"
                data-ocid="auditor-account.close_button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 font-medium">
                  Full Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-50 border-slate-300"
                  data-ocid="auditor-account.name_input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 font-medium">
                  Email
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border-slate-300"
                  data-ocid="auditor-account.email_input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 font-medium">
                  Phone
                </Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-50 border-slate-300"
                  data-ocid="auditor-account.phone_input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 font-medium">
                  Organization
                </Label>
                <Input
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="bg-slate-50 border-slate-300"
                  data-ocid="auditor-account.org_input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-600 font-medium">
                  Auditor ID
                </Label>
                <Input
                  value={auditorId}
                  onChange={(e) => setAuditorId(e.target.value)}
                  className="bg-slate-50 border-slate-300 font-mono"
                  data-ocid="auditor-account.auditor_id_input"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-300 text-slate-600"
                  onClick={() => setShowEdit(false)}
                  data-ocid="auditor-account.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-0 gap-1.5"
                  onClick={handleSave}
                  data-ocid="auditor-account.save_button"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
