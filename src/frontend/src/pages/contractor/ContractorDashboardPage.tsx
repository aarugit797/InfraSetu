import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { TASKS } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Users,
  Wrench,
} from "lucide-react";

const WORKERS = [
  {
    id: "w1",
    name: "Ramesh Kumar",
    trade: "Mason",
    status: "present",
    workDone: "Column shuttering",
  },
  {
    id: "w2",
    name: "Suresh Yadav",
    trade: "Welder",
    status: "present",
    workDone: "Steel rebar tying",
  },
  {
    id: "w3",
    name: "Mahesh Singh",
    trade: "Helper",
    status: "absent",
    workDone: "—",
  },
  {
    id: "w4",
    name: "Ganesh Patel",
    trade: "Carpenter",
    status: "present",
    workDone: "Formwork setup",
  },
  {
    id: "w5",
    name: "Dinesh Verma",
    trade: "Electrician",
    status: "halfDay",
    workDone: "Conduit laying",
  },
  {
    id: "w6",
    name: "Santosh Gupta",
    trade: "Plumber",
    status: "absent",
    workDone: "—",
  },
  {
    id: "w7",
    name: "Ravi Sharma",
    trade: "Mason",
    status: "present",
    workDone: "Brick masonry floor 2",
  },
  {
    id: "w8",
    name: "Anil Tiwari",
    trade: "Helper",
    status: "present",
    workDone: "Material stacking",
  },
];

const WAGE_REQUESTS = [
  {
    id: "wr1",
    worker: "Ramesh Kumar",
    amount: 18500,
    period: "May 2026",
    status: "pending",
  },
  {
    id: "wr2",
    worker: "Suresh Yadav",
    amount: 22000,
    period: "May 2026",
    status: "pending",
  },
  {
    id: "wr3",
    worker: "Ganesh Patel",
    amount: 20000,
    period: "Apr 2026",
    status: "approved",
  },
];

const EQUIPMENT_ISSUES = [
  {
    id: "eq1",
    name: "Concrete Mixer CM-01",
    issue: "Motor overheating",
    severity: "high",
    status: "reported",
  },
  {
    id: "eq2",
    name: "Tower Crane TC-03",
    issue: "Hydraulic leak detected",
    severity: "critical",
    status: "underRepair",
  },
  {
    id: "eq3",
    name: "Excavator EX-02",
    issue: "Track tension loose",
    severity: "medium",
    status: "fixed",
  },
];

export default function ContractorDashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const myTasks = TASKS.filter(
    (t) => t.assignedTo === (currentUser?.id ?? "u4"),
  );
  const inProgressTasks = myTasks.filter(
    (t) => t.status === "inProgress",
  ).length;
  const presentCount = WORKERS.filter((w) => w.status === "present").length;
  const pendingWages = WAGE_REQUESTS.filter(
    (w) => w.status === "pending",
  ).length;
  const openEquipmentIssues = EQUIPMENT_ISSUES.filter(
    (e) => e.status !== "fixed",
  ).length;

  return (
    <div
      className="bg-muted min-h-screen p-4 space-y-6"
      data-ocid="contractor-dashboard.page"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            Welcome, {currentUser?.name?.split(" ")[0]} 👷
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">
            {currentUser?.name?.charAt(0) ?? "C"}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="bg-card border border-border shadow-sm rounded-xl p-4"
          data-ocid="contractor-dashboard.workers_stat"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">
              Total Workers
            </p>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{WORKERS.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {presentCount} present today
          </p>
        </div>

        <div
          className="bg-card border border-border shadow-sm rounded-xl p-4"
          data-ocid="contractor-dashboard.wage_stat"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">
              Wage Approvals
            </p>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-500">{pendingWages}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pending approval
          </p>
        </div>

        <div
          className="bg-card border border-border shadow-sm rounded-xl p-4"
          data-ocid="contractor-dashboard.tasks_stat"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">
              Tasks In Progress
            </p>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {inProgressTasks}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Active tasks</p>
        </div>

        <div
          className="bg-card border border-border shadow-sm rounded-xl p-4"
          data-ocid="contractor-dashboard.equipment_stat"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">
              Equipment Issues
            </p>
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">
            {openEquipmentIssues}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Open issues</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Tasks",
              icon: ClipboardList,
              path: "/contractor/tasks",
              color: "bg-primary/10 text-primary",
            },
            {
              label: "Wages",
              icon: DollarSign,
              path: "/contractor/wage-approval",
              color: "bg-amber-100 text-amber-700",
            },
            {
              label: "Equipment",
              icon: Wrench,
              path: "/contractor/equipment",
              color: "bg-red-100 text-red-600",
            },
          ].map(({ label, icon: Icon, path, color }) => (
            <button
              key={label}
              type="button"
              data-ocid={`contractor-dashboard.${label.toLowerCase()}_button`}
              onClick={() =>
                navigate({ to: path as Parameters<typeof navigate>[0]["to"] })
              }
              className="flex flex-col items-center gap-2 py-4 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-sm transition-all duration-200 group"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-foreground text-center leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pending wage approvals */}
      {pendingWages > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Wages
            </h2>
            <button
              type="button"
              data-ocid="contractor-dashboard.view_wages"
              onClick={() => navigate({ to: "/contractor/wage-approval" })}
              className="text-xs text-primary font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {WAGE_REQUESTS.filter((w) => w.status === "pending").map(
              (req, i) => (
                <div
                  key={req.id}
                  className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm"
                  data-ocid={`contractor-dashboard.wage_request.${i + 1}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-xs">
                      {req.worker.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {req.worker}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {req.period}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-amber-600">
                    ₹{req.amount.toLocaleString()}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Today's team attendance */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Today's Attendance
          </h2>
          <button
            type="button"
            data-ocid="contractor-dashboard.view_attendance"
            onClick={() => navigate({ to: "/contractor/attendance" })}
            className="text-xs text-primary font-medium hover:underline"
          >
            Manage
          </button>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {WORKERS.slice(0, 5).map((worker, i) => (
            <div
              key={worker.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0"
              data-ocid={`contractor-dashboard.worker.${i + 1}`}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-xs">
                  {worker.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {worker.name}
                </p>
                <p className="text-xs text-muted-foreground">{worker.trade}</p>
              </div>
              <StatusBadge status={worker.status} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Tasks
          </h2>
          <button
            type="button"
            data-ocid="contractor-dashboard.view_tasks"
            onClick={() => navigate({ to: "/contractor/tasks" })}
            className="text-xs text-primary font-medium hover:underline"
          >
            View All
          </button>
        </div>
        <div className="space-y-2">
          {myTasks.slice(0, 3).map((task, i) => (
            <div
              key={task.id}
              className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm"
              data-ocid={`contractor-dashboard.task.${i + 1}`}
            >
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Due {formatDate(task.dueDate)}
                </p>
              </div>
              <StatusBadge status={task.status} size="sm" />
            </div>
          ))}
          {myTasks.length === 0 && (
            <div
              className="bg-card border border-border rounded-xl p-6 text-center"
              data-ocid="contractor-dashboard.tasks_empty_state"
            >
              <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No tasks assigned yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
