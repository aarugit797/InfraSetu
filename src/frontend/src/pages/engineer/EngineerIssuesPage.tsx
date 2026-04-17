import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { ISSUES, PROJECTS, TASKS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import type { Issue, IssuePriority } from "@/types";
import { AlertTriangle, CheckCircle2, Clock, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type IssueType = "delay" | "safety" | "material";

interface LocalIssue {
  id: string;
  type: IssueType;
  description: string;
  severity: IssuePriority;
  projectId: string;
  taskId: string;
  status: "open" | "inProgress" | "resolved";
  reportedBy: string;
  createdAt: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 border-red-300 text-red-700",
  high: "bg-orange-100 border-orange-300 text-orange-700",
  medium: "bg-amber-100 border-amber-300 text-amber-700",
  low: "bg-slate-100 border-slate-300 text-slate-600",
};

const TYPE_COLORS: Record<IssueType, string> = {
  delay: "bg-blue-100 border-blue-300 text-blue-700",
  safety: "bg-red-100 border-red-300 text-red-700",
  material: "bg-orange-100 border-orange-300 text-orange-700",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-100 border-amber-300 text-amber-800",
  inProgress: "bg-blue-100 border-blue-300 text-blue-800",
  resolved: "bg-green-100 border-green-300 text-green-700",
};

function mapToLocalIssue(issue: Issue): LocalIssue {
  return {
    id: issue.id,
    type: "safety" as IssueType,
    description: issue.description,
    severity: (issue.priority as IssuePriority) ?? "medium",
    projectId: issue.projectId ?? "",
    taskId: "",
    status: (issue.status as LocalIssue["status"]) ?? "open",
    reportedBy: issue.reportedBy ?? "",
    createdAt: issue.createdAt ?? Date.now(),
  };
}

export default function EngineerIssuesPage() {
  const { currentUser } = useAuth();
  const [issues, setIssues] = useState<LocalIssue[]>(() =>
    ISSUES.filter((i) => i.reportedBy === currentUser?.id).map(mapToLocalIssue),
  );
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Form state
  const [type, setType] = useState<IssueType>("safety");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IssuePriority>("medium");
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");

  const projectTasks = TASKS.filter((t) => t.projectId === projectId);

  function handleSubmit() {
    if (!description.trim() || !projectId) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newIssue: LocalIssue = {
      id: `iss_${Date.now()}`,
      type,
      description,
      severity,
      projectId,
      taskId,
      status: "open",
      reportedBy: currentUser?.id ?? "",
      createdAt: Date.now(),
    };
    setIssues((prev) => [newIssue, ...prev]);
    setShowForm(false);
    setDescription("");
    setType("safety");
    setSeverity("medium");
    setProjectId("");
    setTaskId("");
    toast.success("Issue reported successfully");
  }

  const filtered = issues.filter((i) => {
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (filterType !== "all" && i.type !== filterType) return false;
    return true;
  });

  function getProjectName(id: string) {
    return PROJECTS.find((p) => p.id === id)?.name ?? id;
  }
  function getTaskName(id: string) {
    return TASKS.find((t) => t.id === id)?.title ?? "";
  }

  return (
    <div
      className="p-4 space-y-4 bg-slate-50 min-h-screen"
      data-ocid="engineer-issues.page"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h1 className="font-display text-xl font-bold text-slate-800">
            Issue Reports
          </h1>
        </div>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 gap-1.5 border-0"
          onClick={() => setShowForm(true)}
          data-ocid="engineer-issues.report-button"
        >
          <Plus className="w-4 h-4" />
          Report Issue
        </Button>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap">
        {(["open", "inProgress", "resolved"] as const).map((s) => {
          const count = issues.filter((i) => i.status === s).length;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-medium border transition-colors",
                filterStatus === s
                  ? STATUS_COLORS[s]
                  : "bg-white border-slate-200 text-slate-600",
              )}
              data-ocid={`engineer-issues.filter.${s}.tab`}
            >
              {s === "inProgress"
                ? "In Progress"
                : s.charAt(0).toUpperCase() + s.slice(1)}{" "}
              ({count})
            </button>
          );
        })}
      </div>

      {/* Type filter */}
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger
          className="bg-white border-slate-200 h-9 rounded-xl text-sm text-slate-700"
          data-ocid="engineer-issues.type-filter.select"
        >
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="delay">Delay</SelectItem>
          <SelectItem value="safety">Safety</SelectItem>
          <SelectItem value="material">Material</SelectItem>
        </SelectContent>
      </Select>

      {/* Issue list */}
      <div className="space-y-3" data-ocid="engineer-issues.list">
        {filtered.length === 0 && (
          <div
            className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm"
            data-ocid="engineer-issues.empty_state"
          >
            <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">No issues found</p>
            <p className="text-sm text-slate-500 mt-1">
              Issues you report will appear here
            </p>
          </div>
        )}
        {filtered.map((issue, idx) => (
          <Card
            key={issue.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3"
            data-ocid={`engineer-issues.item.${idx + 1}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={cn(
                      "text-xs border capitalize",
                      TYPE_COLORS[issue.type],
                    )}
                  >
                    {issue.type}
                  </Badge>
                  <Badge
                    className={cn(
                      "text-xs border capitalize",
                      SEVERITY_COLORS[issue.severity],
                    )}
                  >
                    {issue.severity}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                  {issue.description}
                </p>
              </div>
              <Badge
                className={cn(
                  "text-xs border flex-shrink-0 capitalize",
                  STATUS_COLORS[issue.status],
                )}
              >
                {issue.status === "inProgress" ? "In Progress" : issue.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              {issue.projectId && (
                <span className="truncate">
                  {getProjectName(issue.projectId)}
                </span>
              )}
              {issue.taskId && (
                <span className="truncate text-amber-600">
                  {getTaskName(issue.taskId)}
                </span>
              )}
              <span className="flex items-center gap-1 flex-shrink-0 ml-auto">
                <Clock className="w-3 h-3" />
                {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Report Issue Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          data-ocid="engineer-issues.form.dialog"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800 text-lg">
                Report Issue
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-700"
                data-ocid="engineer-issues.form.close-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Issue Type *
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["delay", "safety", "material"] as IssueType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-medium border transition-colors capitalize",
                        type === t
                          ? TYPE_COLORS[t]
                          : "bg-slate-50 border-slate-200 text-slate-600",
                      )}
                      data-ocid={`engineer-issues.form.type.${t}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Description *
                </Label>
                <Textarea
                  placeholder="Describe the issue clearly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm resize-none text-slate-800"
                  rows={4}
                  data-ocid="engineer-issues.form.description.textarea"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Severity
                </Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    ["low", "medium", "high", "critical"] as IssuePriority[]
                  ).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={cn(
                        "px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
                        severity === s
                          ? SEVERITY_COLORS[s]
                          : "bg-slate-50 border-slate-200 text-slate-600",
                      )}
                      data-ocid={`engineer-issues.form.severity.${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Project *
                </Label>
                <Select
                  value={projectId}
                  onValueChange={(v) => {
                    setProjectId(v);
                    setTaskId("");
                  }}
                >
                  <SelectTrigger
                    className="bg-slate-50 border-slate-200 rounded-xl text-sm"
                    data-ocid="engineer-issues.form.project.select"
                  >
                    <SelectValue placeholder="Select project" />
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

              {projectTasks.length > 0 && (
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                    Related Task (optional)
                  </Label>
                  <Select value={taskId} onValueChange={setTaskId}>
                    <SelectTrigger
                      className="bg-slate-50 border-slate-200 rounded-xl text-sm"
                      data-ocid="engineer-issues.form.task.select"
                    >
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-600 rounded-xl"
                onClick={() => setShowForm(false)}
                data-ocid="engineer-issues.form.cancel-button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl border-0 gap-2"
                onClick={handleSubmit}
                data-ocid="engineer-issues.form.submit-button"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Issue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
