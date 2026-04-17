import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";

interface EquipmentFailure {
  id: string;
  equipmentName: string;
  failureDescription: string;
  severity: "low" | "medium" | "high" | "critical";
  reportedDate: string;
  status: "reported" | "underRepair" | "fixed";
}

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_STYLES: Record<string, string> = {
  reported: "bg-amber-100 text-amber-700 border-amber-200",
  underRepair: "bg-blue-100 text-blue-700 border-blue-200",
  fixed: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_LABEL: Record<string, string> = {
  reported: "Reported",
  underRepair: "Under Repair",
  fixed: "Fixed",
};

const INITIAL_FAILURES: EquipmentFailure[] = [
  {
    id: "f1",
    equipmentName: "Concrete Mixer CM-01",
    failureDescription:
      "Motor overheating, shuts off after 10 min of operation",
    severity: "high",
    reportedDate: "2026-05-12",
    status: "underRepair",
  },
  {
    id: "f2",
    equipmentName: "Tower Crane TC-03",
    failureDescription:
      "Hydraulic fluid leak detected near boom extension joint",
    severity: "critical",
    reportedDate: "2026-05-14",
    status: "reported",
  },
  {
    id: "f3",
    equipmentName: "Excavator EX-02",
    failureDescription: "Left track tension is loose, needs re-tensioning",
    severity: "medium",
    reportedDate: "2026-05-08",
    status: "fixed",
  },
  {
    id: "f4",
    equipmentName: "Portable Generator PG-01",
    failureDescription: "Voltage fluctuation causing lights to flicker on site",
    severity: "medium",
    reportedDate: "2026-05-10",
    status: "underRepair",
  },
  {
    id: "f5",
    equipmentName: "Welding Machine WM-02",
    failureDescription: "Arc instability at high current settings",
    severity: "low",
    reportedDate: "2026-05-06",
    status: "fixed",
  },
];

function ReportModal({
  onClose,
  onReport,
}: {
  onClose: () => void;
  onReport: (data: Omit<EquipmentFailure, "id">) => void;
}) {
  const [equipmentName, setEquipmentName] = useState("");
  const [failureDescription, setFailureDescription] = useState("");
  const [severity, setSeverity] =
    useState<EquipmentFailure["severity"]>("medium");
  const [reportedDate, setReportedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  function handleSubmit() {
    if (!equipmentName || !failureDescription) return;
    onReport({
      equipmentName,
      failureDescription,
      severity,
      reportedDate,
      status: "reported",
    });
    onClose();
  }

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
        data-ocid="contractor-equipment.dialog"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-foreground text-lg">
            Report Equipment Failure
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-ocid="contractor-equipment.close_button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="eq-name"
              className="text-xs font-medium text-foreground mb-1.5 block"
            >
              Equipment Name <span className="text-red-500">*</span>
            </label>
            <input
              id="eq-name"
              className="w-full border border-input rounded-xl px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              placeholder="e.g. Concrete Mixer CM-01"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              data-ocid="contractor-equipment.name_input"
            />
          </div>
          <div>
            <label
              htmlFor="eq-desc"
              className="text-xs font-medium text-foreground mb-1.5 block"
            >
              Failure Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="eq-desc"
              className="w-full border border-input rounded-xl px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
              placeholder="Describe what went wrong…"
              rows={3}
              value={failureDescription}
              onChange={(e) => setFailureDescription(e.target.value)}
              data-ocid="contractor-equipment.description_input"
            />
          </div>
          <div>
            <label
              htmlFor="eq-severity"
              className="text-xs font-medium text-foreground mb-1.5 block"
            >
              Severity
            </label>
            <select
              id="eq-severity"
              className="w-full border border-input rounded-xl px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value as EquipmentFailure["severity"])
              }
              data-ocid="contractor-equipment.severity_select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="eq-date"
              className="text-xs font-medium text-foreground mb-1.5 block"
            >
              Date
            </label>
            <input
              id="eq-date"
              type="date"
              className="w-full border border-input rounded-xl px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              value={reportedDate}
              onChange={(e) => setReportedDate(e.target.value)}
              data-ocid="contractor-equipment.date_input"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 py-2.5 bg-muted border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors duration-200"
            data-ocid="contractor-equipment.cancel_button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-primary-foreground rounded-xl text-sm font-semibold transition-colors duration-200"
            data-ocid="contractor-equipment.submit_button"
            disabled={!equipmentName || !failureDescription}
            onClick={handleSubmit}
          >
            Report Failure
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractorEquipmentPage() {
  const [failures, setFailures] =
    useState<EquipmentFailure[]>(INITIAL_FAILURES);
  const [showReport, setShowReport] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    EquipmentFailure["status"] | "all"
  >("all");

  function addFailure(data: Omit<EquipmentFailure, "id">) {
    setFailures((prev) => [{ ...data, id: `f${prev.length + 1}` }, ...prev]);
  }

  const filtered = failures.filter(
    (f) => filterStatus === "all" || f.status === filterStatus,
  );

  const counts = {
    reported: failures.filter((f) => f.status === "reported").length,
    underRepair: failures.filter((f) => f.status === "underRepair").length,
    fixed: failures.filter((f) => f.status === "fixed").length,
  };

  return (
    <div
      className="bg-muted min-h-screen p-4 space-y-6"
      data-ocid="contractor-equipment.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">
            Equipment
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Report and track equipment failures
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm"
          data-ocid="contractor-equipment.open_modal_button"
          onClick={() => setShowReport(true)}
        >
          <Plus className="w-4 h-4" />
          Report
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "Reported",
            count: counts.reported,
            color: "text-amber-600",
            bg: "bg-amber-100",
            status: "reported" as const,
          },
          {
            label: "Repairing",
            count: counts.underRepair,
            color: "text-blue-600",
            bg: "bg-blue-100",
            status: "underRepair" as const,
          },
          {
            label: "Fixed",
            count: counts.fixed,
            color: "text-green-600",
            bg: "bg-green-100",
            status: "fixed" as const,
          },
        ].map((s) => (
          <button
            key={s.label}
            type="button"
            data-ocid={`contractor-equipment.${s.status}_tab`}
            onClick={() =>
              setFilterStatus(filterStatus === s.status ? "all" : s.status)
            }
            className={`bg-card border rounded-xl p-3 text-center shadow-sm transition-all duration-200 ${filterStatus === s.status ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-primary/40"}`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["all", "reported", "underRepair", "fixed"] as const).map((s) => (
          <button
            key={s}
            type="button"
            data-ocid={`contractor-equipment.filter_${s}`}
            onClick={() => setFilterStatus(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200 ${
              filterStatus === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            {s === "all"
              ? "All"
              : s === "underRepair"
                ? "Under Repair"
                : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Failure list */}
      <div className="space-y-3" data-ocid="contractor-equipment.list">
        {filtered.length === 0 && (
          <div
            className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm"
            data-ocid="contractor-equipment.empty_state"
          >
            <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="text-foreground font-medium">
              No failures in this category
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              All equipment is operating normally
            </p>
          </div>
        )}
        {filtered.map((failure, i) => (
          <div
            key={failure.id}
            className="bg-card border border-border rounded-2xl p-4 shadow-sm"
            data-ocid={`contractor-equipment.item.${i + 1}`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${SEVERITY_STYLES[failure.severity]?.split(" ")[0] ?? "bg-muted"}`}
              >
                <AlertTriangle
                  className={`w-5 h-5 ${SEVERITY_STYLES[failure.severity]?.split(" ")[1] ?? "text-foreground"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {failure.equipmentName}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEVERITY_STYLES[failure.severity]}`}
                  >
                    {failure.severity.charAt(0).toUpperCase() +
                      failure.severity.slice(1)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[failure.status]}`}
                  >
                    {STATUS_LABEL[failure.status]}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3 pl-0">
              {failure.failureDescription}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Reported:{" "}
                {new Date(failure.reportedDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {failure.status === "underRepair" && (
                <span className="flex items-center gap-1 ml-2 text-blue-600">
                  <Clock className="w-3.5 h-3.5" />
                  Repair in progress
                </span>
              )}
              {failure.status === "fixed" && (
                <span className="flex items-center gap-1 ml-2 text-green-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showReport && (
        <ReportModal
          onClose={() => setShowReport(false)}
          onReport={addFailure}
        />
      )}
    </div>
  );
}
