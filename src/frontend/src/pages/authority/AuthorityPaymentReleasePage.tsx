import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useApprovals, useProjects } from "@/hooks/useBackend";
import { DEMO_USERS } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import type { Project } from "@/types";
import {
  CheckCircle2,
  Clock,
  Eye,
  IndianRupee,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface PaymentRequest {
  id: string;
  contractorName: string;
  contractorRole: string;
  projectId: string;
  amount: number;
  description: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  invoiceRef: string;
}

const PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    id: "pr1",
    contractorName: "Vikram Patel Construction",
    contractorRole: "Main Contractor",
    projectId: "p1",
    amount: 2450000,
    description: "Milestone 3 — Road Base Layer Completion",
    date: "2026-04-10",
    status: "pending",
    invoiceRef: "INV-2026-0041",
  },
  {
    id: "pr2",
    contractorName: "Ravi Infrastructure Ltd.",
    contractorRole: "Subcontractor",
    projectId: "p2",
    amount: 875000,
    description: "Bridge Deck Reinforcement Works",
    date: "2026-04-08",
    status: "pending",
    invoiceRef: "INV-2026-0038",
  },
  {
    id: "pr3",
    contractorName: "Suresh Civil Works",
    contractorRole: "Main Contractor",
    projectId: "p3",
    amount: 1200000,
    description: "Foundation Completion — Phase 2",
    date: "2026-04-05",
    status: "pending",
    invoiceRef: "INV-2026-0035",
  },
  {
    id: "pr4",
    contractorName: "Vikram Patel Construction",
    contractorRole: "Main Contractor",
    projectId: "p1",
    amount: 1750000,
    description: "Milestone 2 — Earthwork & Drainage",
    date: "2026-03-20",
    status: "approved",
    invoiceRef: "INV-2026-0028",
  },
  {
    id: "pr5",
    contractorName: "Ravi Infrastructure Ltd.",
    contractorRole: "Subcontractor",
    projectId: "p2",
    amount: 420000,
    description: "Falsework Erection — Span B",
    date: "2026-03-15",
    status: "approved",
    invoiceRef: "INV-2026-0022",
  },
  {
    id: "pr6",
    contractorName: "Anand Equipment Hire",
    contractorRole: "Equipment Vendor",
    projectId: "p1",
    amount: 310000,
    description: "Monthly equipment rental — March 2026",
    date: "2026-04-01",
    status: "rejected",
    invoiceRef: "INV-2026-0033",
  },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

function PaymentDetailModal({
  req,
  onClose,
  projectName,
}: {
  req: PaymentRequest | null;
  onClose: () => void;
  projectName: string;
}) {
  if (!req) return null;
  return (
    <Dialog open={!!req} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-white border border-slate-200 max-w-md"
        data-ocid="authority.payment.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-bold pr-6">
            Payment Request Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Invoice Ref", v: req.invoiceRef },
              { l: "Date", v: req.date },
              { l: "Contractor", v: req.contractorName },
              { l: "Project", v: projectName },
            ].map((r) => (
              <div
                key={r.l}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3"
              >
                <p className="text-xs text-slate-500">{r.l}</p>
                <p className="font-medium text-slate-800 mt-0.5">{r.v}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Amount</p>
            <p className="text-2xl font-bold text-amber-600">
              {formatCurrency(req.amount)}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Description</p>
            <p className="text-slate-700">{req.description}</p>
          </div>
          <div className="flex justify-end">
            <Badge
              className={`text-xs capitalize ${STATUS_COLORS[req.status]}`}
            >
              {req.status}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type TabFilter = "all" | "pending" | "approved" | "rejected";

const TABS: { label: string; value: TabFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default function AuthorityPaymentReleasePage() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [tab, setTab] = useState<TabFilter>("pending");
  const [detail, setDetail] = useState<PaymentRequest | null>(null);
  const [localStatuses, setLocalStatuses] = useState<
    Record<string, "pending" | "approved" | "rejected">
  >({});

  const enriched = useMemo(
    () =>
      PAYMENT_REQUESTS.map((r) => ({
        ...r,
        status: localStatuses[r.id] ?? r.status,
      })),
    [localStatuses],
  );

  const filtered = useMemo(
    () => (tab === "all" ? enriched : enriched.filter((r) => r.status === tab)),
    [enriched, tab],
  );

  function handleAction(id: string, action: "approved" | "rejected") {
    setLocalStatuses((prev) => ({ ...prev, [id]: action }));
    if (action === "approved") {
      toast.success("Payment approved and released");
    } else {
      toast.error("Payment request rejected");
    }
  }

  function getProjectName(projectId: string) {
    return (projects ?? []).find((p) => p.id === projectId)?.name ?? projectId;
  }

  const pendingCount = enriched.filter((r) => r.status === "pending").length;
  const pendingTotal = enriched
    .filter((r) => r.status === "pending")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div
      className="p-4 lg:p-6 space-y-5 bg-slate-50 min-h-screen"
      data-ocid="authority.payment.page"
    >
      <div>
        <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
          Release Payments
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Approve or reject contractor payment requests
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <p className="text-xs text-slate-500">Pending Requests</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {pendingCount}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">awaiting decision</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <p className="text-xs text-slate-500">Pending Amount</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {formatCurrency(pendingTotal)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">on hold</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 col-span-2 lg:col-span-1">
          <p className="text-xs text-slate-500">Total Approved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(
              enriched
                .filter((r) => r.status === "approved")
                .reduce((s, r) => s + r.amount, 0),
            )}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">released to date</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {TABS.map((t) => (
          <Button
            key={t.value}
            size="sm"
            className={
              tab === t.value
                ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            }
            onClick={() => setTab(t.value)}
            data-ocid={`authority.payment.tab.${t.value}`}
          >
            {t.label}
            {t.value !== "all" && (
              <span className="ml-1.5 text-[10px] bg-white/30 rounded-full px-1.5">
                {enriched.filter((r) => r.status === t.value).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Table */}
      {projectsLoading ? (
        <div className="space-y-3">
          {["sk-1", "sk-2", "sk-3"].map((k) => (
            <Skeleton key={k} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 text-slate-500"
          data-ocid="authority.payment.empty_state"
        >
          No payment requests in this category.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table
            className="w-full text-sm min-w-[640px]"
            data-ocid="authority.payment.table"
          >
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Contractor</th>
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, idx) => {
                const isPending = req.status === "pending";
                return (
                  <tr
                    key={req.id}
                    className="border-b border-slate-100 hover:bg-amber-50/30 transition-colors"
                    data-ocid={`authority.payment.row.${idx + 1}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 whitespace-nowrap">
                            {req.contractorName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {req.contractorRole}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                      {getProjectName(req.projectId)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[180px]">
                      <p className="truncate">{req.description}</p>
                      <p className="text-xs text-slate-400">{req.invoiceRef}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-600 whitespace-nowrap">
                      <span className="flex items-center justify-end gap-0.5">
                        <IndianRupee className="w-3 h-3" />
                        {(req.amount / 100000).toFixed(2)}L
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {req.date}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-xs capitalize ${STATUS_COLORS[req.status]}`}
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          onClick={() => setDetail(req)}
                          data-ocid={`authority.payment.view_button.${idx + 1}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {isPending && (
                          <>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-green-500 hover:bg-green-600 text-white border-0"
                              onClick={() => handleAction(req.id, "approved")}
                              data-ocid={`authority.payment.approve_button.${idx + 1}`}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Release
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-red-500 hover:bg-red-600 text-white border-0"
                              onClick={() => handleAction(req.id, "rejected")}
                              data-ocid={`authority.payment.reject_button.${idx + 1}`}
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

      <PaymentDetailModal
        req={detail}
        onClose={() => setDetail(null)}
        projectName={detail ? getProjectName(detail.projectId) : ""}
      />
    </div>
  );
}
