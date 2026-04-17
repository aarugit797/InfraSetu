import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useApprovals } from "@/hooks/useBackend";
import { DEMO_USERS } from "@/lib/mockData";
import type { Approval, ApprovalStatus } from "@/types";
import {
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type MainTab = "architecture" | "monetary";
type SubTab = "all" | ApprovalStatus;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  escalated: "bg-red-100 text-red-800 border-red-300",
};

const TYPE_COLORS: Record<string, string> = {
  budget: "bg-amber-100 text-amber-700 border-amber-200",
  expense: "bg-yellow-100 text-yellow-700 border-yellow-200",
  material: "bg-blue-100 text-blue-700 border-blue-200",
  task: "bg-sky-100 text-sky-700 border-sky-200",
  project: "bg-purple-100 text-purple-700 border-purple-200",
  architecture: "bg-indigo-100 text-indigo-700 border-indigo-200",
  blueprint: "bg-violet-100 text-violet-700 border-violet-200",
};

// Architecture-specific approvals (design, blueprint, layout)
const ARCHITECTURE_APPROVALS: Approval[] = [
  {
    id: "arch1",
    type: "project",
    entityId: "p1",
    title: "NH-48 Highway — Bridge Structural Design Approval",
    requestedBy: "u3",
    status: "pending",
    notes:
      "Structural calculation sheets and load analysis submitted. Review of foundation design required.",
    createdAt: Date.now() - 3 * 86400000,
    slaDeadline: Date.now() + 4 * 86400000,
  },
  {
    id: "arch2",
    type: "project",
    entityId: "p2",
    title: "Metro Bridge — Falsework & Centering Design",
    requestedBy: "u2",
    status: "pending",
    notes:
      "Falsework design prepared by structural team. Safety factor calculations enclosed.",
    createdAt: Date.now() - 5 * 86400000,
    slaDeadline: Date.now() + 2 * 86400000,
  },
  {
    id: "arch3",
    type: "project",
    entityId: "p3",
    title: "Government Office Complex — Architectural Layout Plan",
    requestedBy: "u2",
    status: "approved",
    approvedBy: "u1",
    notes: "Floor plan and elevation drawings reviewed and approved.",
    createdAt: Date.now() - 15 * 86400000,
    resolvedAt: Date.now() - 10 * 86400000,
    slaDeadline: Date.now() + 30 * 86400000,
  },
  {
    id: "arch4",
    type: "project",
    entityId: "p1",
    title: "NH-48 — Drainage & Culvert Design Revision",
    requestedBy: "u3",
    status: "rejected",
    notes: "Design does not comply with IRC:75 standards. Revision required.",
    createdAt: Date.now() - 20 * 86400000,
    resolvedAt: Date.now() - 18 * 86400000,
    slaDeadline: Date.now() - 12 * 86400000,
  },
  {
    id: "arch5",
    type: "project",
    entityId: "p2",
    title: "Metro Bridge — Expansion Joint Specification Approval",
    requestedBy: "u3",
    status: "escalated",
    notes:
      "Expansion joint type selection needs authority sign-off due to high cost variant.",
    createdAt: Date.now() - 7 * 86400000,
    slaDeadline: Date.now() + 1 * 86400000,
  },
];

function SlaTimer({ slaDeadline }: { slaDeadline: number }) {
  const now = Date.now();
  const diffDays = Math.ceil((slaDeadline - now) / 86400000);
  let cls = "bg-green-100 text-green-700 border-green-200";
  let label = `${diffDays}d`;
  if (diffDays < 0) {
    cls = "bg-red-100 text-red-700 border-red-200";
    label = "Overdue";
  } else if (diffDays <= 3) {
    cls = "bg-red-100 text-red-700 border-red-200";
  } else if (diffDays <= 7) {
    cls = "bg-amber-100 text-amber-700 border-amber-200";
  }
  return (
    <Badge className={`text-[10px] whitespace-nowrap ${cls}`}>
      <Clock className="w-2.5 h-2.5 mr-0.5" />
      {label}
    </Badge>
  );
}

function ApprovalDetailModal({
  approval,
  onClose,
  onAction,
}: {
  approval: Approval | null;
  onClose: () => void;
  onAction: (id: string, action: "approve" | "reject", reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [actionPending, setActionPending] = useState<
    "approve" | "reject" | null
  >(null);

  if (!approval) return null;
  const requester = DEMO_USERS.find((u) => u.id === approval.requestedBy);

  function handleAction(action: "approve" | "reject") {
    setActionPending(action);
    setTimeout(() => {
      onAction(approval!.id, action, reason);
      setActionPending(null);
      setReason("");
      onClose();
    }, 600);
  }

  return (
    <Dialog open={!!approval} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-white border border-slate-200 max-w-md"
        data-ocid="authority.approval.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-bold pr-6 leading-snug">
            {approval.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex gap-2 flex-wrap">
            <Badge
              className={`capitalize text-xs ${TYPE_COLORS[approval.type] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
            >
              {approval.type}
            </Badge>
            <Badge
              className={`capitalize text-xs ${STATUS_COLORS[approval.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
            >
              {approval.status}
            </Badge>
            <SlaTimer slaDeadline={approval.slaDeadline} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-slate-500">Requested by</p>
              <p className="font-medium text-slate-800 mt-0.5">
                {requester?.name ?? "—"}
              </p>
              <p className="text-xs text-slate-500">{requester?.role}</p>
            </div>
            {approval.amount && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500">Amount</p>
                <p className="font-semibold text-amber-600 mt-0.5">
                  ₹{(approval.amount / 100000).toFixed(2)}L
                </p>
              </div>
            )}
          </div>

          {approval.notes && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <p className="text-slate-700">{approval.notes}</p>
            </div>
          )}

          <div className="text-xs text-slate-500">
            Submitted:{" "}
            {new Date(approval.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>

          {approval.status === "pending" || approval.status === "escalated" ? (
            <div className="space-y-2 pt-1">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                Comment (optional)
              </p>
              <Textarea
                className="bg-white border-slate-300 text-sm resize-none focus:border-amber-400"
                rows={3}
                placeholder="Add a reason or comment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                data-ocid="authority.approval.comment_textarea"
              />
            </div>
          ) : null}
        </div>

        {(approval.status === "pending" || approval.status === "escalated") && (
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={onClose}
              data-ocid="authority.approval.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white border-0"
              onClick={() => handleAction("reject")}
              disabled={!!actionPending}
              data-ocid="authority.approval.confirm_reject_button"
            >
              {actionPending === "reject" ? (
                <Clock className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white border-0"
              onClick={() => handleAction("approve")}
              disabled={!!actionPending}
              data-ocid="authority.approval.confirm_button"
            >
              {actionPending === "approve" ? (
                <Clock className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              )}
              Approve
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

const SUB_TABS: { label: string; value: SubTab }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

function ApprovalsTable({
  items,
  onView,
  onAction,
  localStatuses,
  idPrefix,
}: {
  items: Approval[];
  onView: (a: Approval) => void;
  onAction: (id: string, action: "approve" | "reject", reason: string) => void;
  localStatuses: Record<string, ApprovalStatus>;
  idPrefix: string;
}) {
  const [subTab, setSubTab] = useState<SubTab>("all");

  const enriched = useMemo(
    () =>
      items.map((a) => ({
        ...a,
        status: (localStatuses[a.id] ?? a.status) as ApprovalStatus,
      })),
    [items, localStatuses],
  );
  const filtered =
    subTab === "all" ? enriched : enriched.filter((a) => a.status === subTab);

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {SUB_TABS.map((t) => (
          <Button
            key={t.value}
            size="sm"
            className={
              subTab === t.value
                ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            }
            onClick={() => setSubTab(t.value)}
            data-ocid={`${idPrefix}.sub_tab.${t.value}`}
          >
            {t.label}
            {t.value !== "all" && (
              <span className="ml-1.5 text-[10px] opacity-70">
                {enriched.filter((a) => a.status === t.value).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          className="text-center py-12 text-slate-500"
          data-ocid={`${idPrefix}.empty_state`}
        >
          No approvals found for this filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Submitted By</th>
                {items.some((a) => a.amount) && (
                  <th className="text-right px-4 py-3">Amount</th>
                )}
                <th className="text-left px-4 py-3">SLA</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => {
                const requester = DEMO_USERS.find(
                  (u) => u.id === a.requestedBy,
                );
                const isPending =
                  a.status === "pending" || a.status === "escalated";
                return (
                  <tr
                    key={a.id}
                    className="border-b border-slate-100 hover:bg-amber-50/30 transition-colors"
                    data-ocid={`${idPrefix}.row.${idx + 1}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-800 font-medium">
                          {a.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {requester?.name ?? "—"}
                    </td>
                    {items.some((ai) => ai.amount) && (
                      <td className="px-4 py-3 text-right font-medium text-amber-600">
                        {a.amount ? `₹${(a.amount / 100000).toFixed(1)}L` : "—"}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <SlaTimer slaDeadline={a.slaDeadline} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`capitalize text-xs ${STATUS_COLORS[a.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                      >
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          onClick={() => onView(a)}
                          data-ocid={`${idPrefix}.view_button.${idx + 1}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {isPending && (
                          <>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-green-500 hover:bg-green-600 text-white border-0"
                              onClick={() => onAction(a.id, "approve", "")}
                              data-ocid={`${idPrefix}.approve_button.${idx + 1}`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-red-500 hover:bg-red-600 text-white border-0"
                              onClick={() => onView(a)}
                              data-ocid={`${idPrefix}.reject_button.${idx + 1}`}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AuthorityApprovalsPage() {
  const { data: monetaryApprovals, isLoading } = useApprovals();
  const [mainTab, setMainTab] = useState<MainTab>("architecture");
  const [detail, setDetail] = useState<Approval | null>(null);
  const [localStatuses, setLocalStatuses] = useState<
    Record<string, ApprovalStatus>
  >({});

  function handleAction(
    id: string,
    action: "approve" | "reject",
    _reason: string,
  ) {
    setLocalStatuses((prev) => ({
      ...prev,
      [id]: action === "approve" ? "approved" : "rejected",
    }));
    if (action === "approve") {
      toast.success("Request approved successfully");
    } else {
      toast.error("Request rejected");
    }
  }

  const pendingArchCount = ARCHITECTURE_APPROVALS.filter(
    (a) =>
      (localStatuses[a.id] ?? a.status) === "pending" ||
      (localStatuses[a.id] ?? a.status) === "escalated",
  ).length;

  const pendingMonCount = (monetaryApprovals ?? []).filter(
    (a) =>
      (localStatuses[a.id] ?? a.status) === "pending" ||
      (localStatuses[a.id] ?? a.status) === "escalated",
  ).length;

  return (
    <div
      className="p-4 lg:p-6 space-y-5 bg-slate-50 min-h-screen"
      data-ocid="authority.approvals.page"
    >
      <div>
        <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
          Approvals
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Review architecture and monetary approval requests
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-left w-full hover:border-amber-200 transition-all"
          onClick={() => setMainTab("architecture")}
          data-ocid="authority.approvals.architecture_tab_card"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Architecture</p>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {pendingArchCount}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            blueprints & design approvals pending
          </p>
        </button>
        <button
          type="button"
          className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-left w-full hover:border-amber-200 transition-all"
          onClick={() => setMainTab("monetary")}
          data-ocid="authority.approvals.monetary_tab_card"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Monetary</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">{pendingMonCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            budget & expense approvals pending
          </p>
        </button>
      </div>

      {/* Main tabs */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)}>
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger
            value="architecture"
            className="text-sm data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-slate-600"
            data-ocid="authority.approvals.main_tab.architecture"
          >
            <Building2 className="w-4 h-4 mr-1.5" />
            Architecture
            {pendingArchCount > 0 && (
              <span className="ml-1.5 text-[10px] bg-red-100 text-red-700 rounded-full px-1.5">
                {pendingArchCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="monetary"
            className="text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-600"
            data-ocid="authority.approvals.main_tab.monetary"
          >
            <Banknote className="w-4 h-4 mr-1.5" />
            Monetary
            {pendingMonCount > 0 && (
              <span className="ml-1.5 text-[10px] bg-red-100 text-red-700 rounded-full px-1.5">
                {pendingMonCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {["sk-1", "sk-2", "sk-3"].map((k) => (
            <Skeleton key={k} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : mainTab === "architecture" ? (
        <ApprovalsTable
          items={ARCHITECTURE_APPROVALS}
          onView={setDetail}
          onAction={handleAction}
          localStatuses={localStatuses}
          idPrefix="authority.arch_approvals"
        />
      ) : (
        <ApprovalsTable
          items={monetaryApprovals ?? []}
          onView={setDetail}
          onAction={handleAction}
          localStatuses={localStatuses}
          idPrefix="authority.monetary_approvals"
        />
      )}

      <ApprovalDetailModal
        approval={detail}
        onClose={() => setDetail(null)}
        onAction={handleAction}
      />
    </div>
  );
}
