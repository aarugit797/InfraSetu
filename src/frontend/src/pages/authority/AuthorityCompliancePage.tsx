import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects, useTestReports } from "@/hooks/useBackend";
import type { TestReport } from "@/types";
import {
  CheckCircle2,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

type ComplianceStatus = "Compliant" | "Non-Compliant" | "Pending";
type FilterStatus = "all" | ComplianceStatus;

interface ComplianceRule {
  id: string;
  rule: string;
  category: string;
  projectId: string;
  status: ComplianceStatus;
  lastChecked: string;
  remarks?: string;
}

function buildComplianceRules(reports: TestReport[]): ComplianceRule[] {
  const rules: ComplianceRule[] = [
    {
      id: "r1",
      rule: "Concrete Mix Design — IS 456 Standard",
      category: "Structural",
      projectId: "p1",
      status: "Compliant",
      lastChecked: "2026-04-10",
      remarks: "M30 grade verified",
    },
    {
      id: "r2",
      rule: "Rebar Tensile Strength — Fe-500D",
      category: "Material",
      projectId: "p1",
      status: "Compliant",
      lastChecked: "2026-04-08",
      remarks: "All samples passed",
    },
    {
      id: "r3",
      rule: "Bituminous Pavement Thickness — IRC:37",
      category: "Road Works",
      projectId: "p2",
      status: "Non-Compliant",
      lastChecked: "2026-04-05",
      remarks: "Layer thickness 8mm below spec",
    },
    {
      id: "r4",
      rule: "Environmental Clearance Renewal",
      category: "Regulatory",
      projectId: "p2",
      status: "Pending",
      lastChecked: "2026-03-28",
      remarks: "Renewal submitted, awaiting response",
    },
    {
      id: "r5",
      rule: "Fire Safety NOC — Local Authority",
      category: "Safety",
      projectId: "p3",
      status: "Compliant",
      lastChecked: "2026-04-01",
    },
    {
      id: "r6",
      rule: "Worker Safety Gear Audit",
      category: "Safety",
      projectId: "p1",
      status: "Pending",
      lastChecked: "2026-04-12",
      remarks: "Audit scheduled for next week",
    },
    {
      id: "r7",
      rule: "Soil Bearing Capacity Test — IS 2131",
      category: "Geotechnical",
      projectId: "p3",
      status: "Compliant",
      lastChecked: "2026-03-22",
    },
    {
      id: "r8",
      rule: "Waste Disposal Compliance — PCB Norms",
      category: "Environmental",
      projectId: "p2",
      status: "Non-Compliant",
      lastChecked: "2026-04-02",
      remarks: "Site waste segregation not followed",
    },
    {
      id: "r9",
      rule: "Labour License Under CL(R&A) Act",
      category: "Regulatory",
      projectId: "p1",
      status: "Compliant",
      lastChecked: "2026-04-09",
    },
    {
      id: "r10",
      rule: "Bridge Load Test — IRC:6",
      category: "Structural",
      projectId: "p3",
      status: "Pending",
      lastChecked: "2026-04-03",
      remarks: "Test pending schedule",
    },
  ];

  // Merge test report data
  const failedProjectIds = new Set(
    reports.filter((r) => r.result === "fail").map((r) => r.projectId),
  );
  return rules.map((rule) =>
    failedProjectIds.has(rule.projectId) && rule.status === "Pending"
      ? { ...rule, status: "Non-Compliant" as ComplianceStatus }
      : rule,
  );
}

const STATUS_CONFIG: Record<
  ComplianceStatus,
  { color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Compliant: {
    color: "bg-green-100 text-green-700 border-green-200",
    icon: ShieldCheck,
  },
  "Non-Compliant": {
    color: "bg-red-100 text-red-700 border-red-200",
    icon: ShieldAlert,
  },
  Pending: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: ShieldAlert,
  },
};

const FILTER_TABS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Compliant", value: "Compliant" },
  { label: "Non-Compliant", value: "Non-Compliant" },
  { label: "Pending", value: "Pending" },
];

function ComplianceRow({
  rule,
  projectName,
}: { rule: ComplianceRule; projectName: string }) {
  const cfg = STATUS_CONFIG[rule.status];
  const Icon = cfg.icon;
  return (
    <tr className="border-b border-slate-100 hover:bg-amber-50/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-start gap-2">
          <Icon
            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${rule.status === "Compliant" ? "text-green-500" : rule.status === "Non-Compliant" ? "text-red-500" : "text-amber-500"}`}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800">{rule.rule}</p>
            {rule.remarks && (
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
                {rule.remarks}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
          {rule.category}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
        {projectName}
      </td>
      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
        {rule.lastChecked}
      </td>
      <td className="px-4 py-3">
        <Badge className={`text-xs ${cfg.color}`}>{rule.status}</Badge>
      </td>
    </tr>
  );
}

export default function AuthorityCompliancePage() {
  const { data: reports, isLoading: reportsLoading } = useTestReports();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  const rules = useMemo(() => buildComplianceRules(reports ?? []), [reports]);

  const filtered = useMemo(() => {
    return rules.filter((r) => {
      const matchStatus = filter === "all" || r.status === filter;
      const matchSearch =
        !search ||
        r.rule.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [rules, filter, search]);

  const compliant = rules.filter((r) => r.status === "Compliant").length;
  const nonCompliant = rules.filter((r) => r.status === "Non-Compliant").length;
  const pending = rules.filter((r) => r.status === "Pending").length;
  const rate =
    rules.length > 0 ? Math.round((compliant / rules.length) * 100) : 0;

  const isLoading = reportsLoading || projectsLoading;

  return (
    <div
      className="p-4 lg:p-6 space-y-5 bg-slate-50 min-h-screen"
      data-ocid="authority.compliance.page"
    >
      <div>
        <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
          Compliance & Rules
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Regulatory requirements and compliance status per project
        </p>
      </div>

      {/* Summary cards */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        data-ocid="authority.compliance.stats.section"
      >
        {[
          {
            label: "Compliance Rate",
            value: `${rate}%`,
            color: "text-green-600",
            bg: "bg-green-100 text-green-600",
            sub: `${compliant} of ${rules.length} rules`,
          },
          {
            label: "Compliant",
            value: compliant,
            color: "text-green-600",
            bg: "bg-green-100 text-green-600",
            sub: "rules passed",
          },
          {
            label: "Non-Compliant",
            value: nonCompliant,
            color: "text-red-600",
            bg: "bg-red-100 text-red-600",
            sub: "require action",
          },
          {
            label: "Pending Review",
            value: pending,
            color: "text-amber-600",
            bg: "bg-amber-100 text-amber-600",
            sub: "awaiting check",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 shadow-sm rounded-xl p-4"
            data-ocid="authority.compliance.stat.card"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">{s.label}</p>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.bg}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Compliance rate bar */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-700">
            Overall Compliance Rate
          </span>
          <span className="font-bold text-green-600">{rate}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${rate}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            {compliant} Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <XCircle className="w-3 h-3 text-red-500" />
            {nonCompliant} Non-Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3 text-amber-500" />
            {pending} Pending
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-amber-400"
            placeholder="Search rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="authority.compliance.search_input"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTER_TABS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              className={
                filter === f.value
                  ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              }
              onClick={() => setFilter(f.value)}
              data-ocid={`authority.compliance.filter.${f.value}`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((k) => (
            <Skeleton key={k} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 text-slate-500"
          data-ocid="authority.compliance.empty_state"
        >
          No compliance rules match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table
            className="w-full text-sm min-w-[640px]"
            data-ocid="authority.compliance.table"
          >
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Rule / Requirement</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Last Checked</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rule) => {
                const project = (projects ?? []).find(
                  (p) => p.id === rule.projectId,
                );
                return (
                  <ComplianceRow
                    key={rule.id}
                    rule={rule}
                    projectName={project?.name ?? rule.projectId}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
