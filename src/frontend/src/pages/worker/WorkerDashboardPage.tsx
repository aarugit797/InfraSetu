import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useAttendanceRecords, useTasks } from "@/hooks/useBackend";
import { PROJECTS, SITES } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  MapPin,
  MessageCircleWarning,
  QrCode,
  User2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const today = new Date().toISOString().split("T")[0];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const MOCK_PAYMENT_BALANCE = 12500;

export default function WorkerDashboardPage() {
  const { currentUser, selectedSiteId } = useAuth();
  const navigate = useNavigate();
  const site = SITES.find((s) => s.id === selectedSiteId);
  const project = site ? PROJECTS.find((p) => p.id === site.projectId) : null;
  const [sosActive, setSosActive] = useState(false);

  const { data: attendanceRecords, isLoading: loadingAttendance } =
    useAttendanceRecords(selectedSiteId ?? undefined, currentUser?.id);
  const { data: tasks, isLoading: loadingTasks } = useTasks();

  const todayRecord = attendanceRecords?.find((r) => r.date === today);
  const isCheckedIn = !!todayRecord?.checkInTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;

  const myTasks = tasks?.filter((t) => t.assignedTo === currentUser?.id) ?? [];
  const doneTasks = myTasks.filter((t) => t.status === "completed").length;
  const pendingTasks = myTasks.filter((t) => t.status !== "completed");

  function handleSOS() {
    setSosActive(true);
    toast.error("🆘 SOS Alert Sent!", {
      description: "Emergency services and your supervisor have been notified.",
      duration: 6000,
    });
  }

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5 max-w-lg mx-auto"
      data-ocid="worker-dashboard.page"
    >
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Good {getGreeting()}, {currentUser?.name.split(" ")[0]} 👋
        </h1>
        {site && (
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-sm text-amber-600 font-medium">
              {site.name}
              {project && ` · ${project.name}`}
            </span>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Today's Status"
          loading={loadingAttendance}
          value={
            isCheckedIn && !isCheckedOut
              ? "Checked In"
              : isCheckedOut
                ? "Checked Out"
                : "Not Checked In"
          }
          valueClass={
            isCheckedIn && !isCheckedOut
              ? "text-green-600"
              : isCheckedOut
                ? "text-slate-500"
                : "text-red-600"
          }
          icon={isCheckedIn ? CheckCircle2 : XCircle}
          iconClass={isCheckedIn ? "text-green-500" : "text-red-500"}
        />
        <StatTile
          label="Tasks Today"
          loading={loadingTasks}
          value={`${doneTasks}/${myTasks.length} done`}
          icon={ClipboardList}
          iconClass="text-amber-500"
        />
        <StatTile
          label="Payment Balance"
          loading={false}
          value={`₹${MOCK_PAYMENT_BALANCE.toLocaleString()}`}
          valueClass="text-green-600"
          icon={CreditCard}
          iconClass="text-green-500"
        />
        <StatTile
          label="Check-In Time"
          loading={loadingAttendance}
          value={
            todayRecord?.checkInTime ? fmt(todayRecord.checkInTime) : "--:--"
          }
          icon={Clock}
          iconClass="text-slate-400"
        />
      </div>

      {/* Attendance quick card */}
      <div
        className={cn(
          "bg-white border-2 rounded-2xl p-4 flex items-center gap-4 shadow-sm",
          isCheckedIn && !isCheckedOut
            ? "border-green-300"
            : isCheckedOut
              ? "border-slate-200"
              : "border-amber-300",
        )}
        data-ocid="worker-dashboard.attendance-card"
      >
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
            isCheckedIn && !isCheckedOut
              ? "bg-green-50"
              : isCheckedOut
                ? "bg-slate-100"
                : "bg-amber-50",
          )}
        >
          {isCheckedIn ? (
            <CheckCircle2 className="w-7 h-7 text-green-500" />
          ) : (
            <XCircle className="w-7 h-7 text-amber-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm">
            {isCheckedIn && !isCheckedOut
              ? "You are on site"
              : isCheckedOut
                ? "Shift completed"
                : "Not checked in yet"}
          </p>
          {todayRecord?.checkInTime && (
            <p className="text-xs text-slate-500">
              In: {fmt(todayRecord.checkInTime)}
              {todayRecord.checkOutTime &&
                ` · Out: ${fmt(todayRecord.checkOutTime)}`}
            </p>
          )}
        </div>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-xl text-xs font-bold flex-shrink-0"
          onClick={() => navigate({ to: "/worker/attendance" })}
          data-ocid="worker-dashboard.attendance-button"
        >
          <QrCode className="w-4 h-4 mr-1" />
          {isCheckedIn && !isCheckedOut ? "Check Out" : "Check In"}
        </Button>
      </div>

      {/* Today's tasks preview */}
      <div className="space-y-2" data-ocid="worker-dashboard.tasks-section">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            My Tasks Today
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/worker/tasks" })}
            className="text-xs text-amber-600 font-semibold"
            data-ocid="worker-dashboard.view-all-tasks"
          >
            View all
          </button>
        </div>
        {loadingTasks ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : pendingTasks.length === 0 ? (
          <div
            className="bg-white border border-slate-200 rounded-xl p-4 text-center text-sm text-slate-500 shadow-sm"
            data-ocid="worker-dashboard.tasks-empty"
          >
            No pending tasks — great work! ✓
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTasks.slice(0, 3).map((task, i) => (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm"
                data-ocid={`worker-dashboard.task.${i + 1}`}
              >
                <div
                  className={cn(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0",
                    task.priority === "critical"
                      ? "bg-red-500"
                      : task.priority === "high"
                        ? "bg-orange-500"
                        : task.priority === "medium"
                          ? "bg-amber-400"
                          : "bg-slate-300",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500">Due {task.dueDate}</p>
                </div>
                <Badge
                  className={cn(
                    "text-xs flex-shrink-0 border",
                    task.status === "inProgress"
                      ? "bg-amber-100 text-amber-700 border-amber-300"
                      : "bg-slate-100 text-slate-500 border-slate-200",
                  )}
                >
                  {task.status === "inProgress" ? "In Progress" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="space-y-2" data-ocid="worker-dashboard.quick-links">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Quick Links
        </p>
        <div className="grid grid-cols-2 gap-3">
          <QuickLink
            icon={QrCode}
            label="Attendance"
            color="text-amber-600"
            bg="bg-amber-50 border-amber-200"
            onClick={() => navigate({ to: "/worker/attendance" })}
            ocid="worker-dashboard.quick-attendance"
          />
          <QuickLink
            icon={ClipboardList}
            label="My Tasks"
            color="text-slate-700"
            bg="bg-white border-slate-200"
            onClick={() => navigate({ to: "/worker/tasks" })}
            ocid="worker-dashboard.quick-tasks"
          />
          <QuickLink
            icon={CreditCard}
            label="Payment"
            color="text-green-600"
            bg="bg-green-50 border-green-200"
            onClick={() => navigate({ to: "/worker/payment" })}
            ocid="worker-dashboard.quick-payment"
          />
          <QuickLink
            icon={MessageCircleWarning}
            label="Complaint"
            color="text-red-600"
            bg="bg-red-50 border-red-200"
            onClick={() => navigate({ to: "/worker/complaint" })}
            ocid="worker-dashboard.quick-complaint"
          />
          <QuickLink
            icon={User2}
            label="My Account"
            color="text-slate-600"
            bg="bg-slate-50 border-slate-200"
            onClick={() => navigate({ to: "/worker/account" })}
            ocid="worker-dashboard.quick-account"
          />
        </div>
      </div>

      {/* SOS Emergency Button */}
      <div className="pt-2" data-ocid="worker-dashboard.sos-section">
        <button
          type="button"
          onClick={handleSOS}
          className={cn(
            "w-full h-16 rounded-2xl border-2 font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-sm",
            sosActive
              ? "bg-red-700 border-red-800 text-white"
              : "border-red-600 bg-red-500 hover:bg-red-600 text-white",
          )}
          data-ocid="worker-dashboard.sos-button"
          aria-label="SOS Emergency Alert"
        >
          <AlertTriangle className="w-7 h-7" />
          {sosActive ? "SOS Sent — Help is Coming!" : "🆘 SOS Emergency"}
        </button>
        <p className="text-xs text-center text-slate-400 mt-2">
          Press to send emergency alert to supervisors and emergency services
        </p>
      </div>
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: string;
  loading?: boolean;
  valueClass?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass?: string;
}
function StatTile({
  label,
  value,
  loading,
  valueClass,
  icon: Icon,
  iconClass,
}: StatTileProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
      <Icon className={cn("w-5 h-5", iconClass)} />
      {loading ? (
        <Skeleton className="h-6 w-20" />
      ) : (
        <p
          className={cn(
            "font-bold text-lg leading-tight",
            valueClass ?? "text-slate-800",
          )}
        >
          {value}
        </p>
      )}
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

interface QuickLinkProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bg: string;
  onClick: () => void;
  ocid: string;
}
function QuickLink({
  icon: Icon,
  label,
  color,
  bg,
  onClick,
  ocid,
}: QuickLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className={cn(
        "flex items-center gap-3 rounded-2xl p-4 border transition-colors active:scale-95 text-left",
        bg,
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", color)} />
      <span className={cn("text-sm font-semibold", color)}>{label}</span>
    </button>
  );
}
