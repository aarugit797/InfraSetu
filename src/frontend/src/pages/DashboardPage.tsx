import { Layout } from "@/components/Layout";
import { SkeletonCard, SkeletonStatCard } from "@/components/ui/SkeletonCard";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import {
  APPROVALS,
  AUDIT_LOGS,
  DASHBOARD_STATS,
  PROJECTS,
  TASKS,
} from "@/lib/mockData";
import {
  cn,
  formatCurrency,
  formatDate,
  getRoleDisplayName,
  getStatusColor,
} from "@/lib/utils";
import type { Project, UserRole } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FolderKanban,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

// ── Helpers ────────────────────────────────────────────────────
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function progressColor(pct: number): string {
  if (pct < 50) return "bg-red-400";
  if (pct < 80) return "bg-amber-500";
  return "bg-emerald-500";
}

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: "bg-amber-100", text: "text-amber-700" },
  APPROVE: { bg: "bg-emerald-100", text: "text-emerald-700" },
  REJECT: { bg: "bg-red-100", text: "text-red-700" },
  REPORT: { bg: "bg-orange-100", text: "text-orange-700" },
  UPDATE: { bg: "bg-blue-100", text: "text-blue-700" },
  SUBMIT: { bg: "bg-amber-100", text: "text-amber-700" },
  VERIFY: { bg: "bg-emerald-100", text: "text-emerald-700" },
  ESCALATE: { bg: "bg-red-100", text: "text-red-700" },
  ASSIGN: { bg: "bg-teal-100", text: "text-teal-700" },
  CHECKIN: { bg: "bg-emerald-100", text: "text-emerald-700" },
  UPLOAD: { bg: "bg-violet-100", text: "text-violet-700" },
  VIEW: { bg: "bg-slate-100", text: "text-slate-600" },
  REVIEW: { bg: "bg-blue-100", text: "text-blue-700" },
};

function getActionColors(action: string) {
  return (
    ACTION_COLORS[action] ?? { bg: "bg-slate-100", text: "text-slate-600" }
  );
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: "Active",
    planning: "Planning",
    onHold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}

// ── Project card ───────────────────────────────────────────────
function ProjectProgressCard({ project }: { project: Project }) {
  const sc = getStatusColor(project.status);
  const utilization = Math.round((project.actualCost / project.budget) * 100);
  return (
    <Link
      to="/projects/$id"
      params={{ id: project.id }}
      className="bg-white rounded-2xl p-4 block border border-slate-200 hover:border-amber-300 hover:shadow-md transition-smooth group card-hover"
      data-ocid={`project-card-${project.id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="font-display font-semibold text-sm text-slate-800 truncate group-hover:text-amber-700 transition-colors">
            {project.name}
          </p>
          <p className="text-slate-400 text-xs mt-0.5 truncate">
            {project.location}
          </p>
        </div>
        <StatusBadge
          label={statusLabel(project.status)}
          colorClasses={sc}
          size="sm"
        />
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs font-semibold text-slate-700">
            {project.progress}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              progressColor(project.progress),
            )}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>
          Budget:{" "}
          <span className="text-slate-700 font-medium">
            {formatCurrency(project.budget)}
          </span>
        </span>
        <span
          className={cn(
            "font-medium",
            utilization > 90 ? "text-red-500" : "text-emerald-600",
          )}
        >
          {utilization}% used
        </span>
      </div>
    </Link>
  );
}

// ── Role widget ────────────────────────────────────────────────
function RoleWidget({
  role,
  currentUserId,
}: { role: UserRole; currentUserId: string }) {
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = AUDIT_LOGS.filter(
    (l) => new Date(l.timestamp).toISOString().split("T")[0] === today,
  );

  const overdueTasks = TASKS.filter(
    (t) =>
      t.status !== "completed" &&
      t.status !== "cancelled" &&
      new Date(t.dueDate) < new Date(),
  );

  const myTasks = TASKS.filter(
    (t) => t.assignedTo === currentUserId && t.status !== "completed",
  );

  if (role === "governmentAuthority") {
    const pending = APPROVALS.filter(
      (a) => a.status === "pending" || a.status === "escalated",
    );
    return (
      <div
        className="bg-white rounded-2xl p-4 border border-slate-200"
        data-ocid="role-widget-approvals"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-amber-600" />
            </div>
            <span className="font-display font-semibold text-sm text-slate-800">
              Pending Approvals
            </span>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-semibold">
            {pending.length}
          </span>
        </div>
        <div className="space-y-2">
          {pending.map((ap) => {
            const overSLA = ap.slaDeadline < Date.now();
            return (
              <div
                key={ap.id}
                className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {ap.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ap.amount ? formatCurrency(ap.amount) : ""}
                    {" · SLA "}
                    {overSLA ? (
                      <span className="text-red-500">Overdue</span>
                    ) : (
                      formatDate(ap.slaDeadline)
                    )}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-xs rounded-full px-1.5 py-0.5 font-medium flex-shrink-0",
                    ap.status === "escalated"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700",
                  )}
                >
                  {ap.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (role === "projectManager") {
    return (
      <div
        className="bg-white rounded-2xl p-4 border border-slate-200"
        data-ocid="role-widget-overdue"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <span className="font-display font-semibold text-sm text-slate-800">
              Overdue Tasks
            </span>
          </div>
          <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5 font-semibold">
            {overdueTasks.length}
          </span>
        </div>
        {overdueTasks.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-4">
            No overdue tasks!
          </p>
        ) : (
          <div className="space-y-2">
            {overdueTasks.slice(0, 4).map((t) => {
              const pc = getStatusColor(t.priority);
              return (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {t.title}
                    </p>
                    <p className="text-xs text-red-500 mt-0.5">
                      Due {t.dueDate}
                    </p>
                  </div>
                  <StatusBadge label={t.priority} colorClasses={pc} size="sm" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (role === "worker") {
    return (
      <div
        className="bg-white rounded-2xl p-4 border border-slate-200"
        data-ocid="role-widget-my-tasks"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <span className="font-display font-semibold text-sm text-slate-800">
              My Tasks
            </span>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-semibold">
            {myTasks.length}
          </span>
        </div>
        {myTasks.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-4">
            No assigned tasks.
          </p>
        ) : (
          <div className="space-y-2">
            {myTasks.map((t) => {
              const sc = getStatusColor(t.status);
              return (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {t.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Due {t.dueDate}
                    </p>
                  </div>
                  <StatusBadge label={t.status} colorClasses={sc} size="sm" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (role === "auditor") {
    return (
      <div
        className="bg-white rounded-2xl p-4 border border-slate-200"
        data-ocid="role-widget-audit-summary"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <span className="font-display font-semibold text-sm text-slate-800">
            Audit Summary (Today)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
            <p className="text-2xl font-display font-bold text-amber-600">
              {todayLogs.length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Actions Logged</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-2xl font-display font-bold text-slate-700">
              {new Set(todayLogs.map((l) => l.userId)).size}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Active Users</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {todayLogs.slice(0, 3).map((l) => {
            const ac = getActionColors(l.action);
            return (
              <div key={l.id} className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono font-medium text-[10px]",
                    ac.bg,
                    ac.text,
                  )}
                >
                  {l.action}
                </span>
                <span className="text-slate-700 truncate flex-1">
                  {l.entity}
                </span>
                <span className="text-slate-400 flex-shrink-0">
                  {timeAgo(l.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

// ── Dashboard page ─────────────────────────────────────────────
export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0);
  const totalSpent = PROJECTS.reduce((s, p) => s + p.actualCost, 0);
  const utilization = Math.round((totalSpent / totalBudget) * 100);
  const remaining = totalBudget - totalSpent;

  const recentLogs = [...AUDIT_LOGS]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);
  const roleColor = getStatusColor(currentUser?.role ?? "worker");

  return (
    <Layout>
      <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-800 leading-tight">
              Welcome back,{" "}
              <span className="text-amber-600">
                {currentUser?.name?.split(" ")[0]}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">{dateStr}</span>
            </div>
          </div>
          <StatusBadge
            label={getRoleDisplayName(currentUser?.role ?? "worker")}
            colorClasses={roleColor}
          />
        </div>

        {/* Stat cards */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          data-ocid="stats-row"
        >
          {loading ? (
            ["sk-1", "sk-2", "sk-3", "sk-4"].map((k) => (
              <SkeletonStatCard key={k} />
            ))
          ) : (
            <>
              <StatCard
                label="Total Projects"
                value={DASHBOARD_STATS.totalProjects}
                icon={FolderKanban}
                iconColor="text-amber-600"
                iconBg="bg-amber-100"
                subtitle="All government projects"
                trend={{ value: 12 }}
                data-ocid="stat-total-projects"
              />
              <StatCard
                label="Active Projects"
                value={DASHBOARD_STATS.activeProjects}
                icon={Zap}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
                subtitle="Currently in progress"
                trend={{ value: 0 }}
                data-ocid="stat-active-projects"
              />
              <StatCard
                label="Workers on Site"
                value={DASHBOARD_STATS.workersOnSite.toLocaleString("en-IN")}
                icon={Users}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-100"
                subtitle="Across all active sites"
                trend={{ value: 5 }}
                data-ocid="stat-workers"
              />
              <StatCard
                label="Pending Approvals"
                value={DASHBOARD_STATS.pendingApprovals}
                icon={ClipboardCheck}
                iconColor="text-orange-600"
                iconBg="bg-orange-100"
                subtitle="Awaiting authorization"
                trend={{ value: -2 }}
                data-ocid="stat-approvals"
              />
            </>
          )}
        </div>

        {/* Budget overview */}
        {loading ? (
          <SkeletonCard rows={3} />
        ) : (
          <div
            className="bg-white rounded-2xl p-4 border border-slate-200"
            data-ocid="budget-overview"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-display font-semibold text-sm text-slate-800">
                Budget Overview
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                {
                  label: "Total Budget",
                  value: formatCurrency(totalBudget),
                  color: "text-slate-800",
                  bg: "bg-slate-50 border-slate-100",
                },
                {
                  label: "Total Spent",
                  value: formatCurrency(totalSpent),
                  color: "text-amber-700",
                  bg: "bg-amber-50 border-amber-100",
                },
                {
                  label: "Utilization",
                  value: `${utilization}%`,
                  color: utilization > 85 ? "text-red-600" : "text-teal-600",
                  bg:
                    utilization > 85
                      ? "bg-red-50 border-red-100"
                      : "bg-teal-50 border-teal-100",
                },
                {
                  label: "Remaining",
                  value: formatCurrency(remaining),
                  color: "text-emerald-700",
                  bg: "bg-emerald-50 border-emerald-100",
                },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={cn("p-3 rounded-xl border", bg)}>
                  <p className={cn("text-lg font-display font-bold", color)}>
                    {value}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Budget Utilization</span>
                <span className="font-medium text-slate-700">
                  {utilization}%
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    utilization > 85
                      ? "bg-red-500"
                      : utilization > 60
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  )}
                  style={{ width: `${utilization}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>₹0</span>
                <span>{formatCurrency(totalBudget)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Project progress */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <h2 className="font-display font-semibold text-sm text-slate-800">
                  Project Progress
                </h2>
              </div>
              <Link
                to="/projects"
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors font-medium"
                data-ocid="view-all-projects"
              >
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                <SkeletonCard rows={3} />
                <SkeletonCard rows={3} />
              </div>
            ) : (
              <div className="space-y-3" data-ocid="projects-grid">
                {PROJECTS.map((p) => (
                  <ProjectProgressCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            {currentUser && (
              <RoleWidget
                role={currentUser.role}
                currentUserId={currentUser.id}
              />
            )}

            {/* Recent activity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <h2 className="font-display font-semibold text-sm text-slate-800">
                    Recent Activity
                  </h2>
                </div>
                <Link
                  to="/audit"
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors font-medium"
                  data-ocid="view-audit"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {loading ? (
                <SkeletonCard rows={5} showAvatar />
              ) : (
                <div
                  className="bg-white rounded-2xl divide-y divide-slate-100 border border-slate-200"
                  data-ocid="activity-feed"
                >
                  {recentLogs.map((log) => {
                    const ac = getActionColors(log.action);
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 hover:bg-amber-50/50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            ac.bg,
                          )}
                        >
                          <span
                            className={cn(
                              "text-[10px] font-mono font-bold leading-none",
                              ac.text,
                            )}
                          >
                            {log.action.slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-700 line-clamp-2">
                            {log.details}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-slate-400">
                              {log.userName}
                            </span>
                            <span className="text-slate-300">·</span>
                            <div className="flex items-center gap-0.5 text-slate-400">
                              <Clock className="w-2.5 h-2.5" />
                              <span className="text-xs">
                                {timeAgo(log.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
