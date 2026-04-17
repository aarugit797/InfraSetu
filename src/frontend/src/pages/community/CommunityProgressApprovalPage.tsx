import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getStatusColor } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  History,
  X,
} from "lucide-react";
import { useState } from "react";

interface PMReport {
  id: string;
  projectName: string;
  weekLabel: string;
  pmName: string;
  progressNotes: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  communityNotes?: string;
  approvedAt?: string;
}

const INITIAL_REPORTS: PMReport[] = [
  {
    id: "pmr1",
    projectName: "NH-48 Highway Expansion",
    weekLabel: "Week 15 (Apr 14–20)",
    pmName: "Priya Sharma",
    progressNotes:
      "Section D earthwork completed. Bridge pillar reinforcement on track — 4 of 6 pillars done. Asphalt laying commenced on 2 km stretch. Labour count: 142/150 present. Material stock: cement 85%, steel 70%. No safety incidents this week. Weather: clear, no delays expected.",
    submittedAt: "Apr 20, 2026",
    status: "pending",
  },
  {
    id: "pmr2",
    projectName: "Government School Complex",
    weekLabel: "Week 15 (Apr 14–20)",
    pmName: "Priya Sharma",
    progressNotes:
      "Ground floor slab casting for Block C completed. Electrical rough-in for Block A and B finished. Plumbing installation progressing on floor 1. Interior plastering began in Block A. Labour: 88/95 present. No quality issues flagged.",
    submittedAt: "Apr 20, 2026",
    status: "pending",
  },
  {
    id: "pmr3",
    projectName: "Water Treatment Plant",
    weekLabel: "Week 15 (Apr 14–20)",
    pmName: "Priya Sharma",
    progressNotes:
      "Foundation excavation completed. PCC (Plain Cement Concrete) bed laid. Reinforcement cage for footing under preparation. No delays.",
    submittedAt: "Apr 20, 2026",
    status: "pending",
  },
];

const HISTORY_REPORTS: PMReport[] = [
  {
    id: "pmr4",
    projectName: "NH-48 Highway Expansion",
    weekLabel: "Week 14 (Apr 7–13)",
    pmName: "Priya Sharma",
    progressNotes:
      "Drainage culverts installed in Section B. Road base layer compaction 100% complete for 4 km. Traffic diversion managed without issues.",
    submittedAt: "Apr 13, 2026",
    status: "approved",
    communityNotes:
      "Progress verified on site visit Apr 10. All work consistent with report.",
    approvedAt: "Apr 13, 2026",
  },
  {
    id: "pmr5",
    projectName: "Government School Complex",
    weekLabel: "Week 14 (Apr 7–13)",
    pmName: "Priya Sharma",
    progressNotes:
      "Block B masonry 90% complete. Roof slab shuttering started. Minor delay in steel delivery — resolved.",
    submittedAt: "Apr 13, 2026",
    status: "rejected",
    communityNotes:
      "Debris disposal observed non-compliant during site visit. Requesting corrective action before approval.",
    approvedAt: "Apr 14, 2026",
  },
];

export default function CommunityProgressApprovalPage() {
  const [pending, setPending] = useState<PMReport[]>(INITIAL_REPORTS);
  const [history] = useState<PMReport[]>(HISTORY_REPORTS);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processed, setProcessed] = useState<Record<string, boolean>>({});

  function handleAction(id: string, action: "approved" | "rejected") {
    setPending((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: action,
              communityNotes: notes[id] ?? "",
              approvedAt: new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            }
          : r,
      ),
    );
    setProcessed((prev) => ({ ...prev, [id]: true }));
  }

  const pendingCount = pending.filter((r) => r.status === "pending").length;

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5"
      data-ocid="community-progress-approval.page"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Progress Approval</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Review weekly reports from the Project Manager
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" data-ocid="community-progress-approval.tabs">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={cn(
            "flex-1 py-2 rounded-xl text-sm font-semibold border transition-all duration-200",
            activeTab === "pending"
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white text-slate-600 border-slate-200",
          )}
          data-ocid="community-progress-approval.pending-tab"
        >
          Pending Review {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 py-2 rounded-xl text-sm font-semibold border transition-all duration-200",
            activeTab === "history"
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white text-slate-600 border-slate-200",
          )}
          data-ocid="community-progress-approval.history-tab"
        >
          Approval History
        </button>
      </div>

      {/* Pending tab */}
      {activeTab === "pending" && (
        <div
          className="space-y-3"
          data-ocid="community-progress-approval.pending-list"
        >
          {pending.filter((r) => r.status === "pending").length === 0 ? (
            <div
              className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-3 shadow-sm"
              data-ocid="community-progress-approval.empty_state"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <p className="text-slate-600 font-semibold">
                All reports reviewed!
              </p>
              <p className="text-slate-400 text-sm text-center">
                Switch to the History tab to see past decisions.
              </p>
            </div>
          ) : (
            pending
              .filter((r) => r.status === "pending")
              .map((r, idx) => (
                <div
                  key={r.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
                  data-ocid={`community-progress-approval.pending-item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-slate-800 font-semibold text-sm">
                        {r.projectName}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CalendarDays className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          {r.weekLabel}
                        </span>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-xs text-slate-500">
                          by {r.pmName}
                        </span>
                      </div>
                    </div>
                    <Badge className="text-[10px] px-1.5 py-0 border bg-amber-100 text-amber-800 border-amber-200 flex-shrink-0">
                      Pending
                    </Badge>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                      <ClipboardCheck className="w-3 h-3" /> PM Progress Notes
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {r.progressNotes}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`pa-notes-${r.id}`}
                      className="text-xs font-medium text-slate-700"
                    >
                      Your Notes (optional)
                    </label>
                    <textarea
                      id={`pa-notes-${r.id}`}
                      rows={2}
                      placeholder="Add community feedback or observations before approving…"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                      value={notes[r.id] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [r.id]: e.target.value,
                        }))
                      }
                      data-ocid={`community-progress-approval.notes-textarea.${idx + 1}`}
                    />
                  </div>

                  {processed[r.id] ? (
                    <div
                      className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2"
                      data-ocid={`community-progress-approval.success_state.${idx + 1}`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 text-xs font-medium">
                        Decision recorded
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAction(r.id, "approved")}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl gap-1"
                        data-ocid={`community-progress-approval.approve-button.${idx + 1}`}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </Button>
                      <Button
                        onClick={() => handleAction(r.id, "rejected")}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl gap-1"
                        data-ocid={`community-progress-approval.reject-button.${idx + 1}`}
                      >
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <div
          className="space-y-3"
          data-ocid="community-progress-approval.history-list"
        >
          {[...history, ...pending.filter((r) => r.status !== "pending")].map(
            (r, idx) => {
              const sc = getStatusColor(r.status);
              return (
                <div
                  key={r.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2"
                  data-ocid={`community-progress-approval.history-item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-slate-800 font-semibold text-sm">
                        {r.projectName}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <History className="w-3 h-3 text-slate-400" />
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
                  {r.communityNotes && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-slate-400 mb-0.5">
                        Community Notes
                      </p>
                      <p className="text-xs text-slate-700">
                        {r.communityNotes}
                      </p>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Resolved: {r.approvedAt ?? "—"}
                  </p>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
