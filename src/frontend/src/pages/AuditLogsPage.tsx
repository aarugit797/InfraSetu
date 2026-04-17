import { Layout } from "@/components/Layout";
import { SkeletonRow } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AUDIT_LOGS, DEMO_USERS } from "@/lib/mockData";
import {
  formatDateTime,
  formatTimeAgo,
  getRoleBadgeColor,
  getRoleDisplayName,
} from "@/lib/utils";
import type { AuditLog } from "@/types";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Download,
  FileText,
  Filter,
  FolderKanban,
  Lock,
  Package,
  ShieldCheck,
  ThumbsUp,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 20;

const ACTION_COLORS: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  CREATE: {
    bg: "bg-teal-500/15",
    text: "text-teal-400",
    border: "border-teal-500/30",
    dot: "bg-teal-400",
  },
  SUBMIT: {
    bg: "bg-teal-500/15",
    text: "text-teal-400",
    border: "border-teal-500/30",
    dot: "bg-teal-400",
  },
  CHECKIN: {
    bg: "bg-teal-500/15",
    text: "text-teal-400",
    border: "border-teal-500/30",
    dot: "bg-teal-400",
  },
  UPDATE: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  ASSIGN: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  UPLOAD: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  DELETE: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-400",
  },
  REJECT: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-400",
  },
  APPROVE: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  VERIFY: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  REVIEW: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  ESCALATE: {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
  },
  REPORT: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  VIEW: {
    bg: "bg-slate-500/15",
    text: "text-slate-400",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
  },
};

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  Project: <FolderKanban className="w-3.5 h-3.5" />,
  Task: <CheckSquare className="w-3.5 h-3.5" />,
  Issue: <AlertTriangle className="w-3.5 h-3.5" />,
  Expense: <DollarSign className="w-3.5 h-3.5" />,
  Material: <Package className="w-3.5 h-3.5" />,
  Attendance: <CalendarClock className="w-3.5 h-3.5" />,
  Approval: <ThumbsUp className="w-3.5 h-3.5" />,
  Budget: <DollarSign className="w-3.5 h-3.5" />,
  AuditLog: <ClipboardList className="w-3.5 h-3.5" />,
  Document: <FileText className="w-3.5 h-3.5" />,
  MaterialRequest: <Package className="w-3.5 h-3.5" />,
  Users: <Users className="w-3.5 h-3.5" />,
};

const ALL_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "ESCALATE",
  "SUBMIT",
  "REPORT",
  "ASSIGN",
  "VERIFY",
  "REVIEW",
  "REJECT",
  "UPLOAD",
  "CHECKIN",
  "VIEW",
] as const;
const ALL_ENTITIES = [
  "Project",
  "Task",
  "Issue",
  "Expense",
  "Material",
  "Attendance",
  "Approval",
  "Budget",
  "Document",
  "MaterialRequest",
  "AuditLog",
] as const;

interface FilterState {
  userId: string;
  actionType: string;
  entityType: string;
  dateFrom: string;
  dateTo: string;
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-display font-bold text-foreground leading-tight">
          {value}
        </p>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="hover:text-foreground transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function AuditTableRow({ log, index }: { log: AuditLog; index: number }) {
  const actionColor = ACTION_COLORS[log.action] ?? ACTION_COLORS.VIEW;
  const entityIcon = ENTITY_ICONS[log.entity] ?? (
    <ClipboardList className="w-3.5 h-3.5" />
  );
  const roleBadgeClass = getRoleBadgeColor(log.userRole);

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.4) }}
      className={`border-b border-border/40 last:border-0 ${index % 2 === 0 ? "" : "bg-white/[0.03]"} hover:bg-primary/5 transition-colors`}
    >
      {/* Timestamp */}
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="text-xs font-mono text-foreground">
          {formatDateTime(log.timestamp)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatTimeAgo(log.timestamp)}
        </p>
      </td>

      {/* User */}
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
          {log.userName}
        </p>
      </td>

      {/* Role */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleBadgeClass}`}
        >
          {getRoleDisplayName(log.userRole)}
        </span>
      </td>

      {/* Action */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge
          label={log.action}
          colorClasses={actionColor}
          showDot={false}
          size="sm"
        />
      </td>

      {/* Entity */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="text-accent">{entityIcon}</span>
          {log.entity}
        </span>
      </td>

      {/* Entity ID */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-xs font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
          {log.entityId}
        </span>
      </td>

      {/* Details */}
      <td className="px-4 py-3">
        <p className="text-xs text-muted-foreground line-clamp-2 max-w-[260px]">
          {log.details}
        </p>
      </td>
    </motion.tr>
  );
}

export default function AuditLogsPage() {
  const { currentUser } = useAuth();
  const [isLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    userId: "",
    actionType: "",
    entityType: "",
    dateFrom: "",
    dateTo: "",
  });

  // Access control
  const hasAccess =
    currentUser?.role === "auditor" ||
    currentUser?.role === "governmentAuthority";

  // Stats
  const today = new Date().toDateString();
  const todayCount = AUDIT_LOGS.filter(
    (l) => new Date(l.timestamp).toDateString() === today,
  ).length;
  const activeUsers = new Set(AUDIT_LOGS.map((l) => l.userId)).size;

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return AUDIT_LOGS.filter((log) => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.actionType && log.action !== filters.actionType) return false;
      if (filters.entityType && log.entity !== filters.entityType) return false;
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).setHours(0, 0, 0, 0);
        if (log.timestamp < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo).setHours(23, 59, 59, 999);
        if (log.timestamp > to) return false;
      }
      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [filters]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // Active filter chips
  const activeFilters: { label: string; key: keyof FilterState }[] = [];
  if (filters.userId) {
    const user = DEMO_USERS.find((u) => u.id === filters.userId);
    if (user)
      activeFilters.push({ label: `User: ${user.name}`, key: "userId" });
  }
  if (filters.actionType)
    activeFilters.push({
      label: `Action: ${filters.actionType}`,
      key: "actionType",
    });
  if (filters.entityType)
    activeFilters.push({
      label: `Entity: ${filters.entityType}`,
      key: "entityType",
    });
  if (filters.dateFrom)
    activeFilters.push({ label: `From: ${filters.dateFrom}`, key: "dateFrom" });
  if (filters.dateTo)
    activeFilters.push({ label: `To: ${filters.dateTo}`, key: "dateTo" });

  const clearFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
    setPage(1);
  };

  const clearAll = () => {
    setFilters({
      userId: "",
      actionType: "",
      entityType: "",
      dateFrom: "",
      dateTo: "",
    });
    setPage(1);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (!hasAccess) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Only Auditors and Government Authorities can access the immutable
              audit log.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            data-ocid="audit-access-denied-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-5 pb-8 p-4 md:p-6" data-ocid="audit-logs-page">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground leading-tight">
                Audit Logs
              </h1>
              <p className="text-xs text-muted-foreground">
                Complete immutable activity history
              </p>
            </div>
            <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3 h-3" />
              Tamper-Proof Record
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success("Export started", {
                description: "Audit logs export is being prepared…",
              })
            }
            data-ocid="audit-export-btn"
            className="gap-2 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          <StatCard
            icon={<ClipboardList className="w-5 h-5 text-primary" />}
            label="Total Entries"
            value={AUDIT_LOGS.length}
            color="bg-primary/20"
          />
          <StatCard
            icon={<CalendarClock className="w-5 h-5 text-accent" />}
            label="Today's Actions"
            value={todayCount}
            color="bg-accent/20"
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-violet-400" />}
            label="Active Users"
            value={activeUsers}
            color="bg-violet-500/20"
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass rounded-2xl p-4 space-y-3"
          data-ocid="audit-filter-bar"
        >
          <div className="flex items-center gap-2 mb-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {/* User filter */}
            <select
              value={filters.userId}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
              data-ocid="audit-filter-user"
              className="w-full rounded-lg bg-muted/40 border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring transition-smooth"
            >
              <option value="">All Users</option>
              {DEMO_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            {/* Action type filter */}
            <select
              value={filters.actionType}
              onChange={(e) => handleFilterChange("actionType", e.target.value)}
              data-ocid="audit-filter-action"
              className="w-full rounded-lg bg-muted/40 border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring transition-smooth"
            >
              <option value="">All Actions</option>
              {ALL_ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            {/* Entity type filter */}
            <select
              value={filters.entityType}
              onChange={(e) => handleFilterChange("entityType", e.target.value)}
              data-ocid="audit-filter-entity"
              className="w-full rounded-lg bg-muted/40 border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring transition-smooth"
            >
              <option value="">All Entities</option>
              {ALL_ENTITIES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>

            {/* Date from */}
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              data-ocid="audit-filter-date-from"
              placeholder="From date"
              className="w-full rounded-lg bg-muted/40 border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring transition-smooth [color-scheme:dark]"
            />

            {/* Date to */}
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              data-ocid="audit-filter-date-to"
              placeholder="To date"
              className="w-full rounded-lg bg-muted/40 border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring transition-smooth [color-scheme:dark]"
            />
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {activeFilters.map((f) => (
                <FilterChip
                  key={f.key}
                  label={f.label}
                  onRemove={() => clearFilter(f.key)}
                />
              ))}
              <button
                type="button"
                onClick={clearAll}
                data-ocid="audit-clear-filters"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="glass rounded-2xl overflow-hidden"
          data-ocid="audit-table"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <p className="text-sm font-medium text-foreground">
              {filteredLogs.length}{" "}
              {filteredLogs.length === 1 ? "entry" : "entries"} found
            </p>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Read-only · Immutable
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    User
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Role
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    Entity ID
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }, (_, i) => `skeleton-row-${i}`).map(
                    (key) => (
                      <tr key={key}>
                        <td colSpan={7} className="px-4 py-1">
                          <SkeletonRow />
                        </td>
                      </tr>
                    ),
                  )
                ) : paginatedLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center"
                      data-ocid="audit-empty-state"
                    >
                      <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium text-muted-foreground">
                        No audit entries match your filters
                      </p>
                      <button
                        type="button"
                        onClick={clearAll}
                        className="mt-2 text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                      >
                        Clear filters to see all logs
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, idx) => (
                    <AuditTableRow key={log.id} log={log} index={idx} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-3 border-t border-border/50"
              data-ocid="audit-pagination"
            >
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} · {filteredLogs.length} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-ocid="audit-prev-page"
                  className="h-8 px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs font-mono text-foreground px-1">
                  {page}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-ocid="audit-next-page"
                  className="h-8 px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
