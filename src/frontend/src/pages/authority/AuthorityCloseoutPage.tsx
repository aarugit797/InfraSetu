import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useBackend";
import type { Project } from "@/types";
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Lock,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CloseoutItem {
  id: string;
  label: string;
  description: string;
}

const CLOSEOUT_ITEMS: CloseoutItem[] = [
  {
    id: "permit",
    label: "Permit Obtained",
    description: "All regulatory permits secured and filed",
  },
  {
    id: "payments",
    label: "All Payments Done",
    description: "Contractor, vendor, and labour payments settled",
  },
  {
    id: "inspection",
    label: "Final Inspection Passed",
    description: "Quality and safety inspection completed",
  },
  {
    id: "documents",
    label: "Documents Submitted",
    description: "As-built drawings and completion reports filed",
  },
  {
    id: "handover",
    label: "Site Handed Over",
    description: "Physical handover to owner/dept completed",
  },
  {
    id: "snag",
    label: "Snag List Cleared",
    description: "All defects from punch list rectified",
  },
];

type CheckMap = Record<string, boolean>;

function buildDefaultChecks(projectId: string): CheckMap {
  // Simulate some projects being further along
  if (projectId === "p1") {
    return {
      permit: true,
      payments: true,
      inspection: true,
      documents: false,
      handover: false,
      snag: false,
    };
  }
  if (projectId === "p2") {
    return {
      permit: true,
      payments: false,
      inspection: false,
      documents: false,
      handover: false,
      snag: false,
    };
  }
  return Object.fromEntries(CLOSEOUT_ITEMS.map((i) => [i.id, false]));
}

function CloseoutCard({ project }: { project: Project }) {
  const [checks, setChecks] = useState<CheckMap>(
    buildDefaultChecks(project.id),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [closed, setClosed] = useState(project.status === "completed");

  const completed = Object.values(checks).filter(Boolean).length;
  const total = CLOSEOUT_ITEMS.length;
  const allDone = completed === total;
  const pct = Math.round((completed / total) * 100);

  function toggle(id: string) {
    if (closed) return;
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleClose() {
    setClosed(true);
    setConfirmOpen(false);
    toast.success(`Project "${project.name}" marked as closed`);
  }

  return (
    <div
      className={`bg-white border rounded-xl p-4 space-y-4 shadow-sm transition-all ${closed ? "border-green-300 bg-green-50/30" : "border-slate-200"}`}
      data-ocid={`authority.closeout.project.card.${project.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800">{project.name}</p>
            {closed && (
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs flex items-center gap-1">
                <Lock className="w-3 h-3" /> Closed
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{project.location}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-amber-600">{pct}%</p>
          <p className="text-xs text-slate-500">
            {completed}/{total} done
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${allDone ? "bg-green-500" : "bg-amber-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {CLOSEOUT_ITEMS.map((item, i) => {
          const done = checks[item.id] ?? false;
          return (
            <button
              key={item.id}
              type="button"
              disabled={closed}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                done
                  ? "bg-green-50 border-green-200"
                  : "bg-slate-50 border-slate-200 hover:border-amber-200 hover:bg-amber-50/30"
              } ${closed ? "opacity-75 cursor-default" : "cursor-pointer"}`}
              onClick={() => toggle(item.id)}
              data-ocid={`authority.closeout.item.${i + 1}`}
            >
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${done ? "text-green-800 line-through" : "text-slate-800"}`}
                >
                  {item.label}
                </p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action */}
      {!closed && (
        <Button
          size="sm"
          className={`w-full ${
            allDone
              ? "bg-green-600 hover:bg-green-700 text-white border-0"
              : "bg-white border border-slate-300 text-slate-500 cursor-not-allowed"
          }`}
          disabled={!allDone}
          onClick={() => setConfirmOpen(true)}
          data-ocid={`authority.closeout.close_button.${project.id}`}
        >
          <ClipboardCheck className="w-4 h-4 mr-2" />
          {allDone
            ? "Mark Project as Closed"
            : `Complete all ${total - completed} remaining items`}
        </Button>
      )}

      {closed && (
        <div className="flex items-center justify-center gap-2 text-green-700 text-sm font-medium py-1">
          <Lock className="w-4 h-4" />
          Project officially closed
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          className="bg-white border border-slate-200 max-w-sm"
          data-ocid="authority.closeout.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-slate-800 font-bold">
              Confirm Project Closeout
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to mark <strong>{project.name}</strong> as
            closed? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-300 text-slate-700"
              onClick={() => setConfirmOpen(false)}
              data-ocid="authority.closeout.cancel_button"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white border-0"
              onClick={handleClose}
              data-ocid="authority.closeout.confirm_button"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Confirm Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AuthorityCloseoutPage() {
  const { data: projects, isLoading } = useProjects();

  const activeProjects = (projects ?? []).filter(
    (p) =>
      p.status === "active" ||
      p.status === "planning" ||
      p.status === "completed",
  );

  return (
    <div
      className="p-4 lg:p-6 space-y-5 bg-slate-50 min-h-screen"
      data-ocid="authority.closeout.page"
    >
      <div>
        <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
          Project Closeout
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Verify completion checklist: permits, payments, inspections, handover
        </p>
      </div>

      {/* Legend */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-sm text-amber-800">
        <ClipboardCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
        <span>
          Complete all 6 checklist items to unlock the closeout button. Click
          each item to toggle its status.
        </span>
      </div>

      {isLoading ? (
        <div className="grid lg:grid-cols-2 gap-4">
          {["sk-1", "sk-2", "sk-3"].map((k) => (
            <Skeleton key={k} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : activeProjects.length === 0 ? (
        <div
          className="text-center py-16 text-slate-500"
          data-ocid="authority.closeout.empty_state"
        >
          No active projects to close out.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {activeProjects.map((p) => (
            <CloseoutCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
