import { WAGE_REQUESTS } from "@/lib/mockData";
import type { WageRequest } from "@/lib/mockData";
import { CheckCircle2, Clock, DollarSign, History, X } from "lucide-react";
import { useState } from "react";



function WageDetailModal({
  req,
  onClose,
  onApprove,
  onReject,
}: {
  req: WageRequest;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        role="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div
        className="relative w-full max-w-md bg-card rounded-2xl p-5 space-y-4 shadow-xl border border-border"
        data-ocid="contractor-wages.dialog"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-foreground text-lg">
            Wage Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-ocid="contractor-wages.close_button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-lg">
              {req.workerName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{req.workerName}</p>
            <p className="text-xs text-muted-foreground">
              {req.trade} · {req.period} · <span className="font-medium text-foreground">{req.projectName}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Days Worked", value: `${req.daysWorked} days` },
            { label: "Rate / Day", value: `₹${req.ratePerDay}` },
            {
              label: "Total Amount",
              value: `₹${req.amount.toLocaleString()}`,
              highlight: true,
            },
            { label: "Period", value: req.period },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className="bg-muted border border-border rounded-xl p-3"
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p
                className={`text-sm font-semibold mt-0.5 ${highlight ? "text-primary" : "text-foreground"}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {req.status === "pending" && (
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 rounded-xl text-sm font-semibold transition-colors duration-200"
              data-ocid="contractor-wages.reject_button"
              onClick={() => {
                onReject(req.id);
                onClose();
              }}
            >
              Reject
            </button>
            <button
              type="button"
              className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-colors duration-200"
              data-ocid="contractor-wages.confirm_button"
              onClick={() => {
                onApprove(req.id);
                onClose();
              }}
            >
              Approve ₹{req.amount.toLocaleString()}
            </button>
          </div>
        )}
        {req.status !== "pending" && (
          <div
            className={`flex items-center gap-2 justify-center py-2.5 rounded-xl text-sm font-semibold ${req.status === "approved" || req.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {req.status === "approved" || req.status === "paid" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            {req.status === "paid"
              ? `Paid on ${req.paidOn ?? req.approvedOn}`
              : req.status === "approved"
              ? `Approved on ${req.approvedOn}`
              : "Rejected"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractorWageApprovalPage() {
  const [requests, setRequests] = useState<WageRequest[]>(WAGE_REQUESTS);
  const [selected, setSelected] = useState<WageRequest | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  function approve(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "approved",
              approvedOn: new Date().toISOString().split("T")[0],
            }
          : r,
      ),
    );
  }
  function reject(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)),
    );
  }

  const pending = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending");
  const totalPendingAmount = pending.reduce((sum, r) => sum + r.amount, 0);
  const totalPendingWorkers = pending.length;

  return (
    <div
      className="bg-muted min-h-screen p-4 space-y-6"
      data-ocid="contractor-wages.page"
    >
      <div>
        <h1 className="font-display font-bold text-xl text-foreground">
          Wage Approvals
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Approve or reject labour wage requests
        </p>
      </div>

      {/* Summary banner */}
      {pending.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {totalPendingWorkers} Pending Wage Requests
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total awaiting approval:{" "}
              <span className="font-bold text-primary">
                ₹{totalPendingAmount.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          data-ocid="contractor-wages.pending_tab"
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors duration-200 ${activeTab === "pending" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"}`}
        >
          <Clock className="w-4 h-4" />
          Pending ({pending.length})
        </button>
        <button
          type="button"
          data-ocid="contractor-wages.history_tab"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors duration-200 ${activeTab === "history" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"}`}
        >
          <History className="w-4 h-4" />
          History ({history.length})
        </button>
      </div>

      {/* Pending list */}
      {activeTab === "pending" && (
        <div className="space-y-3" data-ocid="contractor-wages.pending_list">
          {pending.length === 0 && (
            <div
              className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm"
              data-ocid="contractor-wages.empty_state"
            >
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-foreground font-medium">All wages approved</p>
              <p className="text-muted-foreground text-sm mt-1">
                No pending wage requests
              </p>
            </div>
          )}
          {pending.map((req, i) => (
            <div
              key={req.id}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm"
              data-ocid={`contractor-wages.item.${i + 1}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">
                    {req.workerName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{req.workerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.trade} · {req.period} · {req.projectName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-lg">
                    ₹{req.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {req.daysWorked} days × ₹{req.ratePerDay}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 rounded-xl text-sm font-semibold transition-colors duration-200"
                  data-ocid={`contractor-wages.reject_button.${i + 1}`}
                  onClick={() => reject(req.id)}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 bg-green-100 hover:bg-green-200 text-green-700 border border-green-200 rounded-xl text-sm font-semibold transition-colors duration-200"
                  data-ocid={`contractor-wages.approve_button.${i + 1}`}
                  onClick={() => approve(req.id)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="px-3 py-2 bg-muted border border-border text-foreground rounded-xl text-sm font-medium hover:border-primary/40 transition-colors duration-200"
                  data-ocid={`contractor-wages.details_button.${i + 1}`}
                  onClick={() => setSelected(req)}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {activeTab === "history" && (
        <div className="space-y-2" data-ocid="contractor-wages.history_list">
          {history.map((req, i) => (
            <button
              key={req.id}
              type="button"
              className="w-full text-left bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm hover:border-primary/40 transition-colors duration-200"
              data-ocid={`contractor-wages.history_item.${i + 1}`}
              onClick={() => setSelected(req)}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">
                  {req.workerName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {req.workerName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {req.period} · {req.trade} · {req.projectName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  ₹{req.amount.toLocaleString()}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    req.status === "approved" || req.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {req.status === "approved" ? "Approved" : req.status === "paid" ? "Paid" : "Rejected"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <WageDetailModal
          req={selected}
          onClose={() => setSelected(null)}
          onApprove={approve}
          onReject={reject}
        />
      )}
    </div>
  );
}
