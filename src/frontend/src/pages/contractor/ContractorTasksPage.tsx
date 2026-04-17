import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { TASKS } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Filter,
  Plus,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

const WORKERS = [
  { id: "w1", name: "Ramesh Kumar", trade: "Mason" },
  { id: "w2", name: "Suresh Yadav", trade: "Welder" },
  { id: "w3", name: "Mahesh Singh", trade: "Helper" },
  { id: "w4", name: "Ganesh Patel", trade: "Carpenter" },
  { id: "w5", name: "Dinesh Verma", trade: "Electrician" },
  { id: "w6", name: "Santosh Gupta", trade: "Plumber" },
  { id: "w7", name: "Ravi Sharma", trade: "Mason" },
  { id: "w8", name: "Anil Tiwari", trade: "Helper" },
];

interface SubTask {
  id: string;
  parentTaskId: string;
  title: string;
  workerId: string;
  workerName: string;
  status: TaskStatus;
  dueDate: string;
}

const INITIAL_SUBTASKS: SubTask[] = [
  {
    id: "st1",
    parentTaskId: "t2",
    title: "Column shuttering south side",
    workerId: "w1",
    workerName: "Ramesh Kumar",
    status: "inProgress",
    dueDate: "2026-05-20",
  },
  {
    id: "st2",
    parentTaskId: "t2",
    title: "Rebar tying floor 2",
    workerId: "w2",
    workerName: "Suresh Yadav",
    status: "pending",
    dueDate: "2026-05-22",
  },
  {
    id: "st3",
    parentTaskId: "t3",
    title: "Formwork assembly",
    workerId: "w4",
    workerName: "Ganesh Patel",
    status: "completed",
    dueDate: "2026-05-18",
  },
];

const STATUS_ORDER: TaskStatus[] = [
  "pending",
  "inProgress",
  "completed",
  "blocked",
];

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const PROGRESS_MAP: Record<string, number> = {
  pending: 0,
  inProgress: 55,
  completed: 100,
  blocked: 30,
  cancelled: 0,
};

function AssignSubTaskModal({
  task,
  onClose,
  onAssign,
}: {
  task: Task;
  onClose: () => void;
  onAssign: (sub: Omit<SubTask, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit() {
    if (!title || !workerId || !dueDate) return;
    const worker = WORKERS.find((w) => w.id === workerId);
    onAssign({
      parentTaskId: task.id,
      title,
      workerId,
      workerName: worker?.name ?? "Unknown",
      status: "pending",
      dueDate,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        role="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div
        className="relative w-full max-w-md bg-card rounded-2xl p-5 space-y-4 shadow-xl border border-border"
        data-ocid="contractor-tasks.dialog"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-foreground text-lg">
            Assign Sub-Task
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-ocid="contractor-tasks.close_button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
          Task:{" "}
          <span className="font-medium text-foreground">{task.title}</span>
        </p>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="subtask-title"
              className="text-xs font-medium text-foreground mb-1.5 block"
            >
              Sub-task Title <span className="text-red-500">*</span>
            </label>
            <input
              id="subtask-title"
              className="w-full border border-input rounded-xl px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="Describe the work breakdown…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-ocid="contractor-tasks.subtask_title_input"
            />
          </div>
          <div>
            <label
              htmlFor="subtask-worker"
              className="text-xs font-medium text-foreground mb-1.5 block"
            >
              Assign Worker <span className="text-red-500">*</span>
            </label>
            <select
              id="subtask-worker"
              className="w-full border border-input rounded-xl px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              data-ocid="contractor-tasks.worker_select"
            >
              <option value="">Select worker…</option>
              {WORKERS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.trade}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="subtask-due"
              className="text-xs font-medium text-foreground mb-1.5 block"
            >
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              id="subtask-due"
              type="date"
              className="w-full border border-input rounded-xl px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              data-ocid="contractor-tasks.due_date_input"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 py-2.5 bg-muted border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors duration-200"
            data-ocid="contractor-tasks.cancel_button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-primary-foreground rounded-xl text-sm font-semibold transition-colors duration-200"
            data-ocid="contractor-tasks.submit_button"
            disabled={!title || !workerId || !dueDate}
            onClick={handleSubmit}
          >
            Assign Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractorTasksPage() {
  const { currentUser } = useAuth();
  const tasks = TASKS.filter((t) => t.assignedTo === (currentUser?.id ?? "u4"));
  const [subTasks, setSubTasks] = useState<SubTask[]>(INITIAL_SUBTASKS);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  function addSubTask(sub: Omit<SubTask, "id">) {
    setSubTasks((prev) => [...prev, { ...sub, id: `st${prev.length + 1}` }]);
  }

  function toggleSubTaskStatus(id: string) {
    setSubTasks((prev) =>
      prev.map((st) =>
        st.id === id
          ? {
              ...st,
              status: st.status === "completed" ? "pending" : "completed",
            }
          : st,
      ),
    );
  }

  const filtered = tasks.filter(
    (t) => filterStatus === "all" || t.status === filterStatus,
  );

  const counts: Record<string, number> = {};
  for (const s of STATUS_ORDER)
    counts[s] = tasks.filter((t) => t.status === s).length;

  return (
    <div
      className="bg-muted min-h-screen p-4 space-y-5"
      data-ocid="contractor-tasks.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            Tasks
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {tasks.length} assigned tasks
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((p) => !p)}
          data-ocid="contractor-tasks.filter.tab"
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-foreground hover:border-primary/40 transition-colors duration-200 shadow-sm"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["all", ...STATUS_ORDER] as const).map((s) => (
          <button
            key={s}
            type="button"
            data-ocid={`contractor-tasks.${s}_tab`}
            onClick={() => setFilterStatus(s as TaskStatus | "all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200 ${
              filterStatus === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            {s === "all" ? "All" : s.replace(/([A-Z])/g, " $1")}
            {s !== "all" && (
              <span className="ml-1 opacity-70">({counts[s] ?? 0})</span>
            )}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Filter by status
          </p>
          <div className="flex flex-wrap gap-2">
            {["all", ...STATUS_ORDER].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setFilterStatus(s as TaskStatus | "all");
                  setShowFilters(false);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                  filterStatus === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-foreground border-border hover:border-primary/40"
                }`}
              >
                {s === "all" ? "All" : s.replace(/([A-Z])/g, " $1")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-3" data-ocid="contractor-tasks.list">
        {filtered.map((task, i) => {
          const taskSubTasks = subTasks.filter(
            (s) => s.parentTaskId === task.id,
          );
          const isExpanded = expandedTask === task.id;
          const progress = PROGRESS_MAP[task.status] ?? 0;

          return (
            <div
              key={task.id}
              className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
              data-ocid={`contractor-tasks.item.${i + 1}`}
            >
              {/* Task header */}
              <button
                type="button"
                className="w-full text-left p-4 hover:bg-muted/50 transition-colors duration-200"
                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-foreground leading-snug flex-1">
                    {task.title}
                  </p>
                  <StatusBadge status={task.status} size="sm" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[task.priority] ?? "bg-muted text-foreground border-border"}`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due {formatDate(task.dueDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-primary font-semibold w-8 text-right">
                    {progress}%
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {/* Expanded: sub-tasks */}
              {isExpanded && (
                <div className="border-t border-border">
                  <div className="px-4 py-3 bg-muted/40">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Worker Assignments ({taskSubTasks.length})
                      </p>
                      <button
                        type="button"
                        data-ocid={`contractor-tasks.assign_button.${i + 1}`}
                        onClick={() => setAssigningTask(task)}
                        className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Assign
                      </button>
                    </div>

                    {taskSubTasks.length === 0 ? (
                      <div className="text-center py-4">
                        <User className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">
                          No sub-tasks assigned yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {taskSubTasks.map((sub, si) => (
                          <div
                            key={sub.id}
                            className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
                            data-ocid={`contractor-tasks.subtask.${si + 1}`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleSubTaskStatus(sub.id)}
                              data-ocid={`contractor-tasks.subtask_toggle.${si + 1}`}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                                sub.status === "completed"
                                  ? "bg-green-500 border-green-500"
                                  : "border-border hover:border-primary"
                              }`}
                            >
                              {sub.status === "completed" && (
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium truncate ${sub.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}
                              >
                                {sub.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {sub.workerName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  · Due {formatDate(sub.dueDate)}
                                </span>
                              </div>
                            </div>
                            <StatusBadge status={sub.status} size="sm" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div
            className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm"
            data-ocid="contractor-tasks.empty_state"
          >
            <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No tasks found</p>
            <p className="text-muted-foreground text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      {assigningTask && (
        <AssignSubTaskModal
          task={assigningTask}
          onClose={() => setAssigningTask(null)}
          onAssign={addSubTask}
        />
      )}
    </div>
  );
}
