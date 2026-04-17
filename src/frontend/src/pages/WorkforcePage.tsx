import { Layout } from "@/components/Layout";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { ATTENDANCE, DEMO_USERS, PROJECTS } from "@/lib/mockData";
import {
  formatDateTime,
  generateId,
  getRoleBadgeColor,
  getRoleDisplayName,
} from "@/lib/utils";
import type { Attendance, User } from "@/types";
import {
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Pencil,
  Plus,
  QrCode,
  Search,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";

// ─── Skill data ──────────────────────────────────────────────────────────────
const WORKER_SKILLS: Record<string, string[]> = {
  u1: ["Governance", "Policy", "Finance"],
  u2: ["Project Mgmt", "Scheduling", "Risk Analysis"],
  u3: ["Structural", "AutoCAD", "Quality Control"],
  u4: ["Masonry", "Plumbing", "Project Mgmt"],
  u5: ["Masonry", "Welding", "Carpentry"],
  u6: ["Compliance", "Audit", "Documentation"],
};

const WORKER_PROJECTS: Record<string, string> = {
  u1: "All Projects",
  u2: "NH-48 Highway Expansion",
  u3: "NH-48 Highway Expansion",
  u4: "Government School Complex",
  u5: "NH-48 Highway Expansion",
  u6: "Water Treatment Plant",
};

const SKILL_COLORS = [
  "bg-primary/20 text-primary border border-primary/30",
  "bg-accent/20 text-accent border border-accent/30",
  "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  "bg-rose-500/20 text-rose-400 border border-rose-500/30",
  "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  "bg-sky-500/20 text-sky-400 border border-sky-500/30",
];

const WORKER_STATUS: Record<string, "active" | "onLeave"> = {
  u1: "active",
  u2: "active",
  u3: "active",
  u4: "onLeave",
  u5: "active",
  u6: "active",
};

type AttendanceMethod = "QR" | "GPS" | "Manual";

interface AttendanceRecord extends Attendance {
  method: AttendanceMethod;
}

const ATTENDANCE_DATA: AttendanceRecord[] = ATTENDANCE.map((a, i) => ({
  ...a,
  method: (["QR", "GPS", "Manual"] as AttendanceMethod[])[i % 3],
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(id: string) {
  const colors = [
    "from-violet-500 to-indigo-500",
    "from-teal-500 to-emerald-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-sky-500 to-blue-500",
    "from-purple-500 to-violet-500",
  ];
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function calcDuration(checkIn?: number, checkOut?: number): string {
  if (!checkIn || !checkOut) return "—";
  const diff = checkOut - checkIn;
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}

function formatTime(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-foreground font-bold text-xl leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Worker Card ──────────────────────────────────────────────────────────────
function WorkerCard({ user }: { user: User }) {
  const skills = WORKER_SKILLS[user.id] ?? [];
  const projectName = WORKER_PROJECTS[user.id] ?? "Unassigned";
  const status = WORKER_STATUS[user.id] ?? "active";
  const roleColorClass = getRoleBadgeColor(user.role);

  return (
    <div
      className="glass rounded-xl p-4 flex flex-col gap-3 hover:bg-card/60 transition-smooth"
      data-ocid={`worker-card-${user.id}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(user.id)} flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-lg`}
        >
          {getInitials(user.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{user.name}</p>
          <span
            className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium mt-0.5 ${roleColorClass}`}
          >
            {getRoleDisplayName(user.role)}
          </span>
        </div>
        <StatusBadge
          label={status === "active" ? "Active" : "On Leave"}
          colorClasses={
            status === "active"
              ? {
                  bg: "bg-emerald-500/15",
                  text: "text-emerald-400",
                  border: "border-emerald-500/30",
                  dot: "bg-emerald-400",
                }
              : {
                  bg: "bg-amber-500/15",
                  text: "text-amber-400",
                  border: "border-amber-500/30",
                  dot: "bg-amber-400",
                }
          }
          size="sm"
        />
      </div>

      <p className="text-muted-foreground text-xs truncate">{user.email}</p>

      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill, i) => (
          <span
            key={skill}
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${SKILL_COLORS[i % SKILL_COLORS.length]}`}
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
        <span className="truncate">{projectName}</span>
      </div>
    </div>
  );
}

// ─── Method Badge ─────────────────────────────────────────────────────────────
function MethodBadge({ method }: { method: AttendanceMethod }) {
  const config: Record<
    AttendanceMethod,
    { icon: React.ElementType; label: string; classes: string }
  > = {
    QR: {
      icon: QrCode,
      label: "QR",
      classes: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    },
    GPS: {
      icon: Navigation,
      label: "GPS",
      classes: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    },
    Manual: {
      icon: Pencil,
      label: "Manual",
      classes: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
  };
  const { icon: Icon, label, classes } = config[method];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${classes}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];

// ─── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      {SKELETON_COLS.map((col) => (
        <td key={col} className="px-4 py-3">
          <div className="h-4 skeleton rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkforcePage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"workers" | "attendance">(
    "workers",
  );
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [isLoading] = useState(false);

  // Modal states
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);

  // Add worker form
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerRole, setNewWorkerRole] = useState("worker");
  const [newWorkerEmail, setNewWorkerEmail] = useState("");
  const [newWorkerSkills, setNewWorkerSkills] = useState<string[]>([]);
  const [newWorkerProject, setNewWorkerProject] = useState("p1");
  const [skillInput, setSkillInput] = useState("");

  // Mark attendance form
  const [attendanceWorker, setAttendanceWorker] = useState("u5");
  const [attendanceProject, setAttendanceProject] = useState("p1");
  const [attendanceMethod, setAttendanceMethod] =
    useState<AttendanceMethod>("QR");
  const [attendanceCoords, setAttendanceCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locStatus, setLocStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [localAttendance, setLocalAttendance] =
    useState<AttendanceRecord[]>(ATTENDANCE_DATA);

  const canManage =
    currentUser?.role === "governmentAuthority" ||
    currentUser?.role === "projectManager";

  // Filter workers
  const filteredWorkers = DEMO_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  // Filter attendance
  const filteredAttendance = localAttendance.filter(
    (a) => projectFilter === "all" || a.projectId === projectFilter,
  );

  // Attendance stats
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = localAttendance.filter((a) => a.date === today);
  const presentToday = todayRecords.filter(
    (a) => a.status === "present",
  ).length;
  const absentToday = todayRecords.filter((a) => a.status === "absent").length;
  const lateArrivals = todayRecords.filter((a) => {
    if (!a.checkIn) return false;
    const hour = new Date(a.checkIn).getHours();
    return hour >= 10;
  }).length;
  const avgHours =
    todayRecords.length > 0
      ? (
          todayRecords.reduce((sum, a) => {
            if (!a.checkIn || !a.checkOut) return sum;
            return sum + (a.checkOut - a.checkIn) / 3600000;
          }, 0) / todayRecords.length
        ).toFixed(1)
      : "0.0";

  const captureLocation = useCallback(() => {
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAttendanceCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocStatus("success");
      },
      () => setLocStatus("error"),
      { timeout: 8000 },
    );
  }, []);

  function handleMarkAttendance(type: "checkIn" | "checkOut") {
    const now = Date.now();
    const dateStr = new Date().toISOString().split("T")[0];
    const existing = localAttendance.find(
      (a) =>
        a.workerId === attendanceWorker &&
        a.projectId === attendanceProject &&
        a.date === dateStr,
    );
    if (existing && type === "checkOut") {
      setLocalAttendance((prev) =>
        prev.map((a) => (a.id === existing.id ? { ...a, checkOut: now } : a)),
      );
    } else if (!existing && type === "checkIn") {
      const record: AttendanceRecord = {
        id: generateId(),
        workerId: attendanceWorker,
        projectId: attendanceProject,
        checkIn: now,
        date: dateStr,
        status: "present",
        location: attendanceCoords ?? undefined,
        method: attendanceMethod,
      };
      setLocalAttendance((prev) => [record, ...prev]);
    }
    setMarkAttendanceOpen(false);
  }

  function addSkillTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const tag = skillInput.trim();
      if (!newWorkerSkills.includes(tag))
        setNewWorkerSkills((prev) => [...prev, tag]);
      setSkillInput("");
    }
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-5">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Workforce Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track workers, attendance, and skills across all projects
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 glass-sm rounded-xl p-1 w-fit"
          data-ocid="workforce-tabs"
        >
          {(["workers", "attendance"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth capitalize ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/60"
              }`}
              data-ocid={`tab-${tab}`}
            >
              {tab === "workers" ? (
                <Users className="w-4 h-4" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              {tab === "workers" ? "Workers" : "Attendance"}
            </button>
          ))}
        </div>

        {/* ── WORKERS TAB ── */}
        {activeTab === "workers" && (
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Workforce
                </h2>
                <span className="glass-sm text-xs px-2 py-0.5 rounded-full text-muted-foreground font-medium">
                  {filteredWorkers.length} members
                </span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search workers..."
                    className="w-full pl-9 pr-3 py-2 text-sm glass rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    data-ocid="worker-search"
                  />
                </div>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => setAddWorkerOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth flex-shrink-0"
                    data-ocid="add-worker-btn"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Worker</span>
                  </button>
                )}
              </div>
            </div>

            {/* Worker grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkers.map((user) => (
                <WorkerCard key={user.id} user={user} />
              ))}
              {filteredWorkers.length === 0 && (
                <div
                  className="col-span-full glass rounded-xl p-12 flex flex-col items-center gap-3 text-center"
                  data-ocid="workers-empty"
                >
                  <Users className="w-10 h-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-sm">
                    No workers match your search
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ATTENDANCE TAB ── */}
        {activeTab === "attendance" && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={UserCheck}
                label="Present Today"
                value={presentToday}
                color="bg-emerald-500/20 text-emerald-400"
              />
              <StatCard
                icon={UserX}
                label="Absent"
                value={absentToday}
                color="bg-rose-500/20 text-rose-400"
              />
              <StatCard
                icon={AlertCircle}
                label="Late Arrivals"
                value={lateArrivals}
                color="bg-amber-500/20 text-amber-400"
              />
              <StatCard
                icon={Clock}
                label="Avg Hours"
                value={`${avgHours}h`}
                color="bg-primary/20 text-primary"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="glass rounded-lg px-3 py-2 text-sm text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                data-ocid="project-filter"
              >
                <option value="all" className="bg-card text-foreground">
                  All Projects
                </option>
                {PROJECTS.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    className="bg-card text-foreground"
                  >
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setAttendanceCoords(null);
                  setLocStatus("idle");
                  setMarkAttendanceOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-smooth"
                data-ocid="mark-attendance-btn"
              >
                <UserCheck className="w-4 h-4" />
                Mark Attendance
              </button>
            </div>

            {/* Attendance table */}
            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-card/50">
                      {[
                        "Worker",
                        "Date",
                        "Check In",
                        "Check Out",
                        "Duration",
                        "Location",
                        "Method",
                        "Status",
                      ].map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading
                      ? SKELETON_COLS.slice(0, 5).map((col) => (
                          <SkeletonRow key={col} />
                        ))
                      : filteredAttendance.map((record) => {
                          const worker = DEMO_USERS.find(
                            (u) => u.id === record.workerId,
                          );
                          const project = PROJECTS.find(
                            (p) => p.id === record.projectId,
                          );
                          const statusConfig = {
                            present: {
                              bg: "bg-emerald-500/15",
                              text: "text-emerald-400",
                              border: "border-emerald-500/30",
                              dot: "bg-emerald-400",
                            },
                            absent: {
                              bg: "bg-rose-500/15",
                              text: "text-rose-400",
                              border: "border-rose-500/30",
                              dot: "bg-rose-400",
                            },
                            halfDay: {
                              bg: "bg-amber-500/15",
                              text: "text-amber-400",
                              border: "border-amber-500/30",
                              dot: "bg-amber-400",
                            },
                            leave: {
                              bg: "bg-sky-500/15",
                              text: "text-sky-400",
                              border: "border-sky-500/30",
                              dot: "bg-sky-400",
                            },
                          };
                          const statusLabel: Record<string, string> = {
                            present: "Present",
                            absent: "Absent",
                            halfDay: "Half Day",
                            leave: "On Leave",
                          };

                          return (
                            <tr
                              key={record.id}
                              className="border-b border-border/30 hover:bg-card/40 transition-colors"
                              data-ocid={`attendance-row-${record.id}`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(record.workerId)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                                  >
                                    {worker ? getInitials(worker.name) : "?"}
                                  </div>
                                  <span className="font-medium text-foreground whitespace-nowrap">
                                    {worker?.name ?? "Unknown"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                {record.date}
                              </td>
                              <td className="px-4 py-3 text-foreground whitespace-nowrap">
                                {formatTime(record.checkIn)}
                              </td>
                              <td className="px-4 py-3 text-foreground whitespace-nowrap">
                                {formatTime(record.checkOut)}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                {calcDuration(record.checkIn, record.checkOut)}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground text-xs max-w-[120px]">
                                {record.location ? (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                                    {record.location.lat.toFixed(3)},{" "}
                                    {record.location.lng.toFixed(3)}
                                  </span>
                                ) : (
                                  (project?.location ?? "—")
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <MethodBadge method={record.method} />
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge
                                  label={
                                    statusLabel[record.status] ?? record.status
                                  }
                                  colorClasses={
                                    statusConfig[record.status] ??
                                    statusConfig.present
                                  }
                                  size="sm"
                                />
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
                {!isLoading && filteredAttendance.length === 0 && (
                  <div
                    className="py-16 flex flex-col items-center gap-3 text-center"
                    data-ocid="attendance-empty"
                  >
                    <Calendar className="w-10 h-10 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-sm">
                      No attendance records for this project
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ADD WORKER MODAL ── */}
        <Modal
          open={addWorkerOpen}
          onClose={() => setAddWorkerOpen(false)}
          title="Add New Worker"
        >
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setAddWorkerOpen(false);
            }}
          >
            <div className="space-y-1.5">
              <label
                htmlFor="new-worker-name"
                className="text-sm text-muted-foreground font-medium"
              >
                Full Name
              </label>
              <input
                id="new-worker-name"
                value={newWorkerName}
                onChange={(e) => setNewWorkerName(e.target.value)}
                placeholder="Enter worker name"
                required
                className="w-full px-3 py-2 glass rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-ocid="new-worker-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="new-worker-role"
                  className="text-sm text-muted-foreground font-medium"
                >
                  Role
                </label>
                <select
                  id="new-worker-role"
                  value={newWorkerRole}
                  onChange={(e) => setNewWorkerRole(e.target.value)}
                  className="w-full px-3 py-2 glass rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  data-ocid="new-worker-role"
                >
                  <option value="worker" className="bg-card">
                    Worker
                  </option>
                  <option value="siteEngineer" className="bg-card">
                    Site Engineer
                  </option>
                  <option value="contractor" className="bg-card">
                    Contractor
                  </option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="new-worker-project"
                  className="text-sm text-muted-foreground font-medium"
                >
                  Project
                </label>
                <select
                  id="new-worker-project"
                  value={newWorkerProject}
                  onChange={(e) => setNewWorkerProject(e.target.value)}
                  className="w-full px-3 py-2 glass rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  data-ocid="new-worker-project"
                >
                  {PROJECTS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-card">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="new-worker-email"
                className="text-sm text-muted-foreground font-medium"
              >
                Email
              </label>
              <input
                id="new-worker-email"
                type="email"
                value={newWorkerEmail}
                onChange={(e) => setNewWorkerEmail(e.target.value)}
                placeholder="worker@example.com"
                className="w-full px-3 py-2 glass rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-ocid="new-worker-email"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="new-worker-skills-input"
                className="text-sm text-muted-foreground font-medium"
              >
                Skills{" "}
                <span className="text-muted-foreground/60">
                  (press Enter to add)
                </span>
              </label>
              <input
                id="new-worker-skills-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkillTag}
                placeholder="e.g. Masonry, Welding..."
                className="w-full px-3 py-2 glass rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-ocid="new-worker-skills-input"
              />
              {newWorkerSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {newWorkerSkills.map((s, i) => (
                    <span
                      key={s}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${SKILL_COLORS[i % SKILL_COLORS.length]}`}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() =>
                          setNewWorkerSkills((prev) =>
                            prev.filter((x) => x !== s),
                          )
                        }
                        className="opacity-60 hover:opacity-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAddWorkerOpen(false)}
                className="flex-1 px-4 py-2 glass rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth"
                data-ocid="add-worker-submit"
              >
                Add Worker
              </button>
            </div>
          </form>
        </Modal>

        {/* ── MARK ATTENDANCE MODAL ── */}
        <Modal
          open={markAttendanceOpen}
          onClose={() => setMarkAttendanceOpen(false)}
          title="Mark Attendance"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="attendance-worker-select"
                  className="text-sm text-muted-foreground font-medium"
                >
                  Worker
                </label>
                <select
                  id="attendance-worker-select"
                  value={attendanceWorker}
                  onChange={(e) => setAttendanceWorker(e.target.value)}
                  className="w-full px-3 py-2 glass rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  data-ocid="attendance-worker-select"
                >
                  {DEMO_USERS.map((u) => (
                    <option key={u.id} value={u.id} className="bg-card">
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="attendance-project-select"
                  className="text-sm text-muted-foreground font-medium"
                >
                  Project
                </label>
                <select
                  id="attendance-project-select"
                  value={attendanceProject}
                  onChange={(e) => setAttendanceProject(e.target.value)}
                  className="w-full px-3 py-2 glass rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  data-ocid="attendance-project-select"
                >
                  {PROJECTS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-card">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground font-medium">
                Method
              </p>
              <div
                className="flex gap-2"
                data-ocid="attendance-method"
                aria-label="Attendance method"
              >
                {(["QR", "GPS", "Manual"] as AttendanceMethod[]).map((m) => {
                  const icons: Record<AttendanceMethod, React.ElementType> = {
                    QR: QrCode,
                    GPS: Navigation,
                    Manual: Pencil,
                  };
                  const Icon = icons[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAttendanceMethod(m)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-smooth border ${
                        attendanceMethod === m
                          ? "bg-primary text-primary-foreground border-primary"
                          : "glass border-border/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground font-medium">
                Location
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={captureLocation}
                  disabled={locStatus === "loading"}
                  className="flex items-center gap-2 px-3 py-2 glass rounded-lg text-sm text-muted-foreground hover:text-foreground transition-smooth flex-shrink-0 disabled:opacity-50"
                  data-ocid="capture-location-btn"
                >
                  <MapPin className="w-4 h-4 text-accent" />
                  {locStatus === "loading" ? "Capturing..." : "Capture GPS"}
                </button>
                {locStatus === "success" && attendanceCoords && (
                  <div className="flex-1 glass rounded-lg px-3 py-2 text-xs text-accent font-mono flex items-center gap-1">
                    <Navigation className="w-3 h-3 flex-shrink-0" />
                    {attendanceCoords.lat.toFixed(4)},{" "}
                    {attendanceCoords.lng.toFixed(4)}
                  </div>
                )}
                {locStatus === "error" && (
                  <div className="flex-1 glass rounded-lg px-3 py-2 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    Location unavailable
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground font-medium">
                Timestamp
              </p>
              <div className="glass rounded-lg px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {formatDateTime(Date.now())}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleMarkAttendance("checkIn")}
                className="py-2.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-smooth flex items-center justify-center gap-1.5"
                data-ocid="check-in-btn"
              >
                <UserCheck className="w-4 h-4" />
                Check In
              </button>
              <button
                type="button"
                onClick={() => handleMarkAttendance("checkOut")}
                className="py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-sm font-semibold transition-smooth flex items-center justify-center gap-1.5"
                data-ocid="check-out-btn"
              >
                <UserX className="w-4 h-4" />
                Check Out
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
