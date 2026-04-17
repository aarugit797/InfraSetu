import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_USERS, PROJECTS, TASKS } from "@/lib/mockData";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { Filter, Plus, X } from "lucide-react";
import { useState } from "react";

const priorityBadge: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const columnDef: {
  key: TaskStatus;
  label: string;
  accentBar: string;
  countBg: string;
}[] = [
  {
    key: "pending",
    label: "Pending",
    accentBar: "border-t-amber-400",
    countBg: "bg-amber-100 text-amber-700",
  },
  {
    key: "inProgress",
    label: "In Progress",
    accentBar: "border-t-blue-400",
    countBg: "bg-blue-100 text-blue-700",
  },
  {
    key: "completed",
    label: "Completed",
    accentBar: "border-t-emerald-400",
    countBg: "bg-emerald-100 text-emerald-700",
  },
];

// Contractors only — tasks are assigned to contractors per spec
const contractorUsers = DEMO_USERS.filter((u) => u.role === "contractor");

function initials(userId: string) {
  const u = DEMO_USERS.find((u) => u.id === userId);
  if (!u) return "?";
  return u.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface DetailModalProps {
  task: Task;
  onClose: () => void;
  onStatusChange: (id: string, s: TaskStatus) => void;
}

function DetailModal({ task, onClose, onStatusChange }: DetailModalProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const assignee = DEMO_USERS.find((u) => u.id === task.assignedTo);
  return (
    <div
      className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      data-ocid="tasks.dialog"
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-bold text-base text-foreground">{task.title}</h2>
          <button
            type="button"
            onClick={onClose}
            data-ocid="tasks.close_button"
          >
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{task.description}</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Assignee: </span>
            <span className="text-foreground font-medium">
              {assignee?.name ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Priority: </span>
            <Badge
              className={`text-xs border-0 ${priorityBadge[task.priority]} hover:opacity-80`}
            >
              {task.priority}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Due: </span>
            <span className="text-foreground">{task.dueDate}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Project: </span>
            <span className="text-foreground">
              {PROJECTS.find((p) => p.id === task.projectId)?.name ?? "—"}
            </span>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Update Status</Label>
          <Select
            value={task.status}
            onValueChange={(v) => onStatusChange(task.id, v as TaskStatus)}
          >
            <SelectTrigger
              className="mt-1 border-input focus:ring-primary/20"
              data-ocid="tasks.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                [
                  "pending",
                  "inProgress",
                  "completed",
                  "blocked",
                ] as TaskStatus[]
              ).map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "inProgress"
                    ? "In Progress"
                    : s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Comments</Label>
          <div className="space-y-2 mt-1 max-h-28 overflow-y-auto">
            {comments.length === 0 && (
              <p className="text-xs text-muted-foreground">No comments yet</p>
            )}
            {comments.map((c, i) => (
              <div
                key={`comment-${String(i)}`}
                className="text-xs bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground"
              >
                {c}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add a comment…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-xs border-input focus:border-primary focus:ring-primary/20"
              data-ocid="tasks.textarea"
            />
            <Button
              size="sm"
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
              onClick={() => {
                if (comment) {
                  setComments((prev) => [...prev, comment]);
                  setComment("");
                }
              }}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagerTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Task | null>(null);
  const [filterContractor, setFilterContractor] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    contractor: "",
    priority: "medium" as TaskPriority,
    dueDate: "",
    project: "p1",
  });

  const filtered = tasks.filter((t) => {
    if (filterContractor !== "all" && t.assignedTo !== filterContractor)
      return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  function handleCreate() {
    if (!form.title) return;
    const t: Task = {
      id: `t${Date.now()}`,
      projectId: form.project,
      title: form.title,
      description: form.description,
      assignedTo: form.contractor || contractorUsers[0]?.id || "u4",
      status: "pending",
      priority: form.priority,
      dueDate: form.dueDate,
      startDate: new Date().toISOString().split("T")[0],
      createdBy: "u2",
      createdAt: Date.now(),
    };
    setTasks((prev) => [t, ...prev]);
    setShowCreate(false);
    setForm({
      title: "",
      description: "",
      contractor: "",
      priority: "medium",
      dueDate: "",
      project: "p1",
    });
  }

  function handleStatusChange(id: string, s: TaskStatus) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: s } : t)),
    );
    if (detail?.id === id) setDetail((d) => (d ? { ...d, status: s } : d));
  }

  return (
    <>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 bg-muted/20 min-h-screen">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <h1 className="text-2xl font-bold text-foreground">Task Board</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-4">
              {tasks.length} total tasks · Assign to contractors
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-2 py-1">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <Select
                value={filterContractor}
                onValueChange={setFilterContractor}
              >
                <SelectTrigger
                  className="h-7 text-xs border-0 bg-transparent w-32 focus:ring-0 text-foreground"
                  data-ocid="tasks.filter.tab"
                >
                  <SelectValue placeholder="Contractor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contractors</SelectItem>
                  {contractorUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="h-7 text-xs border-0 bg-transparent w-28 focus:ring-0 text-foreground">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {(
                    ["low", "medium", "high", "critical"] as TaskPriority[]
                  ).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreate(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="tasks.add_button"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Task
            </Button>
          </div>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columnDef.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className={`rounded-xl border-2 border-border border-t-4 ${col.accentBar} bg-card overflow-hidden shadow-sm`}
                data-ocid={`tasks.${col.key}.list`}
              >
                <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
                  <span className="font-semibold text-sm text-foreground">
                    {col.label}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countBg}`}
                  >
                    {colTasks.length}
                  </span>
                </div>
                <div className="p-3 space-y-2 min-h-[200px]">
                  {colTasks.map((task, idx) => {
                    const assignee = DEMO_USERS.find(
                      (u) => u.id === task.assignedTo,
                    );
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => setDetail(task)}
                        className="w-full text-left bg-background rounded-lg border border-border p-3 space-y-2 hover:shadow-md hover:border-primary/40 transition-all"
                        data-ocid={`tasks.item.${idx + 1}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {task.title}
                          </p>
                          <Badge
                            className={`text-xs shrink-0 border-0 ${priorityBadge[task.priority]} hover:opacity-80`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                              {initials(task.assignedTo)}
                            </div>
                            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                              {assignee?.name ?? "—"}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {task.dueDate}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div
                      className="text-center py-8 text-muted-foreground text-xs"
                      data-ocid={`tasks.${col.key}.empty_state`}
                    >
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-foreground">Create Task</h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                data-ocid="tasks.close_button"
              >
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Task Name *
                </Label>
                <Input
                  placeholder="e.g. Concrete Pouring Zone D"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                  data-ocid="tasks.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Description
                </Label>
                <Input
                  placeholder="Brief description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Assign to Contractor
                  </Label>
                  <Select
                    value={form.contractor}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, contractor: v }))
                    }
                  >
                    <SelectTrigger className="mt-1 border-input focus:ring-primary/20">
                      <SelectValue placeholder="Select contractor" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractorUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Priority
                  </Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, priority: v as TaskPriority }))
                    }
                  >
                    <SelectTrigger className="mt-1 border-input focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        ["low", "medium", "high", "critical"] as TaskPriority[]
                      ).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Project
                  </Label>
                  <Select
                    value={form.project}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, project: v }))
                    }
                  >
                    <SelectTrigger className="mt-1 border-input focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECTS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Deadline
                  </Label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dueDate: e.target.value }))
                    }
                    className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreate(false)}
                className="border-border text-foreground hover:bg-muted"
                data-ocid="tasks.cancel_button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-ocid="tasks.submit_button"
              >
                Create Task
              </Button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <DetailModal
          task={detail}
          onClose={() => setDetail(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
