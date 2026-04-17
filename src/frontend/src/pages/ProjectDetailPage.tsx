import { Layout } from "@/components/Layout";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_USERS, EXPENSES, ISSUES, PROJECTS, TASKS } from "@/lib/mockData";
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  generateId,
  getPriorityColor,
  getProgressColor,
  getRoleBadgeColor,
  getRoleDisplayName,
  getStatusColor,
} from "@/lib/utils";
import type {
  Document,
  Expense,
  ExpenseCategory,
  ExpenseStatus,
  Issue,
  IssuePriority,
  IssueStatus,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  File,
  FileText,
  Image as ImageIcon,
  IndianRupee,
  MapPin,
  Plus,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Mock Documents ────────────────────────────────────────────────────────────
const MOCK_DOCUMENTS: Document[] = [
  {
    id: "d1",
    projectId: "p1",
    title: "Structural Design Blueprint",
    type: "blueprint",
    fileUrl: "#",
    fileSize: 2450000,
    version: 2,
    uploadedBy: "u3",
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: "d2",
    projectId: "p1",
    title: "Phase 1 Completion Report",
    type: "report",
    fileUrl: "#",
    fileSize: 890000,
    version: 1,
    uploadedBy: "u2",
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    id: "d3",
    projectId: "p1",
    title: "Contractor Agreement – Patel Infra",
    type: "contract",
    fileUrl: "#",
    fileSize: 340000,
    version: 1,
    uploadedBy: "u1",
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    id: "d4",
    projectId: "p2",
    title: "School Complex Layout Plan",
    type: "blueprint",
    fileUrl: "#",
    fileSize: 3100000,
    version: 1,
    uploadedBy: "u3",
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: "d5",
    projectId: "p2",
    title: "Foundation Inspection Report",
    type: "report",
    fileUrl: "#",
    fileSize: 560000,
    version: 1,
    uploadedBy: "u3",
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: "d6",
    projectId: "p3",
    title: "Environmental Impact Assessment",
    type: "report",
    fileUrl: "#",
    fileSize: 4200000,
    version: 3,
    uploadedBy: "u3",
    createdAt: Date.now() - 5 * 86400000,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const DOC_TYPE_LABELS: Record<Document["type"], string> = {
  blueprint: "Blueprint",
  report: "Report",
  contract: "Contract",
  permit: "Permit",
  invoice: "Invoice",
  photo: "Photo",
};

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  inProgress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
  cancelled: "Cancelled",
};

const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: "Open",
  inProgress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  escalated: "Escalated",
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
  return `${(bytes / 1000).toFixed(0)} KB`;
}

function getUserName(id: string): string {
  return DEMO_USERS.find((u) => u.id === id)?.name ?? "Unknown";
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ project }: { project: (typeof PROJECTS)[number] }) {
  const teamUsers = DEMO_USERS.filter((u) =>
    project.teamMembers.includes(u.id),
  );
  const budgetUsed = Math.round((project.actualCost / project.budget) * 100);
  const progressColor = getProgressColor(project.progress);

  const milestones = [
    { label: "Project Initiated", done: true, date: project.startDate },
    { label: "Foundation Complete", done: project.progress > 20, date: "" },
    { label: "Structural Phase", done: project.progress > 50, date: "" },
    { label: "Finishing Work", done: project.progress > 80, date: "" },
    {
      label: "Handover",
      done: project.status === "completed",
      date: project.endDate,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-5">
        {/* Description */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <h3 className="font-display font-semibold text-foreground">
            About This Project
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {project.description}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Start Date</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(project.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">End Date</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(project.endDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Budget breakdown */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-display font-semibold text-foreground">
            Budget Utilization
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(project.actualCost)} spent of{" "}
                {formatCurrency(project.budget)}
              </span>
              <span
                className={cn(
                  "font-semibold",
                  budgetUsed > 90
                    ? "text-red-400"
                    : budgetUsed > 70
                      ? "text-amber-400"
                      : "text-emerald-400",
                )}
              >
                {budgetUsed}%
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  budgetUsed > 90
                    ? "bg-red-500"
                    : budgetUsed > 70
                      ? "bg-amber-500"
                      : "bg-emerald-500",
                )}
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Total Budget",
                value: formatCurrency(project.budget),
                color: "text-primary",
              },
              {
                label: "Spent",
                value: formatCurrency(project.actualCost),
                color: "text-amber-400",
              },
              {
                label: "Remaining",
                value: formatCurrency(
                  Math.max(0, project.budget - project.actualCost),
                ),
                color: "text-emerald-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-sm rounded-xl p-3 text-center"
              >
                <p className={cn("text-base font-bold font-display", s.color)}>
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-foreground">
              Overall Progress
            </h3>
            <span className="text-2xl font-bold font-display text-primary">
              {project.progress}%
            </span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progressColor,
              )}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-5">
        {/* Team */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground">
              Team Members
            </h3>
          </div>
          <div className="space-y-2">
            {teamUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 glass-sm rounded-xl p-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">
                    {u.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {u.name}
                  </p>
                  <Badge
                    className={cn(
                      "text-xs px-1.5 py-0 border mt-0.5",
                      getRoleBadgeColor(u.role),
                    )}
                  >
                    {getRoleDisplayName(u.role)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone timeline */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <h3 className="font-display font-semibold text-foreground">
            Timeline
          </h3>
          <div className="space-y-3">
            {milestones.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    m.done
                      ? "border-emerald-500 bg-emerald-500/20"
                      : "border-muted-foreground/40 bg-muted/30",
                  )}
                >
                  {m.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm truncate",
                      m.done ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {m.label}
                  </p>
                  {m.date && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(m.date)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tasks Tab ─────────────────────────────────────────────────────────────────
function TasksTab({ projectId }: { projectId: string }) {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(
    TASKS.filter((t) => t.projectId === projectId),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "u3",
    status: "pending" as TaskStatus,
    priority: "medium" as TaskPriority,
    dueDate: "",
    startDate: "",
  });

  const canCreate =
    currentUser?.role === "projectManager" ||
    currentUser?.role === "siteEngineer";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t: Task = {
      id: generateId("t"),
      projectId,
      ...form,
      createdBy: currentUser?.id ?? "u2",
      createdAt: Date.now(),
      dependencies: [],
    };
    setTasks((prev) => [t, ...prev]);
    setModalOpen(false);
    toast.success("Task created!");
  }

  const grouped: Record<TaskStatus, Task[]> = {
    pending: [],
    inProgress: [],
    completed: [],
    blocked: [],
    cancelled: [],
  };
  for (const t of tasks) {
    grouped[t.status].push(t);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {tasks.length} tasks total
        </p>
        {canCreate && (
          <Button
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={() => setModalOpen(true)}
            data-ocid="create-task-btn"
          >
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div
          className="glass rounded-2xl p-12 text-center"
          data-ocid="tasks-empty"
        >
          <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No tasks yet</p>
          <p className="text-muted-foreground text-sm">
            Create the first task for this project
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="tasks-list">
          {tasks.map((task) => {
            const sc = getStatusColor(task.status);
            const pc = getPriorityColor(task.priority);
            return (
              <div
                key={task.id}
                className="glass rounded-xl p-4 flex items-start gap-4 hover:border-border/60 transition-smooth"
                data-ocid="task-row"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge
                      label={TASK_STATUS_LABELS[task.status]}
                      colorClasses={sc}
                      size="sm"
                    />
                    <StatusBadge
                      label={
                        task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)
                      }
                      colorClasses={pc}
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {getUserName(task.assignedTo)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className="text-xs font-medium text-foreground">
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Task"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title *</Label>
            <Input
              id="task-title"
              required
              placeholder="Task title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              data-ocid="create-task-title"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <textarea
              id="task-desc"
              rows={2}
              placeholder="Describe the task..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, priority: v as TaskPriority }))
                }
              >
                <SelectTrigger id="task-priority">
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
            <div className="space-y-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as TaskStatus }))
                }
              >
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(TASK_STATUS_LABELS) as [TaskStatus, string][]
                  ).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-start">Start Date</Label>
              <Input
                id="task-start"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due Date</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                data-ocid="create-task-due"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              data-ocid="create-task-submit"
            >
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Issues Tab ────────────────────────────────────────────────────────────────
function IssuesTab({ projectId }: { projectId: string }) {
  const { currentUser } = useAuth();
  const [issues, setIssues] = useState<Issue[]>(
    ISSUES.filter((i) => i.projectId === projectId),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as IssuePriority,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const issue: Issue = {
      id: generateId("i"),
      projectId,
      ...form,
      status: "open" as IssueStatus,
      reportedBy: currentUser?.id ?? "u3",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setIssues((prev) => [issue, ...prev]);
    setModalOpen(false);
    toast.success("Issue reported!");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{issues.length} issues</p>
        <Button
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90"
          onClick={() => setModalOpen(true)}
          data-ocid="report-issue-btn"
        >
          <AlertCircle className="w-4 h-4" /> Report Issue
        </Button>
      </div>

      {issues.length === 0 ? (
        <div
          className="glass rounded-2xl p-12 text-center"
          data-ocid="issues-empty"
        >
          <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No issues reported</p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="issues-list">
          {issues.map((issue) => {
            const sc = getStatusColor(issue.status);
            const pc = getPriorityColor(issue.priority);
            return (
              <div
                key={issue.id}
                className="glass rounded-xl p-4 space-y-2 hover:border-border/60 transition-smooth"
                data-ocid="issue-row"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {issue.title}
                  </p>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <StatusBadge
                      label={
                        issue.priority.charAt(0).toUpperCase() +
                        issue.priority.slice(1)
                      }
                      colorClasses={pc}
                      size="sm"
                    />
                    <StatusBadge
                      label={ISSUE_STATUS_LABELS[issue.status]}
                      colorClasses={sc}
                      size="sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {issue.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Reported by {getUserName(issue.reportedBy)}</span>
                  <span>{formatDateTime(issue.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Report Issue"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="issue-title">Title *</Label>
            <Input
              id="issue-title"
              required
              placeholder="Brief issue title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              data-ocid="report-issue-title"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issue-desc">Description *</Label>
            <textarea
              id="issue-desc"
              rows={3}
              required
              placeholder="Describe the issue in detail..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issue-priority">Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, priority: v as IssuePriority }))
              }
            >
              <SelectTrigger id="issue-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["low", "medium", "high", "critical"] as IssuePriority[]).map(
                  (p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              data-ocid="report-issue-submit"
            >
              Submit Issue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Documents Tab ─────────────────────────────────────────────────────────────
function DocumentsTab({ projectId }: { projectId: string }) {
  const [docs, setDocs] = useState<Document[]>(
    MOCK_DOCUMENTS.filter((d) => d.projectId === projectId),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "report" as Document["type"],
  });
  const { currentUser } = useAuth();

  const docIcons: Record<Document["type"], typeof FileText> = {
    blueprint: FileText,
    report: FileText,
    contract: FileText,
    permit: FileText,
    invoice: FileText,
    photo: ImageIcon,
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const doc: Document = {
      id: generateId("d"),
      projectId,
      ...form,
      fileUrl: "#",
      fileSize: 500000,
      version: 1,
      uploadedBy: currentUser?.id ?? "u3",
      createdAt: Date.now(),
    };
    setDocs((prev) => [doc, ...prev]);
    setModalOpen(false);
    toast.success("Document added!");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{docs.length} documents</p>
        <Button
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90"
          onClick={() => setModalOpen(true)}
          data-ocid="upload-doc-btn"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      {docs.length === 0 ? (
        <div
          className="glass rounded-2xl p-12 text-center"
          data-ocid="docs-empty"
        >
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No documents uploaded</p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="docs-list">
          {docs.map((doc) => {
            const Icon = docIcons[doc.type] ?? File;
            return (
              <div
                key={doc.id}
                className="glass rounded-xl p-4 flex items-center gap-4 hover:border-border/60 transition-smooth"
                data-ocid="doc-row"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {doc.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {DOC_TYPE_LABELS[doc.type]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      v{doc.version} • {formatFileSize(doc.fileSize)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {getUserName(doc.uploadedBy)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(doc.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload Document"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="doc-title">Document Name *</Label>
            <Input
              id="doc-title"
              required
              placeholder="e.g. Site Survey Report Q2"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              data-ocid="upload-doc-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-type">Document Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, type: v as Document["type"] }))
              }
            >
              <SelectTrigger id="doc-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(DOC_TYPE_LABELS) as [
                    Document["type"],
                    string,
                  ][]
                ).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              data-ocid="upload-doc-submit"
            >
              Add Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Finance Tab ───────────────────────────────────────────────────────────────
const EXPENSE_STATUS_COLORS: Record<ExpenseStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

function FinanceTab({ project }: { project: (typeof PROJECTS)[number] }) {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>(
    EXPENSES.filter((e) => e.projectId === project.id),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    category: "Labor" as ExpenseCategory,
    description: "",
    date: "",
  });

  const budgetUsed = Math.round((project.actualCost / project.budget) * 100);
  const canAdd =
    currentUser?.role === "projectManager" ||
    currentUser?.role === "contractor";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const expense: Expense = {
      id: generateId("e"),
      projectId: project.id,
      amount: Number.parseFloat(form.amount),
      category: form.category,
      description: form.description,
      date: form.date,
      submittedBy: currentUser?.id ?? "u4",
      status: "pending",
      createdAt: Date.now(),
    };
    setExpenses((prev) => [expense, ...prev]);
    setModalOpen(false);
    toast.success("Expense submitted for approval!");
  }

  return (
    <div className="space-y-5">
      {/* Budget summary */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-primary" /> Budget Overview
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(project.actualCost)} of{" "}
              {formatCurrency(project.budget)}
            </span>
            <span
              className={cn(
                "font-bold",
                budgetUsed > 90
                  ? "text-red-400"
                  : budgetUsed > 70
                    ? "text-amber-400"
                    : "text-emerald-400",
              )}
            >
              {budgetUsed}% utilized
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                budgetUsed > 90
                  ? "bg-red-500"
                  : budgetUsed > 70
                    ? "bg-amber-500"
                    : "bg-emerald-500",
              )}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Budget",
              value: formatCurrency(project.budget),
              color: "text-primary",
            },
            {
              label: "Actual Cost",
              value: formatCurrency(project.actualCost),
              color: "text-amber-400",
            },
            {
              label: "Remaining",
              value: formatCurrency(
                Math.max(0, project.budget - project.actualCost),
              ),
              color: "text-emerald-400",
            },
            {
              label: "Variance",
              value: `${budgetUsed > 100 ? "+" : ""}${budgetUsed - 100}%`,
              color: budgetUsed > 100 ? "text-red-400" : "text-emerald-400",
            },
          ].map((s) => (
            <div key={s.label} className="glass-sm rounded-xl p-3">
              <p className={cn("text-sm font-bold font-display", s.color)}>
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expense table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-border/30">
          <h3 className="font-display font-semibold text-foreground">
            Expense Records
          </h3>
          {canAdd && (
            <Button
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => setModalOpen(true)}
              data-ocid="add-expense-btn"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </Button>
          )}
        </div>
        <div className="divide-y divide-border/20">
          {expenses.length === 0 ? (
            <div
              className="p-8 text-center text-muted-foreground text-sm"
              data-ocid="expenses-empty"
            >
              No expenses recorded.
            </div>
          ) : (
            expenses.map((exp) => (
              <div
                key={exp.id}
                className="px-5 py-3.5 flex items-center gap-4 hover:bg-card/30 transition-smooth"
                data-ocid="expense-row"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {exp.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {exp.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {exp.date}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    {formatCurrency(exp.amount)}
                  </p>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-medium",
                      EXPENSE_STATUS_COLORS[exp.status],
                    )}
                  >
                    {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Expense"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="exp-desc">Description *</Label>
              <Input
                id="exp-desc"
                required
                placeholder="What was this expense for?"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                data-ocid="add-expense-desc"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp-amount">Amount (₹) *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="exp-amount"
                  type="number"
                  required
                  placeholder="0"
                  className="pl-9"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  min="0"
                  data-ocid="add-expense-amount"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp-cat">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as ExpenseCategory }))
                }
              >
                <SelectTrigger id="exp-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "Labor",
                      "Materials",
                      "Equipment",
                      "Services",
                      "Overhead",
                      "Miscellaneous",
                    ] as ExpenseCategory[]
                  ).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="exp-date">Date</Label>
              <Input
                id="exp-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                data-ocid="add-expense-date"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              data-ocid="add-expense-submit"
            >
              Submit Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams({ from: "/projects/$id" });
  const project = PROJECTS.find((p) => p.id === id);
  const statusColor = getStatusColor(project?.status ?? "planning");

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="text-foreground font-semibold text-lg">
              Project not found
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              The project you're looking for doesn't exist.
            </p>
          </div>
          <Link to="/projects">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const STATUS_LABELS: Record<string, string> = {
    planning: "Planning",
    active: "Active",
    onHold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-5">
        {/* Back button */}
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors"
          data-ocid="back-to-projects"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Projects</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {project.name}
          </span>
        </Link>

        {/* Project Header */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3 justify-between flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-foreground text-xl lg:text-2xl leading-snug">
                {project.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge
                  label={STATUS_LABELS[project.status]}
                  colorClasses={statusColor}
                />
                <span className="text-muted-foreground text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {project.location}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: IndianRupee,
                label: "Budget",
                value: formatCurrency(project.budget),
                color: "text-primary",
              },
              {
                icon: TrendingUp,
                label: "Spent",
                value: formatCurrency(project.actualCost),
                color:
                  project.actualCost > project.budget
                    ? "text-red-400"
                    : "text-amber-400",
              },
              {
                icon: Calendar,
                label: "Start",
                value: formatDate(project.startDate),
                color: "text-foreground",
              },
              {
                icon: Calendar,
                label: "End",
                value: formatDate(project.endDate),
                color: "text-foreground",
              },
            ].map((s) => (
              <div key={s.label} className="glass-sm rounded-xl p-3">
                <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                  <s.icon className="w-3 h-3" />
                  <span>{s.label}</span>
                </div>
                <p className={cn("text-sm font-semibold", s.color)}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion Progress</span>
              <span className="font-semibold text-foreground">
                {project.progress}%
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  getProgressColor(project.progress),
                )}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList
            className="w-full sm:w-auto bg-card/40 border border-border/30 p-1 flex overflow-x-auto"
            data-ocid="project-tabs"
          >
            {[
              { value: "overview", label: "Overview" },
              { value: "tasks", label: "Tasks" },
              { value: "issues", label: "Issues" },
              { value: "documents", label: "Documents" },
              { value: "finance", label: "Finance" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm px-4"
                data-ocid={`tab-${tab.value}`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab project={project} />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="issues">
            <IssuesTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentsTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="finance">
            <FinanceTab project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
