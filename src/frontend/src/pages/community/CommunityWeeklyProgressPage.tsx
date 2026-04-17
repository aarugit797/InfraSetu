import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/lib/mockData";
import { cn, getStatusColor } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Send,
} from "lucide-react";
import { useState } from "react";

type ProgressStatus = "pending" | "approved" | "rejected";

interface SubmittedReport {
  id: string;
  projectId: string;
  projectName: string;
  weekLabel: string;
  progressNotes: string;
  status: ProgressStatus;
  submittedAt: string;
}

const MOCK_PM_REPORT =
  "Foundation work on Block A completed. Structural steel framework for floors 2–4 erected. Electrical conduit installation 60% done. Material delivery for week 15 confirmed — 120 MT cement arriving Monday. No major safety incidents. Minor delay in plumbing due to pipe shortage — expecting resolution by Wed.";

const INITIAL_REPORTS: SubmittedReport[] = [
  {
    id: "wr1",
    projectId: "p1",
    projectName: "NH-48 Highway Expansion",
    weekLabel: "Week 14 (Apr 7–13)",
    progressNotes:
      "Inspected site on Apr 10. Road base compaction in Section C completed per schedule. Drainage installation on track. Worker safety helmets and gear compliance verified. Community concerns about noise near residential areas noted — discussed with PM.",
    status: "approved",
    submittedAt: "Apr 13, 2026",
  },
  {
    id: "wr2",
    projectId: "p2",
    projectName: "Government School Complex",
    weekLabel: "Week 14 (Apr 7–13)",
    progressNotes:
      "Visited site on Apr 11. Masonry work for Block B Ground Floor complete. Quality of cement mix verified. Minor concern raised: debris disposal not happening as per norms — flagged to contractor.",
    status: "pending",
    submittedAt: "Apr 13, 2026",
  },
  {
    id: "wr3",
    projectId: "p1",
    projectName: "NH-48 Highway Expansion",
    weekLabel: "Week 13 (Mar 31–Apr 6)",
    progressNotes:
      "Surveyed Section B. Earthwork moving ahead of plan by 3 days. Labour attendance satisfactory. Equipment in good condition.",
    status: "approved",
    submittedAt: "Apr 6, 2026",
  },
  {
    id: "wr4",
    projectId: "p3",
    projectName: "Water Treatment Plant",
    weekLabel: "Week 13 (Mar 31–Apr 6)",
    progressNotes:
      "Site visit conducted. Foundation excavation started. No significant issues.",
    status: "rejected",
    submittedAt: "Apr 6, 2026",
  },
];

export default function CommunityWeeklyProgressPage() {
  const [selectedProject, setSelectedProject] = useState("");
  const [weekLabel, setWeekLabel] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reports, setReports] = useState<SubmittedReport[]>(INITIAL_REPORTS);
  const [showPmReport, setShowPmReport] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject || !weekLabel || !progressNotes.trim()) return;
    const proj = PROJECTS.find((p) => p.id === selectedProject);
    const newReport: SubmittedReport = {
      id: `wr_${Date.now()}`,
      projectId: selectedProject,
      projectName: proj?.name ?? selectedProject,
      weekLabel,
      progressNotes,
      status: "pending",
      submittedAt: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
    setReports([newReport, ...reports]);
    setSelectedProject("");
    setWeekLabel("");
    setProgressNotes("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5"
      data-ocid="community-weekly-progress.page"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Weekly Progress</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Write and submit your weekly onsite progress report
        </p>
      </div>

      {/* Submit form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4"
        data-ocid="community-weekly-progress.form"
      >
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            New Weekly Report
          </h2>
        </div>

        {/* Project */}
        <div className="space-y-1">
          <label
            htmlFor="wp-project"
            className="text-xs font-medium text-slate-700"
          >
            Project *
          </label>
          <select
            id="wp-project"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            required
            data-ocid="community-weekly-progress.project-select"
          >
            <option value="">Select a project…</option>
            {PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Week label */}
        <div className="space-y-1">
          <label
            htmlFor="wp-week"
            className="text-xs font-medium text-slate-700"
          >
            Week Label *
          </label>
          <input
            id="wp-week"
            type="text"
            placeholder="e.g. Week 15 (Apr 14–20)"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={weekLabel}
            onChange={(e) => setWeekLabel(e.target.value)}
            required
            data-ocid="community-weekly-progress.week-input"
          />
        </div>

        {/* PM report reference */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">
              PM's Latest Weekly Report (Reference)
            </span>
            <button
              type="button"
              className="text-xs text-amber-600 hover:underline"
              onClick={() => setShowPmReport((v) => !v)}
              data-ocid="community-weekly-progress.toggle-pm-report"
            >
              {showPmReport ? "Hide" : "Show"}
            </button>
          </div>
          {showPmReport && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
              {MOCK_PM_REPORT}
            </div>
          )}
        </div>

        {/* Progress notes */}
        <div className="space-y-1">
          <label
            htmlFor="wp-notes"
            className="text-xs font-medium text-slate-700"
          >
            Progress Notes *
          </label>
          <textarea
            id="wp-notes"
            rows={5}
            placeholder="Describe what you observed on site this week — work done, quality checks, safety, community concerns, etc."
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            value={progressNotes}
            onChange={(e) => setProgressNotes(e.target.value)}
            required
            data-ocid="community-weekly-progress.notes-textarea"
          />
        </div>

        {submitted && (
          <div
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2"
            data-ocid="community-weekly-progress.success_state"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 text-sm font-medium">
              Report submitted successfully!
            </span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl gap-2"
          data-ocid="community-weekly-progress.submit_button"
        >
          <Send className="w-4 h-4" />
          Submit Weekly Report
        </Button>
      </form>

      {/* Submitted history */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
        data-ocid="community-weekly-progress.history"
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Submitted Reports
          </h2>
          <span className="ml-auto text-xs text-slate-500">
            {reports.length} total
          </span>
        </div>
        <div className="space-y-2">
          {reports.map((r, idx) => {
            const sc = getStatusColor(r.status);
            return (
              <div
                key={r.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5"
                data-ocid={`community-weekly-progress.report-item.${idx + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-slate-800 text-sm font-semibold truncate">
                      {r.projectName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <CalendarDays className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {r.weekLabel}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "text-[10px] px-1.5 py-0 border capitalize flex-shrink-0",
                      sc.bg,
                      sc.text,
                      sc.border,
                    )}
                  >
                    {r.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {r.progressNotes}
                </p>
                <p className="text-[10px] text-slate-400">
                  Submitted: {r.submittedAt}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
