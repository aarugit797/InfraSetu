import { Layout } from "@/components/Layout";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_USERS, PROJECTS, TASKS } from "@/lib/mockData";
import { generateId } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  GripVertical,
  Plus,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ─── Priority config ────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; dot: string }
> = {
  critical: {
    label: "Critical",
    color: "bg-red-500/20 text-red-400 border border-red-500/30",
    dot: "bg-red-500",
  },
  high: {
    label: "High",
    color: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    dot: "bg-orange-500",
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    dot: "bg-yellow-500",
  },
  low: {
    label: "Low",
    color: "bg-green-500/20 text-green-400 border border-green-500/30",
    dot: "bg-green-500",
  },
};

const COLUMN_CONFIG: {
  status: TaskStatus;
  label: string;
  color: string;
  headerBg: string;
}[] = [
  {
    status: "pending",
    label: "Pending",
    color: "text-slate-400",
    headerBg: "bg-slate-500/20 border-slate-500/40",
  },
  {
    status: "inProgress",
    label: "In Progress",
    color: "text-blue-400",
    headerBg: "bg-blue-500/20 border-blue-500/40",
  },
  {
    status: "completed",
    label: "Completed",
    color: "text-emerald-400",
    headerBg: "bg-emerald-500/20 border-emerald-500/40",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isPastDue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

// ─── Task Card ───────────────────────────────────────────────────────────────
interface TaskCardProps {
  task: Task;
  onDragStart: (id: string) => void;
}

function TaskCard({ task, onDragStart }: TaskCardProps) {
  const project = PROJECTS.find((p) => p.id === task.projectId);
  const assignee = DEMO_USERS.find((u) => u.id === task.assignedTo);
  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = task.status !== "completed" && isPastDue(task.dueDate);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="glass rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:bg-card/60 transition-smooth group"
      data-ocid={`task-card-${task.id}`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-muted-foreground transition-smooth" />
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2 mb-1">
            {task.title}
          </p>
          {/* Project */}
          <p className="text-xs text-muted-foreground truncate mb-2">
            {project?.name}
          </p>
          {/* Priority badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${priority.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>
          {/* Footer: assignee + due date */}
          <div className="flex items-center justify-between mt-2.5 gap-2">
            {assignee ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-6 h-6 rounded-full bg-primary/30 border border-primary/40 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                  {getInitials(assignee.name)}
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {assignee.name.split(" ")[0]}
                </span>
              </div>
            ) : (
              <span />
            )}
            <div
              className={`flex items-center gap-1 text-xs shrink-0 ${overdue ? "text-red-400 font-medium" : "text-muted-foreground"}`}
            >
              {overdue && <AlertCircle className="w-3 h-3" />}
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(task.dueDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────
interface ColumnProps {
  status: TaskStatus;
  label: string;
  color: string;
  headerBg: string;
  tasks: Task[];
  onDragStart: (id: string) => void;
  onDrop: (status: TaskStatus) => void;
}

function KanbanColumn({
  status,
  label,
  color,
  headerBg,
  tasks,
  onDragStart,
  onDrop,
}: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`flex flex-col min-w-[280px] flex-1 rounded-2xl transition-smooth ${isDragOver ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => {
        setIsDragOver(false);
        onDrop(status);
      }}
      data-ocid={`kanban-col-${status}`}
    >
      {/* Column header */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${headerBg} mb-3`}
      >
        <span className={`font-display font-semibold text-sm ${color}`}>
          {label}
        </span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${headerBg} ${color} border-0`}
        >
          {tasks.length}
        </span>
      </div>
      {/* Cards */}
      <div className="flex flex-col gap-2.5 flex-1">
        {tasks.length === 0 ? (
          <div
            className={`glass-sm rounded-xl p-6 text-center text-muted-foreground text-sm border-dashed ${isDragOver ? "border-primary/50 text-primary" : ""}`}
          >
            Drop tasks here
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Create Task Form ─────────────────────────────────────────────────────────
interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: Task) => void;
}

function CreateTaskModal({ open, onClose, onSubmit }: CreateTaskModalProps) {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: PROJECTS[0]?.id ?? "",
    assignedTo: DEMO_USERS[0]?.id ?? "",
    priority: "medium" as TaskPriority,
    dueDate: "",
  });

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newTask: Task = {
      id: generateId(),
      projectId: form.projectId,
      title: form.title.trim(),
      description: form.description.trim(),
      assignedTo: form.assignedTo,
      status: "pending",
      priority: form.priority,
      dueDate: form.dueDate,
      startDate: new Date().toISOString().split("T")[0],
      createdBy: currentUser?.id ?? "u2",
      createdAt: Date.now(),
    };
    onSubmit(newTask);
    setForm({
      title: "",
      description: "",
      projectId: PROJECTS[0]?.id ?? "",
      assignedTo: DEMO_USERS[0]?.id ?? "",
      priority: "medium",
      dueDate: "",
    });
    onClose();
  }

  const inputCls =
    "w-full bg-background/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth";
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1.5";

  return (
    <Modal open={open} onClose={onClose} title="Assign New Task" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className={labelCls}>
            Task Title <span className="text-red-400">*</span>
          </label>
          <input
            id="task-title"
            className={inputCls}
            placeholder="e.g. Install drainage pipes – Section 4"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            data-ocid="task-title-input"
          />
        </div>
        <div>
          <label htmlFor="task-desc" className={labelCls}>
            Description
          </label>
          <textarea
            id="task-desc"
            className={`${inputCls} resize-none h-20`}
            placeholder="Optional task details..."
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            data-ocid="task-desc-input"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-project" className={labelCls}>
              Project <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                id="task-project"
                className={`${inputCls} appearance-none pr-7`}
                value={form.projectId}
                onChange={(e) => handleChange("projectId", e.target.value)}
                data-ocid="task-project-select"
              >
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label htmlFor="task-priority" className={labelCls}>
              Priority
            </label>
            <div className="relative">
              <select
                id="task-priority"
                className={`${inputCls} appearance-none pr-7`}
                value={form.priority}
                onChange={(e) =>
                  handleChange("priority", e.target.value as TaskPriority)
                }
                data-ocid="task-priority-select"
              >
                {(["low", "medium", "high", "critical"] as TaskPriority[]).map(
                  (p) => (
                    <option key={p} value={p}>
                      {PRIORITY_CONFIG[p].label}
                    </option>
                  ),
                )}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-assignee" className={labelCls}>
              Assign To <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                id="task-assignee"
                className={`${inputCls} appearance-none pr-7`}
                value={form.assignedTo}
                onChange={(e) => handleChange("assignedTo", e.target.value)}
                data-ocid="task-assignee-select"
              >
                {DEMO_USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label htmlFor="task-due" className={labelCls}>
              Due Date <span className="text-red-400">*</span>
            </label>
            <input
              id="task-due"
              type="date"
              className={inputCls}
              value={form.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              required
              data-ocid="task-due-input"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/30 transition-smooth"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-smooth"
            data-ocid="task-submit-btn"
          >
            Assign Task
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TaskBoardPage() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dragId = useRef<string | null>(null);

  const canAssign =
    currentUser?.role === "projectManager" ||
    currentUser?.role === "siteEngineer";

  const filteredTasks =
    selectedProject === "all"
      ? tasks
      : tasks.filter((t) => t.projectId === selectedProject);

  function handleDragStart(id: string) {
    dragId.current = id;
  }

  function handleDrop(newStatus: TaskStatus) {
    if (!dragId.current) return;
    const taskId = dragId.current;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    toast.success("Task status updated");
    dragId.current = null;
  }

  function handleCreateTask(task: Task) {
    setTasks((prev) => [task, ...prev]);
    toast.success("Task assigned successfully");
  }

  return (
    <Layout>
      <div className="flex flex-col min-h-0 h-full">
        {/* Page header */}
        <div className="glass-elevated border-b border-border/40 px-4 sm:px-6 py-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">
                Task Board
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Drag cards between columns to update status
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {/* Project filter */}
              <div className="relative">
                <select
                  className="bg-background/60 border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none transition-smooth"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  data-ocid="project-filter"
                >
                  <option value="all">All Projects</option>
                  {PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              {/* Assign Task button */}
              {canAssign && (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-3.5 py-2 rounded-lg transition-smooth"
                  data-ocid="assign-task-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Task</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
          <div className="flex gap-4 min-w-max sm:min-w-0 sm:grid sm:grid-cols-3 h-full">
            {COLUMN_CONFIG.map((col) => (
              <KanbanColumn
                key={col.status}
                {...col}
                tasks={filteredTasks.filter((t) => t.status === col.status)}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>

        {/* Create Task Modal */}
        <CreateTaskModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      </div>
    </Layout>
  );
}
