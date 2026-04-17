import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { EXPENSES, PROJECTS } from "@/lib/mockData";
import {
  cn,
  formatCurrency,
  formatDate,
  generateId,
  getStatusColor,
} from "@/lib/utils";
import type { Expense, ExpenseCategory, ExpenseStatus } from "@/types";
import {
  BarChart3,
  CheckCircle,
  FileDown,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const CATEGORIES: ExpenseCategory[] = [
  "Labor",
  "Materials",
  "Equipment",
  "Services",
  "Overhead",
  "Miscellaneous",
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Labor: "bg-violet-500",
  Materials: "bg-blue-500",
  Equipment: "bg-amber-500",
  Services: "bg-teal-500",
  Overhead: "bg-rose-500",
  Miscellaneous: "bg-slate-500",
};

const CATEGORY_TEXT_COLORS: Record<ExpenseCategory, string> = {
  Labor: "text-violet-400",
  Materials: "text-blue-400",
  Equipment: "text-amber-400",
  Services: "text-teal-400",
  Overhead: "text-rose-400",
  Miscellaneous: "text-slate-400",
};

// ─── Summary Card ────────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  variant,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  variant: "primary" | "accent" | "warning" | "muted";
}) {
  const variantStyles: Record<string, string> = {
    primary: "text-primary",
    accent: "text-accent",
    warning: "text-amber-400",
    muted: "text-muted-foreground",
  };
  const iconBg: Record<string, string> = {
    primary: "bg-primary/15 border-primary/25",
    accent: "bg-accent/15 border-accent/25",
    warning: "bg-amber-500/15 border-amber-500/25",
    muted: "bg-muted border-border",
  };
  return (
    <div
      className="glass rounded-2xl p-4 flex items-center gap-4"
      data-ocid="finance-summary-card"
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center border",
          iconBg[variant],
        )}
      >
        <Icon className={cn("w-6 h-6", variantStyles[variant])} />
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {label}
        </p>
        <p
          className={cn(
            "font-display font-bold text-lg leading-tight",
            variantStyles[variant],
          )}
        >
          {value}
        </p>
        {sub && <p className="text-muted-foreground text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Budget vs Actual SVG Chart ───────────────────────────────────────────────
function BudgetChart({ projectId }: { projectId: string }) {
  const projects =
    projectId === "all" ? PROJECTS : PROJECTS.filter((p) => p.id === projectId);

  const maxVal = Math.max(...projects.flatMap((p) => [p.budget, p.actualCost]));
  const chartH = 160;
  const barW = 28;
  const gap = 8;
  const groupW = barW * 2 + gap + 24;
  const svgW = projects.length * groupW + 40;

  return (
    <div className="overflow-x-auto pb-1">
      <svg
        width={svgW}
        height={chartH + 50}
        className="min-w-full"
        role="img"
        aria-label="Budget vs Actual chart"
      >
        <title>Budget vs Actual Spend by Project</title>
        {/* Y-axis guide lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = 10 + (1 - frac) * chartH;
          return (
            <g key={frac}>
              <line
                x1={36}
                x2={svgW - 8}
                y1={y}
                y2={y}
                stroke="oklch(0.95 0 0 / 0.06)"
                strokeWidth={1}
              />
              <text
                x={32}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="oklch(0.55 0 0)"
                fontFamily="Inter, sans-serif"
              >
                {formatCurrency(maxVal * frac)}
              </text>
            </g>
          );
        })}
        {/* Bars */}
        {projects.map((p, i) => {
          const x = 44 + i * groupW;
          const budgetH = maxVal > 0 ? (p.budget / maxVal) * chartH : 0;
          const actualH = maxVal > 0 ? (p.actualCost / maxVal) * chartH : 0;
          const budgetY = 10 + chartH - budgetH;
          const actualY = 10 + chartH - actualH;
          const shortName = p.name.split(" ").slice(0, 2).join(" ");
          return (
            <g key={p.id}>
              {/* Budget bar */}
              <rect
                x={x}
                y={budgetY}
                width={barW}
                height={budgetH}
                rx={4}
                fill="oklch(0.72 0.2 290 / 0.85)"
                className="transition-smooth"
              >
                <title>{`${p.name} – Budget: ${formatCurrency(p.budget)}`}</title>
              </rect>
              {/* Actual bar */}
              <rect
                x={x + barW + gap}
                y={actualY}
                width={barW}
                height={actualH}
                rx={4}
                fill="oklch(0.7 0.2 180 / 0.85)"
                className="transition-smooth"
              >
                <title>{`${p.name} – Actual: ${formatCurrency(p.actualCost)}`}</title>
              </rect>
              {/* Project label */}
              <text
                x={x + barW + gap / 2}
                y={chartH + 24}
                textAnchor="middle"
                fontSize={9}
                fill="oklch(0.65 0 0)"
                fontFamily="Inter, sans-serif"
                className="select-none"
              >
                {shortName}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-1 px-1">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-3 h-3 rounded-sm bg-primary/85 inline-block" />
          Budget
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-3 h-3 rounded-sm bg-accent/85 inline-block" />
          Actual Spent
        </span>
      </div>
    </div>
  );
}

// ─── Category Breakdown ───────────────────────────────────────────────────────
function CategoryBreakdown({ expenses }: { expenses: Expense[] }) {
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    for (const e of expenses)
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    return CATEGORIES.map((cat) => ({ cat, amount: map.get(cat) ?? 0 }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  return (
    <div className="space-y-3">
      {byCategory.map(({ cat, amount }) => {
        const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
        return (
          <div key={cat} data-ocid={`category-row-${cat.toLowerCase()}`}>
            <div className="flex items-center justify-between mb-1">
              <span
                className={cn("text-sm font-medium", CATEGORY_TEXT_COLORS[cat])}
              >
                {cat}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-foreground">
                  {formatCurrency(amount)}
                </span>
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {pct.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  CATEGORY_COLORS[cat],
                )}
                style={{ width: `${pct}%` }}
                aria-label={`${cat}: ${pct.toFixed(1)}%`}
              />
            </div>
          </div>
        );
      })}
      {byCategory.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-6">
          No expense data for this filter.
        </p>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ExpenseStatus }) {
  const { bg, text, border } = getStatusColor(status);
  return (
    <Badge
      variant="outline"
      className={cn("capitalize text-xs border", bg, text, border)}
    >
      {status}
    </Badge>
  );
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────
interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (expense: Expense) => void;
}

function AddExpenseModal({ open, onClose, onAdd }: AddExpenseModalProps) {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({
    projectId: PROJECTS[0].id,
    category: "Labor" as ExpenseCategory,
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number.parseFloat(form.amount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    const expense: Expense = {
      id: generateId("exp"),
      projectId: form.projectId,
      amount: amt,
      category: form.category,
      description: form.description.trim(),
      submittedBy: currentUser?.id ?? "u2",
      status: "pending",
      date: form.date,
      createdAt: Date.now(),
    };
    onAdd(expense);
    toast.success(`Expense ${formatCurrency(amt)} added successfully!`);
    onClose();
    setForm({
      projectId: PROJECTS[0].id,
      category: "Labor",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
  }

  const inputCls =
    "w-full bg-muted/40 border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth";
  const labelCls =
    "block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Expense"
      description="Submit a new expense for approval"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="exp-project" className={labelCls}>
              Project
            </label>
            <select
              id="exp-project"
              className={inputCls}
              value={form.projectId}
              onChange={(e) =>
                setForm((f) => ({ ...f, projectId: e.target.value }))
              }
              data-ocid="add-expense-project"
            >
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="exp-category" className={labelCls}>
              Category
            </label>
            <select
              id="exp-category"
              className={inputCls}
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as ExpenseCategory,
                }))
              }
              data-ocid="add-expense-category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="exp-amount" className={labelCls}>
              Amount (₹)
            </label>
            <input
              id="exp-amount"
              type="number"
              min="1"
              placeholder="e.g. 500000"
              className={inputCls}
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              data-ocid="add-expense-amount"
            />
          </div>
          <div>
            <label htmlFor="exp-date" className={labelCls}>
              Date
            </label>
            <input
              id="exp-date"
              type="date"
              className={inputCls}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              data-ocid="add-expense-date"
            />
          </div>
        </div>
        <div>
          <label htmlFor="exp-desc" className={labelCls}>
            Description
          </label>
          <input
            id="exp-desc"
            type="text"
            placeholder="Brief description of the expense…"
            className={inputCls}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            data-ocid="add-expense-description"
          />
        </div>
        {form.amount && Number.parseFloat(form.amount) > 0 && (
          <div className="glass-sm rounded-lg px-3 py-2 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Amount: </span>
            <span className="text-sm font-semibold text-accent">
              {formatCurrency(Number.parseFloat(form.amount))}
            </span>
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90"
            data-ocid="add-expense-submit"
          >
            Submit Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FinancePage() {
  const { currentUser } = useAuth();
  const [projectFilter, setProjectFilter] = useState("all");
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES);
  const [showAddModal, setShowAddModal] = useState(false);

  const isManager =
    currentUser?.role === "projectManager" ||
    currentUser?.role === "governmentAuthority";

  const filtered = useMemo(
    () =>
      projectFilter === "all"
        ? expenses
        : expenses.filter((e) => e.projectId === projectFilter),
    [expenses, projectFilter],
  );

  const totalBudget = useMemo(
    () =>
      (projectFilter === "all"
        ? PROJECTS
        : PROJECTS.filter((p) => p.id === projectFilter)
      ).reduce((s, p) => s + p.budget, 0),
    [projectFilter],
  );

  const totalSpent = useMemo(
    () => filtered.reduce((s, e) => s + e.amount, 0),
    [filtered],
  );
  const remaining = totalBudget - totalSpent;
  const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  function handleApprove(id: string) {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "approved" as ExpenseStatus } : e,
      ),
    );
    toast.success("Expense approved.");
  }

  function handleReject(id: string) {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "rejected" as ExpenseStatus } : e,
      ),
    );
    toast.error("Expense rejected.");
  }

  const projectName = (id: string) =>
    PROJECTS.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page Header ── */}
      <div className="glass border-b border-border/40 sticky top-0 z-20 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Financial Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Budget tracking and expense management
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="bg-muted/40 border border-border/60 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[180px]"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              data-ocid="finance-project-filter"
            >
              <option value="all">All Projects</option>
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-border/60 text-muted-foreground hover:text-foreground"
              onClick={() => toast.info("Report generation coming soon.")}
              data-ocid="generate-report-btn"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Report</span>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-primary hover:bg-primary/90"
              onClick={() => setShowAddModal(true)}
              data-ocid="add-expense-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl mx-auto">
        {/* ── Summary Cards ── */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          data-ocid="finance-summary-row"
        >
          <SummaryCard
            label="Total Budget"
            value={formatCurrency(totalBudget)}
            sub="Sanctioned amount"
            icon={Wallet}
            variant="primary"
          />
          <SummaryCard
            label="Total Spent"
            value={formatCurrency(totalSpent)}
            sub={`${utilization.toFixed(1)}% utilized`}
            icon={TrendingUp}
            variant="accent"
          />
          <SummaryCard
            label="Remaining"
            value={formatCurrency(remaining)}
            sub={remaining < 0 ? "Over budget!" : "Available balance"}
            icon={TrendingDown}
            variant={remaining < 0 ? "warning" : "muted"}
          />
          <SummaryCard
            label="Utilization"
            value={`${utilization.toFixed(1)}%`}
            sub={utilization > 80 ? "High utilization" : "On track"}
            icon={BarChart3}
            variant={utilization > 80 ? "warning" : "primary"}
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Budget vs Actual */}
          <div
            className="lg:col-span-2 glass rounded-2xl p-5"
            data-ocid="budget-chart-section"
          >
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-primary inline-block" />
              Budget vs Actual Spend
            </h2>
            <BudgetChart projectId={projectFilter} />
          </div>

          {/* Category Breakdown */}
          <div
            className="glass rounded-2xl p-5"
            data-ocid="category-breakdown-section"
          >
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-accent inline-block" />
              Expense by Category
            </h2>
            <CategoryBreakdown expenses={filtered} />
          </div>
        </div>

        {/* ── Expense Table ── */}
        <div
          className="glass rounded-2xl overflow-hidden"
          data-ocid="expense-table-section"
        >
          <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground">
              Expense Records
            </h2>
            <span className="text-xs text-muted-foreground">
              {filtered.length} entries
            </span>
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden divide-y divide-border/30">
            {filtered.map((exp) => {
              return (
                <div
                  key={exp.id}
                  className="px-4 py-3 space-y-2"
                  data-ocid={`expense-row-${exp.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {exp.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {projectName(exp.projectId)}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-accent text-sm shrink-0">
                      {formatCurrency(exp.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full border",
                        CATEGORY_TEXT_COLORS[exp.category],
                        "border-current/30 bg-current/10",
                      )}
                    >
                      {exp.category}
                    </span>
                    <StatusBadge status={exp.status} />
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDate(exp.date)}
                    </span>
                  </div>
                  {isManager && exp.status === "pending" && (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-smooth"
                        onClick={() => handleApprove(exp.id)}
                        data-ocid={`approve-btn-${exp.id}`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-smooth"
                        onClick={() => handleReject(exp.id)}
                        data-ocid={`reject-btn-${exp.id}`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm" aria-label="Expenses table">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  {[
                    "Date",
                    "Category",
                    "Project",
                    "Description",
                    "Amount",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-muted/10 transition-colors"
                    data-ocid={`expense-row-${exp.id}`}
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(exp.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full border",
                          CATEGORY_TEXT_COLORS[exp.category],
                          "border-current/30 bg-current/10",
                        )}
                      >
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-[160px]">
                      <span className="truncate block">
                        {projectName(exp.projectId)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[220px]">
                      <span className="truncate block">{exp.description}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-accent whitespace-nowrap text-right">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={exp.status} />
                    </td>
                    <td className="px-4 py-3">
                      {isManager && exp.status === "pending" ? (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-smooth"
                            onClick={() => handleApprove(exp.id)}
                            data-ocid={`approve-btn-${exp.id}`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-smooth"
                            onClick={() => handleReject(exp.id)}
                            data-ocid={`reject-btn-${exp.id}`}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div
                className="py-12 text-center text-muted-foreground text-sm"
                data-ocid="expense-empty-state"
              >
                No expenses found for this filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FAB (mobile) ── */}
      <button
        type="button"
        className="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center transition-smooth hover:bg-primary/90 active:scale-95"
        onClick={() => setShowAddModal(true)}
        aria-label="Add expense"
        data-ocid="add-expense-fab"
      >
        <PlusCircle className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* ── Modals ── */}
      <AddExpenseModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(exp) => setExpenses((prev) => [exp, ...prev])}
      />
    </div>
  );
}
