import { Package, Plus, Truck, User, Wrench, X } from "lucide-react";
import { useState } from "react";

interface Equipment {
  id: string;
  name: string;
  type: string;
  assignedTo: string | null;
  workerId: string | null;
  condition: "good" | "fair" | "poor";
}

const WORKERS = [
  { id: "w1", name: "Ramesh Kumar", trade: "Mason" },
  { id: "w2", name: "Suresh Yadav", trade: "Welder" },
  { id: "w3", name: "Mahesh Singh", trade: "Helper" },
  { id: "w4", name: "Ganesh Patel", trade: "Carpenter" },
  { id: "w5", name: "Dinesh Verma", trade: "Electrician" },
  { id: "w6", name: "Santosh Gupta", trade: "Plumber" },
  { id: "w7", name: "Ravi Sharma", trade: "Mason" },
  { id: "w8", name: "Anil Tiwari", trade: "Helper" },
];

const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: "eq1",
    name: "Concrete Mixer CM-01",
    type: "Machinery",
    assignedTo: "Ramesh Kumar",
    workerId: "w1",
    condition: "fair",
  },
  {
    id: "eq2",
    name: "Welding Machine WM-02",
    type: "Tool",
    assignedTo: "Suresh Yadav",
    workerId: "w2",
    condition: "good",
  },
  {
    id: "eq3",
    name: "Power Drill PD-04",
    type: "Tool",
    assignedTo: "Ganesh Patel",
    workerId: "w4",
    condition: "good",
  },
  {
    id: "eq4",
    name: "Pipe Wrench Set PW-01",
    type: "Tool",
    assignedTo: "Santosh Gupta",
    workerId: "w6",
    condition: "fair",
  },
  {
    id: "eq5",
    name: "Scaffolding Frame SF-07",
    type: "Structure",
    assignedTo: null,
    workerId: null,
    condition: "good",
  },
  {
    id: "eq6",
    name: "Portable Generator PG-01",
    type: "Machinery",
    assignedTo: null,
    workerId: null,
    condition: "good",
  },
  {
    id: "eq7",
    name: "Excavator Bucket EB-03",
    type: "Attachment",
    assignedTo: "Ravi Sharma",
    workerId: "w7",
    condition: "poor",
  },
  {
    id: "eq8",
    name: "Safety Harness Kit SH-02",
    type: "Safety",
    assignedTo: "Anil Tiwari",
    workerId: "w8",
    condition: "good",
  },
];

const CONDITION_STYLES: Record<string, string> = {
  good: "bg-green-100 text-green-700 border-green-200",
  fair: "bg-amber-100 text-amber-700 border-amber-200",
  poor: "bg-red-100 text-red-700 border-red-200",
};

const TYPE_ICONS: Record<string, typeof Wrench> = {
  Machinery: Truck,
  Tool: Wrench,
  Structure: Package,
  Attachment: Package,
  Safety: Package,
};

function AssignModal({
  equipment,
  onClose,
  onAssign,
}: {
  equipment: Equipment;
  onClose: () => void;
  onAssign: (eqId: string, workerId: string | null) => void;
}) {
  const [workerId, setWorkerId] = useState(equipment.workerId ?? "");

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
        className="relative w-full max-w-md bg-card rounded-2xl p-5 space-y-4 shadow-xl border border-border"
        data-ocid="contractor-resources.dialog"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-foreground text-lg">
            Assign Equipment
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-ocid="contractor-resources.close_button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-muted rounded-xl p-3 border border-border">
          <p className="text-xs text-muted-foreground">Equipment</p>
          <p className="font-semibold text-foreground mt-0.5">
            {equipment.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {equipment.type}
          </p>
        </div>
        <div>
          <label
            htmlFor="assign-worker"
            className="text-xs font-medium text-foreground mb-1.5 block"
          >
            Assign to Worker
          </label>
          <select
            id="assign-worker"
            className="w-full border border-input rounded-xl px-3 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            data-ocid="contractor-resources.worker_select"
          >
            <option value="">Unassigned</option>
            {WORKERS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} — {w.trade}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 py-2.5 bg-muted border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors duration-200"
            data-ocid="contractor-resources.cancel_button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-colors duration-200"
            data-ocid="contractor-resources.confirm_button"
            onClick={() => {
              onAssign(equipment.id, workerId || null);
              onClose();
            }}
          >
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractorResourceAllocationPage() {
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [assigning, setAssigning] = useState<Equipment | null>(null);
  const [filterAssigned, setFilterAssigned] = useState<
    "all" | "assigned" | "unassigned"
  >("all");

  function assignEquipment(eqId: string, workerId: string | null) {
    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id !== eqId) return eq;
        const worker = WORKERS.find((w) => w.id === workerId);
        return { ...eq, workerId, assignedTo: worker?.name ?? null };
      }),
    );
  }

  const filtered = equipment.filter((eq) => {
    if (filterAssigned === "assigned") return eq.workerId !== null;
    if (filterAssigned === "unassigned") return eq.workerId === null;
    return true;
  });

  const assignedCount = equipment.filter((e) => e.workerId).length;
  const unassignedCount = equipment.filter((e) => !e.workerId).length;

  return (
    <div
      className="bg-muted min-h-screen p-4 space-y-6"
      data-ocid="contractor-resources.page"
    >
      <div>
        <h1 className="font-display font-bold text-xl text-foreground">
          Resource Allocation
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Assign equipment and tools to workers
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total", count: equipment.length, color: "text-foreground" },
          { label: "Assigned", count: assignedCount, color: "text-green-600" },
          { label: "Available", count: unassignedCount, color: "text-primary" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-3 text-center shadow-sm"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "assigned", "unassigned"] as const).map((f) => (
          <button
            key={f}
            type="button"
            data-ocid={`contractor-resources.${f}_tab`}
            onClick={() => setFilterAssigned(f)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors duration-200 ${
              filterAssigned === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Equipment list */}
      <div className="space-y-3" data-ocid="contractor-resources.list">
        {filtered.map((eq, i) => {
          const Icon = TYPE_ICONS[eq.type] ?? Wrench;
          return (
            <div
              key={eq.id}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm"
              data-ocid={`contractor-resources.item.${i + 1}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">
                      {eq.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CONDITION_STYLES[eq.condition]}`}
                    >
                      {eq.condition}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {eq.type}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {eq.assignedTo ? (
                      <>
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-foreground font-medium">
                          {eq.assignedTo}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid={`contractor-resources.assign_button.${i + 1}`}
                  onClick={() => setAssigning(eq)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border text-foreground rounded-xl text-xs font-medium hover:border-primary/40 transition-colors duration-200 flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {eq.assignedTo ? "Reassign" : "Assign"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {assigning && (
        <AssignModal
          equipment={assigning}
          onClose={() => setAssigning(null)}
          onAssign={assignEquipment}
        />
      )}
    </div>
  );
}
