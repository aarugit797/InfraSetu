import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROJECTS } from "@/lib/mockData";
import { CheckCircle2, Eye, Plus, Send, X } from "lucide-react";
import { useState } from "react";

interface WeeklyReport {
  id: string;
  projectId: string;
  projectName: string;
  weekStart: string;
  weekEnd: string;
  progressSummary: string;
  keyMilestones: string;
  issuesFaced: string;
  sentAt: string;
  status: "sent" | "draft";
}

const now = Date.now();
const day = 86400000;

const SENT_REPORTS: WeeklyReport[] = [
  {
    id: "wr1",
    projectId: "p1",
    projectName: PROJECTS[0]?.name ?? "Highway NH-48",
    weekStart: new Date(now - 14 * day).toISOString().split("T")[0],
    weekEnd: new Date(now - 8 * day).toISOString().split("T")[0],
    progressSummary:
      "Foundation work 65% complete. Concrete pouring in Zones A and B finished ahead of schedule. Steel reinforcement procurement ongoing.",
    keyMilestones:
      "Zone A concrete pour completed. Column formwork erected for 12 columns. Safety inspection passed.",
    issuesFaced:
      "Minor equipment breakdown (excavator) — resolved in 4 hours. Material delivery delayed by one day.",
    sentAt: new Date(now - 7 * day).toLocaleString("en-IN"),
    status: "sent",
  },
  {
    id: "wr2",
    projectId: "p2",
    projectName: PROJECTS[1]?.name ?? "Metro Station Block B",
    weekStart: new Date(now - 21 * day).toISOString().split("T")[0],
    weekEnd: new Date(now - 15 * day).toISOString().split("T")[0],
    progressSummary:
      "Underground utility corridor excavation 100% complete. Waterproofing applied on B1 level. Structural work proceeding as planned.",
    keyMilestones:
      "40m trench excavation completed. Waterproof membrane applied (800 sqm). B2 level slab pouring started.",
    issuesFaced:
      "Soil hardness required additional equipment hire (₹45,000 extra). No safety incidents.",
    sentAt: new Date(now - 14 * day).toLocaleString("en-IN"),
    status: "sent",
  },
  {
    id: "wr3",
    projectId: "p3",
    projectName: PROJECTS[2]?.name ?? "Flyover Bridge Section 3",
    weekStart: new Date(now - 28 * day).toISOString().split("T")[0],
    weekEnd: new Date(now - 22 * day).toISOString().split("T")[0],
    progressSummary:
      "Girder installation for spans 5–7 completed. Load testing conducted with satisfactory results. Progress at 58%.",
    keyMilestones:
      "6 pre-stressed girders installed. Load distribution test passed. Deck slab formwork started.",
    issuesFaced:
      "Crane availability caused 1 day delay. Resolved by rescheduling with vendor.",
    sentAt: new Date(now - 21 * day).toLocaleString("en-IN"),
    status: "sent",
  },
];

const defaultForm = {
  project: "",
  weekStart: "",
  weekEnd: "",
  progressSummary: "",
  keyMilestones: "",
  issuesFaced: "",
};

export default function ManagerWeeklyReportPage() {
  const [form, setForm] = useState(defaultForm);
  const [reports, setReports] = useState<WeeklyReport[]>(SENT_REPORTS);
  const [submitted, setSubmitted] = useState(false);
  const [viewReport, setViewReport] = useState<WeeklyReport | null>(null);

  const selectedProject = PROJECTS.find((p) => p.id === form.project);

  function handleSubmit() {
    if (
      !form.project ||
      !form.weekStart ||
      !form.weekEnd ||
      !form.progressSummary
    )
      return;
    const newReport: WeeklyReport = {
      id: `wr${Date.now()}`,
      projectId: form.project,
      projectName: selectedProject?.name ?? "Unknown Project",
      weekStart: form.weekStart,
      weekEnd: form.weekEnd,
      progressSummary: form.progressSummary,
      keyMilestones: form.keyMilestones,
      issuesFaced: form.issuesFaced,
      sentAt: new Date().toLocaleString("en-IN"),
      status: "sent",
    };
    setReports((prev) => [newReport, ...prev]);
    setForm(defaultForm);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  const isFormValid =
    form.project && form.weekStart && form.weekEnd && form.progressSummary;

  return (
    <>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 bg-muted/20 min-h-screen">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h1 className="text-2xl font-bold text-foreground">
              Weekly Report
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-4">
            Create and send weekly progress reports to the Government Authority
          </p>
        </div>

        {/* Success banner */}
        {submitted && (
          <div
            className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3"
            data-ocid="weeklyreport.success_state"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium text-emerald-700">
              Weekly report sent successfully to Government Authority
            </p>
          </div>
        )}

        {/* Create report form */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">New Weekly Report</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label className="text-xs text-muted-foreground">Project *</Label>
              <Select
                value={form.project}
                onValueChange={(v) => setForm((f) => ({ ...f, project: v }))}
              >
                <SelectTrigger
                  className="mt-1 border-input focus:ring-primary/20"
                  data-ocid="weeklyreport.select"
                >
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECTS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Week Start *
              </Label>
              <Input
                type="date"
                value={form.weekStart}
                onChange={(e) =>
                  setForm((f) => ({ ...f, weekStart: e.target.value }))
                }
                className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                data-ocid="weeklyreport.input"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Week End *
              </Label>
              <Input
                type="date"
                value={form.weekEnd}
                onChange={(e) =>
                  setForm((f) => ({ ...f, weekEnd: e.target.value }))
                }
                className="mt-1 border-input focus:border-primary focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Progress Summary *
            </Label>
            <Textarea
              placeholder="Describe overall progress this week — what was accomplished, current completion percentage, and trajectory…"
              value={form.progressSummary}
              onChange={(e) =>
                setForm((f) => ({ ...f, progressSummary: e.target.value }))
              }
              className="mt-1 border-input focus:border-primary focus:ring-primary/20 min-h-[100px] resize-none"
              data-ocid="weeklyreport.textarea"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Key Milestones Achieved
            </Label>
            <Textarea
              placeholder="List key milestones completed this week — e.g. Zone A concrete pour completed, 12 columns erected, safety inspection passed…"
              value={form.keyMilestones}
              onChange={(e) =>
                setForm((f) => ({ ...f, keyMilestones: e.target.value }))
              }
              className="mt-1 border-input focus:border-primary focus:ring-primary/20 min-h-[80px] resize-none"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Issues Faced
            </Label>
            <Textarea
              placeholder="Describe any delays, safety issues, material problems, or equipment failures encountered this week…"
              value={form.issuesFaced}
              onChange={(e) =>
                setForm((f) => ({ ...f, issuesFaced: e.target.value }))
              }
              className="mt-1 border-input focus:border-primary focus:ring-primary/20 min-h-[80px] resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              data-ocid="weeklyreport.submit_button"
            >
              <Send className="w-4 h-4 mr-2" />
              Send to Authority
            </Button>
          </div>
        </div>

        {/* Sent reports history */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Sent Reports History
          </h2>
          {reports.length === 0 ? (
            <div
              className="bg-card border border-border rounded-xl p-10 text-center"
              data-ocid="weeklyreport.empty_state"
            >
              <p className="text-muted-foreground text-sm">
                No reports sent yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r, idx) => (
                <div
                  key={r.id}
                  className="bg-card border border-border rounded-xl p-4 hover:shadow-sm hover:border-primary/30 transition-all"
                  data-ocid={`weeklyreport.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">
                          {r.projectName}
                        </p>
                        <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs hover:bg-emerald-100">
                          Sent to Authority
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Week: {r.weekStart} → {r.weekEnd}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sent: {r.sentAt}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewReport(r)}
                      className="border-border text-foreground hover:bg-amber-50 hover:border-primary/40"
                      data-ocid={`weeklyreport.view_button.${idx + 1}`}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {r.progressSummary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View report modal */}
      {viewReport && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          data-ocid="weeklyreport.dialog"
        >
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold text-lg text-foreground">
                  Weekly Report
                </h2>
                <p className="text-xs text-muted-foreground">
                  {viewReport.projectName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewReport(null)}
                className="text-muted-foreground hover:text-foreground"
                data-ocid="weeklyreport.close_button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Week",
                  value: `${viewReport.weekStart} → ${viewReport.weekEnd}`,
                },
                { label: "Sent", value: viewReport.sentAt },
              ].map((s) => (
                <div key={s.label} className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
            {[
              {
                label: "Progress Summary",
                content: viewReport.progressSummary,
              },
              { label: "Key Milestones", content: viewReport.keyMilestones },
              { label: "Issues Faced", content: viewReport.issuesFaced },
            ]
              .filter((s) => s.content)
              .map((section) => (
                <div
                  key={section.label}
                  className="bg-muted/20 border border-border rounded-lg p-4"
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {section.label}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            <div className="flex justify-end">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setViewReport(null)}
                data-ocid="weeklyreport.confirm_button"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
