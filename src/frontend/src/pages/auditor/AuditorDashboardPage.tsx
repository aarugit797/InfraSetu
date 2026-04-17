import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  APPROVALS,
  AUDIT_LOGS,
  COMPLIANCE_STATS,
  EXPENSES,
  ISSUES,
  PROJECTS,
} from "@/lib/mockData";
import {
  cn,
  formatTimeAgo,
  getRoleBadgeColor,
  getRoleDisplayName,
  getStatusColor,
} from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  FileSearch,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

const COMPLIANCE_TREND = [
  { month: "Nov", score: 72 },
  { month: "Dec", score: 76 },
  { month: "Jan", score: 74 },
  { month: "Feb", score: 79 },
  { month: "Mar", score: 78 },
  { month: "Apr", score: 82 },
];

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-blue-100 text-blue-700 border-blue-300",
  UPDATE: "bg-amber-100 text-amber-700 border-amber-300",
  DELETE: "bg-red-100 text-red-700 border-red-300",
  APPROVE: "bg-green-100 text-green-700 border-green-300",
  REJECT: "bg-red-100 text-red-700 border-red-300",
  SUBMIT: "bg-violet-100 text-violet-700 border-violet-300",
  REPORT: "bg-orange-100 text-orange-700 border-orange-300",
  ESCALATE: "bg-rose-100 text-rose-700 border-rose-300",
  VERIFY: "bg-teal-100 text-teal-700 border-teal-300",
  REVIEW: "bg-cyan-100 text-cyan-700 border-cyan-300",
  ASSIGN: "bg-indigo-100 text-indigo-700 border-indigo-300",
  CHECKIN: "bg-green-100 text-green-700 border-green-300",
  UPLOAD: "bg-purple-100 text-purple-700 border-purple-300",
  VIEW: "bg-slate-100 text-slate-600 border-slate-300",
};

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm",
        href && "hover:border-amber-300 hover:shadow-md transition-smooth",
      )}
    >
      <div className={cn("rounded-xl p-2.5 flex-shrink-0", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium">{label}</p>
        <p className="text-slate-800 text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  if (href) return <Link to={href}>{inner}</Link>;
  return inner;
}

export default function AuditorDashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const auditEventsToday = AUDIT_LOGS.filter(
    (l) => l.timestamp >= todayStart.getTime(),
  ).length;

  const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0);
  const totalSpent = PROJECTS.reduce((s, p) => s + p.actualCost, 0);
  const variancePct = Math.round(
    ((totalSpent - totalBudget) / totalBudget) * 100,
  );

  const flaggedIssues = ISSUES.filter(
    (i) => i.priority === "critical" || i.priority === "high",
  );

  // Fraud risk: suspicious expenses that exceed 90% of project budget ratio
  const suspiciousExpenses = EXPENSES.filter((e) => {
    const proj = PROJECTS.find((p) => p.id === e.projectId);
    return proj && e.amount > proj.budget * 0.05;
  });
  const fraudRiskScore = Math.min(
    99,
    Math.round((suspiciousExpenses.length / EXPENSES.length) * 100),
  );

  const passPercent = Math.round(
    (COMPLIANCE_STATS.passedTests / COMPLIANCE_STATS.totalTests) * 100,
  );
  const failPercent = Math.round(
    (COMPLIANCE_STATS.failedTests / COMPLIANCE_STATS.totalTests) * 100,
  );
  const pendingPercent = Math.round(
    (COMPLIANCE_STATS.pendingTests / COMPLIANCE_STATS.totalTests) * 100,
  );

  const maxScore = Math.max(...COMPLIANCE_TREND.map((d) => d.score));
  const minScore = Math.min(...COMPLIANCE_TREND.map((d) => d.score));

  const recentLogs = AUDIT_LOGS.slice(0, 8);
  const pendingReviews = APPROVALS.filter((a) => a.status === "pending").length;

  if (loading) {
    return (
      <div
        className="bg-slate-50 min-h-screen p-4 space-y-4"
        data-ocid="auditor-dashboard.loading_state"
      >
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5"
      data-ocid="auditor-dashboard.page"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Audit Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Compliance overview &amp; audit summary
        </p>
      </div>

      {/* Summary Cards */}
      <div
        className="grid grid-cols-2 gap-3"
        data-ocid="auditor-dashboard.stats"
      >
        <StatCard
          label="Audit Events Today"
          value={auditEventsToday}
          icon={ClipboardList}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          sub="New log entries"
          href="/auditor/audit"
        />
        <StatCard
          label="Financial Variance"
          value={`${variancePct > 0 ? "+" : ""}${variancePct}%`}
          icon={BarChart3}
          iconBg={variancePct > 10 ? "bg-red-100" : "bg-green-100"}
          iconColor={variancePct > 10 ? "text-red-600" : "text-green-600"}
          sub="Budget vs actual"
          href="/auditor/financial"
        />
        <StatCard
          label="Fraud Risk Score"
          value={`${fraudRiskScore}%`}
          icon={AlertTriangle}
          iconBg={fraudRiskScore > 30 ? "bg-red-100" : "bg-amber-100"}
          iconColor={fraudRiskScore > 30 ? "text-red-600" : "text-amber-600"}
          sub={`${suspiciousExpenses.length} flagged`}
          href="/auditor/fraud"
        />
        <StatCard
          label="Compliance Rate"
          value={`${COMPLIANCE_STATS.complianceRate}%`}
          icon={ShieldCheck}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          sub="Tests passed"
          href="/auditor/projects"
        />
      </div>

      {/* Quick Links */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
        data-ocid="auditor-dashboard.quick-links"
      >
        <h2 className="font-semibold text-slate-800 text-sm">Quick Access</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: "Audit Logs",
              icon: ClipboardList,
              href: "/auditor/audit",
              color: "text-amber-600",
              bg: "bg-amber-50 border-amber-200",
            },
            {
              label: "Financial",
              icon: BarChart3,
              href: "/auditor/financial",
              color: "text-green-600",
              bg: "bg-green-50 border-green-200",
            },
            {
              label: "Fraud Detection",
              icon: AlertTriangle,
              href: "/auditor/fraud",
              color: "text-red-600",
              bg: "bg-red-50 border-red-200",
            },
            {
              label: "Approvals",
              icon: FileSearch,
              href: "/auditor/approvals",
              color: "text-purple-600",
              bg: "bg-purple-50 border-purple-200",
            },
          ].map(({ label, icon: Icon, href, color, bg }) => (
            <Link
              key={label}
              to={href}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border transition-smooth hover:shadow-sm",
                bg,
              )}
              data-ocid={`auditor-dashboard.quick-link.${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", color)} />
              <span className={cn("text-sm font-semibold", color)}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Compliance Score */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg
            viewBox="0 0 36 36"
            className="w-full h-full -rotate-90"
            aria-label="Compliance score"
          >
            <title>Compliance Score</title>
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="3.8"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.8"
              strokeDasharray={`${COMPLIANCE_STATS.complianceRate} ${100 - COMPLIANCE_STATS.complianceRate}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">
              {COMPLIANCE_STATS.complianceRate}%
            </span>
            <span className="text-[9px] text-slate-500 font-medium">SCORE</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm">Overall Compliance</p>
          <p className="text-xs text-slate-500 mt-1">
            {COMPLIANCE_STATS.passedTests} of {COMPLIANCE_STATS.totalTests}{" "}
            tests passed
          </p>
          <div className="flex gap-3 mt-3">
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{passPercent}%</p>
              <p className="text-[10px] text-slate-500">Pass</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">{failPercent}%</p>
              <p className="text-[10px] text-slate-500">Fail</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">
                {pendingPercent}%
              </p>
              <p className="text-[10px] text-slate-500">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Trend Chart */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
        data-ocid="auditor-dashboard.compliance-trend"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Compliance Trend (6 Months)
          </h2>
        </div>
        <div className="relative h-36">
          <div className="absolute inset-x-0 flex items-end justify-between h-full gap-1">
            {COMPLIANCE_TREND.map((d, i) => {
              const heightPct =
                ((d.score - minScore + 5) / (maxScore - minScore + 10)) * 100;
              const isLast = i === COMPLIANCE_TREND.length - 1;
              return (
                <div
                  key={d.month}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      isLast ? "text-amber-600" : "text-slate-400",
                    )}
                  >
                    {d.score}%
                  </span>
                  <div
                    className="w-full rounded-t-lg"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div
                      className={cn(
                        "h-full rounded-t-lg",
                        isLast ? "bg-amber-500" : "bg-amber-200",
                      )}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs text-slate-500">
            Compliance score improved by 10% YTD
          </span>
        </div>
      </div>

      {/* Recent Audit Events */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
        data-ocid="auditor-dashboard.recent-events"
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Recent Audit Events
          </h2>
          <Link
            to="/auditor/audit"
            className="ml-auto text-xs text-amber-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentLogs.map((log, idx) => {
            const actionClass =
              ACTION_COLORS[log.action] ??
              "bg-slate-100 text-slate-600 border-slate-300";
            return (
              <div
                key={log.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                data-ocid={`auditor-dashboard.audit-event.${idx + 1}`}
              >
                <div className="flex items-start gap-2">
                  <Badge
                    className={cn(
                      "text-[10px] px-1.5 py-0 border flex-shrink-0 mt-0.5 font-mono",
                      actionClass,
                    )}
                  >
                    {log.action}
                  </Badge>
                  <p className="text-slate-700 text-xs flex-1 min-w-0 leading-relaxed">
                    {log.details}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-slate-500 text-[10px]">
                    {log.userName}
                  </span>
                  <Badge
                    className={cn(
                      "text-[9px] px-1 py-0 border",
                      getRoleBadgeColor(log.userRole),
                    )}
                  >
                    {getRoleDisplayName(log.userRole)}
                  </Badge>
                  <span className="ml-auto text-slate-400 text-[10px]">
                    {formatTimeAgo(log.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flagged Issues */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
        data-ocid="auditor-dashboard.flagged-issues"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Flagged Issues
          </h2>
          <span className="ml-auto text-xs text-slate-500">
            {flaggedIssues.length} items
          </span>
        </div>
        {flaggedIssues.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">
            No flagged issues
          </p>
        ) : (
          <div className="space-y-2">
            {flaggedIssues.slice(0, 4).map((issue, idx) => {
              const pc = getStatusColor(issue.priority);
              return (
                <div
                  key={issue.id}
                  className="bg-red-50 border-l-4 border-red-500 border border-red-200 rounded-xl p-3 flex items-start gap-3"
                  data-ocid={`auditor-dashboard.flagged-issue.${idx + 1}`}
                >
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-sm font-semibold truncate">
                      {issue.title}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">
                      {issue.description}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "text-[10px] px-1.5 py-0 border flex-shrink-0",
                      pc.bg,
                      pc.text,
                      pc.border,
                    )}
                  >
                    {issue.priority}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Approvals summary */}
      {pendingReviews > 0 && (
        <Link to="/auditor/approvals">
          <div
            className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-smooth"
            data-ocid="auditor-dashboard.pending-approvals-banner"
          >
            <FileSearch className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-800 text-sm font-semibold">
                {pendingReviews} pending approval{pendingReviews > 1 ? "s" : ""}{" "}
                need review
              </p>
              <p className="text-amber-600 text-xs">
                Tap to view approval audit trail
              </p>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
