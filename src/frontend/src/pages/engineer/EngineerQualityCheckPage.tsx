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
  ClipboardCheck,
  Plus,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type MaterialType = "cement" | "structure" | "concrete" | "other";
type QCResult = "pass" | "fail";

interface QualityCheck {
  id: string;
  materialType: MaterialType;
  result: QCResult;
  notes: string;
  date: string;
  projectId: string;
  conductedBy: string;
  createdAt: number;
}

const INITIAL_CHECKS: QualityCheck[] = [
  {
    id: "qc1",
    materialType: "cement",
    result: "pass",
    notes:
      "Cement quality tested — compressive strength 43 MPa. Within IS 8112 specifications.",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    projectId: "p1",
    conductedBy: "u3",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "qc2",
    materialType: "concrete",
    result: "pass",
    notes:
      "Concrete mix 1:1.5:3. Slump test 75mm — acceptable range. Water-cement ratio 0.45.",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    projectId: "p1",
    conductedBy: "u3",
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: "qc3",
    materialType: "structure",
    result: "fail",
    notes:
      "Rebar spacing 180mm — exceeds spec of 150mm max. Corrective work ordered before pour.",
    date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
    projectId: "p2",
    conductedBy: "u3",
    createdAt: Date.now() - 3 * 86400000,
  },
];

const MATERIAL_LABELS: Record<MaterialType, string> = {
  cement: "Cement",
  structure: "Structure / Rebar",
  concrete: "Concrete Mix",
  other: "Other",
};

const MATERIAL_COLORS: Record<MaterialType, string> = {
  cement: "bg-amber-100 border-amber-300 text-amber-700",
  structure: "bg-blue-100 border-blue-300 text-blue-700",
  concrete: "bg-slate-100 border-slate-300 text-slate-700",
  other: "bg-purple-100 border-purple-300 text-purple-700",
};

export default function EngineerQualityCheckPage() {
  const { currentUser } = useAuth();
  const [checks, setChecks] = useState<QualityCheck[]>(
    INITIAL_CHECKS.filter((c) => c.conductedBy === currentUser?.id || true),
  );
  const [showForm, setShowForm] = useState(false);
  const [filterProject, setFilterProject] = useState("all");
  const [filterResult, setFilterResult] = useState("all");

  // Form state
  const [materialType, setMaterialType] = useState<MaterialType>("cement");
  const [result, setResult] = useState<QCResult>("pass");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [projectId, setProjectId] = useState("");

  function handleSubmit() {
    if (!notes.trim() || !projectId) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newCheck: QualityCheck = {
      id: `qc_${Date.now()}`,
      materialType,
      result,
      notes,
      date,
      projectId,
      conductedBy: currentUser?.id ?? "",
      createdAt: Date.now(),
    };
    setChecks((prev) => [newCheck, ...prev]);
    setShowForm(false);
    setNotes("");
    setMaterialType("cement");
    setResult("pass");
    setProjectId("");
    setDate(new Date().toISOString().split("T")[0]);
    toast.success("Quality check recorded");
  }

  const filtered = checks.filter((c) => {
    if (filterProject !== "all" && c.projectId !== filterProject) return false;
    if (filterResult !== "all" && c.result !== filterResult) return false;
    return true;
  });

  const passCount = checks.filter((c) => c.result === "pass").length;
  const failCount = checks.filter((c) => c.result === "fail").length;
  const passRate =
    checks.length > 0 ? Math.round((passCount / checks.length) * 100) : 0;

  return (
    <div
      className="p-4 space-y-4 bg-slate-50 min-h-screen"
      data-ocid="engineer-quality.page"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <h1 className="font-display text-xl font-bold text-slate-800">
            Quality Check
          </h1>
        </div>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 gap-1.5 border-0"
          onClick={() => setShowForm(true)}
          data-ocid="engineer-quality.add-button"
        >
          <Plus className="w-4 h-4" />
          Add Check
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm text-center">
          <p className="text-xl font-bold font-display text-slate-800">
            {checks.length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total</p>
        </Card>
        <Card className="bg-white rounded-2xl p-3 border border-green-200 shadow-sm text-center">
          <p className="text-xl font-bold font-display text-green-700">
            {passCount}
          </p>
          <p className="text-xs text-green-600 mt-0.5">Pass</p>
        </Card>
        <Card className="bg-white rounded-2xl p-3 border border-red-200 shadow-sm text-center">
          <p className="text-xl font-bold font-display text-red-700">
            {failCount}
          </p>
          <p className="text-xs text-red-600 mt-0.5">Fail</p>
        </Card>
      </div>

      {/* Compliance bar */}
      <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 font-medium">Overall Pass Rate</span>
          <span className="text-amber-700 font-bold">{passRate}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              passRate >= 80
                ? "bg-green-500"
                : passRate >= 60
                  ? "bg-amber-500"
                  : "bg-red-500",
            )}
            style={{ width: `${passRate}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger
            className="flex-1 bg-white border-slate-200 h-9 rounded-xl text-sm text-slate-700"
            data-ocid="engineer-quality.project-filter.select"
          >
            <SelectValue placeholder="Project" />
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
        <Select value={filterResult} onValueChange={setFilterResult}>
          <SelectTrigger
            className="flex-1 bg-white border-slate-200 h-9 rounded-xl text-sm text-slate-700"
            data-ocid="engineer-quality.result-filter.select"
          >
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="pass">Pass</SelectItem>
            <SelectItem value="fail">Fail</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3" data-ocid="engineer-quality.list">
        {filtered.length === 0 && (
          <div
            className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm"
            data-ocid="engineer-quality.empty_state"
          >
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">No quality checks yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Log your first quality inspection
            </p>
          </div>
        )}
        {filtered.map((check, idx) => (
          <Card
            key={check.id}
            className={cn(
              "bg-white rounded-2xl border shadow-sm p-4 space-y-2.5",
              check.result === "pass" ? "border-green-200" : "border-red-200",
            )}
            data-ocid={`engineer-quality.item.${idx + 1}`}
          >
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={cn(
                    "text-xs border",
                    MATERIAL_COLORS[check.materialType],
                  )}
                >
                  {MATERIAL_LABELS[check.materialType]}
                </Badge>
                <Badge
                  className={cn(
                    "text-xs border flex items-center gap-1",
                    check.result === "pass"
                      ? "bg-green-100 border-green-300 text-green-700"
                      : "bg-red-100 border-red-300 text-red-700",
                  )}
                >
                  {check.result === "pass" ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {check.result.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                <Calendar className="w-3 h-3" />
                {new Date(check.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {check.notes}
            </p>
            <p className="text-xs text-slate-400">
              {PROJECTS.find((p) => p.id === check.projectId)?.name ??
                check.projectId}
            </p>
          </Card>
        ))}
      </div>

      {/* Add Quality Check Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          data-ocid="engineer-quality.form.dialog"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800 text-lg">
                Log Quality Check
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-700"
                data-ocid="engineer-quality.form.close-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Material / Work Type *
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(MATERIAL_LABELS) as MaterialType[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMaterialType(m)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-medium border transition-colors",
                        materialType === m
                          ? MATERIAL_COLORS[m]
                          : "bg-slate-50 border-slate-200 text-slate-600",
                      )}
                      data-ocid={`engineer-quality.form.material.${m}`}
                    >
                      {MATERIAL_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Standard Met *
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResult("pass")}
                    className={cn(
                      "py-3 rounded-xl text-sm font-semibold border transition-colors flex items-center justify-center gap-2",
                      result === "pass"
                        ? "bg-green-100 border-green-400 text-green-700"
                        : "bg-slate-50 border-slate-200 text-slate-600",
                    )}
                    data-ocid="engineer-quality.form.result.pass"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setResult("fail")}
                    className={cn(
                      "py-3 rounded-xl text-sm font-semibold border transition-colors flex items-center justify-center gap-2",
                      result === "fail"
                        ? "bg-red-100 border-red-400 text-red-700"
                        : "bg-slate-50 border-slate-200 text-slate-600",
                    )}
                    data-ocid="engineer-quality.form.result.fail"
                  >
                    <XCircle className="w-4 h-4" /> Fail
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Notes *
                </Label>
                <Textarea
                  placeholder="Observations, measurements, test results..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm resize-none text-slate-800"
                  rows={3}
                  data-ocid="engineer-quality.form.notes.textarea"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Project *
                </Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger
                    className="bg-slate-50 border-slate-200 rounded-xl text-sm"
                    data-ocid="engineer-quality.form.project.select"
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
                  Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-800"
                  data-ocid="engineer-quality.form.date.input"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-600 rounded-xl"
                onClick={() => setShowForm(false)}
                data-ocid="engineer-quality.form.cancel-button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl border-0 gap-2"
                onClick={handleSubmit}
                data-ocid="engineer-quality.form.submit-button"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Check
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
