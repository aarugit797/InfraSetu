import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { PROJECTS, TASKS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { Calendar, CheckCircle2, ClipboardList, Clock, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: "border-red-300 bg-red-100 text-red-700",
  high: "border-orange-300 bg-orange-100 text-orange-700",
  medium: "border-amber-300 bg-amber-100 text-amber-700",
  low: "border-green-300 bg-green-100 text-green-700",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "border-slate-300 bg-slate-100 text-slate-600",
  inProgress: "border-amber-400 bg-amber-100 text-amber-800",
  completed: "border-green-300 bg-green-100 text-green-700",
  blocked: "border-red-300 bg-red-100 text-red-700",
  cancelled: "border-slate-200 bg-slate-50 text-slate-500",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  inProgress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
  cancelled: "Cancelled",
};

export default function EngineerTasksPage() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(
    TASKS.filter((t) => t.assignedTo === currentUser?.id),
  );
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");

  const filtered = tasks.filter((t) => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    toast.success("Task status updated");
  }

  function handleDetailSave() {
    if (!selectedTask) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id
          ? { ...t, status: progress === 100 ? "completed" : "inProgress" }
          : t,
      ),
    );
    toast.success("Task updated successfully");
    setSelectedTask(null);
    setNotes("");
  }

  function openDetail(task: Task) {
    setSelectedTask(task);
    setProgress(
      task.status === "completed" ? 100 : task.status === "inProgress" ? 50 : 0,
    );
    setNotes("");
  }

  const project = (id: string) => PROJECTS.find((p) => p.id === id);

  return (
    <div
      className="p-4 space-y-4 bg-slate-50 min-h-screen"
      data-ocid="engineer-tasks.page"
    >
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-amber-600" />
        <h1 className="font-display text-xl font-bold text-slate-800">
          My Tasks
        </h1>
        <Badge className="ml-auto bg-amber-100 border-amber-300 text-amber-800">
          {filtered.length} tasks
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger
            className="flex-1 bg-white border-slate-200 h-9 rounded-xl text-sm text-slate-700"
            data-ocid="engineer-tasks.filter-status.select"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inProgress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger
            className="flex-1 bg-white border-slate-200 h-9 rounded-xl text-sm text-slate-700"
            data-ocid="engineer-tasks.filter-priority.select"
          >
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task list */}
      <div className="space-y-3" data-ocid="engineer-tasks.list">
        {filtered.length === 0 && (
          <div
            className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm"
            data-ocid="engineer-tasks.empty_state"
          >
            <ClipboardList className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">No tasks found</p>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}
        {filtered.map((task, idx) => {
          const proj = project(task.projectId);
          const isOverdue =
            new Date(task.dueDate) < new Date() && task.status !== "completed";
          return (
            <Card
              key={task.id}
              className={cn(
                "bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3",
                task.status === "inProgress" && "border-l-4 border-l-amber-400",
                task.status === "completed" && "border-l-4 border-l-green-400",
              )}
              data-ocid={`engineer-tasks.item.${idx + 1}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm leading-snug">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {proj?.name ?? task.projectId}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "text-xs px-1.5 py-0 border capitalize flex-shrink-0",
                    PRIORITY_COLORS[task.priority],
                  )}
                >
                  {task.priority}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span className={cn(isOverdue && "text-red-600 font-medium")}>
                  Due{" "}
                  {new Date(task.dueDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {isOverdue && " (Overdue)"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={task.status}
                  onValueChange={(v) =>
                    handleStatusChange(task.id, v as TaskStatus)
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "flex-1 border h-8 rounded-lg text-xs",
                      STATUS_COLORS[task.status],
                    )}
                    data-ocid={`engineer-tasks.item.${idx + 1}.status.select`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs rounded-lg border-slate-300 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800"
                  onClick={() => openDetail(task)}
                  data-ocid={`engineer-tasks.item.${idx + 1}.detail-button`}
                >
                  Details
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          data-ocid="engineer-tasks.detail.dialog"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display font-bold text-slate-800">
                  {selectedTask.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {PROJECTS.find((p) => p.id === selectedTask.projectId)?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-700 flex-shrink-0"
                data-ocid="engineer-tasks.detail.close-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600">{selectedTask.description}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Start
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {new Date(selectedTask.startDate).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "short" },
                  )}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Due
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {new Date(selectedTask.dueDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </div>

            {/* Progress slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Completion Progress</span>
                <span className="text-amber-600 font-semibold">
                  {progress}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-amber-500"
                data-ocid="engineer-tasks.detail.progress-slider"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-2">Completion Notes</p>
              <Textarea
                placeholder="Add notes about task progress..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl text-sm resize-none text-slate-800"
                rows={3}
                data-ocid="engineer-tasks.detail.notes.textarea"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50"
                onClick={() => setSelectedTask(null)}
                data-ocid="engineer-tasks.detail.cancel-button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-2 border-0"
                onClick={handleDetailSave}
                data-ocid="engineer-tasks.detail.save-button"
              >
                <CheckCircle2 className="w-4 h-4" />
                Update Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
