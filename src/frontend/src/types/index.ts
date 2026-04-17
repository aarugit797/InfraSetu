// ─── Core User / Auth ────────────────────────────────────────────────────────

export type UserRole =
  | "governmentAuthority"
  | "projectManager"
  | "siteEngineer"
  | "contractor"
  | "worker"
  | "auditor"
  | "community"
  | "public";

// ─── Milestone ────────────────────────────────────────────────────────────────

export interface Milestone {
  id: string;
  name: string;
  status: "done" | "planned";
  completionPercent: number;
  description?: string;
}

// ─── Public Complaint ─────────────────────────────────────────────────────────

export interface PublicComplaint {
  id: number;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  imageKey: string;
  geoLat: number;
  geoLng: number;
  reporterName: string;
  status: "open" | "resolved";
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  phone?: string;
  joinedAt: number;
}

// ─── Project / Task / Issue ───────────────────────────────────────────────────

export type ProjectStatus =
  | "planning"
  | "active"
  | "onHold"
  | "completed"
  | "cancelled";

export interface Project {
  id: string;
  name: string;
  location: string;
  status: ProjectStatus;
  budget: number;
  actualCost: number;
  progress: number;
  startDate: string;
  endDate: string;
  description: string;
  teamMembers: string[];
  createdBy: string;
  createdAt: number;
  milestones?: Milestone[];
}

export type TaskStatus =
  | "pending"
  | "inProgress"
  | "completed"
  | "blocked"
  | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  startDate: string;
  completedAt?: number;
  dependencies?: string[];
  createdBy: string;
  createdAt: number;
}

export type IssuePriority = "low" | "medium" | "high" | "critical";
export type IssueStatus =
  | "open"
  | "inProgress"
  | "resolved"
  | "closed"
  | "escalated";

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  reportedBy: string;
  assignedTo?: string;
  imageUrl?: string;
  geoLocation?: { lat: number; lng: number };
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
}

// ─── Attendance (legacy) ──────────────────────────────────────────────────────

export interface Attendance {
  id: string;
  workerId: string;
  projectId: string;
  checkIn: number;
  checkOut?: number;
  location?: { lat: number; lng: number };
  date: string;
  status: "present" | "absent" | "halfDay" | "leave";
}

// ─── Material ─────────────────────────────────────────────────────────────────

export type MaterialStatus = "available" | "low" | "critical" | "outOfStock";

export interface Material {
  id: string;
  name: string;
  projectId: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  status: MaterialStatus;
  lastUpdated: number;
}

// ─── Expense / Finance (legacy) ───────────────────────────────────────────────

export type ExpenseCategory =
  | "Labor"
  | "Materials"
  | "Equipment"
  | "Services"
  | "Overhead"
  | "Miscellaneous";
export type ExpenseStatus = "pending" | "approved" | "rejected" | "paid";

export interface Expense {
  id: string;
  projectId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  submittedBy: string;
  approvedBy?: string;
  status: ExpenseStatus;
  date: string;
  createdAt: number;
}

// ─── Audit / Approval ─────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: number;
  ipAddress?: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated";
export type ApprovalType =
  | "budget"
  | "task"
  | "material"
  | "expense"
  | "project";

export interface Approval {
  id: string;
  type: ApprovalType;
  entityId: string;
  title: string;
  requestedBy: string;
  approvedBy?: string;
  status: ApprovalStatus;
  amount?: number;
  notes?: string;
  createdAt: number;
  resolvedAt?: number;
  slaDeadline: number;
}

export interface MaterialRequest {
  id: string;
  projectId: string;
  materialId: string;
  requestedBy: string;
  quantity: number;
  urgency: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected" | "fulfilled";
  notes?: string;
  createdAt: number;
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  type: "blueprint" | "report" | "contract" | "permit" | "invoice" | "photo";
  fileUrl: string;
  fileSize: number;
  version: number;
  uploadedBy: string;
  createdAt: number;
  description?: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  pendingTasks: number;
  openIssues: number;
  criticalIssues: number;
  totalBudget: number;
  totalSpent: number;
  workersOnSite: number;
  pendingApprovals: number;
}

// ─── NEW: Site ────────────────────────────────────────────────────────────────

export type SiteStatus = "active" | "inactive" | "completed" | "suspended";

export interface Site {
  id: string;
  name: string;
  address: string;
  projectId: string;
  geoLat: number;
  geoLng: number;
  geoRadius: number; // meters
  status: SiteStatus;
  managerName: string;
  totalWorkers: number;
  createdAt: number;
}

export interface SiteStats {
  siteId: string;
  presentToday: number;
  totalWorkers: number;
  tasksInProgress: number;
  openIssues: number;
  lastUpdated: number;
}

// ─── NEW: Attendance Record (QR + GPS) ────────────────────────────────────────

export type AttendanceStatus =
  | "pending"
  | "present"
  | "absent"
  | "halfDay"
  | "leave"
  | "approved"
  | "rejected";

export interface AttendanceRecord {
  id: string;
  userId: string;
  siteId: string;
  projectId: string;
  date: string;
  checkInTime?: number;
  checkOutTime?: number;
  gpsLat?: number;
  gpsLng?: number;
  qrCodeData?: string;
  locationVerified: boolean;
  photoKey?: string;
  status: AttendanceStatus;
  approvedBy?: string;
  notes?: string;
  createdAt: number;
}

// ─── NEW: Purchase Order ──────────────────────────────────────────────────────

export type PurchaseOrderStatus =
  | "draft"
  | "submitted"
  | "approvedL1"
  | "approvedL2"
  | "rejected"
  | "delivered"
  | "cancelled";

export interface PurchaseItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  rating: number;
  createdAt: number;
}

export interface PurchaseOrder {
  id: string;
  siteId: string;
  projectId: string;
  vendorId: string;
  vendorName: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  requestedBy: string;
  approvedByL1?: string;
  approvedByL2?: string;
  deliveryDate?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// ─── NEW: Consumption Log ─────────────────────────────────────────────────────

export interface ConsumptionLog {
  id: string;
  siteId: string;
  projectId: string;
  taskId?: string;
  materialId: string;
  materialName: string;
  unit: string;
  quantity: number;
  loggedBy: string;
  date: string;
  notes?: string;
  createdAt: number;
}

export interface ConsumptionSummary {
  materialId: string;
  materialName: string;
  totalConsumed: number;
  unit: string;
  lastLogged: number;
}

// ─── NEW: Transfer ────────────────────────────────────────────────────────────

export type TransferStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "inTransit"
  | "completed"
  | "cancelled";

export interface Transfer {
  id: string;
  fromSiteId: string;
  toSiteId: string;
  materialId: string;
  materialName: string;
  unit: string;
  quantity: number;
  status: TransferStatus;
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
  createdAt: number;
  completedAt?: number;
}

// ─── NEW: Trip ────────────────────────────────────────────────────────────────

export type TripStatus =
  | "pending"
  | "approved"
  | "inProgress"
  | "completed"
  | "cancelled";

export interface TripLog {
  id: string;
  siteId: string;
  projectId: string;
  vehicleNumber: string;
  vehicleType: string;
  driverId: string;
  driverName: string;
  fromLocation: string;
  toLocation: string;
  purpose: string;
  status: TripStatus;
  departureTime?: number;
  arrivalTime?: number;
  distanceKm?: number;
  fuelCost?: number;
  approvedBy?: string;
  createdAt: number;
}

export interface TripStats {
  siteId: string;
  totalTrips: number;
  completedTrips: number;
  pendingTrips: number;
  totalDistanceKm: number;
  totalFuelCost: number;
}

// ─── NEW: Requirements ────────────────────────────────────────────────────────

export type RequirementStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "ordered"
  | "delivered"
  | "cancelled";
export type Urgency = "low" | "medium" | "high" | "critical";

export interface Requirement {
  id: string;
  siteId: string;
  projectId: string;
  title: string;
  description: string;
  category: "material" | "equipment" | "labor" | "service";
  quantity: number;
  unit: string;
  urgency: Urgency;
  status: RequirementStatus;
  supplierName?: string;
  supplierContact?: string;
  estimatedCost?: number;
  requestedBy: string;
  approvedBy?: string;
  requiredByDate: string;
  notes?: string;
  createdAt: number;
}

// ─── NEW: Billing / Invoice ───────────────────────────────────────────────────

export type InvoiceStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "paid"
  | "overdue";

export interface Invoice {
  id: string;
  siteId: string;
  projectId: string;
  vendorId?: string;
  vendorName: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  submittedBy: string;
  approvedBy?: string;
  dueDate: string;
  paidAt?: number;
  createdAt: number;
}

export interface BillingExpense {
  id: string;
  siteId: string;
  projectId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  status: ExpenseStatus;
  submittedBy: string;
  approvedBy?: string;
  date: string;
  receiptKey?: string;
  createdAt: number;
}

export interface BillingStats {
  siteId: string;
  totalBudget: number;
  totalInvoiced: number;
  totalPaid: number;
  totalExpenses: number;
  budgetUtilization: number; // percentage
}

// ─── NEW: Test Report ─────────────────────────────────────────────────────────

export type TestStatus =
  | "draft"
  | "submitted"
  | "approvedL1"
  | "approvedL2"
  | "rejected"
  | "pass"
  | "fail";

export interface TestReport {
  id: string;
  siteId: string;
  projectId: string;
  taskId?: string;
  title: string;
  testType: string;
  material: string;
  standard: string;
  result: "pass" | "fail" | "pending";
  score?: number;
  maxScore?: number;
  status: TestStatus;
  remarks?: string;
  conductedBy: string;
  approvedByL1?: string;
  approvedByL2?: string;
  testDate: string;
  labName?: string;
  documentKey?: string;
  createdAt: number;
}

export interface ComplianceStats {
  siteId: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  pendingTests: number;
  complianceRate: number; // percentage
}

// ─── NEW: Wage / Payment ──────────────────────────────────────────────────────

export type WageRequestStatus = "pending" | "approved" | "rejected" | "paid";

export interface WageRequest {
  id: string;
  workerId: string;       // references DEMO_USERS id
  workerName: string;
  trade: string;
  projectId: string;
  projectName: string;
  contractorId: string;   // the approver
  amount: number;
  period: string;         // e.g. "Apr 2026"
  daysWorked: number;
  ratePerDay: number;
  status: WageRequestStatus;
  approvedOn?: string;
  paidOn?: string;
  notes?: string;
  createdAt: number;
}

export type WorkerPaymentStatus = "Paid" | "Pending" | "Processing";

export interface WorkerPayment {
  id: string;
  workerId: string;
  amount: number;
  date: string;
  description: string;
  status: WorkerPaymentStatus;
  projectId?: string;
}

// ─── NEW: Daily Log ────────────────────────────────────────────────────────────

export interface DailyLog {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  date: string;
  weather: string;
  workersPresent: number;
  activitiesDone: string[];
  materialsUsed: { name: string; quantity: number; unit: string }[];
  issuesRaised: string[];
  progressPercent: number;
  notes: string;
  createdAt: number;
}

// ─── NEW: Worker Profile (extended) ──────────────────────────────────────────

export interface WorkerProfile {
  id: string;
  name: string;
  trade: string;
  aadhaarId: string;
  ratePerDay: number;
  contractorId: string;
  projectIds: string[];
  phone: string;
  address: string;
  joinedAt: number;
  status: "active" | "inactive" | "onLeave";
}
