import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useIssues, useProjects, useTasks } from "@/hooks/useBackend";
import { DEMO_USERS } from "@/lib/mockData";
import type { Project, ProjectStatus } from "@/types";
import {
  Calendar,
  MapPin,
  Plus,
  Search,
  Star,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type FilterStatus = "all" | ProjectStatus;

const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  planning: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  onHold: "bg-orange-100 text-orange-700 border-orange-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

// Hardcoded contractor details with past performance data
const CONTRACTOR_DATA = [
  {
    id: "c1",
    name: "Vikram Patel Construction",
    specialization: "Road & Highway",
    pastProjects: 12,
    completionRate: 94,
    avgDaysOverdue: 3,
    budgetAdherence: 97,
    rating: 4.8,
    contact: "+91-98100 04001",
    experience: "15 years",
    projectsBudgetRange: "₹5Cr–₹80Cr",
  },
  {
    id: "c2",
    name: "Ravi Infrastructure Ltd.",
    specialization: "Bridge & Structural",
    pastProjects: 9,
    completionRate: 89,
    avgDaysOverdue: 8,
    budgetAdherence: 92,
    rating: 4.5,
    contact: "+91-98100 04002",
    experience: "12 years",
    projectsBudgetRange: "₹10Cr–₹120Cr",
  },
  {
    id: "c3",
    name: "Suresh Civil Works",
    specialization: "Commercial Buildings",
    pastProjects: 7,
    completionRate: 86,
    avgDaysOverdue: 12,
    budgetAdherence: 90,
    rating: 4.2,
    contact: "+91-98100 04003",
    experience: "8 years",
    projectsBudgetRange: "₹2Cr–₹40Cr",
  },
  {
    id: "c4",
    name: "Aryan Projects Pvt. Ltd.",
    specialization: "Government Infrastructure",
    pastProjects: 15,
    completionRate: 96,
    avgDaysOverdue: 2,
    budgetAdherence: 98,
    rating: 4.9,
    contact: "+91-98100 04004",
    experience: "18 years",
    projectsBudgetRange: "₹20Cr–₹200Cr",
  },
];

const MANAGER_DATA = [
  {
    id: "u2",
    name: "Priya Sharma",
    completedProjects: 8,
    onTimeRate: 93,
    score: 95,
  },
  {
    id: "m2",
    name: "Deepak Verma",
    completedProjects: 6,
    onTimeRate: 87,
    score: 88,
  },
  {
    id: "m3",
    name: "Anjali Nair",
    completedProjects: 5,
    onTimeRate: 91,
    score: 90,
  },
];

function ContractorSuggestionCard({
  contractor,
  rank,
  onSelect,
  selected,
}: {
  contractor: (typeof CONTRACTOR_DATA)[0];
  rank: number;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      className={`w-full text-left p-3 rounded-xl border transition-all ${selected ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30"}`}
      onClick={onSelect}
      data-ocid={`authority.addproject.contractor.${rank}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${rank === 1 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
        >
          {rank === 1 ? <Trophy className="w-3.5 h-3.5" /> : rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800">
              {contractor.name}
            </p>
            {rank === 1 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                Recommended
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {contractor.specialization} · {contractor.experience}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-0.5 text-xs text-amber-600">
              <Star className="w-3 h-3 fill-amber-400" />
              {contractor.rating}
            </span>
            <span className="text-xs text-slate-500">
              {contractor.completionRate}% on time
            </span>
            <span className="text-xs text-slate-500">
              {contractor.pastProjects} projects
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function AddProjectModal({ onClose }: { onClose: () => void }) {
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedContractor, setSelectedContractor] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [loading, setLoading] = useState(false);

  const budgetNum = Number.parseFloat(budget) || 0;
  const suggestedContractors = useMemo(() => {
    return [...CONTRACTOR_DATA].sort((a, b) => b.rating - a.rating);
  }, []);

  const suggestedManager = MANAGER_DATA.reduce(
    (best, m) => (m.score > best.score ? m : best),
    MANAGER_DATA[0],
  );

  function handleSubmit() {
    if (
      !projectName ||
      !location ||
      !budget ||
      !selectedContractor ||
      !selectedManager
    ) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Project "${projectName}" created successfully`);
      onClose();
    }, 800);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-white border border-slate-200 max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="authority.addproject.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-bold">
            Add New Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* Project details */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Project Name
              </Label>
              <Input
                className="bg-white border-slate-300 focus:border-amber-400"
                placeholder="e.g. NH-52 Road Widening"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                data-ocid="authority.addproject.name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Location
              </Label>
              <Input
                className="bg-white border-slate-300 focus:border-amber-400"
                placeholder="e.g. Pune-Nashik Corridor"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                data-ocid="authority.addproject.location_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Budget (₹ Crores)
              </Label>
              <Input
                type="number"
                className="bg-white border-slate-300 focus:border-amber-400"
                placeholder="e.g. 45"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                data-ocid="authority.addproject.budget_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Deadline
              </Label>
              <Input
                type="date"
                className="bg-white border-slate-300 focus:border-amber-400"
                data-ocid="authority.addproject.deadline_input"
              />
            </div>
          </div>

          {/* Manager suggestion */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-slate-700">
                Assign Project Manager
              </Label>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                Suggested: {suggestedManager.name}
              </Badge>
            </div>
            <Select value={selectedManager} onValueChange={setSelectedManager}>
              <SelectTrigger
                className="bg-white border-slate-300 text-slate-700"
                data-ocid="authority.addproject.manager_select"
              >
                <SelectValue placeholder="Select a project manager..." />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                {MANAGER_DATA.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span>{m.name}</span>
                      <span className="text-xs text-slate-400">
                        ({m.onTimeRate}% on time · {m.completedProjects}{" "}
                        projects)
                      </span>
                      {m.id === suggestedManager.id && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                          Best
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contractor suggestions */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">
              Assign Contractor
              {budgetNum > 0 && (
                <span className="ml-2 text-amber-600 font-normal">
                  — Suggestions based on ₹{budgetNum}Cr budget and past
                  performance
                </span>
              )}
            </Label>
            <div className="space-y-2">
              {suggestedContractors.map((c, i) => (
                <ContractorSuggestionCard
                  key={c.id}
                  contractor={c}
                  rank={i + 1}
                  selected={selectedContractor === c.id}
                  onSelect={() => setSelectedContractor(c.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white border-slate-300 text-slate-700"
            onClick={onClose}
            data-ocid="authority.addproject.cancel_button"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white border-0"
            onClick={handleSubmit}
            disabled={loading}
            data-ocid="authority.addproject.submit_button"
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProjectCard({
  project,
}: {
  project: Project;
}) {
  const pct = project.progress;
  const manager = DEMO_USERS.find(
    (u) => project.teamMembers.includes(u.id) && u.role === "projectManager",
  );
  // Assign a contractor from our data based on project id
  const contractorIdx = ["p1", "p2", "p3"].indexOf(project.id);
  const contractor = CONTRACTOR_DATA[contractorIdx >= 0 ? contractorIdx : 0];

  return (
    <Link
      to="/projects/$id"
      params={{ id: project.id }}
      className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3 text-left w-full hover:border-amber-300 hover:shadow-md transition-all duration-200 block"
      data-ocid={`authority.project.card.${project.id}`}
    >
      <div className="flex items-start gap-3 justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800 leading-snug">
            {project.name}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <p className="text-xs text-slate-500 truncate">
              {project.location}
            </p>
          </div>
        </div>
        <Badge
          className={`text-xs capitalize flex-shrink-0 ${STATUS_COLORS[project.status]}`}
        >
          {project.status}
        </Badge>
      </div>

      {/* Contractor info */}
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5">
        <p className="text-[10px] text-amber-600 font-medium uppercase tracking-wide mb-1">
          Assigned Contractor
        </p>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {contractor.name}
            </p>
            <p className="text-[10px] text-slate-500">
              {contractor.specialization} · {contractor.experience}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-amber-700">
              {contractor.rating}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
          <span>{contractor.pastProjects} past projects</span>
          <span>{contractor.completionRate}% on-time</span>
          <span>{contractor.budgetAdherence}% budget adherence</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <span className="text-slate-500">Budget</span>
          <p className="font-medium text-slate-800">
            ₹{(project.budget / 10000000).toFixed(1)}Cr
          </p>
        </div>
        <div>
          <span className="text-slate-500">Spent</span>
          <p className="font-medium text-amber-600">
            ₹{(project.actualCost / 10000000).toFixed(1)}Cr
          </p>
        </div>
        <div>
          <span className="text-slate-500">Manager</span>
          <p className="font-medium text-slate-800 truncate">
            {manager?.name ?? "—"}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Team</span>
          <p className="font-medium text-slate-800 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {project.teamMembers.length}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span className="font-medium text-slate-700">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {project.startDate}
        </span>
        <span>→ {project.endDate}</span>
      </div>
    </Link>
  );
}

// Multi-step transition: ProjectDetailModal removed in favor of full-page navigation.

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Planning", value: "planning" },
  { label: "Completed", value: "completed" },
];

export default function AuthorityProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    return (projects ?? []).filter((p) => {
      const matchStatus = filter === "all" || p.status === filter;
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [projects, filter, search]);

  return (
    <div
      className="p-4 lg:p-6 space-y-5 bg-slate-50 min-h-screen"
      data-ocid="authority.projects.page"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
            Projects
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor all government construction projects and assign contractors
          </p>
        </div>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white border-0 flex-shrink-0"
          onClick={() => setAddOpen(true)}
          data-ocid="authority.projects.add_button"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Project
        </Button>
      </div>

      {/* Filters & search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="authority.projects.search_input"
          />
          {search && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setSearch("")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              className={
                filter === f.value
                  ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
              }
              onClick={() => setFilter(f.value)}
              data-ocid={`authority.projects.filter.${f.value}`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Project grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {["sk-p-1", "sk-p-2", "sk-p-3"].map((k) => (
            <Skeleton key={k} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 text-slate-500"
          data-ocid="authority.projects.empty_state"
        >
          No projects found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}


      {addOpen && <AddProjectModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}
