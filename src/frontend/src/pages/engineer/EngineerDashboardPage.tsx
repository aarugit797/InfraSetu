import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { ISSUES, TASKS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Cloud,
  FileText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function EngineerDashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const myTasks = TASKS.filter((t) => t.assignedTo === currentUser?.id);
  const completedTasks = myTasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = myTasks.filter(
    (t) => t.status === "inProgress",
  ).length;
  const openIssues = ISSUES.filter(
    (i) => i.reportedBy === currentUser?.id && i.status === "open",
  ).length;

  if (loading) {
    return (
      <Layout>
        <div className="p-4 space-y-4 bg-slate-50 min-h-screen">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((k) => (
              <Skeleton key={k} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      label: "Tasks Assigned",
      value: myTasks.length,
      icon: ClipboardList,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      border: "border-amber-200",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: TrendingUp,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      border: "border-blue-200",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      border: "border-green-200",
    },
    {
      label: "Open Issues",
      value: openIssues,
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      border: "border-red-200",
    },
  ];

  const quickActions = [
    {
      label: "Weather",
      icon: Cloud,
      color: "bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100",
      path: "/engineer/weather",
    },
    {
      label: "Issues",
      icon: AlertTriangle,
      color: "bg-red-50 border-red-300 text-red-700 hover:bg-red-100",
      path: "/engineer/issues",
    },
    {
      label: "Quality",
      icon: ShieldCheck,
      color:
        "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100",
      path: "/engineer/quality-check",
    },
    {
      label: "Progress",
      icon: TrendingUp,
      color: "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100",
      path: "/engineer/progress",
    },
    {
      label: "Daily Report",
      icon: FileText,
      color:
        "bg-violet-50 border-violet-300 text-violet-700 hover:bg-violet-100",
      path: "/engineer/daily-report",
    },
  ];

  return (
    <Layout>
      <div
        className="p-4 space-y-5 bg-slate-50 min-h-screen"
        data-ocid="engineer-dashboard.page"
      >
        {/* Greeting */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
          <h1 className="font-display text-xl font-bold text-slate-800">
            Good morning, {currentUser?.name.split(" ")[0]} 👷
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Site Engineer ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className={cn(
                "bg-white rounded-2xl p-4 border shadow-sm",
                stat.border,
              )}
              data-ocid={`engineer-dashboard.stat.${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center mb-2",
                  stat.iconBg,
                )}
              >
                <stat.icon className={cn("w-4.5 h-4.5", stat.iconColor)} />
              </div>
              <p className="text-2xl font-bold font-display text-slate-800">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Quick Access
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate({ to: action.path })}
                data-ocid={`engineer-dashboard.quick-action.${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 hover:scale-105 active:scale-95",
                  action.color,
                )}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              My Tasks
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-7 px-2"
              onClick={() => navigate({ to: "/engineer/tasks" })}
              data-ocid="engineer-dashboard.view-all-tasks"
            >
              View All
            </Button>
          </div>
          <div className="space-y-2">
            {myTasks.length === 0 && (
              <div
                className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-sm"
                data-ocid="engineer-dashboard.tasks.empty_state"
              >
                <ClipboardList className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No tasks assigned</p>
              </div>
            )}
            {myTasks.slice(0, 3).map((task, idx) => (
              <div
                key={task.id}
                className={cn(
                  "bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center gap-3",
                  task.status === "inProgress" && "border-l-4 border-l-amber-400",
                  task.status === "completed" && "border-l-4 border-l-green-400",
                )}
                data-ocid={`engineer-dashboard.task.item.${idx + 1}`}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    task.status === "inProgress"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-slate-300",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Due{" "}
                    {new Date(task.dueDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "text-xs px-1.5 py-0 border capitalize flex-shrink-0",
                    task.status === "completed"
                      ? "bg-green-100 border-green-300 text-green-700"
                      : task.status === "inProgress"
                        ? "bg-amber-100 border-amber-300 text-amber-700"
                        : "bg-slate-100 border-slate-300 text-slate-600",
                  )}
                >
                  {task.status === "inProgress" ? "In Progress" : task.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
