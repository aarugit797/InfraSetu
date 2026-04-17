import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AUDIT_LOGS, DEMO_USERS } from "@/lib/mockData";
import {
  cn,
  formatDateTime,
  getRoleBadgeColor,
  getRoleDisplayName,
} from "@/lib/utils";
import type { AuditLog, UserRole } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-blue-100 text-blue-700 border-blue-300",
  UPDATE: "bg-amber-100 text-amber-700 border-amber-300",
  DELETE: "bg-red-100 text-red-700 border-red-300",
  APPROVE: "bg-green-100 text-green-700 border-green-300",
  REJECT: "bg-red-100 text-red-700 border-red-300",
  SUBMIT: "bg-violet-100 text-violet-700 border-violet-300",
  REPORT: "bg-orange-100 text-orange-700 border-orange-300",
  ESCALATE: "bg-rose-100 text-rose-700 border-rose-300",
  VERIFY: "bg-teal-100 text-teal-700 border-teal-300",
  REVIEW: "bg-cyan-100 text-cyan-700 border-cyan-300",
  ASSIGN: "bg-indigo-100 text-indigo-700 border-indigo-300",
  CHECKIN: "bg-green-100 text-green-700 border-green-300",
  UPLOAD: "bg-purple-100 text-purple-700 border-purple-300",
  VIEW: "bg-slate-100 text-slate-600 border-slate-300",
};

const ENTITY_COLORS: Record<string, string> = {
  Project: "bg-blue-100 text-blue-700 border-blue-300",
  Task: "bg-violet-100 text-violet-700 border-violet-300",
  Issue: "bg-red-100 text-red-700 border-red-300",
  Budget: "bg-green-100 text-green-700 border-green-300",
  Expense: "bg-amber-100 text-amber-700 border-amber-300",
  Material: "bg-teal-100 text-teal-700 border-teal-300",
  Attendance: "bg-cyan-100 text-cyan-700 border-cyan-300",
  Document: "bg-purple-100 text-purple-700 border-purple-300",
  AuditLog: "bg-slate-100 text-slate-600 border-slate-300",
  MaterialRequest: "bg-orange-100 text-orange-700 border-orange-300",
};

const ALL_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "SUBMIT",
  "REPORT",
  "ESCALATE",
  "VERIFY",
  "REVIEW",
  "ASSIGN",
  "CHECKIN",
  "UPLOAD",
  "VIEW",
];
const ALL_ROLES: UserRole[] = [
  "governmentAuthority",
  "projectManager",
  "siteEngineer",
  "contractor",
  "worker",
  "auditor",
];
const PAGE_SIZE = 20;

interface DetailModalProps {
  log: AuditLog;
  onClose: () => void;
}

function DetailModal({ log, onClose }: DetailModalProps) {
  const user = DEMO_USERS.find((u) => u.id === log.userId);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      data-ocid="audit-detail.dialog"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Close"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Audit Entry Detail</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Close"
            data-ocid="audit-detail.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn(
                  "border text-xs font-mono",
                  ACTION_COLORS[log.action] ??
                    "bg-slate-100 text-slate-600 border-slate-300",
                )}
              >
                {log.action}
              </Badge>
              <Badge
                className={cn(
                  "border text-xs",
                  ENTITY_COLORS[log.entity] ??
                    "bg-slate-100 text-slate-600 border-slate-300",
                )}
              >
                {log.entity}
              </Badge>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <p className="text-slate-500 text-xs font-medium uppercase">
                Performed By
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center">
                  <span className="text-amber-600 font-bold text-sm">
                    {log.userName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-slate-800 text-sm font-semibold">
                    {log.userName}
                  </p>
                  <Badge
                    className={cn(
                      "text-xs border mt-0.5",
                      getRoleBadgeColor(log.userRole),
                    )}
                  >
                    {getRoleDisplayName(log.userRole)}
                  </Badge>
                </div>
              </div>
              {user && (
                <div className="text-xs text-slate-500 pt-1 space-y-1">
                  <p>Email: {user.email}</p>
                  {user.phone && <p>Phone: {user.phone}</p>}
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-slate-500 text-xs font-medium mb-2 uppercase">
                Timestamp
              </p>
              <p className="text-slate-800 text-sm font-mono">
                {formatDateTime(log.timestamp)}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-slate-500 text-xs font-medium mb-2 uppercase">
                Description
              </p>
              <p className="text-slate-700 text-sm leading-relaxed">
                {log.details}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-slate-500 text-xs font-medium mb-2 uppercase">
                Resource Info
              </p>
              <div className="font-mono text-xs space-y-1">
                <div className="flex gap-2">
                  <span className="text-slate-400 w-20 flex-shrink-0">
                    Entity:
                  </span>
                  <span className="text-slate-700">{log.entity}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-400 w-20 flex-shrink-0">
                    Entity ID:
                  </span>
                  <span className="text-slate-700 break-all">
                    {log.entityId}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-400 w-20 flex-shrink-0">
                    Log ID:
                  </span>
                  <span className="text-slate-700 break-all">{log.id}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-slate-500 text-xs font-medium mb-2 uppercase">
                State Change (Immutable Record)
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-red-600 mb-1 font-semibold">
                    Before
                  </p>
                  <pre className="text-xs text-slate-500 bg-red-50 border border-red-200 rounded-lg p-2 overflow-auto font-mono">
                    {`{ "status": "previous", "action": null }`}
                  </pre>
                </div>
                <div>
                  <p className="text-[10px] text-green-600 mb-1 font-semibold">
                    After
                  </p>
                  <pre className="text-xs text-slate-700 bg-green-50 border border-green-200 rounded-lg p-2 overflow-auto font-mono">
                    {`{ "status": "updated", "action": "${log.action}", "by": "${log.userName}" }`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function AuditClipboard({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Clipboard List</title>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}

export default function AuditorAuditPage() {
  const [search, setSearch] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null);

  const allEntities = [...new Set(AUDIT_LOGS.map((l) => l.entity))];

  function toggleAction(a: string) {
    setSelectedActions((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
    setPage(1);
  }
  function toggleRole(r: UserRole) {
    setSelectedRoles((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
    setPage(1);
  }
  function toggleEntity(e: string) {
    setSelectedEntities((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );
    setPage(1);
  }

  const filtered = AUDIT_LOGS.filter((log) => {
    if (
      search &&
      !log.userName.toLowerCase().includes(search.toLowerCase()) &&
      !log.details.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (selectedActions.length && !selectedActions.includes(log.action))
      return false;
    if (selectedRoles.length && !selectedRoles.includes(log.userRole))
      return false;
    if (selectedEntities.length && !selectedEntities.includes(log.entity))
      return false;
    if (fromDate && log.timestamp < new Date(fromDate).getTime()) return false;
    if (toDate && log.timestamp > new Date(toDate).getTime() + 86400000)
      return false;
    return true;
  }).sort((a, b) => b.timestamp - a.timestamp);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilters =
    selectedActions.length +
    selectedRoles.length +
    selectedEntities.length +
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0);

  function handleExport() {
    toast.success("CSV exported successfully", {
      description: `${filtered.length} audit records downloaded`,
    });
  }

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-4"
      data-ocid="auditor-audit.page"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Audit Log</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {filtered.length} records — immutable trail
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 bg-white"
          onClick={handleExport}
          data-ocid="auditor-audit.export_button"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by user or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-white border-slate-300 text-sm"
            data-ocid="auditor-audit.search_input"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "bg-white border-slate-300 gap-1.5 relative",
            showFilters && "border-amber-400 text-amber-700 bg-amber-50",
          )}
          onClick={() => setShowFilters((v) => !v)}
          data-ocid="auditor-audit.filter_toggle"
        >
          <Filter className="w-4 h-4" />
          {activeFilters > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm"
          data-ocid="auditor-audit.filter_panel"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">From</p>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border-slate-300 text-xs"
                data-ocid="auditor-audit.from_date_input"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">To</p>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border-slate-300 text-xs"
                data-ocid="auditor-audit.to_date_input"
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">
              Action Type
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ACTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAction(a)}
                  data-ocid={`auditor-audit.action-filter.${a.toLowerCase()}`}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded-lg border font-mono font-medium transition-colors",
                    selectedActions.includes(a)
                      ? (ACTION_COLORS[a] ??
                          "bg-slate-100 text-slate-600 border-slate-300")
                      : "text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100",
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">User Role</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRole(r)}
                  data-ocid={`auditor-audit.role-filter.${r}`}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors",
                    selectedRoles.includes(r)
                      ? getRoleBadgeColor(r)
                      : "text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100",
                  )}
                >
                  {getRoleDisplayName(r)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">
              Resource Type
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allEntities.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleEntity(e)}
                  data-ocid={`auditor-audit.entity-filter.${e.toLowerCase()}`}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors",
                    selectedEntities.includes(e)
                      ? (ENTITY_COLORS[e] ??
                          "bg-slate-100 text-slate-600 border-slate-300")
                      : "text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100",
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700 gap-1"
              onClick={() => {
                setSelectedActions([]);
                setSelectedRoles([]);
                setSelectedEntities([]);
                setFromDate("");
                setToDate("");
                setPage(1);
              }}
              data-ocid="auditor-audit.clear_filters"
            >
              <X className="w-3 h-3" />
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        data-ocid="auditor-audit.table"
      >
        <div className="hidden sm:grid grid-cols-[1fr_140px_100px_100px_80px] gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
          <span>Description</span>
          <span>User</span>
          <span>Action</span>
          <span>Resource</span>
          <span>Time</span>
        </div>
        {paginated.length === 0 ? (
          <div
            className="p-8 text-center"
            data-ocid="auditor-audit.empty_state"
          >
            <AuditClipboard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              No audit records match your filters
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginated.map((log, idx) => {
              const actionClass =
                ACTION_COLORS[log.action] ??
                "bg-slate-100 text-slate-600 border-slate-300";
              const entityClass =
                ENTITY_COLORS[log.entity] ??
                "bg-slate-100 text-slate-600 border-slate-300";
              return (
                <div
                  key={log.id}
                  className="hover:bg-amber-50 transition-colors cursor-pointer"
                  data-ocid={`auditor-audit.item.${(page - 1) * PAGE_SIZE + idx + 1}`}
                  onClick={() => setDetailLog(log)}
                  onKeyDown={(e) => e.key === "Enter" && setDetailLog(log)}
                >
                  {/* Mobile row */}
                  <div className="sm:hidden p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0 border flex-shrink-0 font-mono",
                          actionClass,
                        )}
                      >
                        {log.action}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0 border flex-shrink-0",
                          entityClass,
                        )}
                      >
                        {log.entity}
                      </Badge>
                      <span className="ml-auto text-[10px] text-slate-400">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs">{log.details}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 text-[10px]">
                        {log.userName}
                      </span>
                      <Badge
                        className={cn(
                          "text-[9px] px-1 py-0 border",
                          getRoleBadgeColor(log.userRole),
                        )}
                      >
                        {getRoleDisplayName(log.userRole)}
                      </Badge>
                    </div>
                  </div>
                  {/* Desktop row */}
                  <div className="hidden sm:grid grid-cols-[1fr_140px_100px_100px_80px] gap-3 px-4 py-3 items-start text-xs">
                    <p className="text-slate-700 leading-relaxed line-clamp-2">
                      {log.details}
                    </p>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-800 font-medium truncate">
                        {log.userName}
                      </span>
                      <Badge
                        className={cn(
                          "text-[9px] px-1.5 py-0 border w-fit",
                          getRoleBadgeColor(log.userRole),
                        )}
                      >
                        {getRoleDisplayName(log.userRole)}
                      </Badge>
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px] px-1.5 py-0 border w-fit font-mono",
                        actionClass,
                      )}
                    >
                      {log.action}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-[10px] px-1.5 py-0 border w-fit",
                        entityClass,
                      )}
                    >
                      {log.entity}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[10px] leading-tight">
                        {formatDateTime(log.timestamp)}
                      </span>
                      <Eye className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between"
          data-ocid="auditor-audit.pagination"
        >
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages} · {filtered.length} records
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-300 w-8 h-8 p-0"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              data-ocid="auditor-audit.pagination_prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-300 w-8 h-8 p-0"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              data-ocid="auditor-audit.pagination_next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailLog && (
        <DetailModal log={detailLog} onClose={() => setDetailLog(null)} />
      )}
    </div>
  );
}
