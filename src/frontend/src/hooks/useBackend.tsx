import {
  APPROVALS,
  ATTENDANCE,
  ATTENDANCE_RECORDS,
  AUDIT_LOGS,
  BILLING_EXPENSES,
  BILLING_STATS,
  COMPLIANCE_STATS,
  CONSUMPTION_LOGS,
  DASHBOARD_STATS,
  DEMO_USERS,
  EXPENSES,
  INVOICES,
  ISSUES,
  MATERIALS,
  PROJECTS,
  PURCHASE_ORDERS,
  REQUIREMENTS,
  SITES,
  SITE_STATS,
  TASKS,
  TEST_REPORTS,
  TRANSFERS,
  TRIPS,
  TRIP_STATS,
  VENDORS,
} from "@/lib/mockData";
import { useQuery } from "@tanstack/react-query";

const STORAGE_KEY = "infrasetu_auth_token";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const fetchApi = async <T,>(url: string, fallbackData: T): Promise<T> => {
  try {
    const token = localStorage.getItem(STORAGE_KEY);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("API call failed");
    return await res.json() as T;
  } catch (error) {
    console.warn(`Falling back to mock data for ${url}`, error);
    return fallbackData; // Wait simulation removed to prioritize API
  }
};

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return fetchApi("/api/projects/projects/", PROJECTS);
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      return fetchApi(`/api/projects/projects/${id}/`, PROJECTS.find((p) => p.id === id) ?? null);
    },
    enabled: !!id,
  });
}

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: ["tasks", projectId ?? "all"],
    queryFn: async () => {
      const data = await fetchApi("/api/tasks/tasks/", TASKS);
      return projectId ? data.filter((t: any) => t.project === projectId || t.projectId === projectId) : data;
    },
  });
}

export function useIssues(projectId?: string) {
  return useQuery({
    queryKey: ["issues", projectId ?? "all"],
    queryFn: async () => {
      const data = await fetchApi("/api/projects/issues/", ISSUES);
      return projectId
        ? data.filter((i: any) => i.project === projectId || i.projectId === projectId)
        : data;
    },
  });
}

export function useMaterials(projectId?: string) {
  return useQuery({
    queryKey: ["materials", projectId ?? "all"],
    queryFn: async () => {
      const data = await fetchApi("/api/resources/list/", MATERIALS);
      return projectId
        ? data.filter((m: any) => m.project === projectId || m.projectId === projectId)
        : data;
    },
  });
}

export function useExpenses(projectId?: string) {
  return useQuery({
    queryKey: ["expenses", projectId ?? "all"],
    queryFn: async () => {
      await delay(500);
      return projectId
        ? EXPENSES.filter((e) => e.projectId === projectId)
        : EXPENSES;
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["auditLogs"],
    queryFn: async () => {
      await delay(700);
      return AUDIT_LOGS;
    },
  });
}

export function useAttendance(workerId?: string) {
  return useQuery({
    queryKey: ["attendance", workerId ?? "all"],
    queryFn: async () => {
      const data = await fetchApi("/api/workforce/attendance/", ATTENDANCE);
      return workerId
        ? data.filter((a: any) => a.workerId === workerId)
        : data;
    },
  });
}

export function useApprovals() {
  return useQuery({
    queryKey: ["approvals"],
    queryFn: async () => {
      await delay(500);
      return APPROVALS;
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      await delay(800);
      return DASHBOARD_STATS;
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      await delay(300);
      return DEMO_USERS;
    },
  });
}

// ─── New module hooks ─────────────────────────────────────────────────────────

export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      await delay(400);
      return SITES;
    },
  });
}

export function useSite(id: string) {
  return useQuery({
    queryKey: ["sites", id],
    queryFn: async () => {
      await delay(300);
      return SITES.find((s) => s.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useSiteStats(siteId?: string) {
  return useQuery({
    queryKey: ["siteStats", siteId ?? "all"],
    queryFn: async () => {
      await delay(400);
      return siteId
        ? (SITE_STATS.find((s) => s.siteId === siteId) ?? null)
        : SITE_STATS;
    },
  });
}

export function useAttendanceRecords(siteId?: string, userId?: string) {
  return useQuery({
    queryKey: ["attendanceRecords", siteId ?? "all", userId ?? "all"],
    queryFn: async () => {
      await delay(400);
      return ATTENDANCE_RECORDS.filter(
        (r) =>
          (!siteId || r.siteId === siteId) && (!userId || r.userId === userId),
      );
    },
  });
}

export function useVendors() {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      await delay(400);
      return VENDORS;
    },
  });
}

export function usePurchaseOrders(siteId?: string) {
  return useQuery({
    queryKey: ["purchaseOrders", siteId ?? "all"],
    queryFn: async () => {
      await delay(500);
      return siteId
        ? PURCHASE_ORDERS.filter((p) => p.siteId === siteId)
        : PURCHASE_ORDERS;
    },
  });
}

export function useConsumptionLogs(siteId?: string) {
  return useQuery({
    queryKey: ["consumptionLogs", siteId ?? "all"],
    queryFn: async () => {
      await delay(500);
      return siteId
        ? CONSUMPTION_LOGS.filter((c) => c.siteId === siteId)
        : CONSUMPTION_LOGS;
    },
  });
}

export function useTransfers(siteId?: string) {
  return useQuery({
    queryKey: ["transfers", siteId ?? "all"],
    queryFn: async () => {
      await delay(400);
      return siteId
        ? TRANSFERS.filter(
            (t) => t.fromSiteId === siteId || t.toSiteId === siteId,
          )
        : TRANSFERS;
    },
  });
}

export function useTrips(siteId?: string) {
  return useQuery({
    queryKey: ["trips", siteId ?? "all"],
    queryFn: async () => {
      const data = await fetchApi("/api/logistics/trips/", TRIPS);
      return siteId ? data.filter((t: any) => t.siteId === siteId) : data;
    },
  });
}

export function useTripStats(siteId?: string) {
  return useQuery({
    queryKey: ["tripStats", siteId ?? "all"],
    queryFn: async () => {
      await delay(300);
      return siteId === TRIP_STATS.siteId ? TRIP_STATS : null;
    },
  });
}

export function useRequirements(siteId?: string) {
  return useQuery({
    queryKey: ["requirements", siteId ?? "all"],
    queryFn: async () => {
      await delay(500);
      return siteId
        ? REQUIREMENTS.filter((r) => r.siteId === siteId)
        : REQUIREMENTS;
    },
  });
}

export function useInvoices(siteId?: string) {
  return useQuery({
    queryKey: ["invoices", siteId ?? "all"],
    queryFn: async () => {
      const data = await fetchApi("/api/finance/invoices/", INVOICES);
      return siteId ? data.filter((i: any) => i.siteId === siteId) : data;
    },
  });
}

export function useBillingExpenses(siteId?: string) {
  return useQuery({
    queryKey: ["billingExpenses", siteId ?? "all"],
    queryFn: async () => {
      await delay(400);
      return siteId
        ? BILLING_EXPENSES.filter((e) => e.siteId === siteId)
        : BILLING_EXPENSES;
    },
  });
}

export function useBillingStats() {
  return useQuery({
    queryKey: ["billingStats"],
    queryFn: async () => {
      await delay(400);
      return BILLING_STATS;
    },
  });
}

export function useTestReports(siteId?: string) {
  return useQuery({
    queryKey: ["testReports", siteId ?? "all"],
    queryFn: async () => {
      await delay(500);
      return siteId
        ? TEST_REPORTS.filter((t) => t.siteId === siteId)
        : TEST_REPORTS;
    },
  });
}

export function useComplianceStats() {
  return useQuery({
    queryKey: ["complianceStats"],
    queryFn: async () => {
      await delay(300);
      return COMPLIANCE_STATS;
    },
  });
}
