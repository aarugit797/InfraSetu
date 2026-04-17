import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useBackend";
import { PROJECTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Info,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  inProgress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
  cancelled: "Cancelled",
};

type ApprovalStatus = "none" | "pending" | "approved" | "rejected";

export default function WorkerTasksPage() {
  const { currentUser } = useAuth();
  const { data: tasks, isLoading } = useTasks();
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [localStatus, setLocalStatus] = useState<Record<string, TaskStatus>>(
    {},
  );
  const [approvalStatus, setApprovalStatus] = useState<
    Record<string, ApprovalStatus>
  >({});

  const myTasks = tasks?.filter((t) => t.assignedTo === currentUser?.id) ?? [];

  function getStatus(task: Task): TaskStatus {
    return localStatus[task.id] ?? task.status;
  }

  function getApproval(taskId: string): ApprovalStatus {
    return approvalStatus[taskId] ?? "none";
  }

  function handleMarkComplete(task: Task) {
    const current = getStatus(task);
    if (current === "pending") {
      setLocalStatus((prev) => ({ ...prev, [task.id]: "inProgress" }));
      toast.success("Task started", { description: task.title });
    } else if (current === "inProgress") {
      setLocalStatus((prev) => ({ ...prev, [task.id]: "completed" }));
      setApprovalStatus((prev) => ({ ...prev, [task.id]: "pending" }));
      toast.success("Completion request sent!", {
        description: "Waiting for supervisor approval.",
      });
    }
  }

  function getApprovalBadge(approvalSt: ApprovalStatus) {
    if (approvalSt === "pending")
      return {
        label: "Pending Approval",
        cls: "bg-amber-100 text-amber-700 border-amber-300",
      };
    if (approvalSt === "approved")
      return {
        label: "Approved",
        cls: "bg-green-100 text-green-700 border-green-300",
      };
    if (approvalSt === "rejected")
      return {
        label: "Rejected",
        cls: "bg-red-100 text-red-700 border-red-300",
      };
    return null;
  }

  function getPriorityBadge(p: string) {
    if (p === "critical") return "bg-red-100 text-red-700 border-red-300";
    if (p === "high") return "bg-orange-100 text-orange-700 border-orange-300";
    if (p === "medium") return "bg-amber-100 text-amber-700 border-amber-300";
    return "bg-slate-100 text-slate-500 border-slate-200";
  }

  function getStatusBadge(s: TaskStatus) {
    if (s === "completed")
      return "bg-green-100 text-green-700 border-green-300";
    if (s === "inProgress")
      return "bg-amber-100 text-amber-700 border-amber-300";
    if (s === "blocked") return "bg-red-100 text-red-700 border-red-300";
    return "bg-slate-100 text-slate-500 border-slate-200";
  }

  const grouped = {
    inProgress: myTasks.filter((t) => getStatus(t) === "inProgress"),
    pending: myTasks.filter((t) => getStatus(t) === "pending"),
    completed: myTasks.filter((t) => getStatus(t) === "completed"),
    blocked: myTasks.filter(
      (t) => getStatus(t) === "blocked" || getStatus(t) === "cancelled",
    ),
  };

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5 max-w-lg mx-auto"
      data-ocid="worker-tasks.page"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {myTasks.length} total · {grouped.inProgress.length} in progress
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 flex-wrap">
        {[
          {
            label: "In Progress",
            count: grouped.inProgress.length,
            color: "bg-amber-100 text-amber-700 border-amber-300",
          },
          {
            label: "Pending",
            count: grouped.pending.length,
            color: "bg-slate-100 text-slate-600 border-slate-200",
          },
          {
            label: "Done",
            count: grouped.completed.length,
            color: "bg-green-100 text-green-700 border-green-300",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold",
              s.color,
            )}
          >
            {s.label}
            <span className="font-bold">{s.count}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : myTasks.length === 0 ? (
        <div
          className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-sm"
          data-ocid="worker-tasks.empty-state"
        >
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No tasks assigned</p>
          <p className="text-sm text-slate-500">
            Your supervisor will assign tasks to you here
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {(
            [
              { key: "inProgress" as const, label: "In Progress" },
              { key: "pending" as const, label: "Pending" },
              { key: "completed" as const, label: "Completed" },
              { key: "blocked" as const, label: "Blocked / Cancelled" },
            ] as const
          ).map(({ key, label }) =>
            grouped[key].length > 0 ? (
              <div key={key} className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {label}
                </p>
                {grouped[key].map((task, i) => {
                  const project = PROJECTS.find((p) => p.id === task.projectId);
                  const st = getStatus(task);
                  const approval = getApproval(task.id);
                  const approvalBadge = getApprovalBadge(approval);
                  const canAdvance = st === "pending" || st === "inProgress";
                  return (
                    <div
                      key={task.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
                      data-ocid={`worker-tasks.item.${i + 1}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-800 leading-snug">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {project?.name ?? "Unknown Project"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDetailTask(task)}
                          className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700"
                          data-ocid={`worker-tasks.detail-button.${i + 1}`}
                          aria-label="View task details"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={cn(
                            "text-xs border",
                            getPriorityBadge(task.priority),
                          )}
                        >
                          {task.priority}
                        </Badge>
                        <Badge
                          className={cn("text-xs border", getStatusBadge(st))}
                        >
                          {STATUS_LABELS[st]}
                        </Badge>
                        {approvalBadge && (
                          <Badge
                            className={cn("text-xs border", approvalBadge.cls)}
                          >
                            {approvalBadge.label}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
                          <Clock className="w-3.5 h-3.5" />
                          {task.dueDate}
                        </div>
                      </div>

                      {canAdvance && (
                        <button
                          type="button"
                          onClick={() => handleMarkComplete(task)}
                          data-ocid={`worker-tasks.mark-complete.${i + 1}`}
                          className={cn(
                            "w-full h-10 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-colors",
                            st === "inProgress"
                              ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                              : "bg-amber-500 hover:bg-amber-600 text-white border-amber-500",
                          )}
                        >
                          {st === "inProgress" ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Complete
                            </>
                          ) : (
                            <>
                              <ChevronRight className="w-4 h-4" />
                              Start Task
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null,
          )}
        </div>
      )}

      {/* Detail modal */}
      {detailTask && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4"
          data-ocid="worker-tasks.detail-modal"
        >
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold text-lg text-slate-800 leading-tight">
                {detailTask.title}
              </p>
              <button
                type="button"
                onClick={() => setDetailTask(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0"
                data-ocid="worker-tasks.detail-modal.close-button"
                aria-label="Close task details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Description
                </p>
                <p className="text-sm text-slate-700">
                  {detailTask.description}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Instructions
                </p>
                <p className="text-sm text-slate-700">
                  Follow site safety guidelines. Use approved materials only.
                  Report any deviations to the site engineer immediately.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Start Date</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {detailTask.startDate}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Due Date</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {detailTask.dueDate}
                  </p>
                </div>
              </div>

              {getStatus(detailTask) !== "completed" && (
                <Button
                  className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-xl"
                  onClick={() => {
                    handleMarkComplete(detailTask);
                    setDetailTask(null);
                  }}
                  data-ocid="worker-tasks.detail-modal.confirm-button"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {getStatus(detailTask) === "inProgress"
                    ? "Mark Complete"
                    : "Start Task"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
