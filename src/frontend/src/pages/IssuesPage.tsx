import { Layout } from "@/components/Layout";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_USERS, ISSUES, PROJECTS } from "@/lib/mockData";
import {
  cn,
  formatTimeAgo,
  generateId,
  getPriorityColor,
  getStatusColor,
} from "@/lib/utils";
import type { Issue, IssuePriority, IssueStatus } from "@/types";
import {
  AlertTriangle,
  ArrowUpCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Filter,
  ImageIcon,
  MapPin,
  Plus,
  TriangleAlert,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ─── Priority bar colors ──────────────────────────────────────────────────────
const PRIORITY_BAR: Record<IssuePriority, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-400",
  low: "bg-emerald-500",
};

const PRIORITY_LABEL: Record<IssuePriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const STATUS_LABEL: Record<IssueStatus, string> = {
  open: "Open",
  inProgress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  escalated: "Escalated",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusHistory(issue: Issue) {
  const base = [
    {
      status: "open" as IssueStatus,
      label: "Reported",
      time: issue.createdAt,
      user: getUserName(issue.reportedBy),
    },
  ];
  if (
    issue.status === "inProgress" ||
    issue.status === "resolved" ||
    issue.status === "closed"
  ) {
    base.push({
      status: "inProgress" as IssueStatus,
      label: "Acknowledged",
      time: issue.updatedAt,
      user: issue.assignedTo ? getUserName(issue.assignedTo) : "System",
    });
  }
  if (issue.status === "escalated") {
    base.push({
      status: "escalated" as IssueStatus,
      label: "Escalated",
      time: issue.updatedAt,
      user: issue.assignedTo ? getUserName(issue.assignedTo) : "System",
    });
  }
  if (issue.status === "resolved" || issue.status === "closed") {
    base.push({
      status: "resolved" as IssueStatus,
      label: "Resolved",
      time: issue.resolvedAt ?? issue.updatedAt,
      user: issue.assignedTo ? getUserName(issue.assignedTo) : "System",
    });
  }
  if (issue.status === "closed") {
    base.push({
      status: "closed" as IssueStatus,
      label: "Closed",
      time: issue.resolvedAt ?? issue.updatedAt,
      user: "Authority",
    });
  }
  return base;
}

function getUserName(id: string): string {
  return DEMO_USERS.find((u) => u.id === id)?.name ?? id;
}

function getProjectName(id: string): string {
  return PROJECTS.find((p) => p.id === id)?.name ?? "Unknown Project";
}

// ─── Issue Card ───────────────────────────────────────────────────────────────
interface IssueCardProps {
  issue: Issue;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: IssueStatus) => void;
  userRole: string | undefined;
}

function IssueCard({
  issue,
  expanded,
  onToggle,
  onStatusChange,
  userRole,
}: IssueCardProps) {
  const prioColor = getPriorityColor(issue.priority);
  const statusColor = getStatusColor(issue.status);

  return (
    <div
      className="glass rounded-xl overflow-hidden transition-smooth hover:shadow-lg hover:border-primary/30"
      data-ocid={`issue-card-${issue.id}`}
    >
      <div className="flex">
        {/* Priority bar */}
        <div
          className={cn("w-1 flex-shrink-0", PRIORITY_BAR[issue.priority])}
        />

        <div className="flex-1 p-4 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <StatusBadge
                  label={PRIORITY_LABEL[issue.priority]}
                  colorClasses={prioColor}
                  size="sm"
                />
                <StatusBadge
                  label={STATUS_LABEL[issue.status]}
                  colorClasses={statusColor}
                  size="sm"
                />
              </div>
              <h3 className="font-display font-bold text-foreground text-sm leading-snug truncate">
                {issue.title}
              </h3>
            </div>
            <button
              type="button"
              aria-label={expanded ? "Collapse" : "Expand"}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-smooth p-1"
              onClick={onToggle}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Project */}
          <p className="text-xs text-primary font-medium mb-2 truncate">
            {getProjectName(issue.projectId)}
          </p>

          {/* Description */}
          <p
            className={cn(
              "text-muted-foreground text-xs leading-relaxed",
              expanded ? "" : "line-clamp-2",
            )}
          >
            {issue.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {issue.geoLocation && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 text-accent" />
                {issue.geoLocation.lat.toFixed(4)},{" "}
                {issue.geoLocation.lng.toFixed(4)}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              {getUserName(issue.reportedBy)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {formatTimeAgo(issue.createdAt)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {issue.status === "open" && (
              <button
                type="button"
                data-ocid={`ack-issue-${issue.id}`}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-smooth"
                onClick={() => onStatusChange(issue.id, "inProgress")}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge
              </button>
            )}
            {issue.status === "inProgress" && (
              <button
                type="button"
                data-ocid={`escalate-issue-${issue.id}`}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 transition-smooth"
                onClick={() => onStatusChange(issue.id, "escalated")}
              >
                <ArrowUpCircle className="w-3.5 h-3.5" /> Escalate
              </button>
            )}
            {issue.status === "inProgress" &&
              (userRole === "projectManager" ||
                userRole === "governmentAuthority") && (
                <button
                  type="button"
                  data-ocid={`resolve-issue-${issue.id}`}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-smooth"
                  onClick={() => onStatusChange(issue.id, "resolved")}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                </button>
              )}
            {issue.status === "resolved" &&
              userRole === "governmentAuthority" && (
                <button
                  type="button"
                  data-ocid={`close-issue-${issue.id}`}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-smooth"
                  onClick={() => onStatusChange(issue.id, "closed")}
                >
                  <XCircle className="w-3.5 h-3.5" /> Close
                </button>
              )}
          </div>

          {/* Expanded: detail panel */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-border/40 space-y-4">
              {/* Image */}
              {issue.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-border/40 max-h-48">
                  <img
                    src={issue.imageUrl}
                    alt="Issue evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Status history */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Status History
                </h4>
                <ol className="space-y-2">
                  {getStatusHistory(issue).map((entry) => {
                    const sc = getStatusColor(entry.status);
                    return (
                      <li
                        key={`${entry.status}-${entry.time}`}
                        className="flex items-start gap-3"
                      >
                        <span
                          className={cn(
                            "mt-1 w-2 h-2 rounded-full flex-shrink-0",
                            sc.dot,
                          )}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-foreground">
                            {entry.label}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            by {entry.user}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(entry.time)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Role-based update buttons */}
              <div className="flex flex-wrap gap-2">
                {userRole === "siteEngineer" && issue.status === "open" && (
                  <button
                    type="button"
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-smooth"
                    onClick={() => onStatusChange(issue.id, "inProgress")}
                  >
                    Mark In Progress
                  </button>
                )}
                {userRole === "projectManager" &&
                  (issue.status === "inProgress" ||
                    issue.status === "escalated") && (
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-smooth"
                      onClick={() => onStatusChange(issue.id, "resolved")}
                    >
                      Resolve Issue
                    </button>
                  )}
                {userRole === "governmentAuthority" &&
                  issue.status === "resolved" && (
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-smooth"
                      onClick={() => onStatusChange(issue.id, "closed")}
                    >
                      Close Issue
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Report Issue Modal ───────────────────────────────────────────────────────
interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (issue: Issue) => void;
  currentUserId: string;
}

function ReportIssueModal({
  open,
  onClose,
  onSubmit,
  currentUserId,
}: ReportModalProps) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleGetLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocLoading(false);
        toast.success("Location captured");
      },
      () => {
        toast.error("Could not get location");
        setLocLoading(false);
      },
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    const now = Date.now();
    const newIssue: Issue = {
      id: generateId("i"),
      projectId,
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "open",
      reportedBy: currentUserId,
      imageUrl: previewUrl ?? undefined,
      geoLocation:
        lat && lng
          ? { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) }
          : undefined,
      createdAt: now,
      updatedAt: now,
    };
    onSubmit(newIssue);
    // reset
    setTitle("");
    setProjectId("");
    setDescription("");
    setPriority("medium");
    setLat("");
    setLng("");
    setPreviewUrl(null);
    setImageFileName("");
    onClose();
    toast.success("Issue reported successfully");
  }

  const inputCls =
    "w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth";
  const labelCls =
    "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report Issue"
      description="Submit a new issue for review and action"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className={labelCls} htmlFor="issue-title">
            Title *
          </label>
          <input
            id="issue-title"
            type="text"
            className={inputCls}
            placeholder="Brief issue title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-ocid="issue-title-input"
          />
        </div>

        {/* Project + Priority row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="issue-project">
              Project *
            </label>
            <select
              id="issue-project"
              className={inputCls}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              data-ocid="issue-project-select"
            >
              <option value="">Select project...</option>
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="issue-priority">
              Priority *
            </label>
            <select
              id="issue-priority"
              className={inputCls}
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
              data-ocid="issue-priority-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls} htmlFor="issue-description">
            Description *
          </label>
          <textarea
            id="issue-description"
            rows={3}
            className={cn(inputCls, "resize-none")}
            placeholder="Describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-ocid="issue-desc-input"
          />
        </div>

        {/* Location */}
        <div>
          <p className={labelCls}>Location (GPS)</p>
          <div className="flex gap-2 mb-2">
            <label className="sr-only" htmlFor="issue-lat">
              Latitude
            </label>
            <input
              id="issue-lat"
              type="text"
              className={cn(inputCls, "flex-1")}
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              data-ocid="issue-lat-input"
            />
            <label className="sr-only" htmlFor="issue-lng">
              Longitude
            </label>
            <input
              id="issue-lng"
              type="text"
              className={cn(inputCls, "flex-1")}
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              data-ocid="issue-lng-input"
            />
          </div>
          <button
            type="button"
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-smooth"
            onClick={handleGetLocation}
            disabled={locLoading}
            data-ocid="get-location-btn"
          >
            <Crosshair
              className={cn("w-3.5 h-3.5", locLoading && "animate-spin")}
            />
            {locLoading ? "Getting location..." : "Get My Location"}
          </button>
        </div>

        {/* Image Upload */}
        <div>
          <p className={labelCls}>Evidence Photo</p>
          <label htmlFor="issue-file-input" className="block">
            <div
              className="border-2 border-dashed border-border/50 rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-smooth"
              data-ocid="issue-image-upload"
            >
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mx-auto max-h-32 rounded-lg object-cover"
                  />
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {imageFileName}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click to upload photo
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              )}
            </div>
          </label>
          <input
            ref={fileRef}
            id="issue-file-input"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            data-ocid="issue-file-input"
          />
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-smooth rounded-lg hover:bg-muted/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-smooth"
            data-ocid="report-issue-submit"
          >
            <Upload className="w-4 h-4" />
            Submit Report
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IssuesPage() {
  const { currentUser } = useAuth();
  const [issues, setIssues] = useState<Issue[]>(ISSUES);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [filterProject, setFilterProject] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  function handleStatusChange(id: string, newStatus: IssueStatus) {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status: newStatus,
              updatedAt: Date.now(),
              resolvedAt:
                newStatus === "resolved" || newStatus === "closed"
                  ? Date.now()
                  : issue.resolvedAt,
            }
          : issue,
      ),
    );
    if (newStatus === "escalated") {
      toast.warning("Issue escalated to management", { duration: 4000 });
    } else if (newStatus === "resolved") {
      toast.success("Issue marked as resolved", { duration: 4000 });
    } else if (newStatus === "inProgress") {
      toast.success("Issue acknowledged", { duration: 4000 });
    } else if (newStatus === "closed") {
      toast.success("Issue closed", { duration: 4000 });
    }
  }

  function handleNewIssue(issue: Issue) {
    setIssues((prev) => [issue, ...prev]);
  }

  const filtered = issues.filter((i) => {
    if (filterProject && i.projectId !== filterProject) return false;
    if (filterPriority && i.priority !== filterPriority) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.status === "open").length,
    critical: issues.filter((i) => i.priority === "critical").length,
    escalated: issues.filter((i) => i.status === "escalated").length,
  };

  const selectCls =
    "bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth";

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border/40 px-4 py-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Issues
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                {stats.total} total · {stats.open} open · {stats.critical}{" "}
                critical
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-smooth shadow-lg"
              onClick={() => setReportOpen(true)}
              data-ocid="report-issue-btn"
            >
              <Plus className="w-4 h-4" />
              Report Issue
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Total Issues",
                value: stats.total,
                icon: (
                  <TriangleAlert className="w-4 h-4 text-muted-foreground" />
                ),
                cls: "",
              },
              {
                label: "Open",
                value: stats.open,
                icon: <div className="w-2 h-2 rounded-full bg-amber-400" />,
                cls: "text-amber-400",
              },
              {
                label: "Critical",
                value: stats.critical,
                icon: <div className="w-2 h-2 rounded-full bg-red-500" />,
                cls: "text-red-400",
              },
              {
                label: "Escalated",
                value: stats.escalated,
                icon: <ArrowUpCircle className="w-4 h-4 text-orange-400" />,
                cls: "text-orange-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="glass rounded-xl p-4 flex items-center gap-3"
              >
                <div className="flex-shrink-0">{s.icon}</div>
                <div className="min-w-0">
                  <div
                    className={cn(
                      "font-display font-bold text-2xl leading-none",
                      s.cls || "text-foreground",
                    )}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Filters
              </span>
            </div>
            <div className="flex flex-wrap gap-3" data-ocid="issues-filter-bar">
              <select
                className={selectCls}
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                data-ocid="filter-project"
              >
                <option value="">All Projects</option>
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                className={selectCls}
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                data-ocid="filter-priority"
              >
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                className={selectCls}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                data-ocid="filter-status"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="inProgress">In Progress</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              {(filterProject || filterPriority || filterStatus) && (
                <button
                  type="button"
                  className="text-xs px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth"
                  onClick={() => {
                    setFilterProject("");
                    setFilterPriority("");
                    setFilterStatus("");
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Issue Grid */}
          {filtered.length === 0 ? (
            <div
              className="glass rounded-2xl p-12 text-center"
              data-ocid="issues-empty-state"
            >
              <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground text-lg mb-2">
                No issues found
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                No issues match your current filters, or none have been reported
                yet.
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-smooth"
                onClick={() => setReportOpen(true)}
                data-ocid="report-first-issue-btn"
              >
                <Plus className="w-4 h-4" /> Report First Issue
              </button>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              data-ocid="issues-grid"
            >
              {filtered.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  expanded={expandedId === issue.id}
                  onToggle={() =>
                    setExpandedId((prev) =>
                      prev === issue.id ? null : issue.id,
                    )
                  }
                  onStatusChange={handleStatusChange}
                  userRole={currentUser?.role}
                />
              ))}
            </div>
          )}
        </div>

        {/* Report Issue Modal */}
        <ReportIssueModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          onSubmit={handleNewIssue}
          currentUserId={currentUser?.id ?? "u3"}
        />
      </div>
    </Layout>
  );
}
