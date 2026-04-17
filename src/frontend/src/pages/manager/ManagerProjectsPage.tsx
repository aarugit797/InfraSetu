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
import { ALL_PROJECTS, DEMO_USERS, TASKS } from "@/lib/mockData";
import type { Project, ProjectStatus } from "@/types";
import {
  ChevronRight,
  ClipboardList,
  Grid3X3,
  List,
  Plus,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

const statusBadge: Record<ProjectStatus, string> = {
  planning: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  onHold: "bg-orange-100 text-orange-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};
const statusLabel: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  onHold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

const contractors = DEMO_USERS.filter((u) => u.role === "contractor");

export default function ManagerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(ALL_PROJECTS);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showModal, setShowModal] = useState(false);
  const [showTasksFor, setShowTasksFor] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    contractor: "",
  });

  function handleCreate() {
    if (!form.name) return;
    const newP: Project = {
      id: `p${Date.now()}`,
      name: form.name,
      location: "New Site",
      status: "planning",
      budget: Number(form.budget) || 0,
      actualCost: 0,
      progress: 0,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description,
      teamMembers: form.contractor ? [form.contractor] : [],
      createdBy: "u2",
      createdAt: Date.now(),
    };
    setProjects((prev) => [newP, ...prev]);
    setShowModal(false);
    setForm({
      name: "",
      description: "",
      budget: "",
      startDate: "",
      endDate: "",
      contractor: "",
    });
  }

  function cycleStatus(id: string) {
    const cycle: ProjectStatus[] = [
      "planning",
      "active",
      "onHold",
      "completed",
    ];
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const idx = cycle.indexOf(p.status);
        return { ...p, status: cycle[(idx + 1) % cycle.length] };
      }),
    );
  }

  return (
    <>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 bg-muted/20 min-h-screen">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full" />
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-4">
              {projects.length} assigned projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-amber-100 text-amber-600" : "text-muted-foreground hover:text-foreground"}`}
              data-ocid="projects.grid_toggle"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-amber-100 text-amber-600" : "text-muted-foreground hover:text-foreground"}`}
              data-ocid="projects.list_toggle"
            >
              <List className="w-4 h-4" />
            </button>
            <Button
              onClick={() => setShowModal(true)}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="projects.add_button"
            >
              <Plus className="w-4 h-4 mr-1" /> New Project
            </Button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, idx) => {
              const assignedContractor = contractors.find((c) =>
                p.teamMembers?.includes(c.id),
              );
              return (
                <Link
                  key={p.id}
                  to="/projects/$id"
                  params={{ id: p.id }}
                  className="bg-card border border-border shadow-sm rounded-xl p-4 space-y-3 hover:shadow-md hover:border-primary/40 transition-all block group"
                  data-ocid={`projects.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => cycleStatus(p.id)}
                      data-ocid={`projects.edit_button.${idx + 1}`}
                    >
                      <Badge
                        className={`text-xs cursor-pointer border-0 ${statusBadge[p.status]} hover:opacity-80`}
                      >
                        {statusLabel[p.status]}
                      </Badge>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span className="font-medium text-foreground">
                        {p.progress}%
                      </span>
                    </div>
                    <ProgressBar value={p.progress} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Contractor:{" "}
                      <span className="text-foreground font-medium">
                        {assignedContractor?.name ?? "Unassigned"}
                      </span>
                    </span>
                    <span className="text-muted-foreground">→ {p.endDate}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs border-border text-foreground hover:bg-amber-50"
                      onClick={() =>
                        setShowTasksFor(showTasksFor === p.id ? null : p.id)
                      }
                      data-ocid={`projects.tasks_button.${idx + 1}`}
                    >
                      <ClipboardList className="w-3 h-3 mr-1" />
                      {showTasksFor === p.id ? "Hide Tasks" : "View Tasks"}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => setShowTasksFor(p.id)}
                      data-ocid={`projects.breakdown_button.${idx + 1}`}
                    >
                      <ChevronRight className="w-3 h-3 mr-1" />
                      Break into Tasks
                    </Button>
                  </div>
                  {showTasksFor === p.id && (
                    <div className="bg-muted/30 rounded-lg p-3 text-xs space-y-1">
                      <p className="font-medium text-foreground mb-2">
                        Tasks for {p.name} ({TASKS.filter((t) => t.projectId === p.id).length} total)
                      </p>
                      {TASKS.filter((t) => t.projectId === p.id).length === 0 ? (
                        <p className="text-muted-foreground">No tasks assigned yet</p>
                      ) : (
                        TASKS.filter((t) => t.projectId === p.id).map((task) => (
                          <div key={task.id} className="flex items-center justify-between gap-2 py-0.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                task.status === "completed" ? "bg-emerald-500" :
                                task.status === "inProgress" ? "bg-amber-500 animate-pulse" :
                                "bg-muted-foreground"
                              }`} />
                              <span className="text-foreground font-medium truncate max-w-[180px]">{task.title}</span>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${
                              task.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                              task.status === "inProgress" ? "bg-amber-100 text-amber-700" :
                              task.priority === "critical" ? "bg-red-100 text-red-700" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {task.status === "inProgress" ? "In Progress" :
                               task.status === "completed" ? "Done" :
                               task.priority === "critical" ? "Critical" : "Pending"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {[
                    "Project",
                    "Status",
                    "Contractor",
                    "Progress",
                    "Deadline",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p, idx) => {
                  const assignedContractor = contractors.find((c) =>
                    p.teamMembers?.includes(c.id),
                  );
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-border hover:bg-amber-50/30 transition-colors cursor-pointer group"
                      onClick={() => (window.location.href = `/projects/${p.id}`)}
                      data-ocid={`projects.row.${idx + 1}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {p.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {p.location}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => cycleStatus(p.id)}>
                          <Badge
                            className={`text-xs cursor-pointer border-0 ${statusBadge[p.status]} hover:opacity-80`}
                          >
                            {statusLabel[p.status]}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        {assignedContractor?.name ?? "Unassigned"}
                      </td>
                      <td className="px-4 py-3 w-32">
                        <div className="text-xs text-muted-foreground mb-1">
                          {p.progress}%
                        </div>
                        <ProgressBar value={p.progress} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {p.endDate}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-border"
                          >
                            <ClipboardList className="w-3 h-3 mr-1" /> Tasks
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          data-ocid="projects.dialog"
        >
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-foreground">New Project</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
                data-ocid="projects.close_button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Project Name *
                </Label>
                <Input
                  placeholder="e.g. NH-48 Extension Phase 3"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                  data-ocid="projects.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Description
                </Label>
                <Input
                  placeholder="Brief description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Budget (₹)
                  </Label>
                  <Input
                    type="number"
                    placeholder="50000000"
                    value={form.budget}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, budget: e.target.value }))
                    }
                    className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Assign Contractor
                  </Label>
                  <Select
                    value={form.contractor}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, contractor: v }))
                    }
                  >
                    <SelectTrigger className="mt-1 border-input focus:ring-primary/20">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractors.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Start Date
                  </Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startDate: e.target.value }))
                    }
                    className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    End Date
                  </Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                    className="mt-1 border-input focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
                className="border-border text-foreground hover:bg-muted"
                data-ocid="projects.cancel_button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-ocid="projects.submit_button"
              >
                Create Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
