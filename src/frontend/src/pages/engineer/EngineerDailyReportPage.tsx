import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useAuth } from "@/hooks/useAuth";
import { PROJECTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DailyReport {
  id: string;
  date: string;
  projectId: string;
  progressSummary: string;
  materialsUsed: string;
  manpowerCount: number;
  issuesFaced: string;
  nextDayPlan: string;
  submittedBy: string;
  submittedAt: number;
}

const INITIAL_REPORTS: DailyReport[] = [
  {
    id: "dr1",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    projectId: "p1",
    progressSummary:
      "Completed formwork for columns C1-C5 in Zone A. Concrete pour scheduled for tomorrow.",
    materialsUsed:
      "Steel rebar 2.5 MT, Plywood shuttering 120 sqft, Binding wire 25 kg",
    manpowerCount: 18,
    issuesFaced:
      "Minor delay due to late arrival of shuttering material. Resolved by 11 AM.",
    nextDayPlan:
      "Concrete pour for columns C1-C5. Begin formwork for slab in Zone B.",
    submittedBy: "u3",
    submittedAt: Date.now() - 86400000,
  },
  {
    id: "dr2",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    projectId: "p1",
    progressSummary:
      "Excavation completed for Zone B footings. Soil compaction tested and approved.",
    materialsUsed: "No materials consumed — excavation day",
    manpowerCount: 22,
    issuesFaced: "No major issues. Minor waterlogging cleared from pit.",
    nextDayPlan: "Begin PCC work for Zone B footings. Steel delivery expected.",
    submittedBy: "u3",
    submittedAt: Date.now() - 2 * 86400000,
  },
];

export default function EngineerDailyReportPage() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>(INITIAL_REPORTS);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [projectId, setProjectId] = useState("");
  const [progressSummary, setProgressSummary] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState("");
  const [manpowerCount, setManpowerCount] = useState<number>(0);
  const [issuesFaced, setIssuesFaced] = useState("");
  const [nextDayPlan, setNextDayPlan] = useState("");

  function handleSubmit() {
    if (!projectId || !progressSummary.trim() || !nextDayPlan.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newReport: DailyReport = {
      id: `dr_${Date.now()}`,
      date,
      projectId,
      progressSummary,
      materialsUsed,
      manpowerCount,
      issuesFaced,
      nextDayPlan,
      submittedBy: currentUser?.id ?? "",
      submittedAt: Date.now(),
    };
    setReports((prev) => [newReport, ...prev]);
    setShowForm(false);
    setProjectId("");
    setProgressSummary("");
    setMaterialsUsed("");
    setManpowerCount(0);
    setIssuesFaced("");
    setNextDayPlan("");
    setDate(new Date().toISOString().split("T")[0]);
    toast.success("Daily report submitted to Project Manager");
  }

  function getProjectName(id: string) {
    return PROJECTS.find((p) => p.id === id)?.name ?? id;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const alreadySubmittedToday = reports.some((r) => r.date === todayStr);

  return (
    <div
      className="p-4 space-y-4 bg-slate-50 min-h-screen"
      data-ocid="engineer-daily-report.page"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-600" />
          <h1 className="font-display text-xl font-bold text-slate-800">
            Daily Reports
          </h1>
        </div>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 gap-1.5 border-0"
          onClick={() => setShowForm(true)}
          data-ocid="engineer-daily-report.new-button"
        >
          <Plus className="w-4 h-4" />
          New Report
        </Button>
      </div>

      {alreadySubmittedToday && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">Today's report submitted ✓</p>
        </div>
      )}

      {/* Report list */}
      <div className="space-y-3" data-ocid="engineer-daily-report.list">
        {reports.length === 0 && (
          <div
            className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm"
            data-ocid="engineer-daily-report.empty_state"
          >
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">
              No reports submitted yet
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Submit your first daily report
            </p>
          </div>
        )}
        {reports.map((report, idx) => {
          const isExpanded = expandedId === report.id;
          return (
            <Card
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              data-ocid={`engineer-daily-report.item.${idx + 1}`}
            >
              <button
                type="button"
                className="w-full p-4 text-left flex items-start justify-between gap-3"
                onClick={() => setExpandedId(isExpanded ? null : report.id)}
                data-ocid={`engineer-daily-report.item.${idx + 1}.toggle`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-amber-100 border-amber-300 text-amber-700 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Badge>
                    <Badge className="bg-blue-100 border-blue-300 text-blue-700 text-xs">
                      Submitted
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-1.5 truncate">
                    {getProjectName(report.projectId)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {report.manpowerCount} workers ·{" "}
                    {report.progressSummary.slice(0, 60)}...
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                  {[
                    {
                      label: "Progress Summary",
                      value: report.progressSummary,
                    },
                    { label: "Materials Used", value: report.materialsUsed },
                    {
                      label: "Manpower Count",
                      value: `${report.manpowerCount} workers on site`,
                    },
                    {
                      label: "Issues Faced",
                      value: report.issuesFaced || "None reported",
                    },
                    { label: "Next Day Plan", value: report.nextDayPlan },
                  ].map((field) => (
                    <div key={field.label}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        {field.label}
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* New Report Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          data-ocid="engineer-daily-report.form.dialog"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800 text-lg">
                Daily Report
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-700"
                data-ocid="engineer-daily-report.form.close-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                    Date *
                  </Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-800"
                    data-ocid="engineer-daily-report.form.date.input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                    Manpower *
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={manpowerCount}
                    onChange={(e) => setManpowerCount(Number(e.target.value))}
                    className="bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-800"
                    placeholder="Workers count"
                    data-ocid="engineer-daily-report.form.manpower.input"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Project *
                </Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger
                    className="bg-slate-50 border-slate-200 rounded-xl text-sm"
                    data-ocid="engineer-daily-report.form.project.select"
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
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Progress Summary *
                </Label>
                <Textarea
                  placeholder="What work was done today?"
                  value={progressSummary}
                  onChange={(e) => setProgressSummary(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm resize-none text-slate-800"
                  rows={3}
                  data-ocid="engineer-daily-report.form.progress.textarea"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Materials Used
                </Label>
                <Textarea
                  placeholder="List materials consumed today..."
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm resize-none text-slate-800"
                  rows={2}
                  data-ocid="engineer-daily-report.form.materials.textarea"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Issues Faced
                </Label>
                <Textarea
                  placeholder="Any delays, safety issues, or problems?"
                  value={issuesFaced}
                  onChange={(e) => setIssuesFaced(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm resize-none text-slate-800"
                  rows={2}
                  data-ocid="engineer-daily-report.form.issues.textarea"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Next Day Plan *
                </Label>
                <Textarea
                  placeholder="What is planned for tomorrow?"
                  value={nextDayPlan}
                  onChange={(e) => setNextDayPlan(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm resize-none text-slate-800"
                  rows={2}
                  data-ocid="engineer-daily-report.form.next-plan.textarea"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-600 rounded-xl"
                onClick={() => setShowForm(false)}
                data-ocid="engineer-daily-report.form.cancel-button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl border-0 gap-2"
                onClick={handleSubmit}
                data-ocid="engineer-daily-report.form.submit-button"
              >
                <Send className="w-4 h-4" />
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
