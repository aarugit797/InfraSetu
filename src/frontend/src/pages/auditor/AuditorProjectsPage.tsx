import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  APPROVALS,
  COMPLIANCE_STATS,
  ISSUES,
  PROJECTS,
  TASKS,
  TEST_REPORTS,
} from "@/lib/mockData";
import {
  cn,
  formatCurrency,
  formatDate,
  getProgressColor,
  getStatusColor,
} from "@/lib/utils";
import type { Project } from "@/types";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const tasks = TASKS.filter((t) => t.projectId === project.id);
  const issues = ISSUES.filter((i) => i.projectId === project.id);
  const testReports = TEST_REPORTS.filter((r) => r.projectId === project.id);
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const openIssues = issues.filter(
    (i) =>
      i.status === "open" ||
      i.status === "inProgress" ||
      i.status === "escalated",
  ).length;
  const passedTests = testReports.filter((r) => r.result === "pass").length;
  const testCompliance = testReports.length
    ? Math.round((passedTests / testReports.length) * 100)
    : 0;
  const relatedApprovals = APPROVALS.filter((a) => a.entityId === project.id);
  const sc = getStatusColor(project.status);
  const budgetUsed = Math.round((project.actualCost / project.budget) * 100);

  // Compliance score: weighted by test compliance + task completion + issue severity
  const criticalIssues = issues.filter((i) => i.priority === "critical").length;
  const complianceScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        testCompliance * 0.5 + project.progress * 0.35 - criticalIssues * 5,
      ),
    ),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      data-ocid="auditor-project-detail.dialog"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Close"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 truncate">
              {project.name}
            </h3>
            <p className="text-slate-500 text-xs mt-0.5 truncate">
              {project.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-slate-400 hover:text-slate-700 flex-shrink-0"
            aria-label="Close"
            data-ocid="auditor-project-detail.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge
                className={cn("border text-xs", sc.bg, sc.text, sc.border)}
              >
                {project.status}
              </Badge>
              <Badge className="border text-xs border-slate-200 text-slate-500 bg-slate-100">
                {formatDate(project.startDate)} → {formatDate(project.endDate)}
              </Badge>
            </div>

            {/* Compliance Score */}
            <div
              className={cn(
                "border rounded-xl p-3 space-y-2",
                complianceScore >= 75
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200",
              )}
            >
              <div className="flex items-center gap-2">
                <Shield
                  className={cn(
                    "w-4 h-4",
                    complianceScore >= 75 ? "text-green-600" : "text-red-600",
                  )}
                />
                <p className="text-slate-800 text-sm font-semibold">
                  Compliance Score
                </p>
                <p
                  className={cn(
                    "ml-auto text-xl font-bold",
                    complianceScore >= 75 ? "text-green-700" : "text-red-700",
                  )}
                >
                  {complianceScore}%
                </p>
              </div>
              <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    complianceScore >= 75 ? "bg-green-500" : "bg-red-500",
                  )}
                  style={{ width: `${complianceScore}%` }}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <p className="text-slate-800 text-sm font-semibold">Budget</p>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">
                  Allocated:{" "}
                  <strong className="text-slate-800">
                    {formatCurrency(project.budget)}
                  </strong>
                </span>
                <span className="text-slate-500">
                  Spent:{" "}
                  <strong
                    className={
                      budgetUsed > 80 ? "text-red-600" : "text-green-600"
                    }
                  >
                    {formatCurrency(project.actualCost)}
                  </strong>
                </span>
              </div>
              <Progress value={budgetUsed} className="h-2" />
              <p
                className={cn(
                  "text-xs font-semibold",
                  budgetUsed > 80 ? "text-red-600" : "text-green-600",
                )}
              >
                {budgetUsed}% budget utilized
              </p>
            </div>

            {/* Tasks */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-500" />
                <p className="text-slate-800 text-sm font-semibold">
                  Tasks Overview
                </p>
                <span className="ml-auto text-xs text-slate-400">
                  {tasks.length} total
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Done",
                    count: completedTasks,
                    color: "text-green-600",
                  },
                  {
                    label: "Active",
                    count: tasks.filter((t) => t.status === "inProgress")
                      .length,
                    color: "text-blue-600",
                  },
                  {
                    label: "Pending",
                    count: tasks.filter((t) => t.status === "pending").length,
                    color: "text-amber-600",
                  },
                ].map(({ label, count, color }) => (
                  <div
                    key={label}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-center"
                  >
                    <p className={cn("text-lg font-bold", color)}>{count}</p>
                    <p className="text-[10px] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Completion</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>
            </div>

            {/* Issues */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-slate-800 text-sm font-semibold">Issues</p>
                <span className="ml-auto text-xs text-slate-400">
                  {issues.length} total
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white border border-slate-200 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-red-600">{openIssues}</p>
                  <p className="text-[10px] text-slate-500">Open</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-green-600">
                    {
                      issues.filter(
                        (i) => i.status === "resolved" || i.status === "closed",
                      ).length
                    }
                  </p>
                  <p className="text-[10px] text-slate-500">Resolved</p>
                </div>
              </div>
            </div>

            {/* Test Reports */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <p className="text-slate-800 text-sm font-semibold">
                  Test Compliance
                </p>
                <span className="ml-auto text-xs text-slate-400">
                  {testReports.length} tests
                </span>
              </div>
              {testReports.length > 0 ? (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">{passedTests} passed</span>
                    <span className="text-red-600">
                      {testReports.filter((r) => r.result === "fail").length}{" "}
                      failed
                    </span>
                    <span className="text-amber-600">
                      {testReports.filter((r) => r.result === "pending").length}{" "}
                      pending
                    </span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                    {testCompliance > 0 && (
                      <div
                        className="bg-green-500"
                        style={{ width: `${testCompliance}%` }}
                      />
                    )}
                    <div className="bg-red-500 flex-1" />
                  </div>
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      testCompliance >= 75 ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {testCompliance}% compliance rate
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-500">No test reports yet</p>
              )}
            </div>

            {/* Financial Health */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <p className="text-slate-800 text-sm font-semibold">
                  Financial Health
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Budget</p>
                  <p className="text-slate-800 font-semibold">
                    {formatCurrency(project.budget)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Actual Cost</p>
                  <p className="text-slate-800 font-semibold">
                    {formatCurrency(project.actualCost)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Remaining</p>
                  <p className="text-green-600 font-semibold">
                    {formatCurrency(project.budget - project.actualCost)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Utilization</p>
                  <p
                    className={cn(
                      "font-semibold",
                      budgetUsed > 80 ? "text-red-600" : "text-slate-800",
                    )}
                  >
                    {budgetUsed}%
                  </p>
                </div>
              </div>
            </div>

            {relatedApprovals.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <p className="text-slate-800 text-sm font-semibold">
                  Related Approvals ({relatedApprovals.length})
                </p>
                {relatedApprovals.map((ap) => {
                  const asc = getStatusColor(ap.status);
                  return (
                    <div key={ap.id} className="flex items-center gap-2">
                      <p className="text-xs text-slate-700 flex-1 min-w-0 truncate">
                        {ap.title}
                      </p>
                      <Badge
                        className={cn(
                          "text-[10px] border flex-shrink-0",
                          asc.bg,
                          asc.text,
                          asc.border,
                        )}
                      >
                        {ap.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <p className="text-slate-800 text-sm font-semibold">
                  Team Size
                </p>
              </div>
              <p className="text-slate-800 text-2xl font-bold">
                {project.teamMembers.length}
                <span className="text-slate-400 text-sm font-normal ml-1.5">
                  members
                </span>
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default function AuditorProjectsPage() {
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = PROJECTS.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-4"
      data-ocid="auditor-projects.page"
    >
      <div>
        <h1 className="text-xl font-bold text-slate-800">Projects</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Compliance &amp; financial health · {PROJECTS.length} projects
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-slate-300"
          data-ocid="auditor-projects.search_input"
        />
      </div>

      {filtered.length === 0 ? (
        <div
          className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm"
          data-ocid="auditor-projects.empty_state"
        >
          <p className="text-slate-500 text-sm">No projects found</p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="auditor-projects.list">
          {filtered.map((project, idx) => {
            const sc = getStatusColor(project.status);
            const budgetUsed = Math.round(
              (project.actualCost / project.budget) * 100,
            );
            const tasks = TASKS.filter((t) => t.projectId === project.id);
            const issues = ISSUES.filter((i) => i.projectId === project.id);
            const testReports = TEST_REPORTS.filter(
              (r) => r.projectId === project.id,
            );
            const passedTests = testReports.filter(
              (r) => r.result === "pass",
            ).length;
            const testCompliance = testReports.length
              ? Math.round((passedTests / testReports.length) * 100)
              : 0;
            const criticalIssues = issues.filter(
              (i) => i.priority === "critical",
            ).length;
            const complianceScore = Math.max(
              0,
              Math.min(
                100,
                Math.round(
                  testCompliance * 0.5 +
                    project.progress * 0.35 -
                    criticalIssues * 5,
                ),
              ),
            );
            const openIssues = issues.filter(
              (i) =>
                i.status === "open" ||
                i.status === "inProgress" ||
                i.status === "escalated",
            );
            const financialHealthClass =
              budgetUsed > 90
                ? "border-l-red-500 bg-red-50"
                : budgetUsed > 70
                  ? "border-l-amber-400 bg-amber-50"
                  : "border-l-green-500 bg-green-50";

            return (
              <button
                key={project.id}
                type="button"
                className={cn(
                  "bg-white border border-slate-200 rounded-2xl p-4 w-full text-left hover:shadow-md transition-shadow space-y-3 border-l-4",
                  financialHealthClass,
                )}
                onClick={() => setSelectedProject(project)}
                data-ocid={`auditor-projects.item.${idx + 1}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
                      sc.dot,
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-semibold text-sm leading-tight truncate">
                      {project.name}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">
                      {project.location}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "text-[10px] px-1.5 py-0 border flex-shrink-0",
                      sc.bg,
                      sc.text,
                      sc.border,
                    )}
                  >
                    {project.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Completion</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        getProgressColor(project.progress),
                      )}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      label: "Budget",
                      value: formatCurrency(project.budget),
                      color: "text-slate-800",
                    },
                    {
                      label: "Budget Used",
                      value: `${budgetUsed}%`,
                      color:
                        budgetUsed > 80 ? "text-red-600" : "text-green-600",
                    },
                    {
                      label: "Tasks",
                      value: tasks.length,
                      color: "text-slate-800",
                    },
                    {
                      label: "Open Issues",
                      value: openIssues.length,
                      color:
                        openIssues.length > 0
                          ? "text-red-600"
                          : "text-green-600",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="bg-white border border-slate-200 rounded-xl p-2 text-center"
                    >
                      <p className={cn("text-sm font-bold", color)}>{value}</p>
                      <p className="text-[10px] text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-slate-500">
                      Compliance:{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          complianceScore >= 75
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {complianceScore}%
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Shield className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="text-xs text-slate-500">
                      Tests:{" "}
                      <span className="text-amber-600 font-semibold">
                        {testCompliance}%
                      </span>
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
