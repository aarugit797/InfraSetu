import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APPROVALS, DEMO_USERS } from "@/lib/mockData";
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTimeAgo,
  getStatusColor,
} from "@/lib/utils";
import type { Approval, ApprovalStatus, ApprovalType } from "@/types";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Filter,
  Flag,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TYPE_COLORS: Record<ApprovalType, string> = {
  budget: "bg-green-100 text-green-700 border-green-300",
  task: "bg-violet-100 text-violet-700 border-violet-300",
  material: "bg-amber-100 text-amber-700 border-amber-300",
  expense: "bg-blue-100 text-blue-700 border-blue-300",
  project: "bg-cyan-100 text-cyan-700 border-cyan-300",
};

const STATUS_OPTIONS: ApprovalStatus[] = [
  "pending",
  "approved",
  "rejected",
  "escalated",
];
const TYPE_OPTIONS: ApprovalType[] = [
  "budget",
  "task",
  "material",
  "expense",
  "project",
];

const EXTENDED_APPROVALS = APPROVALS.map((a, i) => ({
  ...a,
  approvedBy: i % 2 === 0 ? "u2" : undefined,
  approvalTime: a.resolvedAt
    ? Math.round((a.resolvedAt - a.createdAt) / 3600000)
    : undefined,
}));

function slaStatus(a: Approval): "within" | "breached" | "pending" {
  if (a.status === "approved" || a.status === "rejected") {
    return a.resolvedAt && a.resolvedAt <= a.slaDeadline ? "within" : "pending";
  }
  return Date.now() > a.slaDeadline ? "breached" : "pending";
}

function getSlaRowClass(sla: string, isFlagged: boolean) {
  if (isFlagged)
    return "bg-amber-50 border-l-4 border-l-amber-500 border border-amber-200";
  if (sla === "breached")
    return "bg-red-50 border-l-4 border-l-red-500 border border-red-200";
  return "bg-white border border-slate-200";
}

export default function AuditorApprovalsPage() {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ApprovalStatus[]>(
    [],
  );
  const [selectedTypes, setSelectedTypes] = useState<ApprovalType[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  function toggleStatus(s: ApprovalStatus) {
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function toggleType(t: ApprovalType) {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  const filtered = EXTENDED_APPROVALS.filter((a) => {
    if (
      search &&
      !a.title.toLowerCase().includes(search.toLowerCase()) &&
      !a.requestedBy.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (selectedStatuses.length && !selectedStatuses.includes(a.status))
      return false;
    if (selectedTypes.length && !selectedTypes.includes(a.type)) return false;
    if (fromDate && a.createdAt < new Date(fromDate).getTime()) return false;
    if (toDate && a.createdAt > new Date(toDate).getTime() + 86400000)
      return false;
    return true;
  });

  const activeFilters =
    selectedStatuses.length +
    selectedTypes.length +
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0);

  const totalApprovals = EXTENDED_APPROVALS.length;
  const withinSla = EXTENDED_APPROVALS.filter(
    (a) => slaStatus(a) === "within",
  ).length;
  const breachedSla = EXTENDED_APPROVALS.filter(
    (a) => slaStatus(a) === "breached",
  ).length;
  const slaRate = Math.round((withinSla / totalApprovals) * 100);
  const avgTime = 48;

  function handleFlag(id: string) {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Flag removed");
      } else {
        next.add(id);
        toast.warning("Approval flagged for review", {
          description: "This will be included in the next audit report",
        });
      }
      return next;
    });
  }

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-4"
      data-ocid="auditor-approvals.page"
    >
      <div>
        <h1 className="text-xl font-bold text-slate-800">Approvals</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Read-only audit view · {EXTENDED_APPROVALS.length} records
        </p>
      </div>

      {/* SLA Summary */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
        data-ocid="auditor-approvals.sla-report"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            SLA Compliance Report
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-green-700 text-xl font-bold">{slaRate}%</p>
            <p className="text-[10px] text-slate-500">Within SLA</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <p className="text-red-700 text-xl font-bold">{breachedSla}</p>
            <p className="text-[10px] text-slate-500">SLA Breached</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-amber-700 text-xl font-bold">{avgTime}h</p>
            <p className="text-[10px] text-slate-500">Avg. Time</p>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${slaRate}%` }}
          />
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search approvals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-slate-300"
            data-ocid="auditor-approvals.search_input"
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
          data-ocid="auditor-approvals.filter_toggle"
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
          data-ocid="auditor-approvals.filter_panel"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">From</p>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-slate-50 border-slate-300 text-xs"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">To</p>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-slate-50 border-slate-300 text-xs"
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((s) => {
                const sc = getStatusColor(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStatus(s)}
                    data-ocid={`auditor-approvals.status-filter.${s}`}
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors capitalize",
                      selectedStatuses.includes(s)
                        ? cn(sc.bg, sc.text, sc.border)
                        : "text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">Type</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  data-ocid={`auditor-approvals.type-filter.${t}`}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors capitalize",
                    selectedTypes.includes(t)
                      ? TYPE_COLORS[t]
                      : "text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100",
                  )}
                >
                  {t}
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
                setSelectedStatuses([]);
                setSelectedTypes([]);
                setFromDate("");
                setToDate("");
              }}
            >
              <X className="w-3 h-3" />
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Approvals List */}
      {filtered.length === 0 ? (
        <div
          className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm"
          data-ocid="auditor-approvals.empty_state"
        >
          <p className="text-slate-500 text-sm">
            No approvals match your filters
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="auditor-approvals.list">
          {filtered.map((ap, idx) => {
            const sc = getStatusColor(ap.status);
            const tc = TYPE_COLORS[ap.type];
            const sla = slaStatus(ap);
            const requester = DEMO_USERS.find((u) => u.id === ap.requestedBy);
            const approver = ap.approvedBy
              ? DEMO_USERS.find((u) => u.id === ap.approvedBy)
              : null;
            const isFlagged = flagged.has(ap.id);
            const isBreached = sla === "breached";

            return (
              <div
                key={ap.id}
                className={cn(
                  "rounded-2xl p-4 space-y-3 shadow-sm",
                  getSlaRowClass(sla, isFlagged),
                )}
                data-ocid={`auditor-approvals.item.${idx + 1}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0 border capitalize",
                          sc.bg,
                          sc.text,
                          sc.border,
                        )}
                      >
                        {ap.status}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0 border capitalize",
                          tc,
                        )}
                      >
                        {ap.type}
                      </Badge>
                      {isFlagged && (
                        <Badge className="text-[10px] px-1.5 py-0 border bg-amber-100 text-amber-700 border-amber-300">
                          ⚑ Flagged
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-800 text-sm font-semibold leading-tight">
                      {ap.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFlag(ap.id)}
                    data-ocid={`auditor-approvals.flag_button.${idx + 1}`}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors flex-shrink-0",
                      isFlagged
                        ? "text-amber-600 bg-amber-100 hover:bg-amber-200"
                        : "text-slate-400 hover:text-amber-500 hover:bg-amber-50",
                    )}
                    aria-label={
                      isFlagged ? "Remove flag" : "Flag as suspicious"
                    }
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {ap.amount && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 text-xs">Amount:</span>
                      <span className="text-slate-800 text-xs font-semibold">
                        {formatCurrency(ap.amount)}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex items-center gap-1",
                      isBreached ? "text-red-600" : "text-green-600",
                    )}
                  >
                    {isBreached ? (
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-semibold px-1.5 py-0.5 rounded",
                        isBreached
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800",
                      )}
                    >
                      {isBreached ? "SLA Breached" : "Within SLA"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">
                      Deadline: {formatDate(String(ap.slaDeadline))}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                    <p className="text-slate-400 text-[10px] mb-1">
                      Requested By
                    </p>
                    <p className="text-slate-800 font-semibold truncate">
                      {requester?.name ?? ap.requestedBy}
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      {formatTimeAgo(ap.createdAt)}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                    <p className="text-slate-400 text-[10px] mb-1">
                      Approved By
                    </p>
                    {approver ? (
                      <>
                        <p className="text-slate-800 font-semibold truncate">
                          {approver.name}
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          {ap.resolvedAt ? formatDateTime(ap.resolvedAt) : "—"}
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-400 italic text-xs">
                        {ap.status === "pending" ? "Awaiting" : "N/A"}
                      </p>
                    )}
                  </div>
                </div>

                {ap.notes && (
                  <p className="text-slate-500 text-xs border-t border-slate-100 pt-2 line-clamp-2">
                    {ap.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Flagged Count Footer */}
      {flagged.size > 0 && (
        <div
          className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-center gap-2 shadow-sm"
          data-ocid="auditor-approvals.flagged_summary"
        >
          <Flag className="w-4 h-4 text-amber-600" />
          <span className="text-amber-700 text-sm font-semibold">
            {flagged.size} approval{flagged.size > 1 ? "s" : ""} flagged for
            audit review
          </span>
        </div>
      )}
    </div>
  );
}
