import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { CONSUMPTION_LOGS, MATERIALS, TASKS } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import type { ConsumptionLog, Material } from "@/types";
import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  Package,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";

function LogModal({
  materials,
  tasks,
  onClose,
  onLog,
}: {
  materials: Material[];
  tasks: typeof TASKS;
  onClose: () => void;
  onLog: (log: Omit<ConsumptionLog, "id" | "createdAt">) => void;
}) {
  const [materialId, setMaterialId] = useState("");
  const [qty, setQty] = useState("");
  const [taskId, setTaskId] = useState("");
  const [note, setNote] = useState("");
  const selectedMat = materials.find((m) => m.id === materialId);

  function submit() {
    if (!materialId || !qty) return;
    const mat = materials.find((m) => m.id === materialId);
    onLog({
      siteId: "s1",
      projectId: "p1",
      taskId: taskId || undefined,
      materialId,
      materialName: mat?.name ?? "",
      unit: mat?.unit ?? "",
      quantity: Number(qty),
      loggedBy: "u4",
      date: new Date().toISOString().split("T")[0],
      notes: note,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        role="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div
        className="relative w-full max-w-md bg-white rounded-2xl p-5 space-y-4 shadow-xl border border-slate-200"
        data-ocid="contractor-materials.dialog"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-800 text-lg">
            Log Consumption
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-ocid="contractor-materials.close_button"
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">
              Material <span className="text-red-500">*</span>
            </Label>
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger
                className="border-slate-200 focus:ring-amber-500 focus:border-amber-500"
                data-ocid="contractor-materials.material_select"
              >
                <SelectValue placeholder="Select material…" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMat && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
              <span className="text-slate-600">Available stock</span>
              <span className="text-amber-700 font-semibold">
                {selectedMat.quantity} {selectedMat.unit}
              </span>
            </div>
          )}

          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">
              Quantity Used <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="border-slate-200 focus:ring-amber-500 focus:border-amber-500"
                data-ocid="contractor-materials.qty_input"
              />
              {selectedMat && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {selectedMat.unit}
                </span>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">
              Linked Task (optional)
            </Label>
            <Select value={taskId} onValueChange={setTaskId}>
              <SelectTrigger
                className="border-slate-200 focus:ring-amber-500 focus:border-amber-500"
                data-ocid="contractor-materials.task_select"
              >
                <SelectValue placeholder="Select task…" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Notes</Label>
            <Input
              placeholder="Additional notes…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border-slate-200 focus:ring-amber-500 focus:border-amber-500"
              data-ocid="contractor-materials.notes_input"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors duration-200"
            data-ocid="contractor-materials.cancel_button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!materialId || !qty}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-semibold transition-colors duration-200"
            data-ocid="contractor-materials.submit_button"
            onClick={submit}
          >
            Log Consumption
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestModal({
  materials,
  onClose,
  onRequest,
}: {
  materials: Material[];
  onClose: () => void;
  onRequest: (data: { name: string; qty: string; urgency: string }) => void;
}) {
  const [materialId, setMaterialId] = useState("");
  const [qty, setQty] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const selectedMat = materials.find((m) => m.id === materialId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        role="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div
        className="relative w-full max-w-md bg-white rounded-2xl p-5 space-y-4 shadow-xl border border-slate-200"
        data-ocid="contractor-materials.request_dialog"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-800 text-lg">
            Request Material
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-ocid="contractor-materials.request_close_button"
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">
              Material
            </Label>
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger
                className="border-slate-200 focus:ring-amber-500 focus:border-amber-500"
                data-ocid="contractor-materials.request_material_select"
              >
                <SelectValue placeholder="Select material…" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">
              Quantity Needed
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="border-slate-200 focus:ring-amber-500 focus:border-amber-500"
              data-ocid="contractor-materials.request_qty_input"
            />
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">
              Urgency
            </Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger
                className="border-slate-200 focus:ring-amber-500 focus:border-amber-500"
                data-ocid="contractor-materials.urgency_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors duration-200"
            onClick={onClose}
            data-ocid="contractor-materials.request_cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!materialId || !qty}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-semibold transition-colors duration-200"
            data-ocid="contractor-materials.request_submit_button"
            onClick={() => {
              onRequest({ name: selectedMat?.name ?? "", qty, urgency });
              onClose();
            }}
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractorMaterialsPage() {
  const { currentUser } = useAuth();
  const myTasks = TASKS.filter(
    (t) => t.assignedTo === (currentUser?.id ?? "u4"),
  );
  const projectIds = [...new Set(myTasks.map((t) => t.projectId))];
  const allocatedMaterials = MATERIALS.filter((m) =>
    projectIds.includes(m.projectId),
  );

  const [logs, setLogs] = useState<ConsumptionLog[]>(
    CONSUMPTION_LOGS.filter((c) => c.loggedBy === (currentUser?.id ?? "u4")),
  );
  const [showLog, setShowLog] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [tab, setTab] = useState<"materials" | "history">("materials");

  function addLog(log: Omit<ConsumptionLog, "id" | "createdAt">) {
    setLogs((prev) => [
      { ...log, id: `cl${prev.length + 1}`, createdAt: Date.now() },
      ...prev,
    ]);
  }

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5"
      data-ocid="contractor-materials.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-800">
            Materials
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Allocated materials & consumption
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:border-amber-300 transition-colors duration-200 shadow-sm"
            data-ocid="contractor-materials.request_button"
            onClick={() => setShowRequest(true)}
          >
            <ArrowUpRight className="w-4 h-4" />
            Request
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm"
            data-ocid="contractor-materials.log_button"
            onClick={() => setShowLog(true)}
          >
            <Plus className="w-4 h-4" />
            Log
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["materials", "history"] as const).map((t) => (
          <button
            key={t}
            type="button"
            data-ocid={`contractor-materials.${t}_tab`}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors duration-200 ${
              tab === t
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
            }`}
          >
            {t === "materials" ? "Allocated" : "History"}
          </button>
        ))}
      </div>

      {tab === "materials" && (
        <div
          className="space-y-3"
          data-ocid="contractor-materials.materials_list"
        >
          {allocatedMaterials.map((mat, i) => {
            const pct = Math.min(
              100,
              Math.round((mat.quantity / (mat.minQuantity * 3)) * 100),
            );
            const alertLevel =
              mat.status === "critical" || mat.status === "outOfStock";
            const barColor =
              mat.status === "outOfStock"
                ? "bg-red-500"
                : mat.status === "critical"
                  ? "bg-orange-500"
                  : mat.status === "low"
                    ? "bg-amber-500"
                    : "bg-green-500";

            return (
              <div
                key={mat.id}
                className={`bg-white rounded-2xl p-4 border shadow-sm ${
                  alertLevel ? "border-red-200" : "border-slate-200"
                }`}
                data-ocid={`contractor-materials.material.${i + 1}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {mat.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Unit: {mat.unit} · Min: {mat.minQuantity} {mat.unit}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={mat.status} size="sm" />
                    {alertLevel && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-800 w-16 text-right">
                    {mat.quantity}{" "}
                    <span className="text-xs text-slate-500">{mat.unit}</span>
                  </span>
                </div>
              </div>
            );
          })}

          {allocatedMaterials.length === 0 && (
            <div
              className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm"
              data-ocid="contractor-materials.empty_state"
            >
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-medium">
                No materials allocated
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div
          className="space-y-2"
          data-ocid="contractor-materials.history_table"
        >
          {logs.length === 0 ? (
            <div
              className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm"
              data-ocid="contractor-materials.history_empty_state"
            >
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-medium">
                No consumption logged yet
              </p>
              <button
                type="button"
                className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors duration-200"
                onClick={() => setShowLog(true)}
                data-ocid="contractor-materials.history_log_button"
              >
                <Plus className="w-4 h-4" />
                Log First Entry
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 grid grid-cols-12 gap-2">
                <span className="col-span-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Material
                </span>
                <span className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Qty
                </span>
                <span className="col-span-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Date
                </span>
              </div>
              {logs.map((log, i) => (
                <div
                  key={log.id}
                  className="px-4 py-3 border-b border-slate-100 last:border-b-0 grid grid-cols-12 gap-2 items-center hover:bg-amber-50/30 transition-colors duration-150"
                  data-ocid={`contractor-materials.history_row.${i + 1}`}
                >
                  <div className="col-span-5 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {log.materialName}
                    </p>
                    {log.notes && (
                      <p className="text-xs text-slate-500 truncate">
                        {log.notes}
                      </p>
                    )}
                  </div>
                  <span className="col-span-3 text-right text-sm font-bold text-amber-600">
                    {log.quantity}{" "}
                    <span className="text-xs text-slate-500 font-normal">
                      {log.unit}
                    </span>
                  </span>
                  <span className="col-span-4 text-right text-xs text-slate-500">
                    {formatDate(log.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showLog && (
        <LogModal
          materials={allocatedMaterials}
          tasks={myTasks}
          onClose={() => setShowLog(false)}
          onLog={addLog}
        />
      )}
      {showRequest && (
        <RequestModal
          materials={allocatedMaterials}
          onClose={() => setShowRequest(false)}
          onRequest={() => {}}
        />
      )}
    </div>
  );
}
