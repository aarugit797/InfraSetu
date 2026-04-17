import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_USERS, MATERIALS, PROJECTS } from "@/lib/mockData";
import { generateId } from "@/lib/utils";
import type { Material, MaterialRequest } from "@/types";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Edit3,
  Filter,
  Package,
  Plus,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpdateStockForm {
  materialId: string;
  currentQty: number;
  newQty: string;
  reason: string;
}

interface NewRequestForm {
  materialId: string;
  projectId: string;
  quantity: string;
  urgency: "low" | "medium" | "high";
  notes: string;
}

// ─── Initial mock requests ─────────────────────────────────────────────────

const now = Date.now();
const day = 86400000;

const INITIAL_REQUESTS: MaterialRequest[] = [
  {
    id: "mr1",
    projectId: "p1",
    materialId: "m2",
    requestedBy: "u4",
    quantity: 50,
    urgency: "high",
    status: "pending",
    notes: "TMT steel urgently needed for Phase 2 framework",
    createdAt: now - 3 * day,
  },
  {
    id: "mr2",
    projectId: "p2",
    materialId: "m4",
    requestedBy: "u4",
    quantity: 300,
    urgency: "high",
    status: "approved",
    notes: "Critical – cement stock near zero for Block A",
    createdAt: now - 7 * day,
  },
  {
    id: "mr3",
    projectId: "p1",
    materialId: "m3",
    requestedBy: "u3",
    quantity: 80,
    urgency: "medium",
    status: "pending",
    notes: "Coarse aggregate needed for Section 3 concrete pouring",
    createdAt: now - 2 * day,
  },
  {
    id: "mr4",
    projectId: "p2",
    materialId: "m5",
    requestedBy: "u3",
    quantity: 1500,
    urgency: "low",
    status: "rejected",
    notes: "Advance stock for future floors",
    createdAt: now - 10 * day,
  },
  {
    id: "mr5",
    projectId: "p3",
    materialId: "m6",
    requestedBy: "u4",
    quantity: 600,
    urgency: "high",
    status: "pending",
    notes: "HDPE pipes out of stock, needed for Water Treatment Plant",
    createdAt: now - 1 * day,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMaterialStatus(
  qty: number,
  minQty: number,
): "inStock" | "low" | "critical" | "outOfStock" {
  if (qty === 0) return "outOfStock";
  if (qty <= minQty / 2) return "critical";
  if (qty <= minQty) return "low";
  return "inStock";
}

function getMaterialStatusBadge(qty: number, minQty: number) {
  const s = getMaterialStatus(qty, minQty);
  if (s === "inStock")
    return {
      label: "In Stock",
      colorClasses: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        dot: "bg-emerald-400",
      },
    };
  if (s === "critical")
    return {
      label: "Critical",
      colorClasses: {
        bg: "bg-red-500/15",
        text: "text-red-400",
        border: "border-red-500/40",
        dot: "bg-red-400",
      },
    };
  if (s === "outOfStock")
    return {
      label: "Out of Stock",
      colorClasses: {
        bg: "bg-red-900/30",
        text: "text-red-300",
        border: "border-red-500/50",
        dot: "bg-red-300",
      },
    };
  return {
    label: "Low Stock",
    colorClasses: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
      dot: "bg-amber-400",
    },
  };
}

function getRequestStatusBadge(status: MaterialRequest["status"]) {
  switch (status) {
    case "approved":
      return {
        label: "Approved",
        colorClasses: {
          bg: "bg-emerald-500/10",
          text: "text-emerald-400",
          border: "border-emerald-500/30",
          dot: "bg-emerald-400",
        },
      };
    case "rejected":
      return {
        label: "Rejected",
        colorClasses: {
          bg: "bg-red-500/10",
          text: "text-red-400",
          border: "border-red-500/30",
          dot: "bg-red-400",
        },
      };
    case "fulfilled":
      return {
        label: "Fulfilled",
        colorClasses: {
          bg: "bg-blue-500/10",
          text: "text-blue-400",
          border: "border-blue-500/30",
          dot: "bg-blue-400",
        },
      };
    default:
      return {
        label: "Pending",
        colorClasses: {
          bg: "bg-amber-500/10",
          text: "text-amber-400",
          border: "border-amber-500/30",
          dot: "bg-amber-400",
        },
      };
  }
}

function getUrgencyBadge(urgency: MaterialRequest["urgency"]) {
  if (urgency === "high")
    return {
      label: "High",
      colorClasses: {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/30",
        dot: "bg-red-400",
      },
    };
  if (urgency === "medium")
    return {
      label: "Medium",
      colorClasses: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/30",
        dot: "bg-amber-400",
      },
    };
  return {
    label: "Low",
    colorClasses: {
      bg: "bg-muted/50",
      text: "text-muted-foreground",
      border: "border-border",
      dot: "bg-muted-foreground",
    },
  };
}

function getCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("cement")) return "Binder";
  if (n.includes("steel") || n.includes("rebar")) return "Metal";
  if (n.includes("block") || n.includes("aggregate")) return "Aggregate";
  if (n.includes("pipe") || n.includes("hdpe")) return "Plumbing";
  return "General";
}

function formatCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

function StatsRow({ materials }: { materials: Material[] }) {
  const low = materials.filter(
    (m) => getMaterialStatus(m.quantity, m.minQuantity) !== "inStock",
  ).length;
  const value = materials.reduce((sum, m) => sum + m.quantity * m.unitPrice, 0);
  const stats = [
    {
      label: "Total Items",
      value: String(materials.length),
      icon: Package,
      color: "text-primary",
      highlight: false,
    },
    {
      label: "Low Stock Alerts",
      value: String(low),
      icon: AlertTriangle,
      color: "text-red-400",
      highlight: low > 0,
    },
    {
      label: "Estimated Value",
      value: formatCurrency(value),
      icon: TrendingDown,
      color: "text-accent",
      highlight: false,
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value: val, icon: Icon, color, highlight }) => (
        <div
          key={label}
          className={`glass rounded-xl p-3 sm:p-4 flex items-center gap-3 ${highlight ? "border-red-500/30" : ""}`}
          data-ocid="stats-card"
        >
          <div className={`p-2 rounded-lg bg-muted/30 ${color}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p
              className={`font-bold text-lg sm:text-xl ${highlight ? "text-red-400" : "text-foreground"}`}
            >
              {val}
            </p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Inventory Skeleton ───────────────────────────────────────────────────────

function InventorySkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border/40 flex gap-4">
        {[140, 80, 120, 100, 80, 70, 60].map((w, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <div key={i} className="skeleton h-3 rounded" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: 6 }, (_, i) => `skeleton-row-${i}`).map((key) => (
        <div
          key={key}
          className="px-4 py-4 border-b border-border/20 flex gap-4 items-center"
        >
          <div className="skeleton h-4 rounded" style={{ width: 180 }} />
          <div className="skeleton h-4 rounded w-16" />
          <div className="skeleton h-4 rounded w-24" />
          <div className="skeleton h-4 rounded w-20" />
          <div className="skeleton h-4 rounded w-16" />
          <div className="skeleton h-5 rounded-full w-16" />
          <div className="skeleton h-7 rounded-lg w-20" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MaterialsPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"inventory" | "requests">(
    "inventory",
  );
  const [siteFilter, setSiteFilter] = useState("all");
  const [materials, setMaterials] = useState<Material[]>(MATERIALS);
  const [requests, setRequests] = useState<MaterialRequest[]>(INITIAL_REQUESTS);
  const [isLoading] = useState(false);

  // Modals
  const [updateModal, setUpdateModal] = useState<UpdateStockForm | null>(null);
  const [newRequestModal, setNewRequestModal] = useState(false);
  const [newReqForm, setNewReqForm] = useState<NewRequestForm>({
    materialId: "",
    projectId: "",
    quantity: "",
    urgency: "medium",
    notes: "",
  });

  const canApprove =
    currentUser?.role === "governmentAuthority" ||
    currentUser?.role === "projectManager";
  const isContractor = currentUser?.role === "contractor";

  const filteredMaterials = useMemo(() => {
    if (siteFilter === "all") return materials;
    return materials.filter((m) => m.projectId === siteFilter);
  }, [materials, siteFilter]);

  const visibleRequests = useMemo(() => {
    if (isContractor && currentUser)
      return requests.filter((r) => r.requestedBy === currentUser.id);
    return requests;
  }, [requests, isContractor, currentUser]);

  // ── Update stock ───────────────────────────────────────────────────────────

  function openUpdateModal(m: Material) {
    setUpdateModal({
      materialId: m.id,
      currentQty: m.quantity,
      newQty: String(m.quantity),
      reason: "",
    });
  }

  function handleUpdateStock() {
    if (!updateModal) return;
    const newQty = Number.parseInt(updateModal.newQty, 10);
    if (Number.isNaN(newQty) || newQty < 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    if (!updateModal.reason) {
      toast.error("Please select a reason");
      return;
    }

    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== updateModal.materialId) return m;
        const status: Material["status"] =
          newQty === 0
            ? "outOfStock"
            : newQty <= m.minQuantity / 2
              ? "critical"
              : newQty <= m.minQuantity
                ? "low"
                : "available";
        return { ...m, quantity: newQty, status, lastUpdated: Date.now() };
      }),
    );
    toast.success("Stock updated successfully");
    setUpdateModal(null);
  }

  // ── Approve / Reject request ───────────────────────────────────────────────

  function handleApprove(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "approved" as const } : r,
      ),
    );
    toast.success("Request approved");
  }

  function handleReject(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "rejected" as const } : r,
      ),
    );
    toast.error("Request rejected");
  }

  // ── New request ────────────────────────────────────────────────────────────

  function handleSubmitRequest() {
    if (!newReqForm.materialId) {
      toast.error("Select a material");
      return;
    }
    if (!newReqForm.projectId) {
      toast.error("Select a project");
      return;
    }
    const qty = Number.parseInt(newReqForm.quantity, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    const req: MaterialRequest = {
      id: generateId(),
      projectId: newReqForm.projectId,
      materialId: newReqForm.materialId,
      requestedBy: currentUser?.id ?? "u4",
      quantity: qty,
      urgency: newReqForm.urgency,
      status: "pending",
      notes: newReqForm.notes,
      createdAt: Date.now(),
    };
    setRequests((prev) => [req, ...prev]);
    toast.success("Material request submitted");
    setNewRequestModal(false);
    setNewReqForm({
      materialId: "",
      projectId: "",
      quantity: "",
      urgency: "medium",
      notes: "",
    });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
            Materials
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Inventory management &amp; procurement requests
          </p>
        </div>
        {activeTab === "requests" && (
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-smooth shadow-lg shadow-primary/20"
            onClick={() => setNewRequestModal(true)}
            data-ocid="new-request-btn"
          >
            <Plus className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">New Request</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        className="glass rounded-xl p-1 flex gap-1 w-fit"
        data-ocid="tabs-nav"
      >
        {(["inventory", "requests"] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-smooth ${activeTab === tab ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
            data-ocid={`tab-${tab}`}
          >
            {tab === "inventory" ? "Inventory" : "Requests"}
          </button>
        ))}
      </div>

      {/* INVENTORY TAB */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          {/* Filter row */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <label htmlFor="site-filter" className="sr-only">
                Filter by site
              </label>
              <select
                id="site-filter"
                className="pl-8 pr-8 py-2 rounded-xl glass border border-border/50 text-sm text-foreground bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40"
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                data-ocid="site-filter"
              >
                <option value="all" className="bg-card">
                  All Sites
                </option>
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-card">
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Stats */}
          <StatsRow materials={filteredMaterials} />

          {/* Table / Cards */}
          {isLoading ? (
            <InventorySkeleton />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block glass rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      {[
                        "Material Name",
                        "Category",
                        "Site",
                        "Stock / Threshold",
                        "Unit Price",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((m) => {
                      const badge = getMaterialStatusBadge(
                        m.quantity,
                        m.minQuantity,
                      );
                      const isAlert = m.quantity <= m.minQuantity;
                      const isCritical =
                        m.quantity <= m.minQuantity / 2 || m.quantity === 0;
                      const project = PROJECTS.find(
                        (p) => p.id === m.projectId,
                      );
                      return (
                        <tr
                          key={m.id}
                          className={`border-b border-border/20 last:border-0 transition-smooth hover:bg-muted/10 ${isAlert ? "border-l-2 border-l-red-500" : ""}`}
                          data-ocid={`material-row-${m.id}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isCritical && (
                                <span
                                  className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                              <span className="font-medium text-foreground truncate max-w-[200px]">
                                {m.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {getCategory(m.name)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {project?.name ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-bold ${isAlert ? "text-red-400" : "text-foreground"}`}
                            >
                              {m.quantity.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              / {m.minQuantity.toLocaleString()} {m.unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {formatCurrency(m.unitPrice)}/{m.unit}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge {...badge} />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => openUpdateModal(m)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/10 transition-smooth"
                              data-ocid={`update-stock-${m.id}`}
                            >
                              <Edit3 className="w-3 h-3" /> Update
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMaterials.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-muted-foreground"
                        >
                          No materials found for this site
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filteredMaterials.map((m) => {
                  const badge = getMaterialStatusBadge(
                    m.quantity,
                    m.minQuantity,
                  );
                  const isAlert = m.quantity <= m.minQuantity;
                  const project = PROJECTS.find((p) => p.id === m.projectId);
                  return (
                    <div
                      key={m.id}
                      className={`glass rounded-xl p-4 space-y-3 ${isAlert ? "border-l-4 border-l-red-500" : ""}`}
                      data-ocid={`material-card-${m.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">
                            {m.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {project?.name} · {getCategory(m.name)}
                          </p>
                        </div>
                        <StatusBadge {...badge} size="sm" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Stock</p>
                          <p
                            className={`font-bold ${isAlert ? "text-red-400" : "text-foreground"}`}
                          >
                            {m.quantity.toLocaleString()} {m.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Threshold</p>
                          <p className="font-medium text-foreground">
                            {m.minQuantity.toLocaleString()} {m.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Unit Price</p>
                          <p className="font-medium text-foreground">
                            {formatCurrency(m.unitPrice)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openUpdateModal(m)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/10 transition-smooth"
                        data-ocid={`update-stock-mobile-${m.id}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Update Stock
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* REQUESTS TAB */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {visibleRequests.length === 0 ? (
            <div
              className="glass rounded-xl p-12 text-center space-y-3"
              data-ocid="empty-requests"
            >
              <Package className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">No requests yet</p>
              <p className="text-muted-foreground text-sm">
                Create your first material request using the button above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleRequests.map((req) => {
                const mat = materials.find((m) => m.id === req.materialId);
                const project = PROJECTS.find((p) => p.id === req.projectId);
                const requester = DEMO_USERS.find(
                  (u) => u.id === req.requestedBy,
                );
                const statusBadge = getRequestStatusBadge(req.status);
                const urgBadge = getUrgencyBadge(req.urgency);
                return (
                  <div
                    key={req.id}
                    className="glass rounded-xl p-4 space-y-3"
                    data-ocid={`request-card-${req.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          {mat?.name ?? "Unknown Material"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {project?.name} · {requester?.name} ·{" "}
                          {formatDate(req.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge {...urgBadge} size="sm" />
                        <StatusBadge {...statusBadge} />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Requested Qty
                        </span>
                        <p className="font-bold text-foreground">
                          {req.quantity.toLocaleString()} {mat?.unit ?? ""}
                        </p>
                      </div>
                      {req.notes && (
                        <div className="min-w-0 flex-1">
                          <span className="text-muted-foreground text-xs">
                            Notes
                          </span>
                          <p className="text-foreground text-xs truncate">
                            {req.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {canApprove && req.status === "pending" && (
                      <div className="flex gap-2 pt-1 border-t border-border/30">
                        <button
                          type="button"
                          onClick={() => handleApprove(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-smooth flex-1 justify-center"
                          data-ocid={`approve-request-${req.id}`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-smooth flex-1 justify-center"
                          data-ocid={`reject-request-${req.id}`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Update Stock Modal ─────────────────────────────────────────────── */}
      <Modal
        open={!!updateModal}
        onClose={() => setUpdateModal(null)}
        title="Update Stock"
        description="Adjust the material quantity on site"
        size="sm"
      >
        {updateModal &&
          (() => {
            const mat = materials.find((m) => m.id === updateModal.materialId);
            if (!mat) return null;
            return (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Material
                  </p>
                  <p className="mt-1 text-foreground font-semibold">
                    {mat.name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Current Stock
                    </p>
                    <p className="mt-1 text-foreground font-bold text-lg">
                      {updateModal.currentQty}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        {mat.unit}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="update-qty"
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1"
                    >
                      New Quantity
                    </label>
                    <input
                      id="update-qty"
                      type="number"
                      min={0}
                      className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                      value={updateModal.newQty}
                      onChange={(e) =>
                        setUpdateModal((u) =>
                          u ? { ...u, newQty: e.target.value } : u,
                        )
                      }
                      data-ocid="update-stock-qty-input"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="update-reason"
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1"
                  >
                    Reason
                  </label>
                  <select
                    id="update-reason"
                    className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none"
                    value={updateModal.reason}
                    onChange={(e) =>
                      setUpdateModal((u) =>
                        u ? { ...u, reason: e.target.value } : u,
                      )
                    }
                    data-ocid="update-stock-reason"
                  >
                    <option value="" className="bg-card">
                      Select reason…
                    </option>
                    <option value="delivery" className="bg-card">
                      New Delivery Received
                    </option>
                    <option value="usage" className="bg-card">
                      Site Consumption / Usage
                    </option>
                    <option value="damage" className="bg-card">
                      Damaged / Waste Deduction
                    </option>
                    <option value="return" className="bg-card">
                      Return to Supplier
                    </option>
                    <option value="correction" className="bg-card">
                      Inventory Correction
                    </option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUpdateModal(null)}
                    className="flex-1 py-2.5 rounded-xl border border-border/50 text-muted-foreground text-sm font-semibold hover:bg-muted/20 transition-smooth"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateStock}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-smooth shadow-lg shadow-primary/20"
                    data-ocid="update-stock-submit"
                  >
                    Update Stock
                  </button>
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* ─── New Request Modal ──────────────────────────────────────────────── */}
      <Modal
        open={newRequestModal}
        onClose={() => setNewRequestModal(false)}
        title="New Material Request"
        description="Submit a procurement request for site materials"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="req-material"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1"
            >
              Material *
            </label>
            <select
              id="req-material"
              className="w-full px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none"
              value={newReqForm.materialId}
              onChange={(e) =>
                setNewReqForm((f) => ({ ...f, materialId: e.target.value }))
              }
              data-ocid="new-request-material"
            >
              <option value="" className="bg-card">
                Select material…
              </option>
              {materials.map((m) => (
                <option key={m.id} value={m.id} className="bg-card">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="req-project"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1"
            >
              Project *
            </label>
            <select
              id="req-project"
              className="w-full px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none"
              value={newReqForm.projectId}
              onChange={(e) =>
                setNewReqForm((f) => ({ ...f, projectId: e.target.value }))
              }
              data-ocid="new-request-project"
            >
              <option value="" className="bg-card">
                Select project…
              </option>
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id} className="bg-card">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="req-qty"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1"
              >
                Quantity *
              </label>
              <input
                id="req-qty"
                type="number"
                min={1}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                value={newReqForm.quantity}
                onChange={(e) =>
                  setNewReqForm((f) => ({ ...f, quantity: e.target.value }))
                }
                data-ocid="new-request-qty"
              />
            </div>
            <div>
              <label
                htmlFor="req-priority"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1"
              >
                Priority
              </label>
              <select
                id="req-priority"
                className="w-full px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none"
                value={newReqForm.urgency}
                onChange={(e) =>
                  setNewReqForm((f) => ({
                    ...f,
                    urgency: e.target.value as "low" | "medium" | "high",
                  }))
                }
                data-ocid="new-request-priority"
              >
                <option value="low" className="bg-card">
                  Low
                </option>
                <option value="medium" className="bg-card">
                  Medium
                </option>
                <option value="high" className="bg-card">
                  High
                </option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="req-notes"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1"
            >
              Notes
            </label>
            <textarea
              id="req-notes"
              rows={3}
              placeholder="Additional context or urgency details…"
              className="w-full px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
              value={newReqForm.notes}
              onChange={(e) =>
                setNewReqForm((f) => ({ ...f, notes: e.target.value }))
              }
              data-ocid="new-request-notes"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setNewRequestModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-border/50 text-muted-foreground text-sm font-semibold hover:bg-muted/20 transition-smooth"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitRequest}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-smooth shadow-lg shadow-primary/20"
              data-ocid="new-request-submit"
            >
              Submit Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
