import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PUBLIC_COMPLAINTS } from "@/lib/mockData";
import type { PublicComplaint } from "@/types";
import { Flag, Image as ImageIcon, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type StatusFilter = "all" | "open" | "resolved";

function ComplaintCard({
  complaint,
  onResolve,
  onReopen,
  index,
}: {
  complaint: PublicComplaint;
  onResolve: (id: number) => void;
  onReopen: (id: number) => void;
  index: number;
}) {
  const isOpen = complaint.status === "open";
  const dateStr = new Date(complaint.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3"
      data-ocid={`authority.public_complaints.item.${index}`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isOpen ? "bg-red-100" : "bg-emerald-100"
          }`}
        >
          <Flag
            className={`w-4 h-4 ${isOpen ? "text-red-600" : "text-emerald-600"}`}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {complaint.title}
            </p>
            {isOpen ? (
              <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] flex-shrink-0">
                <Flag className="w-2.5 h-2.5 mr-0.5" /> Open
              </Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] flex-shrink-0">
                Resolved
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            {complaint.description}
          </p>
        </div>

        {/* Photo thumbnail */}
        {complaint.imageKey && (
          <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <ImageIcon className="w-5 h-5 text-slate-400" />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pl-11">
        <span className="flex items-center gap-1">
          <Flag className="w-3 h-3" />
          {complaint.reporterName}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {complaint.projectName}
        </span>
        <span>{dateStr}</span>
      </div>

      {/* Actions */}
      <div className="pl-11 flex items-center gap-2">
        {isOpen ? (
          <Button
            size="sm"
            className="h-7 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-0"
            onClick={() => onResolve(complaint.id)}
            data-ocid={`authority.public_complaints.resolve_button.${index}`}
          >
            Mark Resolved
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onReopen(complaint.id)}
            data-ocid={`authority.public_complaints.reopen_button.${index}`}
          >
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AuthorityPublicComplaintsPage() {
  const [complaints, setComplaints] = useState<PublicComplaint[]>(
    PUBLIC_COMPLAINTS.map((c) => ({ ...c })),
  );
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const projectNames = Array.from(
    new Set(complaints.map((c) => c.projectName)),
  );

  const totalCount = complaints.length;
  const openCount = complaints.filter((c) => c.status === "open").length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved",
  ).length;

  const filtered = complaints.filter((c) => {
    const matchProject =
      projectFilter === "all" || c.projectName === projectFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchProject && matchStatus;
  });

  function handleResolve(id: number) {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "resolved" as const } : c,
      ),
    );
    toast.success("Complaint marked as resolved");
  }

  function handleReopen(id: number) {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "open" as const } : c)),
    );
    toast.warning("Complaint reopened");
  }

  return (
    <div
      className="p-4 lg:p-6 space-y-6 bg-slate-50 min-h-screen"
      data-ocid="authority.public_complaints.page"
    >
      {/* Header */}
      <div>
        <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
          Public Complaints
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Complaints raised by the public
        </p>
      </div>

      {/* Stats bar */}
      <div
        className="grid grid-cols-3 gap-3"
        data-ocid="authority.public_complaints.stats"
      >
        {[
          {
            label: "Total",
            value: totalCount,
            color: "text-slate-700",
            bg: "bg-white",
          },
          {
            label: "Open",
            value: openCount,
            color: "text-red-600",
            bg: "bg-red-50 border-red-200",
          },
          {
            label: "Resolved",
            value: resolvedCount,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-200",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border border-slate-200 rounded-xl p-3 text-center`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div
        className="flex flex-wrap items-center gap-3"
        data-ocid="authority.public_complaints.filters"
      >
        <select
          className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          data-ocid="authority.public_complaints.project_filter"
        >
          <option value="all">All Projects</option>
          {projectNames.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {(["all", "open", "resolved"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              data-ocid={`authority.public_complaints.status_filter.${s}`}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-amber-100 text-amber-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints list */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-14 text-slate-500 text-sm bg-white rounded-xl border border-slate-200"
          data-ocid="authority.public_complaints.empty_state"
        >
          <Flag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          No complaints match the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              onResolve={handleResolve}
              onReopen={handleReopen}
              index={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
