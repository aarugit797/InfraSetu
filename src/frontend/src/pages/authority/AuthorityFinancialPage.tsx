import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDashboardStats,
  useExpenses,
  useProjects,
} from "@/hooks/useBackend";
import { formatCurrency } from "@/lib/utils";
import type { Project } from "@/types";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const MONTHLY_DATA = [
  { budget: 12.0, spent: 8.5 },
  { budget: 14.0, spent: 11.2 },
  { budget: 13.5, spent: 12.8 },
  { budget: 16.0, spent: 14.1 },
  { budget: 15.0, spent: 13.3 },
  { budget: 18.0, spent: 15.6 },
];
const MAX_VAL = 20;

function BudgetVsActualChart() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-amber-400 inline-block" />
          Budgeted (₹Cr)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-blue-400 inline-block" />
          Actual (₹Cr)
        </span>
      </div>
      <div className="flex items-end gap-2 h-40">
        {MONTHS.map((m, i) => {
          const d = MONTHLY_DATA[i] ?? { budget: 0, spent: 0 };
          const bH = (d.budget / MAX_VAL) * 100;
          const sH = (d.spent / MAX_VAL) * 100;
          return (
            <div key={m} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full flex items-end gap-0.5"
                style={{ height: "128px" }}
              >
                <div
                  className="flex-1 rounded-t-sm bg-amber-300 border border-amber-400 transition-all"
                  style={{ height: `${bH}%` }}
                />
                <div
                  className="flex-1 rounded-t-sm bg-blue-400 border border-blue-500 transition-all"
                  style={{ height: `${sH}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">{m}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectFinanceRow({
  project,
  idx,
}: { project: Project; idx: number }) {
  const utilization = Math.round((project.actualCost / project.budget) * 100);
  const overBudget = project.actualCost > project.budget;
  const statusColor =
    project.status === "active"
      ? "bg-green-100 text-green-700 border-green-200"
      : project.status === "planning"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <tr
      className="border-b border-slate-100 hover:bg-amber-50/30 transition-colors"
      data-ocid={`authority.financial.project.row.${idx}`}
    >
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-slate-800">{project.name}</p>
        <p className="text-xs text-slate-500">{project.location}</p>
      </td>
      <td className="px-4 py-3">
        <Badge className={`text-xs capitalize ${statusColor}`}>
          {project.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-slate-700 text-right">
        {formatCurrency(project.budget)}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-amber-600 text-right">
        {formatCurrency(project.actualCost)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-sm font-semibold ${overBudget ? "text-red-600" : "text-green-600"}`}
          >
            {utilization}%
          </span>
          <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${overBudget ? "bg-red-500" : utilization >= 80 ? "bg-amber-500" : "bg-green-500"}`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        {overBudget ? (
          <span className="flex items-center justify-end gap-1 text-xs text-red-600 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            Over by {formatCurrency(project.actualCost - project.budget)}
          </span>
        ) : (
          <span className="flex items-center justify-end gap-1 text-xs text-green-600 font-medium">
            <ArrowDownRight className="w-3 h-3" />
            Under by {formatCurrency(project.budget - project.actualCost)}
          </span>
        )}
      </td>
    </tr>
  );
}

export default function AuthorityFinancialPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: expenses, isLoading: expensesLoading } = useExpenses();

  const totalBudget = stats?.totalBudget ?? 0;
  const totalSpent = stats?.totalSpent ?? 0;
  const utilization =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = (expenses ?? [])
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + e.amount, 0);

  const summaryCards = [
    {
      label: "Total Allocated",
      value: formatCurrency(totalBudget),
      sub: "across all projects",
      icon: Wallet,
      iconBg: "bg-amber-100 text-amber-600",
      valueColor: "text-amber-600",
    },
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      sub: `${utilization}% utilized`,
      icon: TrendingUp,
      iconBg: "bg-blue-100 text-blue-600",
      valueColor: "text-blue-600",
    },
    {
      label: "Budget Remaining",
      value: formatCurrency(Math.max(0, totalBudget - totalSpent)),
      sub: "available balance",
      icon: TrendingDown,
      iconBg: "bg-green-100 text-green-600",
      valueColor: "text-green-600",
    },
    {
      label: "Pending Expenses",
      value: formatCurrency(pendingExpenses),
      sub: "awaiting approval",
      icon: BarChart3,
      iconBg: "bg-orange-100 text-orange-600",
      valueColor: "text-orange-600",
    },
  ];

  return (
    <div
      className="p-4 lg:p-6 space-y-5 bg-slate-50 min-h-screen"
      data-ocid="authority.financial.page"
    >
      <div>
        <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
          Financial Overview
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Budget allocation, expenditure tracking, and per-project breakdown
        </p>
      </div>

      {/* Summary cards */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        data-ocid="authority.financial.stats.section"
      >
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`sk-${String(i)}`} className="h-24 rounded-xl" />
            ))
          : summaryCards.map((s) => (
              <div
                key={s.label}
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.iconBg}`}
                  >
                    <s.icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className={`text-xl font-bold ${s.valueColor}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
              </div>
            ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Budget vs Actual chart */}
        <div
          className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3"
          data-ocid="authority.financial.budget_chart"
        >
          <h2 className="font-semibold text-slate-800 text-sm">
            Monthly Budget vs Actual (₹Cr)
          </h2>
          <BudgetVsActualChart />
        </div>

        {/* Category breakdown */}
        <div
          className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3"
          data-ocid="authority.financial.category_breakdown"
        >
          <h2 className="font-semibold text-slate-800 text-sm">
            Expenditure by Category
          </h2>
          {expensesLoading ? (
            <div className="space-y-2">
              {["sk-c1", "sk-c2", "sk-c3"].map((k) => (
                <Skeleton key={k} className="h-8 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(
                [
                  "Labor",
                  "Materials",
                  "Equipment",
                  "Services",
                  "Overhead",
                ] as const
              ).map((cat) => {
                const catTotal = (expenses ?? [])
                  .filter((e) => e.category === cat)
                  .reduce((s, e) => s + e.amount, 0);
                const pct =
                  totalExpenses > 0
                    ? Math.round((catTotal / totalExpenses) * 100)
                    : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">{cat}</span>
                      <span className="text-slate-800 font-medium">
                        {formatCurrency(catTotal)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Per-project breakdown table */}
      <div className="space-y-3">
        <h2 className="font-semibold text-slate-800 text-sm">
          Per-Project Financial Breakdown
        </h2>
        {projectsLoading ? (
          <div className="space-y-2">
            {["sk-p1", "sk-p2", "sk-p3"].map((k) => (
              <Skeleton key={k} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table
              className="w-full text-sm min-w-[640px]"
              data-ocid="authority.financial.projects.table"
            >
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Project</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Budget</th>
                  <th className="text-right px-4 py-3">Actual Spent</th>
                  <th className="text-right px-4 py-3">Utilization</th>
                  <th className="text-right px-4 py-3">Variance</th>
                </tr>
              </thead>
              <tbody>
                {(projects ?? []).map((p, idx) => (
                  <ProjectFinanceRow key={p.id} project={p} idx={idx + 1} />
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-amber-50 border-t border-amber-200">
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-sm font-semibold text-slate-800"
                  >
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-800">
                    {formatCurrency(totalBudget)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-amber-600">
                    {formatCurrency(totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-slate-700">
                    {utilization}%
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                    Under by {formatCurrency(totalBudget - totalSpent)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
