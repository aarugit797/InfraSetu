import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PROJECTS } from "@/lib/mockData";
import { cn, getStatusColor } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Camera,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Image,
  PlusCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

type ProgressStatus = "pending" | "approved" | "rejected";

interface WeeklyProgressSummary {
  id: string;
  projectName: string;
  weekLabel: string;
  status: ProgressStatus;
  submittedAt: string;
}

const RECENT_PROGRESS: WeeklyProgressSummary[] = [
  {
    id: "wp1",
    projectName: "NH-48 Highway Expansion",
    weekLabel: "Week 14 (Apr 7–13)",
    status: "approved",
    submittedAt: "Apr 13, 2026",
  },
  {
    id: "wp2",
    projectName: "Government School Complex",
    weekLabel: "Week 14 (Apr 7–13)",
    status: "pending",
    submittedAt: "Apr 13, 2026",
  },
  {
    id: "wp3",
    projectName: "Water Treatment Plant",
    weekLabel: "Week 13 (Mar 31–Apr 6)",
    status: "approved",
    submittedAt: "Apr 6, 2026",
  },
  {
    id: "wp4",
    projectName: "NH-48 Highway Expansion",
    weekLabel: "Week 13 (Mar 31–Apr 6)",
    status: "rejected",
    submittedAt: "Apr 6, 2026",
  },
];

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
        href &&
          "hover:border-amber-300 hover:shadow-md transition-all duration-200",
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

export default function CommunityDashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const totalProjects = PROJECTS.length;
  const weeklySubmittedThisMonth = RECENT_PROGRESS.length;
  const pendingApprovals = RECENT_PROGRESS.filter(
    (p) => p.status === "pending",
  ).length;
  const totalPictures = 18;

  if (loading) {
    return (
      <div
        className="bg-slate-50 min-h-screen p-4 space-y-4"
        data-ocid="community-dashboard.loading_state"
      >
        <Skeleton className="h-8 w-52" />
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
      data-ocid="community-dashboard.page"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Community Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Oversee project progress, approvals &amp; site updates
        </p>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 gap-3"
        data-ocid="community-dashboard.stats"
      >
        <StatCard
          label="Projects Overseen"
          value={totalProjects}
          icon={FolderKanban}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          sub="Active projects"
          href="/community/weekly-progress"
        />
        <StatCard
          label="Reports This Month"
          value={weeklySubmittedThisMonth}
          icon={ClipboardList}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          sub="Weekly reports sent"
          href="/community/weekly-progress"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingApprovals}
          icon={CheckCircle2}
          iconBg={pendingApprovals > 0 ? "bg-orange-100" : "bg-emerald-100"}
          iconColor={
            pendingApprovals > 0 ? "text-orange-600" : "text-emerald-600"
          }
          sub="PM reports to review"
          href="/community/progress-approval"
        />
        <StatCard
          label="Site Pictures"
          value={totalPictures}
          icon={Image}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          sub="Total uploaded"
          href="/community/upload-pictures"
        />
      </div>

      {/* Quick Actions */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
        data-ocid="community-dashboard.quick-actions"
      >
        <h2 className="font-semibold text-slate-800 text-sm">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/community/weekly-progress"
            className="flex items-center gap-2 p-3 rounded-xl border bg-amber-50 border-amber-200 hover:shadow-sm transition-all duration-200"
            data-ocid="community-dashboard.submit-progress-link"
          >
            <PlusCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-amber-700">
              Submit Progress
            </span>
          </Link>
          <Link
            to="/community/upload-pictures"
            className="flex items-center gap-2 p-3 rounded-xl border bg-purple-50 border-purple-200 hover:shadow-sm transition-all duration-200"
            data-ocid="community-dashboard.upload-pictures-link"
          >
            <Camera className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-purple-700">
              Upload Pictures
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Weekly Progress */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
        data-ocid="community-dashboard.recent-progress"
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Recent Weekly Reports
          </h2>
          <Link
            to="/community/weekly-progress"
            className="ml-auto text-xs text-amber-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {RECENT_PROGRESS.map((item, idx) => {
            const sc = getStatusColor(item.status);
            return (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3"
                data-ocid={`community-dashboard.progress-item.${idx + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-sm font-semibold truncate">
                    {item.projectName}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {item.weekLabel}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    className={cn(
                      "text-[10px] px-1.5 py-0 border capitalize",
                      sc.bg,
                      sc.text,
                      sc.border,
                    )}
                  >
                    {item.status}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {item.submittedAt}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
