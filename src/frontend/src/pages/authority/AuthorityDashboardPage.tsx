import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  useApprovals,
  useComplianceStats,
  useDashboardStats,
  useProjects,
} from "@/hooks/useBackend";
import { PUBLIC_COMPLAINTS, SITES } from "@/lib/mockData";
import type { Approval, Project } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const BUDGET_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const BUDGET_DATA = [
  { budgeted: 8.2, actual: 6.1 },
  { budgeted: 9.0, actual: 7.8 },
  { budgeted: 10.5, actual: 9.2 },
  { budgeted: 11.0, actual: 10.4 },
  { budgeted: 9.8, actual: 9.0 },
  { budgeted: 12.0, actual: 10.5 },
];
const MAX_VAL = 14;

function BudgetChart() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-amber-400 inline-block" />
          Budgeted (₹Cr)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-blue-400 inline-block" />
          Actual (₹Cr)
        </span>
      </div>
      <div className="flex items-end gap-2 h-36">
        {BUDGET_MONTHS.map((m, i) => {
          const b = BUDGET_DATA[i] ?? { budgeted: 0, actual: 0 };
          const bH = (b.budgeted / MAX_VAL) * 100;
          const aH = (b.actual / MAX_VAL) * 100;
          return (
            <div key={m} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full flex items-end gap-0.5"
                style={{ height: "112px" }}
              >
                <div
                  className="flex-1 rounded-t-sm bg-amber-300 border border-amber-400 transition-all"
                  style={{ height: `${bH}%` }}
                />
                <div
                  className="flex-1 rounded-t-sm bg-blue-400 border border-blue-500 transition-all"
                  style={{ height: `${aH}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">{m}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlaTag({ slaDeadline }: { slaDeadline: number }) {
  const now = Date.now();
  const diffDays = Math.ceil((slaDeadline - now) / 86400000);
  if (diffDays < 0)
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
        Overdue
      </Badge>
    );
  if (diffDays <= 3)
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
        {diffDays}d left
      </Badge>
    );
  if (diffDays <= 7)
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
        {diffDays}d left
      </Badge>
    );
  return (
    <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
      {diffDays}d left
    </Badge>
  );
}

function ApprovalRow({ approval }: { approval: Approval }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  function handleAction(action: "approve" | "reject") {
    setLoading(action);
    setTimeout(() => {
      setLoading(null);
      if (action === "approve") {
        toast.success(`Approved: ${approval.title}`);
      } else {
        toast.error(`Rejected: ${approval.title}`);
      }
    }, 700);
  }

  return (
    <div
      className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3"
      data-ocid={`authority.approval.item.${approval.id}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {approval.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500 capitalize">
            {approval.type}
          </span>
          {approval.amount && (
            <span className="text-xs text-amber-600 font-medium">
              ₹{(approval.amount / 100000).toFixed(1)}L
            </span>
          )}
          <SlaTag slaDeadline={approval.slaDeadline} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button
          size="sm"
          className="h-7 px-2.5 text-xs bg-green-500 hover:bg-green-600 text-white border-0"
          onClick={() => handleAction("approve")}
          disabled={!!loading}
          data-ocid={`authority.approval.approve_button.${approval.id}`}
        >
          {loading === "approve" ? (
            <Clock className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3 h-3" />
          )}
        </Button>
        <Button
          size="sm"
          className="h-7 px-2.5 text-xs bg-red-500 hover:bg-red-600 text-white border-0"
          onClick={() => handleAction("reject")}
          disabled={!!loading}
          data-ocid={`authority.approval.reject_button.${approval.id}`}
        >
          {loading === "reject" ? (
            <Clock className="w-3 h-3 animate-spin" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

function ProjectStatusCard({ project }: { project: Project }) {
  const pct = project.progress;
  const statusColor =
    project.status === "active"
      ? "bg-green-100 text-green-700 border-green-200"
      : project.status === "planning"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <Link
      to="/projects/$id"
      params={{ id: project.id }}
      className="block group"
    >
      <div
        className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 space-y-2 group-hover:border-amber-300 transition-colors"
        data-ocid={`authority.project.card.${project.id}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-800 leading-snug truncate group-hover:text-amber-700 transition-colors">
            {project.name}
          </p>
          <Badge
            className={`text-[10px] capitalize flex-shrink-0 ${statusColor}`}
          >
            {project.status}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span className="font-medium text-slate-700">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          ₹{(project.actualCost / 10000000).toFixed(1)}Cr / ₹
          {(project.budget / 10000000).toFixed(1)}Cr
        </p>
      </div>
    </Link>
  );
}

export default function AuthorityDashboardPage() {
  const { currentUser, selectedSiteId } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: approvals, isLoading: approvalsLoading } = useApprovals();
  const { data: compliance } = useComplianceStats();

  const activeSite = SITES.find((s) => s.id === selectedSiteId);
  const pendingApprovals = (approvals ?? []).filter(
    (a) => a.status === "pending" || a.status === "escalated",
  );

  const openComplaintsCount = PUBLIC_COMPLAINTS.filter(
    (c) => c.status === "open",
  ).length;

  const budgetPct = stats
    ? Math.round((stats.totalSpent / stats.totalBudget) * 100)
    : 0;

  const statCards = [
    {
      label: "Total Projects",
      value: stats?.totalProjects ?? "—",
      sub: `${stats?.activeProjects ?? 0} active`,
      icon: TrendingUp,
      color: "text-amber-600",
      iconBg: "bg-amber-100 text-amber-600",
      link: null,
    },
    {
      label: "Budget Utilized",
      value: stats ? `${budgetPct}%` : "—",
      sub: `₹${stats ? (stats.totalSpent / 10000000).toFixed(1) : 0}Cr spent`,
      icon: TrendingUp,
      color: "text-blue-600",
      iconBg: "bg-blue-100 text-blue-600",
      link: null,
    },
    {
      label: "Pending Approvals",
      value: pendingApprovals.length,
      sub: "awaiting action",
      icon: Clock,
      color: "text-orange-600",
      iconBg: "bg-orange-100 text-orange-600",
      link: "/authority/approvals",
    },
    {
      label: "Compliance Score",
      value: compliance ? `${compliance.complianceRate.toFixed(1)}%` : "—",
      sub: `${compliance?.passedTests ?? 0}/${compliance?.totalTests ?? 0} tests passed`,
      icon: CheckCircle2,
      color: "text-green-600",
      iconBg: "bg-green-100 text-green-600",
      link: null,
    },
    {
      label: "Public Complaints",
      value: openComplaintsCount,
      sub: "open complaints",
      icon: Flag,
      color: "text-red-600",
      iconBg: "bg-red-100 text-red-600",
      link: "/authority/public-complaints",
    },
  ];

  return (
    <div
      className="p-4 lg:p-6 space-y-6 bg-slate-50 min-h-screen"
      data-ocid="authority.dashboard.page"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold uppercase tracking-wider">
              Government Authority
            </Badge>
          </div>
          <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
            Authority Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Good morning, {currentUser?.name.split(" ")[0]}
          </p>
        </div>
        {activeSite && (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs flex-shrink-0">
            {activeSite.name}
          </Badge>
        )}
      </div>

      {/* Stat cards */}
      <div
        className="grid grid-cols-2 lg:grid-cols-5 gap-3"
        data-ocid="authority.stats.section"
      >
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={`stat-sk-${String(i)}`}
                className="h-24 rounded-xl"
              />
            ))
          : statCards.map((s) => (
              <div
                key={s.label}
                className={`bg-white border border-slate-200 shadow-sm rounded-xl p-4 ${s.link ? "cursor-pointer hover:border-amber-300 transition-colors" : ""}`}
                data-ocid="authority.stat.card"
                role={s.link ? "button" : undefined}
                tabIndex={s.link ? 0 : undefined}
                onClick={
                  s.link ? () => navigate({ to: s.link as string }) : undefined
                }
                onKeyDown={
                  s.link
                    ? (e) =>
                        e.key === "Enter" && navigate({ to: s.link as string })
                    : undefined
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.iconBg}`}
                  >
                    <s.icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
                {s.link && (
                  <p className="text-[10px] text-amber-600 mt-1 font-medium">
                    View all →
                  </p>
                )}
              </div>
            ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Budget vs Actual Chart */}
        <div
          className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3"
          data-ocid="authority.budget.chart"
        >
          <h2 className="font-semibold text-slate-800 text-sm">
            Budget vs Actual (₹Cr)
          </h2>
          <BudgetChart />
        </div>

        {/* Pending Approvals panel */}
        <div
          className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3"
          data-ocid="authority.approvals.panel"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Pending Approvals
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-7"
              onClick={() => navigate({ to: "/authority/approvals" })}
              data-ocid="authority.approvals.view_all_button"
            >
              View All
            </Button>
          </div>
          {approvalsLoading ? (
            <div className="space-y-2">
              {["sk-ap-1", "sk-ap-2", "sk-ap-3"].map((k) => (
                <Skeleton key={k} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div
              className="text-center py-6 text-slate-500 text-sm"
              data-ocid="authority.approvals.empty_state"
            >
              All approvals up to date
            </div>
          ) : (
            <div className="space-y-2">
              {pendingApprovals.slice(0, 5).map((a) => (
                <ApprovalRow key={a.id} approval={a} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Status Summary */}
      <div className="space-y-3" data-ocid="authority.projects.section">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">
            Project Status
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-7"
            onClick={() => navigate({ to: "/authority/projects" })}
            data-ocid="authority.projects.view_all_button"
          >
            View All
          </Button>
        </div>
        {projectsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["sk-proj-1", "sk-proj-2", "sk-proj-3"].map((k) => (
              <Skeleton key={k} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(projects ?? []).map((p) => (
              <ProjectStatusCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Weekly Reports */}
      <div className="space-y-3" data-ocid="authority.weekly_reports.section">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            Recent Weekly Reports
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-7"
            onClick={() => navigate({ to: "/authority/reports" })}
            data-ocid="authority.weekly_reports.view_all_button"
          >
            View All
          </Button>
        </div>
        <div className="space-y-2">
          {[
            {
              pm: "Priya Sharma",
              project: "NH-48 Highway Expansion",
              date: "12 Apr 2026",
              new: true,
            },
            {
              pm: "Priya Sharma",
              project: "Metro Bridge Project",
              date: "12 Apr 2026",
              new: false,
            },
            {
              pm: "Priya Sharma",
              project: "Government Office Complex",
              date: "12 Apr 2026",
              new: true,
            },
          ].map((r, i) => (
            <div
              key={`wr-${String(i)}`}
              className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3"
              data-ocid={`authority.weekly_report.item.${i + 1}`}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {r.project}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <User className="w-3 h-3" /> {r.pm}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" /> {r.date}
                  </span>
                </div>
              </div>
              {r.new && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs flex-shrink-0">
                  New
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-amber-600 hover:bg-amber-50 flex-shrink-0"
                onClick={() => navigate({ to: "/authority/reports" })}
                data-ocid={`authority.weekly_report.view_button.${i + 1}`}
              >
                View
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
