import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { PROJECTS, SITES } from "@/lib/mockData";
import { cn, getRoleDisplayName } from "@/lib/utils";
import {
  Building2,
  Calendar,
  Edit3,
  HardHat,
  MapPin,
  Phone,
  Save,
  User2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SKILLS_OPTIONS = [
  "Masonry",
  "Welding",
  "Carpentry",
  "Plumbing",
  "Electrical",
  "Concrete Work",
  "Steel Fixing",
  "Painting",
  "Scaffolding",
  "Heavy Equipment",
  "Survey",
  "Safety",
];

const WORKER_SKILLS_DEFAULT = ["Concrete Work", "Steel Fixing", "Masonry"];

export default function WorkerAccountPage() {
  const { currentUser, selectedSiteId, logout } = useAuth();
  const site = SITES.find((s) => s.id === selectedSiteId);
  const project = site ? PROJECTS.find((p) => p.id === site.projectId) : null;

  const [editModal, setEditModal] = useState(false);
  const [phone, setPhone] = useState(currentUser?.phone ?? "+91-9810001005");
  const [skills, setSkills] = useState<string[]>(WORKER_SKILLS_DEFAULT);
  const [editPhone, setEditPhone] = useState(phone);
  const [editSkills, setEditSkills] = useState<string[]>(skills);
  const [saving, setSaving] = useState(false);

  if (!currentUser) return null;

  const joinedDate = new Date(currentUser.joinedAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  function toggleSkill(s: string) {
    setEditSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setPhone(editPhone);
      setSkills(editSkills);
      setSaving(false);
      setEditModal(false);
      toast.success("Profile updated successfully!");
    }, 1000);
  }

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5 max-w-lg mx-auto"
      data-ocid="worker-account.page"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Account</h1>
        <p className="text-sm text-slate-500 mt-0.5">Profile & settings</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center flex-shrink-0">
          <span className="text-amber-600 font-bold text-3xl">
            {currentUser.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xl text-slate-800 truncate">
            {currentUser.name}
          </p>
          <Badge className="mt-1 bg-amber-100 text-amber-700 border border-amber-300 text-xs">
            {getRoleDisplayName(currentUser.role)}
          </Badge>
          <p className="text-xs text-slate-500 mt-1.5 truncate">
            {currentUser.email}
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0"
          onClick={() => {
            setEditPhone(phone);
            setEditSkills(skills);
            setEditModal(true);
          }}
          aria-label="Edit profile"
          data-ocid="worker-account.edit-button"
        >
          <Edit3 className="w-4 h-4" />
        </Button>
      </div>

      {/* Info rows */}
      <div className="space-y-2">
        <ProfileRow
          icon={User2}
          label="Employee ID"
          value={`EMP-${currentUser.id.toUpperCase()}`}
          ocid="worker-account.employee-id"
        />
        <ProfileRow
          icon={Phone}
          label="Phone"
          value={phone}
          ocid="worker-account.phone"
        />
        <ProfileRow
          icon={Calendar}
          label="Joined"
          value={joinedDate}
          ocid="worker-account.joined-date"
        />
        {site && (
          <ProfileRow
            icon={MapPin}
            label="Active Site"
            value={site.name}
            subValue={site.address}
            ocid="worker-account.active-site"
          />
        )}
        {project && (
          <ProfileRow
            icon={Building2}
            label="Assigned Project"
            value={project.name}
            subValue={project.location}
            ocid="worker-account.project"
          />
        )}
      </div>

      {/* Skills */}
      <div className="space-y-3" data-ocid="worker-account.skills-section">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {skills.length === 0 ? (
            <p className="text-sm text-slate-500">No skills added yet</p>
          ) : (
            skills.map((s) => (
              <Badge
                key={s}
                className="bg-amber-100 text-amber-700 border border-amber-300 text-xs"
              >
                {s}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Site manager info */}
      {site && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <HardHat className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Site Manager</p>
            <p className="text-sm font-semibold text-slate-800">
              {site.managerName}
            </p>
          </div>
        </div>
      )}

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full h-12 border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
        onClick={logout}
        data-ocid="worker-account.logout-button"
      >
        Sign Out
      </Button>

      {/* Edit modal */}
      {editModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4"
          data-ocid="worker-account.edit-modal"
        >
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between">
              <p className="font-bold text-lg text-slate-800">Edit Profile</p>
              <button
                type="button"
                onClick={() => setEditModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"
                data-ocid="worker-account.edit-modal.close-button"
                aria-label="Close edit modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="edit-phone"
                className="text-sm text-slate-600 font-medium"
              >
                Phone Number
              </Label>
              <Input
                id="edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91-XXXXXXXXXX"
                className="rounded-xl bg-slate-50 border-slate-300"
                data-ocid="worker-account.edit-modal.phone-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-slate-600 font-medium">
                Skills (tap to toggle)
              </Label>
              <div className="flex flex-wrap gap-2">
                {SKILLS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                      editSkills.includes(s)
                        ? "bg-amber-100 border-amber-400 text-amber-700"
                        : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200",
                    )}
                    data-ocid={`worker-account.edit-modal.skill-${s.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-600 rounded-xl"
                onClick={() => setEditModal(false)}
                data-ocid="worker-account.edit-modal.cancel-button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-xl"
                onClick={handleSave}
                disabled={saving}
                data-ocid="worker-account.edit-modal.save-button"
              >
                {saving ? (
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  subValue,
  ocid,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
  ocid: string;
}) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm"
      data-ocid={ocid}
    >
      <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
        {subValue && (
          <p className="text-xs text-slate-500 truncate">{subValue}</p>
        )}
      </div>
    </div>
  );
}
