import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_USERS, PROJECTS } from "@/lib/mockData";
import { Calendar, Eye, FileText, Search, X } from "lucide-react";
import { useState } from "react";

interface DailyReport {
  id: string;
  engineerId: string;
  engineerName: string;
  projectId: string;
  projectName: string;
  date: string;
  summary: string;
  workDone: string;
  issues: string;
  weather: string;
  attendance: number;
}

const now = Date.now();
const day = 86400000;
const engineers = DEMO_USERS.filter((u) => u.role === "siteEngineer");

const SAMPLE_REPORTS: DailyReport[] = [
  {
    id: "dr1",
    engineerId: "u3",
    engineerName: "Arjun Singh",
    projectId: "p1",
    projectName: PROJECTS[0]?.name ?? "Highway NH-48",
    date: new Date(now - 0 * day).toISOString().split("T")[0],
    summary:
      "Foundation work progressing on schedule. Zone A concrete pour completed.",
    workDone:
      "Concrete pouring in Zone A completed. 120 cubic meters poured. Curing started.",
    issues:
      "Minor delay due to equipment breakdown — resolved by afternoon. No safety incidents.",
    weather: "Clear, 32°C",
    attendance: 38,
  },
  {
    id: "dr2",
    engineerId: "u3",
    engineerName: "Arjun Singh",
    projectId: "p1",
    projectName: PROJECTS[0]?.name ?? "Highway NH-48",
    date: new Date(now - 1 * day).toISOString().split("T")[0],
    summary:
      "Steel reinforcement installed in Columns C1–C8. Formwork prepared for Zone B.",
    workDone:
      "Installed TMT steel bars in 8 columns. Formwork erected for Zone B slab.",
    issues: "No major issues. 2 workers reported minor fatigue — advised rest.",
    weather: "Partly cloudy, 30°C",
    attendance: 41,
  },
  {
    id: "dr3",
    engineerId: "u3",
    engineerName: "Arjun Singh",
    projectId: "p2",
    projectName: PROJECTS[1]?.name ?? "Metro Station Block B",
    date: new Date(now - 2 * day).toISOString().split("T")[0],
    summary:
      "Excavation for underground utility corridor completed. Safety inspection passed.",
    workDone:
      "Excavated 40m trench for utility corridor. Safety netting installed on perimeter.",
    issues:
      "Soil hardness higher than expected — required additional equipment.",
    weather: "Windy, 28°C",
    attendance: 35,
  },
  {
    id: "dr4",
    engineerId: "u3",
    engineerName: "Arjun Singh",
    projectId: "p2",
    projectName: PROJECTS[1]?.name ?? "Metro Station Block B",
    date: new Date(now - 3 * day).toISOString().split("T")[0],
    summary:
      "Waterproofing membrane applied on level B1 floor slab. Material delivery received.",
    workDone:
      "Applied 800 sqm waterproof membrane. Received cement, sand, and aggregate delivery.",
    issues: "One delivery truck was delayed by 2 hours.",
    weather: "Clear, 33°C",
    attendance: 40,
  },
  {
    id: "dr5",
    engineerId: "u3",
    engineerName: "Arjun Singh",
    projectId: "p3",
    projectName: PROJECTS[2]?.name ?? "Flyover Bridge Section 3",
    date: new Date(now - 4 * day).toISOString().split("T")[0],
    summary:
      "Pre-stressed girder installation completed for spans 5–7. Quality check passed.",
    workDone:
      "Lifted and placed 6 pre-stressed girders. Conducted load distribution tests.",
    issues: "Crane operator needed additional safety briefing before lifts.",
    weather: "Clear, 29°C",
    attendance: 44,
  },
];

export default function ManagerDailyReportsPage() {
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterEngineer, setFilterEngineer] = useState("all");
  const [selected, setSelected] = useState<DailyReport | null>(null);

  const filtered = SAMPLE_REPORTS.filter((r) => {
    if (
      search &&
      !r.engineerName.toLowerCase().includes(search.toLowerCase()) &&
      !r.summary.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (filterProject !== "all" && r.projectId !== filterProject) return false;
    if (filterEngineer !== "all" && r.engineerId !== filterEngineer)
      return false;
    return true;
  });

  return (
    <>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5 bg-muted/20 min-h-screen">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h1 className="text-2xl font-bold text-foreground">
              Daily Reports
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-4">
            Received from site engineers — {SAMPLE_REPORTS.length} reports this
            week
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-input focus:border-primary focus:ring-primary/20 bg-card"
              data-ocid="reports.search_input"
            />
          </div>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger
              className="w-44 border-input bg-card focus:ring-primary/20"
              data-ocid="reports.filter.tab"
            >
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {PROJECTS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterEngineer} onValueChange={setFilterEngineer}>
            <SelectTrigger className="w-44 border-input bg-card focus:ring-primary/20">
              <SelectValue placeholder="All Engineers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Engineers</SelectItem>
              {engineers.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reports list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div
              className="bg-card border border-border rounded-xl p-12 text-center"
              data-ocid="reports.empty_state"
            >
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">No reports found</p>
              <p className="text-muted-foreground text-sm mt-1">
                Adjust filters to see more reports
              </p>
            </div>
          ) : (
            filtered.map((report, idx) => (
              <div
                key={report.id}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all"
                data-ocid={`reports.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {report.engineerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">
                          {report.engineerName}
                        </p>
                        <Badge className="bg-blue-100 text-blue-800 border-0 text-xs hover:bg-blue-100">
                          Site Engineer
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {report.projectName}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {report.date}
                        <span className="mx-1">·</span>
                        {report.attendance} workers present
                        <span className="mx-1">·</span>
                        {report.weather}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(report)}
                    className="border-border text-foreground hover:bg-amber-50 hover:border-primary/40 shrink-0"
                    data-ocid={`reports.view_button.${idx + 1}`}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View Report
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {report.summary}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Full report modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          data-ocid="reports.dialog"
        >
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold text-lg text-foreground">
                  Daily Report
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selected.projectName} · {selected.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground"
                data-ocid="reports.close_button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                {selected.engineerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {selected.engineerName}
                </p>
                <p className="text-xs text-muted-foreground">Site Engineer</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Date", value: selected.date },
                {
                  label: "Attendance",
                  value: `${selected.attendance} workers`,
                },
                { label: "Weather", value: selected.weather },
              ].map((s) => (
                <div key={s.label} className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
            {[
              { label: "Summary", content: selected.summary },
              { label: "Work Done", content: selected.workDone },
              { label: "Issues / Observations", content: selected.issues },
            ].map((section) => (
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
                onClick={() => setSelected(null)}
                data-ocid="reports.confirm_button"
              >
                Close Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
