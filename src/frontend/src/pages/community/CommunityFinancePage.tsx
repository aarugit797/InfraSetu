import { Badge } from "@/components/ui/badge";
import { PROJECTS } from "@/lib/mockData";
import { cn, formatCurrency, getStatusColor } from "@/lib/utils";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";

interface ExpenseRow {
  id: string;
  projectId: string;
  description: string;
  amount: number;
  status: "approved" | "pending" | "paid" | "rejected";
  date: string;
  category: string;
}

const EXPENSE_ROWS: ExpenseRow[] = [
  {
    id: "e1",
    projectId: "p1",
    description: "Concrete Supply — Section C",
    amount: 1850000,
    status: "paid",
    date: "Apr 10, 2026",
    category: "Materials",
  },
  {
    id: "e2",
    projectId: "p1",
    description: "Labour Wages — Week 14",
    amount: 620000,
    status: "paid",
    date: "Apr 12, 2026",
    category: "Labour",
  },
  {
    id: "e3",
    projectId: "p1",
    description: "Heavy Equipment Hire — Excavator ×3",
    amount: 480000,
    status: "approved",
    date: "Apr 15, 2026",
    category: "Equipment",
  },
  {
    id: "e4",
    projectId: "p2",
    description: "Steel Reinforcement Bars",
    amount: 2100000,
    status: "paid",
    date: "Apr 8, 2026",
    category: "Materials",
  },
  {
    id: "e5",
    projectId: "p2",
    description: "Electrical Contractor Bill",
    amount: 390000,
    status: "pending",
    date: "Apr 18, 2026",
    category: "Services",
  },
  {
    id: "e6",
    projectId: "p2",
    description: "Labour Wages — Week 14",
    amount: 440000,
    status: "paid",
    date: "Apr 12, 2026",
    category: "Labour",
  },
  {
    id: "e7",
    projectId: "p3",
    description: "Site Clearing & Leveling",
    amount: 320000,
    status: "approved",
    date: "Apr 5, 2026",
    category: "Services",
  },
  {
    id: "e8",
    projectId: "p3",
    description: "Soil Testing Laboratory",
    amount: 95000,
    status: "pending",
    date: "Apr 17, 2026",
    category: "Services",
  },
];

const TOTAL_BUDGET = PROJECTS.reduce((s, p) => s + p.budget, 0);
const TOTAL_SPENT = PROJECTS.reduce((s, p) => s + p.actualCost, 0);
const TOTAL_RELEASED = 95000000;
const PENDING_PAYMENTS = EXPENSE_ROWS.filter(
  (e) => e.status === "pending",
).reduce((s, e) => s + e.amount, 0);

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
      <div className={cn("rounded-xl p-2.5 flex-shrink-0", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium">{label}</p>
        <p className="text-slate-800 text-xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function CommunityFinancePage() {
  const utilizationPct = Math.round((TOTAL_SPENT / TOTAL_BUDGET) * 100);

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5"
      data-ocid="community-finance.page"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Finance Overview</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Budget provided by the Government Authority — read only
        </p>
      </div>

      {/* Read-only notice */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          This is a read-only view. Finance data is managed by the Government
          Authority. Community can view but not edit.
        </p>
      </div>

      {/* Summary stats */}
      <div
        className="grid grid-cols-2 gap-3"
        data-ocid="community-finance.stats"
      >
        <StatCard
          label="Total Budget"
          value={formatCurrency(TOTAL_BUDGET)}
          icon={DollarSign}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          sub="All projects combined"
        />
        <StatCard
          label="Amount Released"
          value={formatCurrency(TOTAL_RELEASED)}
          icon={CheckCircle2}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          sub="Disbursed by authority"
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(TOTAL_SPENT)}
          icon={TrendingUp}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          sub={`${utilizationPct}% of budget used`}
        />
        <StatCard
          label="Pending Approvals"
          value={formatCurrency(PENDING_PAYMENTS)}
          icon={Clock}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          sub="Awaiting authority"
        />
      </div>

      {/* Budget utilization bar */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
        data-ocid="community-finance.budget-bar"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Overall Budget Utilization
          </h2>
          <span className="ml-auto text-sm font-bold text-amber-600">
            {utilizationPct}%
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-700"
            style={{ width: `${utilizationPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Spent: {formatCurrency(TOTAL_SPENT)}</span>
          <span>Budget: {formatCurrency(TOTAL_BUDGET)}</span>
        </div>
      </div>

      {/* Per-project summary */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
        data-ocid="community-finance.project-summary"
      >
        <h2 className="font-semibold text-slate-800 text-sm">
          Per-Project Finance Summary
        </h2>
        <div className="space-y-3">
          {PROJECTS.map((proj, idx) => {
            const pct = Math.round((proj.actualCost / proj.budget) * 100);
            return (
              <div
                key={proj.id}
                className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2"
                data-ocid={`community-finance.project-card.${idx + 1}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-slate-800 text-sm font-semibold truncate">
                    {proj.name}
                  </p>
                  <span className="text-xs font-bold text-amber-600 flex-shrink-0">
                    {pct}%
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      pct >= 80
                        ? "bg-red-500"
                        : pct >= 50
                          ? "bg-amber-500"
                          : "bg-emerald-500",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Spent: {formatCurrency(proj.actualCost)}</span>
                  <span>Budget: {formatCurrency(proj.budget)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense breakdown table */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
        data-ocid="community-finance.expense-table"
      >
        <h2 className="font-semibold text-slate-800 text-sm">
          Expense Breakdown
        </h2>
        <div className="space-y-2">
          {EXPENSE_ROWS.map((row, idx) => {
            const proj = PROJECTS.find((p) => p.id === row.projectId);
            const sc = getStatusColor(row.status);
            return (
              <div
                key={row.id}
                className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3"
                data-ocid={`community-finance.expense-row.${idx + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-xs font-semibold truncate">
                    {row.description}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {proj?.name ?? "—"} · {row.category} · {row.date}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(row.amount)}
                  </span>
                  <Badge
                    className={cn(
                      "text-[10px] px-1.5 py-0 border capitalize",
                      sc.bg,
                      sc.text,
                      sc.border,
                    )}
                  >
                    {row.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
