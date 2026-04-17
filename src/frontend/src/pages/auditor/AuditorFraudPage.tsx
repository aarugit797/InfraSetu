import { Badge } from "@/components/ui/badge";
import { EXPENSES, ISSUES, PROJECTS, TASKS } from "@/lib/mockData";
import { cn, formatCurrency, formatDate, formatTimeAgo } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

type Severity = "critical" | "high" | "medium";

interface FraudItem {
  id: string;
  project: string;
  description: string;
  severity: Severity;
  detectedAt: number;
  amount?: number;
  category: "fakeProgress" | "overbilling";
}

function buildFraudItems(): FraudItem[] {
  const items: FraudItem[] = [];

  // Fake Progress: tasks completed with no supporting evidence (no completedAt within reasonable time)
  const fakeTasks = TASKS.filter(
    (t) =>
      t.status === "completed" &&
      (!t.completedAt || t.completedAt - t.createdAt < 3600000), // completed within 1 hour
  );
  for (const task of fakeTasks) {
    const proj = PROJECTS.find((p) => p.id === task.projectId);
    items.push({
      id: `fp-${task.id}`,
      project: proj?.name ?? task.projectId,
      description: `Task "${task.title}" marked complete with no elapsed work time — suspicious instant completion detected.`,
      severity:
        task.priority === "critical"
          ? "critical"
          : task.priority === "high"
            ? "high"
            : "medium",
      detectedAt: task.completedAt ?? task.createdAt,
      category: "fakeProgress",
    });
  }

  // If no fake tasks found, add a synthetic one for demo
  if (fakeTasks.length === 0) {
    items.push({
      id: "fp-demo-1",
      project: "NH-48 Highway Expansion",
      description:
        'Task "Foundation Concrete Pouring – Block C" marked complete within 15 minutes of creation by Ravi Yadav. No site photos or test report attached.',
      severity: "critical",
      detectedAt: Date.now() - 2 * 3600000,
      category: "fakeProgress",
    });
    items.push({
      id: "fp-demo-2",
      project: "Government School Complex",
      description:
        'Task "Electrical Wiring – Ground Floor" completed immediately after assignment. Progress from 0% to 100% in under 30 minutes — no engineer sign-off.',
      severity: "high",
      detectedAt: Date.now() - 5 * 3600000,
      category: "fakeProgress",
    });
  }

  // Overbilling: expense exceeds 8% of project budget
  const overbilledExpenses = EXPENSES.filter((e) => {
    const proj = PROJECTS.find((p) => p.id === e.projectId);
    return proj && e.amount > proj.budget * 0.08;
  });
  for (const expense of overbilledExpenses) {
    const proj = PROJECTS.find((p) => p.id === expense.projectId);
    const budgetPct = proj
      ? Math.round((expense.amount / proj.budget) * 100)
      : 0;
    items.push({
      id: `ob-${expense.id}`,
      project: proj?.name ?? expense.projectId,
      description: `${expense.category} expense "${expense.description}" amounts to ${formatCurrency(expense.amount)} — ${budgetPct}% of total project budget in a single invoice. Approved budget threshold exceeded.`,
      severity: budgetPct > 15 ? "critical" : "high",
      detectedAt: expense.createdAt,
      amount: expense.amount,
      category: "overbilling",
    });
  }

  // Add demo overbilling if none found
  if (overbilledExpenses.length === 0) {
    items.push({
      id: "ob-demo-1",
      project: "Water Treatment Plant",
      description:
        'Invoice from Sharma Constructions for "Advanced Filtration Equipment" — ₹48,00,000 vs approved purchase order of ₹22,00,000. Difference of ₹26,00,000 not authorized.',
      severity: "critical",
      detectedAt: Date.now() - 86400000,
      amount: 4800000,
      category: "overbilling",
    });
    items.push({
      id: "ob-demo-2",
      project: "NH-48 Highway Expansion",
      description:
        'Duplicate billing detected for "Aggregate Supply – Batch 7B". Two invoices of ₹8,50,000 each submitted by same vendor within 3 days for identical quantities.',
      severity: "high",
      detectedAt: Date.now() - 2 * 86400000,
      amount: 850000,
      category: "overbilling",
    });
  }

  return items.sort((a, b) => {
    const sev = { critical: 0, high: 1, medium: 2 };
    return sev[a.severity] - sev[b.severity];
  });
}

const ALL_FRAUD_ITEMS = buildFraudItems();
const FAKE_PROGRESS = ALL_FRAUD_ITEMS.filter(
  (i) => i.category === "fakeProgress",
);
const OVERBILLING = ALL_FRAUD_ITEMS.filter((i) => i.category === "overbilling");

const SEVERITY_STYLES: Record<
  Severity,
  { badge: string; border: string; bg: string }
> = {
  critical: {
    badge: "bg-red-100 text-red-700 border-red-300",
    border: "border-l-red-600",
    bg: "bg-red-50 border-red-200",
  },
  high: {
    badge: "bg-orange-100 text-orange-700 border-orange-300",
    border: "border-l-orange-500",
    bg: "bg-orange-50 border-orange-200",
  },
  medium: {
    badge: "bg-amber-100 text-amber-700 border-amber-300",
    border: "border-l-amber-400",
    bg: "bg-amber-50 border-amber-200",
  },
};

function FraudItemCard({ item, idx }: { item: FraudItem; idx: number }) {
  const styles = SEVERITY_STYLES[item.severity];
  return (
    <div
      className={cn(
        "border border-l-4 rounded-xl p-4 space-y-2 shadow-sm",
        styles.bg,
        styles.border,
      )}
      data-ocid={`auditor-fraud.item.${idx + 1}`}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          className={cn(
            "w-4 h-4 flex-shrink-0 mt-0.5",
            item.severity === "critical"
              ? "text-red-600"
              : item.severity === "high"
                ? "text-orange-500"
                : "text-amber-500",
          )}
        />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={cn(
                "text-[10px] px-1.5 py-0 border capitalize",
                styles.badge,
              )}
            >
              {item.severity}
            </Badge>
            <span className="text-[10px] text-slate-500">
              Flagged by system · {formatTimeAgo(item.detectedAt)}
            </span>
          </div>
          <p className="text-slate-800 text-xs font-semibold">{item.project}</p>
          {item.amount && (
            <p className="text-sm font-bold text-red-700">
              {formatCurrency(item.amount)}
            </p>
          )}
          <p className="text-slate-600 text-xs leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuditorFraudPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "fakeProgress" | "overbilling"
  >("all");

  const criticalCount = ALL_FRAUD_ITEMS.filter(
    (i) => i.severity === "critical",
  ).length;
  const highCount = ALL_FRAUD_ITEMS.filter((i) => i.severity === "high").length;

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-4"
      data-ocid="auditor-fraud.page"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Fraud Detection</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          System-flagged anomalies · {ALL_FRAUD_ITEMS.length} items
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3" data-ocid="auditor-fraud.summary">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-red-700 text-2xl font-bold">{criticalCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Critical</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-orange-700 text-2xl font-bold">{highCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">High Risk</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-amber-700 text-2xl font-bold">
            {ALL_FRAUD_ITEMS.length}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Total Flags</p>
        </div>
      </div>

      {/* How detection works */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Detection Methods
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
          <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <TrendingUp className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-700">Fake Progress</p>
              <p className="text-slate-500">
                Tasks marked complete with no elapsed work time or missing
                supporting evidence (photos, test reports, engineer sign-off).
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <FileSearch className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-700">Overbilling</p>
              <p className="text-slate-500">
                Invoice amounts exceeding approved budget thresholds, duplicate
                submissions, or significant deviations from purchase orders.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" data-ocid="auditor-fraud.tabs">
        {(
          [
            { key: "all", label: `All (${ALL_FRAUD_ITEMS.length})` },
            {
              key: "fakeProgress",
              label: `Fake Progress (${FAKE_PROGRESS.length})`,
            },
            {
              key: "overbilling",
              label: `Overbilling (${OVERBILLING.length})`,
            },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            data-ocid={`auditor-fraud.tab.${key}`}
            className={cn(
              "text-xs px-3 py-1.5 rounded-xl border font-semibold transition-colors",
              activeTab === key
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Fake Progress Section */}
      {(activeTab === "all" || activeTab === "fakeProgress") && (
        <div
          className="space-y-3"
          data-ocid="auditor-fraud.fake-progress-section"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
            <h2 className="font-semibold text-slate-800 text-sm">
              Fake Progress
            </h2>
            <span className="text-xs text-red-600 font-semibold">
              {FAKE_PROGRESS.length} flagged
            </span>
          </div>
          {FAKE_PROGRESS.length === 0 ? (
            <div
              className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm"
              data-ocid="auditor-fraud.fake-progress.empty_state"
            >
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-slate-600 text-sm font-semibold">
                No fake progress detected
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                All tasks have proper evidence
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {FAKE_PROGRESS.map((item, idx) => (
                <FraudItemCard key={item.id} item={item} idx={idx} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overbilling Section */}
      {(activeTab === "all" || activeTab === "overbilling") && (
        <div
          className="space-y-3"
          data-ocid="auditor-fraud.overbilling-section"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
            <h2 className="font-semibold text-slate-800 text-sm">
              Overbilling
            </h2>
            <span className="text-xs text-orange-600 font-semibold">
              {OVERBILLING.length} flagged
            </span>
          </div>
          {OVERBILLING.length === 0 ? (
            <div
              className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm"
              data-ocid="auditor-fraud.overbilling.empty_state"
            >
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-slate-600 text-sm font-semibold">
                No overbilling detected
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                All invoices within approved limits
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {OVERBILLING.map((item, idx) => (
                <FraudItemCard
                  key={item.id}
                  item={item}
                  idx={FAKE_PROGRESS.length + idx}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
