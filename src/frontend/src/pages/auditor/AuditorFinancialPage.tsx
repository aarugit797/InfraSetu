import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EXPENSES, PROJECTS } from "@/lib/mockData";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Download,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProjectFinancialRow {
  id: string;
  name: string;
  location: string;
  allocated: number;
  spent: number;
  variance: number;
  variancePct: number;
  status: string;
  isSuspicious: boolean;
}

function buildRows(): ProjectFinancialRow[] {
  return PROJECTS.map((p) => {
    const projectExpenses = EXPENSES.filter((e) => e.projectId === p.id);
    const spent = projectExpenses.reduce((s, e) => s + e.amount, 0);
    const variance = spent - p.actualCost;
    const variancePct =
      p.actualCost > 0
        ? Math.round(((spent - p.actualCost) / p.actualCost) * 100)
        : 0;
    const isSuspicious = projectExpenses.some(
      (e) => e.amount > p.budget * 0.08,
    );
    return {
      id: p.id,
      name: p.name,
      location: p.location,
      allocated: p.budget,
      spent: p.actualCost,
      variance,
      variancePct,
      status: p.status,
      isSuspicious,
    };
  });
}

const ALL_ROWS = buildRows();

// Bar chart max
const MAX_BUDGET = Math.max(...PROJECTS.map((p) => p.budget));

export default function AuditorFinancialPage() {
  const [search, setSearch] = useState("");

  const filtered = ALL_ROWS.filter(
    (r) =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()),
  );

  const totalAllocated = ALL_ROWS.reduce((s, r) => s + r.allocated, 0);
  const totalSpent = ALL_ROWS.reduce((s, r) => s + r.spent, 0);
  const overallVariancePct = Math.round(
    ((totalSpent - totalAllocated) / totalAllocated) * 100,
  );
  const suspiciousCount = ALL_ROWS.filter((r) => r.isSuspicious).length;

  function handleExport() {
    toast.success("Financial report exported", {
      description: `${ALL_ROWS.length} projects · ${formatCurrency(totalAllocated)} total budget`,
    });
  }

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-4"
      data-ocid="auditor-financial.page"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Financial Monitoring
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Budget vs actual · {ALL_ROWS.length} projects
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 bg-white"
          onClick={handleExport}
          data-ocid="auditor-financial.export_button"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div
        className="grid grid-cols-2 gap-3"
        data-ocid="auditor-financial.summary"
      >
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <p className="text-xs text-slate-500 font-medium">
              Total Allocated
            </p>
          </div>
          <p className="text-slate-800 text-xl font-bold">
            {formatCurrency(totalAllocated)}
          </p>
          <p className="text-slate-400 text-xs mt-0.5">
            Across {ALL_ROWS.length} projects
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <p className="text-xs text-slate-500 font-medium">Total Spent</p>
          </div>
          <p className="text-slate-800 text-xl font-bold">
            {formatCurrency(totalSpent)}
          </p>
          <p
            className={cn(
              "text-xs mt-0.5 font-semibold flex items-center gap-1",
              overallVariancePct > 0 ? "text-red-600" : "text-green-600",
            )}
          >
            {overallVariancePct > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {overallVariancePct > 0 ? "+" : ""}
            {overallVariancePct}% variance
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-slate-500 font-medium">
              Budget Utilization
            </p>
          </div>
          <p className="text-slate-800 text-xl font-bold">
            {Math.round((totalSpent / totalAllocated) * 100)}%
          </p>
          <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{
                width: `${Math.min(100, Math.round((totalSpent / totalAllocated) * 100))}%`,
              }}
            />
          </div>
        </div>
        <div
          className={cn(
            "border rounded-2xl p-4 shadow-sm",
            suspiciousCount > 0
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200",
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle
              className={cn(
                "w-4 h-4",
                suspiciousCount > 0 ? "text-red-600" : "text-green-600",
              )}
            />
            <p className="text-xs text-slate-500 font-medium">Anomalies</p>
          </div>
          <p
            className={cn(
              "text-xl font-bold",
              suspiciousCount > 0 ? "text-red-700" : "text-green-700",
            )}
          >
            {suspiciousCount}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Suspicious expenses</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm"
        data-ocid="auditor-financial.bar-chart"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Budget Comparison
          </h2>
        </div>
        <div className="space-y-4">
          {PROJECTS.map((p) => {
            const spentPct = Math.round((p.actualCost / p.budget) * 100);
            const budgetBarW = Math.round((p.budget / MAX_BUDGET) * 100);
            const isOver = spentPct > 90;
            return (
              <div key={p.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-slate-700 text-xs font-semibold leading-tight truncate max-w-[60%]">
                    {p.name}
                  </p>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      isOver ? "text-red-600" : "text-green-600",
                    )}
                  >
                    {spentPct}%
                  </span>
                </div>
                {/* Allocated bar */}
                <div
                  className="h-2 bg-slate-100 rounded-full overflow-hidden"
                  style={{ width: `${budgetBarW}%` }}
                >
                  <div
                    className={cn(
                      "h-full rounded-full",
                      isOver ? "bg-red-500" : "bg-amber-500",
                    )}
                    style={{ width: `${Math.min(100, spentPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Spent: {formatCurrency(p.actualCost)}</span>
                  <span>Budget: {formatCurrency(p.budget)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span className="text-slate-500">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-slate-500">&gt;90% used</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-slate-300"
          data-ocid="auditor-financial.search_input"
        />
      </div>

      {/* Table */}
      <div
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        data-ocid="auditor-financial.table"
      >
        <div className="hidden sm:grid grid-cols-[1fr_110px_110px_90px_60px] gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
          <span>Project</span>
          <span className="text-right">Allocated</span>
          <span className="text-right">Spent</span>
          <span className="text-right">Variance</span>
          <span className="text-center">Flag</span>
        </div>

        {filtered.length === 0 ? (
          <div
            className="p-8 text-center"
            data-ocid="auditor-financial.empty_state"
          >
            <p className="text-slate-500 text-sm">
              No projects match your search
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((row, idx) => (
              <div
                key={row.id}
                className={cn(
                  "p-4 space-y-2 transition-colors",
                  row.isSuspicious
                    ? "bg-red-50 border-l-4 border-l-red-500"
                    : "hover:bg-amber-50",
                )}
                data-ocid={`auditor-financial.item.${idx + 1}`}
              >
                {/* Mobile view */}
                <div className="sm:hidden space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 text-sm font-semibold truncate">
                        {row.name}
                      </p>
                      <p className="text-slate-500 text-xs">{row.location}</p>
                    </div>
                    {row.isSuspicious && (
                      <Badge className="text-[10px] px-1.5 py-0 border bg-red-100 text-red-700 border-red-300 flex-shrink-0">
                        ⚠ Anomaly
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                      <p className="text-slate-400 text-[10px]">Allocated</p>
                      <p className="text-slate-800 font-bold">
                        {formatCurrency(row.allocated)}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                      <p className="text-slate-400 text-[10px]">Spent</p>
                      <p className="text-slate-800 font-bold">
                        {formatCurrency(row.spent)}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "border rounded-lg p-2 text-center",
                        row.variancePct > 10
                          ? "bg-red-50 border-red-200"
                          : "bg-green-50 border-green-200",
                      )}
                    >
                      <p className="text-slate-400 text-[10px]">Variance</p>
                      <p
                        className={cn(
                          "font-bold text-sm",
                          row.variancePct > 10
                            ? "text-red-700"
                            : "text-green-700",
                        )}
                      >
                        {row.variancePct > 0 ? "+" : ""}
                        {row.variancePct}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Budget utilization</span>
                      <span>
                        {Math.round((row.spent / row.allocated) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          row.spent / row.allocated > 0.9
                            ? "bg-red-500"
                            : "bg-amber-500",
                        )}
                        style={{
                          width: `${Math.min(100, Math.round((row.spent / row.allocated) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Desktop view */}
                <div className="hidden sm:grid grid-cols-[1fr_110px_110px_90px_60px] gap-2 items-center text-xs">
                  <div className="min-w-0">
                    <p className="text-slate-800 font-semibold truncate">
                      {row.name}
                    </p>
                    <p className="text-slate-400 text-[10px] truncate">
                      {row.location}
                    </p>
                  </div>
                  <p className="text-slate-700 text-right font-mono">
                    {formatCurrency(row.allocated)}
                  </p>
                  <p className="text-slate-700 text-right font-mono">
                    {formatCurrency(row.spent)}
                  </p>
                  <p
                    className={cn(
                      "text-right font-bold",
                      row.variancePct > 10
                        ? "text-red-600"
                        : row.variancePct < -5
                          ? "text-green-600"
                          : "text-slate-700",
                    )}
                  >
                    {row.variancePct > 0 ? "+" : ""}
                    {row.variancePct}%
                  </p>
                  <div className="flex justify-center">
                    {row.isSuspicious ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suspicious Expenses Detail */}
      {suspiciousCount > 0 && (
        <div
          className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
          data-ocid="auditor-financial.suspicious-expenses"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-semibold text-slate-800 text-sm">
              Flagged Suspicious Expenses
            </h2>
            <span className="ml-auto text-xs text-red-500 font-semibold">
              {suspiciousCount} anomalies
            </span>
          </div>
          <div className="space-y-2">
            {EXPENSES.filter((e) => {
              const proj = PROJECTS.find((p) => p.id === e.projectId);
              return proj && e.amount > proj.budget * 0.08;
            })
              .slice(0, 5)
              .map((expense, idx) => {
                const proj = PROJECTS.find((p) => p.id === expense.projectId);
                return (
                  <div
                    key={expense.id}
                    className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl p-3 space-y-1"
                    data-ocid={`auditor-financial.suspicious-expense.${idx + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-slate-800 text-sm font-semibold truncate">
                        {expense.description}
                      </p>
                      <p className="text-red-700 font-bold text-sm flex-shrink-0">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{proj?.name ?? expense.projectId}</span>
                      <span>·</span>
                      <span>{expense.category}</span>
                      <span>·</span>
                      <span>{formatDate(expense.date)}</span>
                      <Badge className="ml-auto text-[9px] px-1.5 py-0 border bg-amber-100 text-amber-700 border-amber-300">
                        {expense.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
