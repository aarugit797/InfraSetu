import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/hooks/useAuth";
import { getRoleDashboardPath } from "@/lib/utils";
import AuditLogsPage from "@/pages/AuditLogsPage";
import DashboardPage from "@/pages/DashboardPage";
import FinancePage from "@/pages/FinancePage";
import IssuesPage from "@/pages/IssuesPage";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import MaterialsPage from "@/pages/MaterialsPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import ProjectsPage from "@/pages/ProjectsPage";
import SiteSelectionPage from "@/pages/SiteSelectionPage";
import TaskBoardPage from "@/pages/TaskBoardPage";
import WorkforcePage from "@/pages/WorkforcePage";
import AuditorAccountPage from "@/pages/auditor/AuditorAccountPage";
import AuditorApprovalsPage from "@/pages/auditor/AuditorApprovalsPage";
import AuditorAuditPage from "@/pages/auditor/AuditorAuditPage";
import AuditorDashboardPage from "@/pages/auditor/AuditorDashboardPage";
import AuditorFinancialPage from "@/pages/auditor/AuditorFinancialPage";
import AuditorFraudPage from "@/pages/auditor/AuditorFraudPage";
import AuditorProjectsPage from "@/pages/auditor/AuditorProjectsPage";
import AuthorityAccountPage from "@/pages/authority/AuthorityAccountPage";
import AuthorityApprovalsPage from "@/pages/authority/AuthorityApprovalsPage";
import AuthorityAuditPage from "@/pages/authority/AuthorityAuditPage";
import AuthorityCloseoutPage from "@/pages/authority/AuthorityCloseoutPage";
import AuthorityCompliancePage from "@/pages/authority/AuthorityCompliancePage";
import AuthorityDashboardPage from "@/pages/authority/AuthorityDashboardPage";
import AuthorityFinancialPage from "@/pages/authority/AuthorityFinancialPage";
import AuthorityPaymentReleasePage from "@/pages/authority/AuthorityPaymentReleasePage";
import AuthorityProjectsPage from "@/pages/authority/AuthorityProjectsPage";
import AuthorityPublicComplaintsPage from "@/pages/authority/AuthorityPublicComplaintsPage";
import AuthorityReportsPage from "@/pages/authority/AuthorityReportsPage";
import CommunityAccountPage from "@/pages/community/CommunityAccountPage";
import CommunityDashboardPage from "@/pages/community/CommunityDashboardPage";
import CommunityFinancePage from "@/pages/community/CommunityFinancePage";
import CommunityProgressApprovalPage from "@/pages/community/CommunityProgressApprovalPage";
import CommunityUploadPicturesPage from "@/pages/community/CommunityUploadPicturesPage";
import CommunityWeeklyProgressPage from "@/pages/community/CommunityWeeklyProgressPage";
import ContractorAccountPage from "@/pages/contractor/ContractorAccountPage";
import ContractorAttendancePage from "@/pages/contractor/ContractorAttendancePage";
import ContractorDashboardPage from "@/pages/contractor/ContractorDashboardPage";
import ContractorEquipmentPage from "@/pages/contractor/ContractorEquipmentPage";
import ContractorResourceAllocationPage from "@/pages/contractor/ContractorResourceAllocationPage";
import ContractorTasksPage from "@/pages/contractor/ContractorTasksPage";
import ContractorWageApprovalPage from "@/pages/contractor/ContractorWageApprovalPage";
import EngineerAccountPage from "@/pages/engineer/EngineerAccountPage";
import EngineerDailyReportPage from "@/pages/engineer/EngineerDailyReportPage";
import EngineerDashboardPage from "@/pages/engineer/EngineerDashboardPage";
import EngineerIssuesPage from "@/pages/engineer/EngineerIssuesPage";
import EngineerProgressPage from "@/pages/engineer/EngineerProgressPage";
import EngineerQualityCheckPage from "@/pages/engineer/EngineerQualityCheckPage";
import EngineerTasksPage from "@/pages/engineer/EngineerTasksPage";
import EngineerWeatherPage from "@/pages/engineer/EngineerWeatherPage";
import ManagerAccountPage from "@/pages/manager/ManagerAccountPage";
import ManagerDailyReportsPage from "@/pages/manager/ManagerDailyReportsPage";
import ManagerDashboardPage from "@/pages/manager/ManagerDashboardPage";
import ManagerProjectsPage from "@/pages/manager/ManagerProjectsPage";
import ManagerTasksPage from "@/pages/manager/ManagerTasksPage";
import ManagerWeeklyReportPage from "@/pages/manager/ManagerWeeklyReportPage";
import ManagerWorkforcePage from "@/pages/manager/ManagerWorkforcePage";
import PublicPage from "@/pages/public/PublicPage";
import WorkerAccountPage from "@/pages/worker/WorkerAccountPage";
import WorkerAttendancePage from "@/pages/worker/WorkerAttendancePage";
import WorkerComplaintPage from "@/pages/worker/WorkerComplaintPage";
import WorkerDashboardPage from "@/pages/worker/WorkerDashboardPage";
import WorkerPaymentPage from "@/pages/worker/WorkerPaymentPage";
import WorkerTasksPage from "@/pages/worker/WorkerTasksPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000 } },
});

// Root route
const rootRoute = createRootRoute({ component: Outlet });

// Guards
function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, selectedSiteId } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!selectedSiteId) return <Navigate to="/site-selection" />;
  return <Layout>{children}</Layout>;
}

function LoginGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, selectedSiteId } = useAuth();
  if (isAuthenticated && selectedSiteId) {
    // redirect to role dashboard handled by index
  }
  return <>{children}</>;
}

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <LandingPage />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <LoginGuard>
      <LoginPage />
    </LoginGuard>
  ),
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/landing",
  component: () => <LandingPage />,
});

const siteSelectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/site-selection",
  component: function SiteSelectionGuard() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <SiteSelectionPage />;
  },
});

// ─── Project routes ───────────────────────────────────

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  component: () => (
    <AuthGuard>
      <ProjectsPage />
    </AuthGuard>
  ),
});

const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$id",
  component: () => (
    <AuthGuard>
      <ProjectDetailPage />
    </AuthGuard>
  ),
});

const legacyTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tasks",
  component: () => (
    <AuthGuard>
      <TaskBoardPage />
    </AuthGuard>
  ),
});

const legacyIssuesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/issues",
  component: () => (
    <AuthGuard>
      <IssuesPage />
    </AuthGuard>
  ),
});

const legacyWorkforceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workforce",
  component: () => (
    <AuthGuard>
      <WorkforcePage />
    </AuthGuard>
  ),
});

const legacyMaterialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/materials",
  component: () => (
    <AuthGuard>
      <MaterialsPage />
    </AuthGuard>
  ),
});

const legacyFinanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/finance",
  component: () => (
    <AuthGuard>
      <FinancePage />
    </AuthGuard>
  ),
});

const legacyAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/audit",
  component: () => (
    <AuthGuard>
      <AuditLogsPage />
    </AuthGuard>
  ),
});

const legacyProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <AuthGuard>
      <PlaceholderPage
        title="Profile"
        subtitle="Manage your account settings"
      />
    </AuthGuard>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: function DashboardRedirect() {
    const { isAuthenticated, selectedSiteId, currentUser } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!selectedSiteId) return <Navigate to="/site-selection" />;
    if (currentUser)
      return <Navigate to={getRoleDashboardPath(currentUser.role)} />;
    return <Navigate to="/login" />;
  },
});

// ─── Authority routes ─────────────────────────────────────────────────────────

const authorityDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authority/dashboard",
  component: () => (
    <AuthGuard>
      <AuthorityDashboardPage />
    </AuthGuard>
  ),
});
const authorityProjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authority/projects",
  component: () => (
    <AuthGuard>
      <AuthorityProjectsPage />
    </AuthGuard>
  ),
});
const authorityApprovalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authority/approvals",
  component: () => (
    <AuthGuard>
      <AuthorityApprovalsPage />
    </AuthGuard>
  ),
});
const authorityAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authority/audit",
  component: () => (
    <AuthGuard>
      <AuthorityAuditPage />
    </AuthGuard>
  ),
});
const authorityAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authority/account",
  component: () => (
    <AuthGuard>
      <AuthorityAccountPage />
    </AuthGuard>
  ),
});
const authorityComplianceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authority/compliance",
  component: () => (
    <AuthGuard>
      <AuthorityCompliancePage />
    </AuthGuard>
  ),
});
const authorityFinancialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authority/financial",
  component: () => (
    <AuthGuard>
      <AuthorityFinancialPage />
    </AuthGuard>
  ),
});
const authorityCloseoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authority/closeout",
  component: () => (
    <AuthGuard>
      <AuthorityCloseoutPage />
    </AuthGuard>
  ),
});
const authorityPaymentReleaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authority/payment-release",
  component: () => (
    <AuthGuard>
      <AuthorityPaymentReleasePage />
    </AuthGuard>
  ),
});
const authorityReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authority/reports",
  component: () => (
    <AuthGuard>
      <AuthorityReportsPage />
    </AuthGuard>
  ),
});
const authorityPublicComplaintsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/authority/public-complaints",
  component: () => (
    <AuthGuard>
      <AuthorityPublicComplaintsPage />
    </AuthGuard>
  ),
});

// ─── Manager routes ───────────────────────────────────────────────────────────

const managerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager/dashboard",
  component: function ManagerDashboardRoute() {
    return (
      <AuthGuard>
        <ManagerDashboardPage />
      </AuthGuard>
    );
  },
});
const managerProjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager/projects",
  component: function ManagerProjectsRoute() {
    return (
      <AuthGuard>
        <ManagerProjectsPage />
      </AuthGuard>
    );
  },
});
const managerTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager/tasks",
  component: function ManagerTasksRoute() {
    return (
      <AuthGuard>
        <ManagerTasksPage />
      </AuthGuard>
    );
  },
});
const managerWorkforceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager/workforce",
  component: function ManagerWorkforceRoute() {
    return (
      <AuthGuard>
        <ManagerWorkforcePage />
      </AuthGuard>
    );
  },
});
const managerAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager/account",
  component: function ManagerAccountRoute() {
    return (
      <AuthGuard>
        <ManagerAccountPage />
      </AuthGuard>
    );
  },
});
const managerDailyReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager/daily-reports",
  component: function ManagerDailyReportsRoute() {
    return (
      <AuthGuard>
        <ManagerDailyReportsPage />
      </AuthGuard>
    );
  },
});
const managerWeeklyReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager/weekly-report",
  component: function ManagerWeeklyReportRoute() {
    return (
      <AuthGuard>
        <ManagerWeeklyReportPage />
      </AuthGuard>
    );
  },
});

// ─── Engineer routes ──────────────────────────────────────────────────────────

const engineerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/engineer/dashboard",
  component: function EngineerDashboardRoute() {
    return (
      <AuthGuard>
        <EngineerDashboardPage />
      </AuthGuard>
    );
  },
});
const engineerTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/engineer/tasks",
  component: function EngineerTasksRoute() {
    return (
      <AuthGuard>
        <EngineerTasksPage />
      </AuthGuard>
    );
  },
});
const engineerAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/engineer/account",
  component: function EngineerAccountRoute() {
    return (
      <AuthGuard>
        <EngineerAccountPage />
      </AuthGuard>
    );
  },
});
const engineerProgressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/engineer/progress",
  component: function EngineerProgressRoute() {
    return (
      <AuthGuard>
        <EngineerProgressPage />
      </AuthGuard>
    );
  },
});
const engineerWeatherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/engineer/weather",
  component: function EngineerWeatherRoute() {
    return (
      <AuthGuard>
        <EngineerWeatherPage />
      </AuthGuard>
    );
  },
});
const engineerIssuesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/engineer/issues",
  component: function EngineerIssuesRoute() {
    return (
      <AuthGuard>
        <EngineerIssuesPage />
      </AuthGuard>
    );
  },
});
const engineerQualityCheckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/engineer/quality-check",
  component: function EngineerQualityCheckRoute() {
    return (
      <AuthGuard>
        <EngineerQualityCheckPage />
      </AuthGuard>
    );
  },
});
const engineerDailyReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/engineer/daily-report",
  component: function EngineerDailyReportRoute() {
    return (
      <AuthGuard>
        <EngineerDailyReportPage />
      </AuthGuard>
    );
  },
});

// ─── Contractor routes ────────────────────────────────────────────────────────

const contractorDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contractor/dashboard",
  component: function ContractorDashboardRoute() {
    return (
      <AuthGuard>
        <ContractorDashboardPage />
      </AuthGuard>
    );
  },
});
const contractorTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contractor/tasks",
  component: function ContractorTasksRoute() {
    return (
      <AuthGuard>
        <ContractorTasksPage />
      </AuthGuard>
    );
  },
});
const contractorAttendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contractor/attendance",
  component: function ContractorAttendanceRoute() {
    return (
      <AuthGuard>
        <ContractorAttendancePage />
      </AuthGuard>
    );
  },
});
const contractorAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contractor/account",
  component: function ContractorAccountRoute() {
    return (
      <AuthGuard>
        <ContractorAccountPage />
      </AuthGuard>
    );
  },
});
const contractorWageApprovalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contractor/wage-approval",
  component: function ContractorWageApprovalRoute() {
    return (
      <AuthGuard>
        <ContractorWageApprovalPage />
      </AuthGuard>
    );
  },
});
const contractorResourceAllocationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contractor/resources",
  component: function ContractorResourceAllocationRoute() {
    return (
      <AuthGuard>
        <ContractorResourceAllocationPage />
      </AuthGuard>
    );
  },
});
const contractorEquipmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contractor/equipment",
  component: function ContractorEquipmentRoute() {
    return (
      <AuthGuard>
        <ContractorEquipmentPage />
      </AuthGuard>
    );
  },
});

// ─── Worker routes ────────────────────────────────────────────────────────────

const workerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker/dashboard",
  component: () => (
    <AuthGuard>
      <WorkerDashboardPage />
    </AuthGuard>
  ),
});
const workerAttendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker/attendance",
  component: () => (
    <AuthGuard>
      <WorkerAttendancePage />
    </AuthGuard>
  ),
});
const workerTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker/tasks",
  component: () => (
    <AuthGuard>
      <WorkerTasksPage />
    </AuthGuard>
  ),
});
const workerPaymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker/payment",
  component: () => (
    <AuthGuard>
      <WorkerPaymentPage />
    </AuthGuard>
  ),
});
const workerComplaintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker/complaint",
  component: () => (
    <AuthGuard>
      <WorkerComplaintPage />
    </AuthGuard>
  ),
});
const workerAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker/account",
  component: () => (
    <AuthGuard>
      <WorkerAccountPage />
    </AuthGuard>
  ),
});

// ─── Auditor routes ───────────────────────────────────────────────────────────

const auditorDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auditor/dashboard",
  component: () => (
    <AuthGuard>
      <AuditorDashboardPage />
    </AuthGuard>
  ),
});
const auditorAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auditor/audit",
  component: () => (
    <AuthGuard>
      <AuditorAuditPage />
    </AuthGuard>
  ),
});
const auditorProjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auditor/projects",
  component: () => (
    <AuthGuard>
      <AuditorProjectsPage />
    </AuthGuard>
  ),
});
const auditorApprovalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auditor/approvals",
  component: () => (
    <AuthGuard>
      <AuditorApprovalsPage />
    </AuthGuard>
  ),
});
const auditorAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auditor/account",
  component: () => (
    <AuthGuard>
      <AuditorAccountPage />
    </AuthGuard>
  ),
});
const auditorFinancialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auditor/financial",
  component: () => (
    <AuthGuard>
      <AuditorFinancialPage />
    </AuthGuard>
  ),
});
const auditorFraudRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auditor/fraud",
  component: () => (
    <AuthGuard>
      <AuditorFraudPage />
    </AuthGuard>
  ),
});

// ─── Community routes ─────────────────────────────────────────────────────────

const communityDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community/dashboard",
  component: () => (
    <AuthGuard>
      <CommunityDashboardPage />
    </AuthGuard>
  ),
});
const communityWeeklyProgressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community/weekly-progress",
  component: () => (
    <AuthGuard>
      <CommunityWeeklyProgressPage />
    </AuthGuard>
  ),
});
const communityProgressApprovalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community/progress-approval",
  component: () => (
    <AuthGuard>
      <CommunityProgressApprovalPage />
    </AuthGuard>
  ),
});
const communityFinanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community/finance",
  component: () => (
    <AuthGuard>
      <CommunityFinancePage />
    </AuthGuard>
  ),
});
const communityUploadPicturesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community/upload-pictures",
  component: () => (
    <AuthGuard>
      <CommunityUploadPicturesPage />
    </AuthGuard>
  ),
});
const communityAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community/account",
  component: () => (
    <AuthGuard>
      <CommunityAccountPage />
    </AuthGuard>
  ),
});

// ─── Public route (no auth required) ─────────────────────────────────────────

const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/public",
  component: () => <PublicPage />,
});

// ─── Route tree ───────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  landingRoute,
  siteSelectionRoute,
  dashboardRoute,
  // Authority
  authorityDashboardRoute,
  authorityProjectsRoute,
  authorityApprovalsRoute,
  authorityAuditRoute,
  authorityAccountRoute,
  authorityComplianceRoute,
  authorityFinancialRoute,
  authorityCloseoutRoute,
  authorityPaymentReleaseRoute,
  authorityReportsRoute,
  authorityPublicComplaintsRoute,
  // Manager
  managerDashboardRoute,
  managerProjectsRoute,
  managerTasksRoute,
  managerWorkforceRoute,
  managerAccountRoute,
  managerDailyReportsRoute,
  managerWeeklyReportRoute,
  // Engineer
  engineerDashboardRoute,
  engineerTasksRoute,
  engineerAccountRoute,
  engineerProgressRoute,
  engineerWeatherRoute,
  engineerIssuesRoute,
  engineerQualityCheckRoute,
  engineerDailyReportRoute,
  // Contractor
  contractorDashboardRoute,
  contractorTasksRoute,
  contractorAttendanceRoute,
  contractorAccountRoute,
  contractorWageApprovalRoute,
  contractorResourceAllocationRoute,
  contractorEquipmentRoute,
  // Worker
  workerDashboardRoute,
  workerAttendanceRoute,
  workerTasksRoute,
  workerPaymentRoute,
  workerComplaintRoute,
  workerAccountRoute,
  // Auditor
  auditorDashboardRoute,
  auditorAuditRoute,
  auditorFinancialRoute,
  auditorFraudRoute,
  auditorProjectsRoute,
  auditorApprovalsRoute,
  auditorAccountRoute,
  // Community
  communityDashboardRoute,
  communityWeeklyProgressRoute,
  communityProgressApprovalRoute,
  communityFinanceRoute,
  communityUploadPicturesRoute,
  communityAccountRoute,
  // Public (no auth)
  publicRoute,
  // Project routes
  projectsRoute,
  projectDetailRoute,
  legacyTasksRoute,
  legacyIssuesRoute,
  legacyWorkforceRoute,
  legacyMaterialsRoute,
  legacyFinanceRoute,
  legacyAuditRoute,
  legacyProfileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
