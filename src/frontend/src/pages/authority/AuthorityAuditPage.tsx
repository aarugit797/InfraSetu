import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/hooks/useBackend";
import type { AuditLog, UserRole } from "@/types";
import { Download, Eye, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const ROLE_COLORS: Record<UserRole, string> = {
  governmentAuthority: "bg-amber-100 text-amber-700 border-amber-200",
  projectManager: "bg-blue-100 text-blue-700 border-blue-200",
  siteEngineer: "bg-sky-100 text-sky-700 border-sky-200",
  contractor: "bg-orange-100 text-orange-700 border-orange-200",
  worker: "bg-slate-100 text-slate-600 border-slate-200",
  auditor: "bg-purple-100 text-purple-700 border-purple-200",
  community: "bg-green-100 text-green-700 border-green-200",
  public: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const ROLE_LABELS: Record<UserRole, string> = {
  governmentAuthority: "Authority",
  projectManager: "Manager",
  siteEngineer: "Engineer",
  contractor: "Contractor",
  worker: "Worker",
  auditor: "Auditor",
  community: "Community",
  public: "Public",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  APPROVE: "bg-emerald-100 text-emerald-700",
  REJECT: "bg-red-100 text-red-700",
  UPDATE: "bg-blue-100 text-blue-700",
  SUBMIT: "bg-amber-100 text-amber-700",
  REPORT: "bg-orange-100 text-orange-700",
  VIEW: "bg-slate-100 text-slate-600",
  ASSIGN: "bg-purple-100 text-purple-700",
  CHECKIN: "bg-cyan-100 text-cyan-700",
  ESCALATE: "bg-red-100 text-red-800",
  VERIFY: "bg-teal-100 text-teal-700",
  REVIEW: "bg-indigo-100 text-indigo-700",
  UPLOAD: "bg-sky-100 text-sky-700",
};

const ALL_ACTIONS = [
  "ALL",
  "CREATE",
  "APPROVE",
  "REJECT",
  "UPDATE",
  "SUBMIT",
  "REPORT",
  "ASSIGN",
  "ESCALATE",
  "VERIFY",
  "CHECKIN",
];
const ALL_ROLES = [
  "ALL",
  "governmentAuthority",
  "projectManager",
  "siteEngineer",
  "contractor",
  "worker",
  "auditor",
] as const;

function AuditDetailModal({
  log,
  onClose,
}: { log: AuditLog | null; onClose: () => void }) {
  if (!log) return null;
  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-white border border-slate-200 max-w-md"
        data-ocid="authority.audit.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-bold pr-6">
            Audit Log Detail
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex gap-2 flex-wrap">
            <Badge
              className={`text-xs ${ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-600"}`}
            >
              {log.action}
            </Badge>
            <Badge className={`text-xs ${ROLE_COLORS[log.userRole]}`}>
              {ROLE_LABELS[log.userRole]}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "User", v: log.userName },
              { l: "Entity", v: log.entity },
              { l: "Entity ID", v: log.entityId },
              {
                l: "Timestamp",
                v: new Date(log.timestamp).toLocaleString("en-IN"),
              },
            ].map((r) => (
              <div
                key={r.l}
                className="bg-slate-50 border border-slate-200 rounded-lg p-2.5"
              >
                <p className="text-xs text-slate-500">{r.l}</p>
                <p className="font-medium text-slate-800 mt-0.5 text-sm break-all">
                  {r.v}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Details</p>
            <p className="text-slate-700">{log.details}</p>
          </div>

          {log.ipAddress && (
            <p className="text-xs text-slate-500">IP: {log.ipAddress}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AuthorityAuditPage() {
  const { data: logs, isLoading } = useAuditLogs();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [detail, setDetail] = useState<AuditLog | null>(null);

  const filtered = useMemo(() => {
    return (logs ?? [])
      .filter((l) => {
        const matchSearch =
          !search ||
          l.details.toLowerCase().includes(search.toLowerCase()) ||
          l.userName.toLowerCase().includes(search.toLowerCase()) ||
          l.entity.toLowerCase().includes(search.toLowerCase());
        const matchAction = actionFilter === "ALL" || l.action === actionFilter;
        const matchRole = roleFilter === "ALL" || l.userRole === roleFilter;
        return matchSearch && matchAction && matchRole;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, search, actionFilter, roleFilter]);

  function handleExport() {
    toast.success("Audit log exported successfully (CSV download simulated)");
  }

  return (
    <div
      className="p-4 lg:p-6 space-y-5 bg-slate-50 min-h-screen"
      data-ocid="authority.audit.page"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-bold text-slate-800">
            Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Immutable activity and compliance records
          </p>
        </div>
        <Button
          size="sm"
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex-shrink-0"
          onClick={handleExport}
          data-ocid="authority.audit.export_button"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-amber-400"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="authority.audit.search_input"
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger
            className="w-40 bg-white border-slate-300 text-slate-700 text-sm"
            data-ocid="authority.audit.action_filter_select"
          >
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            {ALL_ACTIONS.map((a) => (
              <SelectItem key={a} value={a} className="text-sm text-slate-700">
                {a === "ALL" ? "All Actions" : a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger
            className="w-40 bg-white border-slate-300 text-slate-700 text-sm"
            data-ocid="authority.audit.role_filter_select"
          >
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            {ALL_ROLES.map((r) => (
              <SelectItem key={r} value={r} className="text-sm text-slate-700">
                {r === "ALL" ? "All Roles" : ROLE_LABELS[r as UserRole]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-medium text-slate-800">{filtered.length}</span>{" "}
        records
      </p>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[
            "sk-al-1",
            "sk-al-2",
            "sk-al-3",
            "sk-al-4",
            "sk-al-5",
            "sk-al-6",
          ].map((k) => (
            <Skeleton key={k} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 text-slate-500"
          data-ocid="authority.audit.empty_state"
        >
          No audit logs match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table
            className="w-full text-sm min-w-[720px]"
            data-ocid="authority.audit.table"
          >
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wide sticky top-0">
                <th className="text-left px-4 py-3">Timestamp</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Entity</th>
                <th className="text-left px-4 py-3 max-w-xs">Details</th>
                <th className="text-right px-4 py-3">View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, idx) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-100 hover:bg-amber-50/30 transition-colors"
                  data-ocid={`authority.audit.row.${idx + 1}`}
                >
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                    {new Date(log.timestamp).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`text-[10px] ${ROLE_COLORS[log.userRole]}`}
                    >
                      {ROLE_LABELS[log.userRole]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`text-[10px] ${ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {log.entity}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs">
                    <p className="truncate">{log.details}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      onClick={() => setDetail(log)}
                      data-ocid={`authority.audit.view_button.${idx + 1}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AuditDetailModal log={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
