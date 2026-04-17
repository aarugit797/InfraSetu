import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { WORKER_PAYMENTS } from "@/lib/mockData";
import type { WorkerPayment } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { CalendarDays, CreditCard, IndianRupee } from "lucide-react";

const thisMonth = new Date().toISOString().slice(0, 7); // "2026-04"

function statusColor(status: WorkerPayment["status"]) {
  if (status === "Paid") return "bg-green-100 text-green-700 border-green-300";
  if (status === "Processing")
    return "bg-amber-100 text-amber-700 border-amber-300";
  return "bg-slate-100 text-slate-500 border-slate-200";
}



export default function WorkerPaymentPage() {
  const { currentUser } = useAuth();
  // Filter by logged-in worker ID, fall back to demo worker u5
  const myPayments = WORKER_PAYMENTS.filter(
    (p) => p.workerId === (currentUser?.id ?? "u5"),
  );

  const monthTotal = myPayments
    .filter((p) => p.date.startsWith(thisMonth) && p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const pending = myPayments.filter(
    (p) => p.status === "Pending" || p.status === "Processing",
  );
  const paid = myPayments.filter((p) => p.status === "Paid");

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5 max-w-lg mx-auto"
      data-ocid="worker-payment.page"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payment</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Earnings & payment history
        </p>
      </div>

      {/* Month earnings card */}
      <div
        className="bg-amber-500 rounded-2xl p-5 text-white shadow-sm"
        data-ocid="worker-payment.month-summary"
      >
        <div className="flex items-center gap-2 mb-3">
          <IndianRupee className="w-5 h-5 opacity-80" />
          <p className="text-sm font-semibold opacity-90">
            Earnings This Month
          </p>
        </div>
        <p className="text-4xl font-bold tracking-tight">
          ₹{monthTotal.toLocaleString()}
        </p>
        <p className="text-xs mt-2 opacity-75">
          {new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })} ·{" "}
          {paid.filter((p) => p.date.startsWith(thisMonth)).length}{" "}
          payments received
        </p>
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-xs opacity-75">Pending</p>
            <p className="font-bold text-sm">
              ₹{pending.reduce((s, p) => s + p.amount, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-75">Processing</p>
            <p className="font-bold text-sm">
              ₹
              {myPayments.filter((p) => p.status === "Processing")
                .reduce((s, p) => s + p.amount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="ml-auto">
            <p className="text-xs opacity-75">Total Payments</p>
            <p className="font-bold text-sm">{myPayments.length}</p>
          </div>
        </div>
      </div>

      {/* Pending / Processing */}
      {pending.length > 0 && (
        <div className="space-y-2" data-ocid="worker-payment.pending-section">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Upcoming Payments
          </p>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100">
            {pending.map((payment, i) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                index={i + 1}
                section="upcoming"
              />
            ))}
          </div>
        </div>
      )}

      {/* Payment history table */}
      <div className="space-y-2" data-ocid="worker-payment.history-section">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Payment History
        </p>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100">
          {paid.map((payment, i) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              index={i + 1}
              section="history"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentRow({
  payment,
  index,
  section,
}: {
  payment: WorkerPayment;
  index: number;
  section: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-4"
      data-ocid={`worker-payment.${section}.item.${index}`}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          payment.status === "Paid"
            ? "bg-green-50"
            : payment.status === "Processing"
              ? "bg-amber-50"
              : "bg-slate-100",
        )}
      >
        <CreditCard
          className={cn(
            "w-5 h-5",
            payment.status === "Paid"
              ? "text-green-500"
              : payment.status === "Processing"
                ? "text-amber-500"
                : "text-slate-400",
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {payment.description}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <CalendarDays className="w-3 h-3 text-slate-400" />
          <p className="text-xs text-slate-500">
            {new Date(payment.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <p className="text-sm font-bold text-slate-800">
          ₹{payment.amount.toLocaleString()}
        </p>
        <Badge className={cn("text-xs border", statusColor(payment.status))}>
          {payment.status}
        </Badge>
      </div>
    </div>
  );
}
