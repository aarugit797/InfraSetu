import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillingStats, useInvoices } from "@/hooks/useBackend";
import type { Invoice, InvoiceStatus } from "@/types";
import { CheckCircle2, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  overdue: "bg-red-100 text-red-800 border-red-300",
};

const PIE_SLICES = [
  { label: "Labor", pct: 42, color: "#F59E0B" },
  { label: "Material", pct: 33, color: "#3B82F6" },
  { label: "Equipment", pct: 16, color: "#10B981" },
  { label: "Overhead", pct: 9, color: "#EF4444" },
];

function PieChart() {
  let cumPct = 0;
  const r = 40;
  const cx = 60;
  const cy = 60;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg
        width={120}
        height={120}
        viewBox="0 0 120 120"
        aria-label="Budget breakdown chart"
        role="img"
      >
        {PIE_SLICES.map((s) => {
          const offset = circ * (1 - cumPct / 100);
          const dash = circ * (s.pct / 100);
          cumPct += s.pct;
          return (
            <circle
              key={s.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={20}
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={offset}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "60px 60px",
              }}
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {PIE_SLICES.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-slate-500 w-20">{s.label}</span>
            <span className="font-semibold text-slate-800">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PAYMENT_HISTORY = [
  {
    date: "2024-06-30",
    vendor: "BuildEquip Rentals",
    amount: 413000,
    ref: "BER/2024/0345",
  },
  {
    date: "2024-06-15",
    vendor: "Shree Steel Industries",
    amount: 2500000,
    ref: "SSI/2024/0612",
  },
  {
    date: "2024-05-31",
    vendor: "Rajasthan Cement Corp",
    amount: 304000,
    ref: "RCC/2024/0099",
  },
  {
    date: "2024-05-20",
    vendor: "Green Consult",
    amount: 420000,
    ref: "GCA/2024/0071",
  },
  {
    date: "2024-04-30",
    vendor: "Shree Steel Industries",
    amount: 4500000,
    ref: "SSI/2024/0580",
  },
];

function InvoiceDetailModal({
  invoice,
  onClose,
  onMarkPaid,
}: {
  invoice: Invoice | null;
  onClose: () => void;
  onMarkPaid: (id: string) => void;
}) {
  if (!invoice) return null;
  const canPay = invoice.status === "approved";

  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-white border border-slate-200 max-w-md"
        data-ocid="authority.billing.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-bold pr-6">
            Invoice {invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge
              className={`text-xs capitalize ${STATUS_COLORS[invoice.status]}`}
            >
              {invoice.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Vendor", v: invoice.vendorName },
              { l: "Invoice No", v: invoice.invoiceNumber },
              {
                l: "Base Amount",
                v: `₹${(invoice.amount / 100000).toFixed(2)}L`,
              },
              {
                l: "Tax (GST)",
                v: `₹${(invoice.taxAmount / 100000).toFixed(2)}L`,
              },
              {
                l: "Total Amount",
                v: `₹${(invoice.totalAmount / 100000).toFixed(2)}L`,
              },
              { l: "Due Date", v: invoice.dueDate },
            ].map((r) => (
              <div
                key={r.l}
                className="bg-slate-50 border border-slate-200 rounded-lg p-2.5"
              >
                <p className="text-xs text-slate-500">{r.l}</p>
                <p className="font-medium text-slate-800 mt-0.5 text-sm">
                  {r.v}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Description</p>
            <p className="text-slate-700 text-sm">{invoice.description}</p>
          </div>

          {invoice.paidAt && (
            <p className="text-xs text-green-600">
              Paid on {new Date(invoice.paidAt).toLocaleDateString("en-IN")}
            </p>
          )}
        </div>

        {canPay && (
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={onClose}
              data-ocid="authority.billing.cancel_button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white border-0"
              onClick={() => {
                onMarkPaid(invoice.id);
                onClose();
              }}
              data-ocid="authority.billing.confirm_button"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Mark as Paid
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AuthorityBillingPage() {
  const { data: stats, isLoading: statsLoading } = useBillingStats();
  const { data: invoices, isLoading: invLoading } = useInvoices();
  const [detail, setDetail] = useState<Invoice | null>(null);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  function handleMarkPaid(id: string) {
    setPaidIds((prev) => new Set([...prev, id]));
    toast.success("Invoice marked as paid");
  }

  function handleApproveInvoice(id: string) {
    toast.success(`Invoice ${id} approved`);
  }

  const enrichedInvoices = (invoices ?? []).map((inv) => ({
    ...inv,
    status: (paidIds.has(inv.id) ? "paid" : inv.status) as InvoiceStatus,
  }));

  const totalPaid = enrichedInvoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.totalAmount, 0);
  const totalPending = enrichedInvoices
    .filter((i) => i.status === "submitted" || i.status === "approved")
    .reduce((s, i) => s + i.totalAmount, 0);
  const totalOverdue = enrichedInvoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + i.totalAmount, 0);

  const statItems = [
    {
      label: "Total Invoiced",
      value: stats ? `₹${(stats.totalInvoiced / 100000).toFixed(1)}L` : "—",
      color: "text-slate-800",
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      label: "Total Paid",
      value: `₹${(totalPaid / 100000).toFixed(1)}L`,
      color: "text-green-600",
      iconBg: "bg-green-100 text-green-600",
    },
    {
      label: "Pending Payment",
      value: `₹${(totalPending / 100000).toFixed(1)}L`,
      color: "text-amber-600",
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      label: "Overdue",
      value: `₹${(totalOverdue / 100000).toFixed(1)}L`,
      color: "text-red-600",
      iconBg: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div
      className="p-4 lg:p-6 space-y-6 bg-slate-50 min-h-screen"
      data-ocid="authority.billing.page"
    >
      <div>
        <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
          Billing & Finance
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Invoice management and budget oversight
        </p>
      </div>

      {/* Stat row */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        data-ocid="authority.billing.stats.section"
      >
        {statsLoading
          ? ["sk-bs-1", "sk-bs-2", "sk-bs-3", "sk-bs-4"].map((k) => (
              <Skeleton key={k} className="h-20 rounded-xl" />
            ))
          : statItems.map((s) => (
              <div
                key={s.label}
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-4"
              >
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Budget breakdown pie */}
        <div
          className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3"
          data-ocid="authority.billing.pie_chart"
        >
          <h2 className="font-semibold text-slate-800 text-sm">
            Budget Breakdown
          </h2>
          <PieChart />
        </div>

        {/* Payment history */}
        <div
          className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3"
          data-ocid="authority.billing.payment_history"
        >
          <h2 className="font-semibold text-slate-800 text-sm">
            Recent Payments
          </h2>
          <div className="space-y-2">
            {PAYMENT_HISTORY.map((p, i) => (
              <div
                key={p.ref}
                className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0"
                data-ocid={`authority.billing.payment.item.${i + 1}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {p.vendor}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.ref} · {p.date}
                  </p>
                </div>
                <p className="font-semibold text-amber-600 text-sm flex-shrink-0">
                  ₹{(p.amount / 100000).toFixed(1)}L
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice table */}
      <div className="space-y-3" data-ocid="authority.billing.invoices.section">
        <h2 className="font-semibold text-slate-800 text-sm">Invoices</h2>
        {invLoading ? (
          <div className="space-y-2">
            {["sk-inv-1", "sk-inv-2", "sk-inv-3", "sk-inv-4"].map((k) => (
              <Skeleton key={k} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Invoice No</th>
                  <th className="text-left px-4 py-3">Vendor</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Due Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrichedInvoices.map((inv, idx) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-100 hover:bg-amber-50/30 transition-colors"
                    data-ocid={`authority.billing.invoice.row.${idx + 1}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">
                          {inv.invoiceNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {inv.vendorName}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-600">
                      ₹{(inv.totalAmount / 100000).toFixed(2)}L
                    </td>
                    <td className="px-4 py-3 text-slate-600">{inv.dueDate}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-xs capitalize ${STATUS_COLORS[inv.status]}`}
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          onClick={() => setDetail(inv)}
                          data-ocid={`authority.billing.invoice.view_button.${idx + 1}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {inv.status === "submitted" && (
                          <Button
                            size="sm"
                            className="h-7 px-2.5 text-xs bg-amber-500 hover:bg-amber-600 text-white border-0"
                            onClick={() => handleApproveInvoice(inv.id)}
                            data-ocid={`authority.billing.invoice.approve_button.${idx + 1}`}
                          >
                            Approve
                          </Button>
                        )}
                        {inv.status === "approved" && (
                          <Button
                            size="sm"
                            className="h-7 px-2.5 text-xs bg-green-500 hover:bg-green-600 text-white border-0"
                            onClick={() => handleMarkPaid(inv.id)}
                            data-ocid={`authority.billing.invoice.mark_paid_button.${idx + 1}`}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InvoiceDetailModal
        invoice={detail}
        onClose={() => setDetail(null)}
        onMarkPaid={handleMarkPaid}
      />
    </div>
  );
}
