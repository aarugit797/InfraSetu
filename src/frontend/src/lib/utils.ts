import type {
  ExpenseStatus,
  IssuePriority,
  IssueStatus,
  MaterialStatus,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | number): string {
  const date =
    typeof dateStr === "number" ? new Date(dateStr) : new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

type StatusColorReturn = {
  bg: string;
  text: string;
  border: string;
  dot: string;
};

export function getStatusColor(
  status: ProjectStatus | TaskStatus | IssueStatus | string,
): StatusColorReturn {
  const map: Record<string, StatusColorReturn> = {
    active: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
    inProgress: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
    in_progress: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
    planning: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
    pending: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    completed: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    done: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    approved: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      dot: "bg-green-500",
    },
    resolved: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    open: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
    draft: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
    onHold: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
    blocked: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
    },
    overdue: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
    },
    escalated: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
      dot: "bg-orange-500",
    },
    critical: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
      dot: "bg-orange-500",
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      dot: "bg-red-500",
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      dot: "bg-red-500",
    },
    fail: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      dot: "bg-red-500",
    },
    paid: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    closed: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
    inactive: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
    fulfilled: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    delivered: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    pass: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    submitted: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
    approvedL1: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      dot: "bg-green-500",
    },
    approvedL2: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      dot: "bg-green-500",
    },
    inTransit: {
      bg: "bg-cyan-100",
      text: "text-cyan-800",
      border: "border-cyan-200",
      dot: "bg-cyan-500",
    },
    ordered: {
      bg: "bg-cyan-100",
      text: "text-cyan-800",
      border: "border-cyan-200",
      dot: "bg-cyan-500",
    },
    suspended: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
      dot: "bg-orange-500",
    },
    halfDay: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    leave: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
      dot: "bg-purple-500",
    },
    absent: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      dot: "bg-red-500",
    },
    present: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
  };
  return (
    map[status] ?? {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    }
  );
}

export function getPriorityColor(
  priority: TaskPriority | IssuePriority,
): StatusColorReturn {
  const map: Record<string, StatusColorReturn> = {
    critical: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      dot: "bg-red-500",
    },
    high: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      border: "border-orange-200",
      dot: "bg-orange-500",
    },
    major: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      border: "border-orange-200",
      dot: "bg-orange-500",
    },
    medium: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    moderate: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    low: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
    minor: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
  };
  return (
    map[priority] ?? {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    }
  );
}

export function getMaterialStatusColor(
  status: MaterialStatus,
): StatusColorReturn {
  const map: Record<MaterialStatus, StatusColorReturn> = {
    available: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    low: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    critical: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
      dot: "bg-orange-500",
    },
    outOfStock: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      dot: "bg-red-500",
    },
  };
  return map[status];
}

export function getRoleBadgeColor(role: UserRole): string {
  const map: Record<UserRole, string> = {
    governmentAuthority: "bg-amber-100 text-amber-800 border-amber-200",
    projectManager: "bg-blue-100 text-blue-800 border-blue-200",
    siteEngineer: "bg-teal-100 text-teal-800 border-teal-200",
    contractor: "bg-orange-100 text-orange-800 border-orange-200",
    worker: "bg-green-100 text-green-800 border-green-200",
    auditor: "bg-purple-100 text-purple-800 border-purple-200",
    community: "bg-green-100 text-green-800 border-green-200",
    public: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return map[role];
}

export function getRoleDisplayName(role: UserRole): string {
  const map: Record<UserRole, string> = {
    governmentAuthority: "Govt. Authority",
    projectManager: "Project Manager",
    siteEngineer: "Site Engineer",
    contractor: "Contractor",
    worker: "Worker",
    auditor: "Auditor",
    community: "Community",
    public: "Public",
  };
  return map[role];
}

export function getRoleDashboardPath(role: UserRole): string {
  const map: Record<UserRole, string> = {
    governmentAuthority: "/authority/dashboard",
    projectManager: "/manager/dashboard",
    siteEngineer: "/engineer/dashboard",
    contractor: "/contractor/dashboard",
    worker: "/worker/dashboard",
    auditor: "/auditor/dashboard",
    community: "/community/dashboard",
    public: "/public",
  };
  return map[role];
}

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export function getNavItemsForRole(role: UserRole): NavItem[] {
  const byRole: Record<UserRole, NavItem[]> = {
    governmentAuthority: [
      {
        path: "/authority/dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard",
      },
      { path: "/authority/projects", label: "Projects", icon: "FolderKanban" },
      {
        path: "/authority/approvals",
        label: "Approvals",
        icon: "ClipboardCheck",
      },
      {
        path: "/authority/compliance",
        label: "Compliance",
        icon: "ShieldCheck",
      },
      { path: "/authority/financial", label: "Financial", icon: "DollarSign" },
      {
        path: "/authority/payment-release",
        label: "Payments",
        icon: "DollarSign",
      },
      { path: "/authority/reports", label: "Reports", icon: "ClipboardList" },
      {
        path: "/authority/closeout",
        label: "Closeout",
        icon: "ClipboardCheck",
      },
      { path: "/authority/audit", label: "Audit Logs", icon: "ClipboardList" },
      {
        path: "/authority/public-complaints",
        label: "Public Complaints",
        icon: "MessageCircleWarning",
      },
      { path: "/authority/account", label: "Account", icon: "UserCircle" },
    ],
    projectManager: [
      {
        path: "/manager/dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard",
      },
      { path: "/manager/projects", label: "Projects", icon: "FolderKanban" },
      { path: "/manager/tasks", label: "Tasks", icon: "Kanban" },
      { path: "/manager/workforce", label: "Workforce", icon: "Users" },
      {
        path: "/manager/daily-reports",
        label: "Daily Reports",
        icon: "FileText",
      },
      {
        path: "/manager/weekly-report",
        label: "Weekly Report",
        icon: "Send",
      },
      { path: "/manager/account", label: "Account", icon: "UserCircle" },
    ],
    siteEngineer: [
      {
        path: "/engineer/dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard",
      },
      { path: "/engineer/tasks", label: "Tasks", icon: "Kanban" },
      { path: "/engineer/progress", label: "Progress Updates", icon: "Camera" },
      { path: "/engineer/weather", label: "Weather", icon: "Cloud" },
      { path: "/engineer/issues", label: "Issues", icon: "AlertTriangle" },
      {
        path: "/engineer/quality-check",
        label: "Quality",
        icon: "FlaskConical",
      },
      {
        path: "/engineer/daily-report",
        label: "Reports",
        icon: "ClipboardList",
      },
      { path: "/engineer/account", label: "Account", icon: "UserCircle" },
    ],
    contractor: [
      {
        path: "/contractor/dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard",
      },
      { path: "/contractor/tasks", label: "Tasks", icon: "Kanban" },
      {
        path: "/contractor/attendance",
        label: "Attendance",
        icon: "CalendarCheck",
      },
      {
        path: "/contractor/wage-approval",
        label: "Wage Approval",
        icon: "CreditCard",
      },
      {
        path: "/contractor/resources",
        label: "Resources",
        icon: "Package",
      },
      {
        path: "/contractor/equipment",
        label: "Equipment",
        icon: "Wrench",
      },
      { path: "/contractor/account", label: "Account", icon: "UserCircle" },
    ],
    worker: [
      { path: "/worker/dashboard", label: "Home", icon: "LayoutDashboard" },
      {
        path: "/worker/attendance",
        label: "Attendance",
        icon: "CalendarCheck",
      },
      { path: "/worker/tasks", label: "My Tasks", icon: "Kanban" },
      { path: "/worker/payment", label: "Payment", icon: "CreditCard" },
      {
        path: "/worker/complaint",
        label: "Complaint",
        icon: "MessageCircleWarning",
      },
      { path: "/worker/account", label: "Account", icon: "UserCircle" },
    ],
    auditor: [
      {
        path: "/auditor/dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard",
      },
      { path: "/auditor/audit", label: "Audit Logs", icon: "ClipboardList" },
      { path: "/auditor/financial", label: "Financial", icon: "BarChart3" },
      { path: "/auditor/fraud", label: "Fraud Detection", icon: "ShieldAlert" },
      { path: "/auditor/projects", label: "Projects", icon: "FolderKanban" },
      {
        path: "/auditor/approvals",
        label: "Approvals",
        icon: "ClipboardCheck",
      },
      { path: "/auditor/account", label: "Account", icon: "UserCircle" },
    ],
    community: [
      {
        path: "/community/dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard",
      },
      {
        path: "/community/weekly-progress",
        label: "Weekly Progress",
        icon: "ClipboardList",
      },
      {
        path: "/community/progress-approval",
        label: "Progress Approval",
        icon: "ClipboardCheck",
      },
      {
        path: "/community/finance",
        label: "Finance",
        icon: "DollarSign",
      },
      {
        path: "/community/upload-pictures",
        label: "Upload Pictures",
        icon: "Camera",
      },
      { path: "/community/account", label: "Account", icon: "UserCircle" },
    ],
    public: [
      { path: "/public", label: "Map", icon: "MapPin" },
      { path: "/public/progress", label: "Progress", icon: "BarChart3" },
      {
        path: "/public/complaints",
        label: "Complaints",
        icon: "MessageCircleWarning",
      },
      { path: "/public/about", label: "About", icon: "ShieldCheck" },
    ],
  };
  return byRole[role] ?? [];
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 50) return "bg-blue-500";
  if (progress >= 25) return "bg-amber-500";
  return "bg-red-500";
}
