import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useBackend";
import { Calendar, ChevronRight, FileText, User } from "lucide-react";
import { useState } from "react";

interface WeeklyReport {
  id: string;
  pmName: string;
  projectId: string;
  reportDate: string;
  weekRange: string;
  summary: string;
  fullContent: string;
  tasksCompleted: number;
  issuesRaised: number;
  progressDelta: number;
  status: "submitted" | "reviewed";
}

const WEEKLY_REPORTS: WeeklyReport[] = [
  {
    id: "wr1",
    pmName: "Priya Sharma",
    projectId: "p1",
    reportDate: "2026-04-12",
    weekRange: "7 Apr – 12 Apr 2026",
    summary:
      "Road base layer completion achieved at NH-48 corridor. Asphalt paving initiated on Section 3. Minor delay in culvert construction due to soil conditions.",
    fullContent: `Weekly Progress Report — NH-48 Highway Expansion
Week: 7 Apr – 12 Apr 2026
Project Manager: Priya Sharma

KEY ACHIEVEMENTS:
• Road base layer 100% complete on Section 1 and 2 (total 4.2 km)
• Asphalt paving started on Section 3 — 600m completed
• Drain lining work progressed to 78% completion

ISSUES:
• Culvert construction at Km 12.4 delayed by 3 days — soil bearing capacity lower than expected. Stabilization work ongoing.
• Labour attendance at 92% this week (target 95%)

FINANCIALS:
• Weekly expenditure: ₹18.6L against planned ₹20L (within budget)
• Cumulative: ₹3.2Cr spent of ₹5.0Cr allocated for this quarter

NEXT WEEK PLAN:
• Complete asphalt paving on Section 3 (remaining 1.1 km)
• Resolve culvert issue and resume construction
• Begin median island construction on Section 1`,
    tasksCompleted: 8,
    issuesRaised: 2,
    progressDelta: 6,
    status: "submitted",
  },
  {
    id: "wr2",
    pmName: "Priya Sharma",
    projectId: "p2",
    reportDate: "2026-04-12",
    weekRange: "7 Apr – 12 Apr 2026",
    summary:
      "Bridge deck reinforcement work progressing on schedule. Two of four spans completed. Inspection by structural consultant scheduled for next Monday.",
    fullContent: `Weekly Progress Report — Metro Bridge Project
Week: 7 Apr – 12 Apr 2026
Project Manager: Priya Sharma

KEY ACHIEVEMENTS:
• Deck reinforcement complete on Spans A and B
• Falsework removal for Span A successfully executed
• Concrete pour for Span C scheduled

ISSUES:
• Material delivery for high-tensile rebar delayed — vendor confirmed dispatch on 14th April
• One safety incident (minor) — no injuries, investigation concluded

FINANCIALS:
• Weekly expenditure: ₹12.1L against planned ₹12.5L
• Cumulative budget utilization: 62%

NEXT WEEK PLAN:
• Structural inspection of Spans A and B
• Begin reinforcement for Span D
• Resolve rebar delivery issue`,
    tasksCompleted: 5,
    issuesRaised: 1,
    progressDelta: 4,
    status: "reviewed",
  },
  {
    id: "wr3",
    pmName: "Priya Sharma",
    projectId: "p1",
    reportDate: "2026-04-05",
    weekRange: "31 Mar – 5 Apr 2026",
    summary:
      "Section 2 earthwork completed. Drain lining initiated. Material inventory replenished for upcoming paving works. Weather caused 1.5 days of delay.",
    fullContent: `Weekly Progress Report — NH-48 Highway Expansion
Week: 31 Mar – 5 Apr 2026
Project Manager: Priya Sharma

KEY ACHIEVEMENTS:
• Section 2 earthwork completed
• Drain lining work initiated
• Aggregate base layer 50% complete on Section 2

ISSUES:
• Rain on 2nd and 3rd April caused 1.5 days delay on earthwork
• Crane breakdown on 4th — repaired same day

NEXT WEEK PLAN:
• Complete aggregate base layer on Section 2
• Begin road base layer on Section 1`,
    tasksCompleted: 6,
    issuesRaised: 3,
    progressDelta: 5,
    status: "reviewed",
  },
  {
    id: "wr4",
    pmName: "Priya Sharma",
    projectId: "p3",
    reportDate: "2026-04-12",
    weekRange: "7 Apr – 12 Apr 2026",
    summary:
      "Foundation Phase 2 complete. Column casting in progress. Structural review by government consultant pending. Workforce at full capacity.",
    fullContent: `Weekly Progress Report — Government Office Complex
Week: 7 Apr – 12 Apr 2026
Project Manager: Priya Sharma

KEY ACHIEVEMENTS:
• Foundation Phase 2 complete — all 36 pile caps cast and cured
• Column casting started — 8 of 24 columns done
• Plinth beam reinforcement drawing approved

ISSUES:
• Government consultant structural review pending — follow-up sent

FINANCIALS:
• Weekly expenditure: ₹9.4L against planned ₹10L
• 62% budget utilized overall

NEXT WEEK PLAN:
• Continue column casting (target 16 total by end of week)
• Schedule structural review meeting
• Begin plinth beam formwork`,
    tasksCompleted: 7,
    issuesRaised: 1,
    progressDelta: 7,
    status: "submitted",
  },
];

function ReportDetailModal({
  report,
  projectName,
  onClose,
}: {
  report: WeeklyReport | null;
  projectName: string;
  onClose: () => void;
}) {
  if (!report) return null;
  return (
    <Dialog open={!!report} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-white border border-slate-200 max-w-2xl max-h-[85vh] overflow-y-auto"
        data-ocid="authority.reports.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-bold pr-6 leading-snug">
            Weekly Report — {projectName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs flex items-center gap-1">
              <User className="w-3 h-3" /> {report.pmName}
            </Badge>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {report.weekRange}
            </Badge>
            <Badge
              className={`text-xs ${report.status === "reviewed" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}
            >
              {report.status === "reviewed" ? "Reviewed" : "Submitted"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                l: "Tasks Completed",
                v: report.tasksCompleted,
                c: "text-green-600",
              },
              { l: "Issues Raised", v: report.issuesRaised, c: "text-red-600" },
              {
                l: "Progress Δ",
                v: `+${report.progressDelta}%`,
                c: "text-amber-600",
              },
            ].map((s) => (
              <div
                key={s.l}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center"
              >
                <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <pre className="whitespace-pre-wrap text-xs text-slate-700 font-mono leading-relaxed">
              {report.fullContent}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AuthorityReportsPage() {
  const { data: projects, isLoading } = useProjects();
  const [detail, setDetail] = useState<WeeklyReport | null>(null);

  function getProjectName(id: string) {
    return (projects ?? []).find((p) => p.id === id)?.name ?? id;
  }

  return (
    <div
      className="p-4 lg:p-6 space-y-5 bg-slate-50 min-h-screen"
      data-ocid="authority.reports.page"
    >
      <div>
        <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
          Weekly Reports
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Weekly progress reports submitted by project managers
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Reports</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {WEEKLY_REPORTS.length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">this quarter</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
          <p className="text-xs text-slate-500">Awaiting Review</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {WEEKLY_REPORTS.filter((r) => r.status === "submitted").length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">new submissions</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 col-span-2 lg:col-span-1">
          <p className="text-xs text-slate-500">Reviewed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {WEEKLY_REPORTS.filter((r) => r.status === "reviewed").length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">acknowledged</p>
        </div>
      </div>

      {/* Reports list */}
      {isLoading ? (
        <div className="space-y-3">
          {["sk-1", "sk-2", "sk-3", "sk-4"].map((k) => (
            <Skeleton key={k} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3" data-ocid="authority.reports.list">
          {WEEKLY_REPORTS.map((report, idx) => (
            <div
              key={report.id}
              className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-amber-200 transition-all"
              data-ocid={`authority.reports.item.${idx + 1}`}
            >
              <div className="flex items-start gap-3 justify-between">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm">
                        {getProjectName(report.projectId)}
                      </p>
                      <Badge
                        className={`text-xs ${report.status === "reviewed" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}
                      >
                        {report.status === "reviewed" ? "Reviewed" : "New"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <User className="w-3 h-3" /> {report.pmName}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" /> {report.weekRange}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {report.summary}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="flex-shrink-0 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
                  onClick={() => setDetail(report)}
                  data-ocid={`authority.reports.view_button.${idx + 1}`}
                >
                  View <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span className="text-green-600 font-medium">
                  {report.tasksCompleted} tasks done
                </span>
                <span className="text-red-600 font-medium">
                  {report.issuesRaised} issues raised
                </span>
                <span className="text-amber-600 font-medium">
                  +{report.progressDelta}% progress
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReportDetailModal
        report={detail}
        projectName={detail ? getProjectName(detail.projectId) : ""}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}
