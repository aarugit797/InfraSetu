import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_PROJECTS, DEMO_USERS, WORKER_PROFILES } from "@/lib/mockData";
import { Phone, Search, Users } from "lucide-react";
import { useState } from "react";

const workerCount = (projectId: string) =>
  WORKER_PROFILES.filter((w) => w.projectIds.includes(projectId)).length;

export default function ManagerWorkforcePage() {
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");

  const contractors = DEMO_USERS.filter((u) => u.role === "contractor");
  const workers = DEMO_USERS.filter((u) => u.role === "worker");

  const filteredContractors = contractors.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // Build contractor-per-project assignments
  const contractorAssignments = ALL_PROJECTS.filter(
    (p) => filterProject === "all" || p.id === filterProject,
  ).map((p) => {
    const assigned = contractors.filter((c) => p.teamMembers?.includes(c.id));
    const wCount = workerCount(p.id);
    return { project: p, assigned, wCount };
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 bg-muted/20 min-h-screen">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full" />
          <h1 className="text-2xl font-bold text-foreground">Workforce</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-4">
          {contractors.length} contractors · {workers.length} workers across all
          projects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contractors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-input focus:border-primary focus:ring-primary/20 bg-card"
            data-ocid="workforce.search_input"
          />
        </div>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger
            className="w-48 border-input bg-card focus:ring-primary/20"
            data-ocid="workforce.filter.tab"
          >
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {ALL_PROJECTS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Per-project contractor listing */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Contractors per Project
        </h2>
        {contractorAssignments.map((item, idx) => (
          <div
            key={item.project.id}
            className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
            data-ocid={`workforce.item.${idx + 1}`}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-100">
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  {item.project.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {item.project.location}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-800 border-0 text-xs hover:bg-amber-100">
                  {item.project.status}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background border border-border rounded-lg px-2 py-1">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium text-foreground">
                    {item.wCount}
                  </span>{" "}
                  workers
                </div>
              </div>
            </div>
            {item.assigned.length === 0 ? (
              <div
                className="px-4 py-6 text-center text-muted-foreground text-sm"
                data-ocid={`workforce.item.${idx + 1}.empty_state`}
              >
                No contractors assigned to this project
              </div>
            ) : (
              <div className="divide-y divide-border">
                {item.assigned.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {c.name}
                        </p>
                        {c.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {c.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-0 text-xs hover:bg-amber-100">
                      Contractor
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Worker directory by contractor */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Workers on Site ({WORKER_PROFILES.length} total)
        </h2>
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                {["Worker", "Trade", "Phone", "Project", "Rate/Day", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WORKER_PROFILES.filter((w) =>
                filterProject === "all" || w.projectIds.includes(filterProject)
              ).map((w, idx) => (
                <tr key={w.id} className="border-t border-border hover:bg-amber-50/30 transition-colors" data-ocid={`workforce.worker_row.${idx + 1}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                        {w.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{w.name}</p>
                        <p className="text-[10px] text-muted-foreground">{w.aadhaarId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{w.trade}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{w.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {w.projectIds.map((pid) => (
                        <span key={pid} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">
                          {ALL_PROJECTS.find((p) => p.id === pid)?.name.split(" ").slice(0, 2).join(" ") ?? pid}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">₹{w.ratePerDay}/day</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      w.status === "active" ? "bg-emerald-100 text-emerald-700" :
                      w.status === "onLeave" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {w.status === "onLeave" ? "On Leave" : w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contractor directory */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Contractor Directory
        </h2>
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                {[
                  "Contractor",
                  "Phone",
                  "Projects Assigned",
                  "Workers Under",
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
              {filteredContractors.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground text-sm"
                    data-ocid="workforce.empty_state"
                  >
                    No contractors found
                  </td>
                </tr>
              ) : (
                filteredContractors.map((c, idx) => {
                  const assignedProjects = ALL_PROJECTS.filter((p) =>
                    p.teamMembers?.includes(c.id),
                  );
                  const totalWorkers = assignedProjects.reduce(
                    (sum, p) => sum + workerCount(p.id),
                    0,
                  );
                  return (
                    <tr
                      key={c.id}
                      className="border-t border-border hover:bg-amber-50/30 transition-colors"
                      data-ocid={`workforce.row.${idx + 1}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
                            {c.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <span className="font-medium text-foreground">
                            {c.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {c.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {assignedProjects.length}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {totalWorkers}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
