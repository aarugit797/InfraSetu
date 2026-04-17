import { Layout } from "@/components/Layout";
import { Modal } from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
import { useAuth } from "@/hooks/useAuth";
import { DEMO_USERS, PROJECTS } from "@/lib/mockData";
import {
  cn,
  formatCurrency,
  formatDate,
  generateId,
  getProgressColor,
  getStatusColor,
} from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  Filter,
  IndianRupee,
  MapPin,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  onHold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

function ProjectCard({
  project,
  onClick,
}: { project: Project; onClick: () => void }) {
  const statusColor = getStatusColor(project.status);
  const progressColor = getProgressColor(project.progress);
  const teamUsers = DEMO_USERS.filter((u) =>
    project.teamMembers.includes(u.id),
  ).slice(0, 4);
  const extraCount = project.teamMembers.length - 4;

  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid="project-card"
      className="glass rounded-2xl p-5 flex flex-col gap-4 cursor-pointer hover:border-primary/40 hover:bg-card/60 transition-smooth group text-left w-full"
    >
      {/* Title + Status */}
      <div className="flex items-start gap-3 justify-between">
        <h3 className="font-display font-semibold text-foreground text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {project.name}
        </h3>
        <StatusBadge
          label={STATUS_LABELS[project.status]}
          colorClasses={statusColor}
          size="sm"
          className="flex-shrink-0"
        />
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{project.location}</span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Progress</span>
          <span className="text-foreground font-semibold">
            {project.progress}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", progressColor)}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Budget row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-sm rounded-xl p-2.5">
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-0.5">
            <IndianRupee className="w-3 h-3" />
            <span>Budget</span>
          </div>
          <p className="text-foreground text-sm font-semibold">
            {formatCurrency(project.budget)}
          </p>
        </div>
        <div className="glass-sm rounded-xl p-2.5">
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>Actual</span>
          </div>
          <p
            className={cn(
              "text-sm font-semibold",
              project.actualCost > project.budget
                ? "text-red-400"
                : "text-emerald-400",
            )}
          >
            {formatCurrency(project.actualCost)}
          </p>
        </div>
      </div>

      {/* Footer: team + dates */}
      <div className="flex items-center justify-between pt-1 border-t border-border/30">
        {/* Team avatars */}
        <div className="flex items-center">
          {teamUsers.map((u, i) => (
            <div
              key={u.id}
              className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center -ml-2 first:ml-0 flex-shrink-0"
              style={{ zIndex: teamUsers.length - i }}
              title={u.name}
            >
              <span className="text-primary text-xs font-bold">
                {u.name.charAt(0)}
              </span>
            </div>
          ))}
          {extraCount > 0 && (
            <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center -ml-2 flex-shrink-0">
              <span className="text-muted-foreground text-xs font-bold">
                +{extraCount}
              </span>
            </div>
          )}
        </div>
        {/* Dates */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>
            {formatDate(project.startDate)} → {formatDate(project.endDate)}
          </span>
        </div>
      </div>
    </button>
  );
}

interface CreateProjectForm {
  name: string;
  location: string;
  budget: string;
  startDate: string;
  endDate: string;
  description: string;
  status: ProjectStatus;
}

const INITIAL_FORM: CreateProjectForm = {
  name: "",
  location: "",
  budget: "",
  startDate: "",
  endDate: "",
  description: "",
  status: "planning",
};

export default function ProjectsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateProjectForm>(INITIAL_FORM);
  const [loading] = useState(false);

  const canCreate =
    currentUser?.role === "projectManager" ||
    currentUser?.role === "governmentAuthority";

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.location || !form.budget) {
      toast.error("Please fill all required fields");
      return;
    }
    const newProject: Project = {
      id: generateId("p"),
      name: form.name,
      location: form.location,
      budget: Number.parseFloat(form.budget),
      actualCost: 0,
      progress: 0,
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description,
      teamMembers: currentUser ? [currentUser.id] : [],
      createdBy: currentUser?.id ?? "u1",
      createdAt: Date.now(),
    };
    setProjects((prev) => [newProject, ...prev]);
    setModalOpen(false);
    setForm(INITIAL_FORM);
    toast.success("Project created successfully!");
  }

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-foreground text-2xl">
              Projects
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
          {canCreate && (
            <Button
              onClick={() => setModalOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90"
              data-ocid="create-project-btn"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Project</span>
            </Button>
          )}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card/40 border-border/50"
              data-ocid="project-search"
            />
          </div>
          <div className="flex items-center gap-2 sm:w-auto w-full">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ProjectStatus | "all")}
            >
              <SelectTrigger
                className="bg-card/40 border-border/50 sm:w-44 w-full"
                data-ocid="project-status-filter"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
            data-ocid="projects-empty"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-foreground font-semibold">No projects found</p>
              <p className="text-muted-foreground text-sm mt-1">
                Try adjusting your search or filter
              </p>
            </div>
            {canCreate && (
              <Button
                onClick={() => setModalOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="w-4 h-4" /> Create New Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() =>
                  navigate({ to: "/projects/$id", params: { id: p.id } })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Ring Road Phase 3"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                data-ocid="create-project-name"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="City, District"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  className="pl-9"
                  required
                  data-ocid="create-project-location"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget (₹) *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g. 50000000"
                  value={form.budget}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, budget: e.target.value }))
                  }
                  className="pl-9"
                  required
                  min="0"
                  data-ocid="create-project-budget"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as ProjectStatus }))
                }
              >
                <SelectTrigger id="status" data-ocid="create-project-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                data-ocid="create-project-start"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
                data-ocid="create-project-end"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Brief project description..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                data-ocid="create-project-description"
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              data-ocid="create-project-submit"
            >
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
