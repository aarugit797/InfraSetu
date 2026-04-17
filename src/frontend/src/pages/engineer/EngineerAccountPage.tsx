import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { PROJECTS, SITES } from "@/lib/mockData";
import { cn, getRoleBadgeColor, getRoleDisplayName } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Edit3,
  HardHat,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EngineerAccountPage() {
  const { currentUser, selectedSiteId, logout } = useAuth();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
  });

  const activeSite = SITES.find((s) => s.id === selectedSiteId);
  const assignedProjects = PROJECTS.filter((p) =>
    p.teamMembers.includes(currentUser?.id ?? ""),
  );

  function handleSave() {
    setShowEditModal(false);
    toast.success("Profile updated successfully");
  }

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  if (!currentUser) return null;

  return (
    <div
      className="p-4 space-y-5 bg-slate-50 min-h-screen"
      data-ocid="engineer-account.page"
    >
      {/* Profile card */}
      <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-200 border border-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-2xl font-display">
              {currentUser.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold text-slate-800 truncate">
              {currentUser.name}
            </h1>
            <Badge
              className={cn(
                "text-xs mt-1 border",
                getRoleBadgeColor(currentUser.role),
              )}
            >
              <HardHat className="w-3 h-3 mr-1" />
              {getRoleDisplayName(currentUser.role)}
            </Badge>
            <p className="text-xs text-slate-500 mt-1.5">
              Member since{" "}
              {new Date(currentUser.joinedAt).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl h-9 gap-1.5 text-xs flex-shrink-0"
            onClick={() => setShowEditModal(true)}
            data-ocid="engineer-account.edit-button"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>
      </div>

      {/* Contact details */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Contact Details
        </h2>
        <div className="space-y-2">
          {[
            { icon: Mail, label: "Email", value: currentUser.email },
            {
              icon: Phone,
              label: "Phone",
              value: currentUser.phone ?? "Not set",
            },
            {
              icon: User,
              label: "Employee ID",
              value: currentUser.id.toUpperCase(),
            },
          ].map((item, idx) => (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center gap-3"
              data-ocid={`engineer-account.detail.${idx + 1}`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-sm font-medium text-slate-800 truncate">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active site */}
      {activeSite && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Active Site
          </h2>
          <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {activeSite.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {activeSite.address}
                </p>
              </div>
              <Badge className="bg-green-100 border-green-300 text-green-700 text-xs">
                Active
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Project assignments */}
      {assignedProjects.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Project Assignments
          </h2>
          <div className="space-y-2">
            {assignedProjects.map((proj, idx) => (
              <div
                key={proj.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center gap-3"
                data-ocid={`engineer-account.project.${idx + 1}`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {proj.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {proj.location}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "text-xs border capitalize",
                    proj.status === "active"
                      ? "bg-green-100 border-green-300 text-green-700"
                      : "bg-slate-100 border-slate-300 text-slate-500",
                  )}
                >
                  {proj.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full border-red-300 text-red-700 hover:bg-red-50 rounded-xl h-11 gap-2"
        onClick={handleLogout}
        data-ocid="engineer-account.logout-button"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          data-ocid="engineer-account.edit-modal.dialog"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800 text-lg">
                Edit Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700"
                data-ocid="engineer-account.edit-modal.close-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-medium">
                  Full Name
                </p>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-800"
                  data-ocid="engineer-account.edit-modal.name.input"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-medium">
                  Email
                </p>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-800"
                  data-ocid="engineer-account.edit-modal.email.input"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-medium">
                  Phone
                </p>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-800"
                  data-ocid="engineer-account.edit-modal.phone.input"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50"
                onClick={() => setShowEditModal(false)}
                data-ocid="engineer-account.edit-modal.cancel-button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-2 border-0"
                onClick={handleSave}
                data-ocid="engineer-account.edit-modal.save-button"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
