import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_PROJECTS, DAILY_LOGS, DEMO_USERS, TASKS, WORKER_PROFILES } from "@/lib/mockData";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderOpen,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const day = 86400000;
const now = Date.now();

function buildTrend() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * day);
    const label = d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    const completed = Math.floor(Math.random() * 3) + (i > 9 ? 2 : 0);
    return { label, completed };
  });
}

const contractors = DEMO_USERS.filter((u) => u.role === "contractor");
const engineers = DEMO_USERS.filter((u) => u.role === "siteEngineer");

const upcomingDeadlines = ALL_PROJECTS.slice(0, 4).map((p) => ({
  id: p.id,
  name: p.name,
  endDate: p.endDate,
  progress: p.progress,
}));

export default function ManagerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const trend = buildTrend();
  const maxTrend = Math.max(...trend.map((t) => t.completed), 1);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const activeProjects = ALL_PROJECTS.filter((p) => p.status === "active").length;
  const pendingTasks = TASKS.filter((t) => t.status === "pending").length;
  const nearDeadline = ALL_PROJECTS.filter((p) => {
    const end = new Date(p.endDate).getTime();
    return end - now < 14 * day && end > now;
  }).length;
  const dailyReportsReceived = DAILY_LOGS.filter(
    (l) => Date.now() - l.createdAt < 7 * day
  ).length;

  const stats = [
    {
      label: "Active Projects",
      value: activeProjects,
      icon: FolderOpen,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      sub: "currently running",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks,
      icon: ClipboardList,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      sub: "awaiting action",
    },
    {
      label: "Upcoming Deadlines",
      value: nearDeadline,
      icon: CalendarDays,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      sub: "within 14 days",
    },
    {
      label: "Daily Reports",
      value: dailyReportsReceived,
      icon: FileText,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      sub: "received this week",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-4 bg-muted/30 min-h-screen">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {["s1", "s2", "s3", "s4"].map((k) => (
            <Skeleton key={k} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto bg-muted/20 min-h-screen">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-7 bg-primary rounded-full" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                Project Manager
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Manager Dashboard
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm ml-4">
          Project planning &amp; scheduling overview —{" "}
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        data-ocid="manager.dashboard.section"
      >
        {stats.map((s) => (
          <Card
            key={s.label}
            className="bg-card border border-border shadow-sm rounded-xl"
          >
            <CardContent className="p-4">
              <div
                className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center mb-3`}
              >
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {s.value}
              </div>
              <div className="text-xs text-foreground/70 mt-0.5">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task completion trend */}
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Task Completion — Last 14 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-end gap-1 h-24">
              {trend.map((d) => (
                <div
                  key={d.label}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t bg-primary/70 hover:bg-primary transition-all"
                    style={{
                      height: `${(d.completed / maxTrend) * 80}px`,
                      minHeight: "4px",
                    }}
                    title={`${d.completed} completed`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {trend[0].label}
              </span>
              <span className="text-xs text-muted-foreground">
                {trend[13].label}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Resource allocation summary */}
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Resource Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Contractors Assigned
              </p>
              {contractors.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {c.name}
                    </span>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 border-0 text-xs hover:bg-amber-100">
                    Contractor
                  </Badge>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Site Engineers
              </p>
              {engineers.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                      {e.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {e.name}
                    </span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-0 text-xs hover:bg-blue-100">
                    Engineer
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduling overview */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Project Scheduling Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {ALL_PROJECTS.slice(0, 4).map((p) => (
            <Link
              key={p.id}
              to="/projects/$id"
              params={{ id: p.id }}
              className="block group"
            >
              <div className="space-y-1 py-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-foreground truncate max-w-[200px] group-hover:text-primary transition-colors">
                    {p.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">→ {p.endDate}</span>
                    <span className="text-primary font-semibold ml-1">
                      {p.progress}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all group-hover:bg-primary/80"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming deadlines */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-foreground">
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {upcomingDeadlines.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="manager.deadlines.empty_state"
            >
              No upcoming deadlines
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((d, idx) => {
                const daysLeft = Math.ceil(
                  (new Date(d.endDate).getTime() - now) / day,
                );
                const urgent = daysLeft <= 14;
                return (
                  <Link
                    key={d.id}
                    to="/projects/$id"
                    params={{ id: d.id }}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/50 transition-colors px-1"
                    data-ocid={`manager.deadlines.item.${idx + 1}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {d.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Deadline: {d.endDate}
                      </p>
                    </div>
                    <Badge
                      className={`border-0 text-xs ${
                        urgent
                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {daysLeft > 0 ? `${daysLeft}d left` : "Overdue"}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
