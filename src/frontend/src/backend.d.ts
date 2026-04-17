import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ComplianceStats {
    avgScore: number;
    totalTests: bigint;
    pending: bigint;
    failed: bigint;
    passed: bigint;
}
export interface Document {
    id: UserId;
    title: string;
    fileType: string;
    version: bigint;
    projectId: UserId;
    uploadedAt: Timestamp;
    uploadedBy: UserId;
    fileKey: string;
}
export interface BillingExpense {
    id: string;
    status: ExpenseStatus;
    receiptKey?: string;
    date: string;
    approvedBy?: UserId;
    createdAt: Timestamp;
    submittedBy: UserId;
    description: string;
    taskId?: string;
    category: ExpenseCategory;
    siteId: string;
    amount: number;
}
export interface Approval {
    id: UserId;
    status: ApprovalStatus;
    createdAt: Timestamp;
    approverRole: UserRole;
    entityId: UserId;
    notes: string;
    entityType: EntityType;
    requestedBy: UserId;
}
export interface Material {
    id: UserId;
    threshold: number;
    name: string;
    unit: string;
    updatedAt: Timestamp;
    quantity: number;
    category: string;
    siteId: UserId;
}
export interface CreatePublicComplaintInput {
    title: string;
    reporterName: string;
    description: string;
    imageKey: string;
    projectId: string;
    geoLat: number;
    geoLng: number;
}
export interface AttendanceRecord {
    id: string;
    status: AttendanceStatus;
    qrCodeData?: string;
    userId: UserId;
    date: string;
    approvedBy?: UserId;
    photoKey?: string;
    checkInTime: Timestamp;
    siteId: string;
    checkOutTime?: Timestamp;
    locationVerified: boolean;
    gpsLat?: number;
    gpsLng?: number;
}
export interface SiteStats {
    totalSites: bigint;
    inactiveSites: bigint;
    activeSites: bigint;
}
export interface Expense {
    id: UserId;
    createdAt: Timestamp;
    createdBy: UserId;
    description: string;
    approvalStatus: ApprovalStatus;
    projectId: UserId;
    category: string;
    amount: number;
}
export interface DashboardStats {
    pendingApprovals: bigint;
    totalWorkers: bigint;
    activeProjects: bigint;
    workersPresent: bigint;
    totalProjects: bigint;
    totalSpent: number;
    totalBudget: number;
}
export type UserId = string;
export interface TripStats {
    pendingApprovals: bigint;
    totalTrips: bigint;
    totalCost: number;
    totalFuel: number;
    totalDistance: number;
}
export interface TestReport {
    id: string;
    attachmentKey?: string;
    status: TestStatus;
    testDate: string;
    createdAt: Timestamp;
    testName: string;
    inspectorId: UserId;
    taskId?: string;
    notes?: string;
    approvalLevel1By?: UserId;
    approvalLevel2By?: UserId;
    siteId: string;
    complianceScore: number;
    materialType: string;
}
export interface Project {
    id: UserId;
    status: ProjectStatus;
    endDate: string;
    name: string;
    createdAt: Timestamp;
    createdBy: UserId;
    description: string;
    teamMembers: Array<UserId>;
    actualCost: number;
    progress: number;
    budget: number;
    location: string;
    startDate: string;
}
export interface SitePicture {
    id: UserId;
    visibleToTenant: boolean;
    projectId: UserId;
    caption: string;
    weekLabel: string;
    uploadedAt: Timestamp;
    uploadedBy: UserId;
    fileKey: string;
}
export type Timestamp = bigint;
export interface AuditLog {
    id: UserId;
    userName: string;
    action: string;
    userId: UserId;
    entityId: UserId;
    timestamp: Timestamp;
    details: string;
    entityType: EntityType;
}
export interface Task {
    id: UserId;
    status: TaskStatus;
    title: string;
    assignedTo: UserId;
    createdAt: Timestamp;
    createdBy: UserId;
    dueDate: string;
    description: string;
    projectId: UserId;
    priority: Priority;
}
export interface PublicComplaint {
    id: bigint;
    status: PublicComplaintStatus;
    title: string;
    reporterName: string;
    createdAt: bigint;
    description: string;
    imageKey: string;
    projectId: string;
    geoLat: number;
    geoLng: number;
}
export interface Transfer {
    id: string;
    fromSiteId: string;
    status: TransferStatus;
    transferDate: string;
    approvedBy?: UserId;
    createdAt: Timestamp;
    createdBy: UserId;
    unit: string;
    materialId: string;
    quantity: number;
    materialName: string;
    toSiteId: string;
    reason: string;
}
export interface Requirement {
    id: string;
    supplierContact: string;
    status: RequirementStatus;
    linkedPurchaseOrderId?: string;
    urgency: Urgency;
    supplierName: string;
    createdAt: Timestamp;
    createdBy: UserId;
    unit: string;
    requiredDate: string;
    notes?: string;
    approvalLevel1By?: UserId;
    approvalLevel2By?: UserId;
    quantity: number;
    siteId: string;
    materialName: string;
}
export interface WeeklyProgress {
    id: UserId;
    writtenBy: UserId;
    status: string;
    approvedAt?: string;
    createdAt: Timestamp;
    pmProgressRef: string;
    progressNotes: string;
    projectId: UserId;
    communityNotes: string;
    weekLabel: string;
    photos: Array<string>;
}
export interface PurchaseOrder {
    id: string;
    attachmentKey?: string;
    status: PurchaseOrderStatus;
    createdAt: Timestamp;
    createdBy: UserId;
    deliveryDate: string;
    totalAmount: number;
    vendorId: string;
    approvalLevel1By?: UserId;
    approvalLevel2By?: UserId;
    siteId: string;
    items: Array<PurchaseItem>;
    vendorName: string;
}
export interface Vendor {
    id: string;
    contact: string;
    name: string;
    email: string;
    address: string;
    rating: number;
}
export interface MaterialRequest {
    id: UserId;
    status: ApprovalStatus;
    createdAt: Timestamp;
    materialId: UserId;
    quantityRequested: number;
    projectId: UserId;
    notes: string;
    requestedBy: UserId;
}
export interface BillingStats {
    overdueCount: bigint;
    totalPaid: number;
    totalExpenses: number;
    totalPending: number;
    totalInvoiced: number;
}
export interface PurchaseItem {
    qty: number;
    rate: number;
    unit: string;
    amount: number;
    materialName: string;
}
export interface Attendance {
    id: UserId;
    method: AttendanceMethod;
    workerId: UserId;
    checkIn: Timestamp;
    projectId: UserId;
    checkOut?: Timestamp;
    location: string;
}
export interface User {
    id: UserId;
    name: string;
    createdAt: Timestamp;
    role: UserRole;
    email: string;
}
export interface Issue {
    id: UserId;
    status: IssueStatus;
    title: string;
    createdAt: Timestamp;
    description: string;
    imageKey: string;
    reportedBy: UserId;
    projectId: UserId;
    priority: Priority;
    location: string;
}
export interface ConsumptionSummary {
    unit: string;
    materialId: string;
    totalConsumed: number;
    materialName: string;
}
export interface Invoice {
    id: string;
    status: InvoiceStatus;
    createdAt: Timestamp;
    dueDate: string;
    purchaseOrderId?: string;
    paidDate?: string;
    invoiceNumber: string;
    totalAmount: number;
    vendor: string;
    siteId: string;
    taxAmount: number;
    amount: number;
    paidBy?: UserId;
}
export interface AttendanceStats {
    totalAbsent: bigint;
    totalLate: bigint;
    totalApproved: bigint;
    totalRejected: bigint;
    totalPresent: bigint;
}
export interface ConsumptionLog {
    id: string;
    date: string;
    createdAt: Timestamp;
    unit: string;
    materialId: string;
    taskId?: string;
    notes?: string;
    quantityConsumed: number;
    siteId: string;
    materialName: string;
    loggedBy: UserId;
}
export interface TripLog {
    id: string;
    status: TripStatus;
    vehicleName: string;
    driverId: string;
    tripDate: string;
    ratePerKm: number;
    approvedBy?: UserId;
    createdAt: Timestamp;
    createdBy: UserId;
    totalCost: number;
    distance: number;
    fuelConsumed: number;
    endLocation: string;
    siteId: string;
    driverName: string;
    purpose: string;
    startLocation: string;
    vehicleId: string;
}
export interface Site {
    id: string;
    status: SiteStatus;
    name: string;
    createdAt: Timestamp;
    createdBy: UserId;
    geoRadius: number;
    address: string;
    geoLat: number;
    geoLng: number;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum AttendanceMethod {
    qr = "qr",
    gps = "gps",
    manual = "manual"
}
export enum AttendanceStatus {
    Present = "Present",
    Late = "Late",
    Approved = "Approved",
    Rejected = "Rejected",
    Absent = "Absent"
}
export enum EntityType {
    expense = "expense",
    task = "task",
    approval = "approval",
    attendance = "attendance",
    issue = "issue",
    material = "material",
    project = "project"
}
export enum ExpenseCategory {
    Labor = "Labor",
    Overhead = "Overhead",
    Material = "Material",
    Equipment = "Equipment"
}
export enum InvoiceStatus {
    Paid = "Paid",
    Approved = "Approved",
    Overdue = "Overdue",
    Pending = "Pending"
}
export enum IssueStatus {
    resolved = "resolved",
    closed = "closed",
    acknowledged = "acknowledged",
    reported = "reported",
    inProgress = "inProgress"
}
export enum Priority {
    low = "low",
    high = "high",
    critical = "critical",
    medium = "medium"
}
export enum ProjectStatus {
    active = "active",
    cancelled = "cancelled",
    completed = "completed",
    onHold = "onHold",
    planning = "planning"
}
export enum PublicComplaintStatus {
    resolved = "resolved",
    open = "open"
}
export enum PurchaseOrderStatus {
    ApprovedL1 = "ApprovedL1",
    ApprovedL2 = "ApprovedL2",
    Delivered = "Delivered",
    Draft = "Draft",
    Rejected = "Rejected",
    Submitted = "Submitted"
}
export enum RequirementStatus {
    ApprovedL1 = "ApprovedL1",
    ApprovedL2 = "ApprovedL2",
    Draft = "Draft",
    Rejected = "Rejected",
    Submitted = "Submitted",
    Fulfilled = "Fulfilled"
}
export enum SiteStatus {
    Inactive = "Inactive",
    Active = "Active"
}
export enum TaskStatus {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum TestStatus {
    Fail = "Fail",
    Pass = "Pass",
    Pending = "Pending"
}
export enum TransferStatus {
    Approved = "Approved",
    Rejected = "Rejected",
    Completed = "Completed",
    Pending = "Pending"
}
export enum TripStatus {
    Approved = "Approved",
    Rejected = "Rejected",
    Pending = "Pending"
}
export enum Urgency {
    Low = "Low",
    High = "High",
    Medium = "Medium",
    Critical = "Critical"
}
export enum UserRole {
    publicUser = "publicUser",
    community = "community",
    projectManager = "projectManager",
    auditor = "auditor",
    governmentAuthority = "governmentAuthority",
    worker = "worker",
    tenant = "tenant",
    contractor = "contractor",
    siteEngineer = "siteEngineer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveAttendance(id: string): Promise<boolean>;
    approveExpense(id: string, approved: boolean): Promise<Expense | null>;
    approveExpenseRecord(id: string): Promise<boolean>;
    approveInvoice(id: string): Promise<boolean>;
    approveMaterialRequest(id: string, approved: boolean, notes: string): Promise<MaterialRequest | null>;
    approvePurchaseOrderL1(id: string): Promise<boolean>;
    approvePurchaseOrderL2(id: string): Promise<boolean>;
    approveRequirementL1(id: string): Promise<boolean>;
    approveRequirementL2(id: string): Promise<boolean>;
    approveTestReportL1(id: string): Promise<boolean>;
    approveTestReportL2(id: string): Promise<boolean>;
    approveTransfer(id: string): Promise<boolean>;
    approveTrip(id: string): Promise<boolean>;
    approveWeeklyProgress(id: string, communityNotes: string, approvedAt: string): Promise<WeeklyProgress | null>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    checkoutAttendance(attendanceId: string): Promise<Attendance | null>;
    completeTransfer(id: string): Promise<boolean>;
    createApproval(entityType: EntityType, entityId: string, approverRole: UserRole, notes: string): Promise<Approval>;
    createBillingExpense(siteId: string, taskId: string | null, category: ExpenseCategory, description: string, amount: number, date: string, receiptKey: string | null): Promise<BillingExpense>;
    createExpense(projectId: string, amount: number, category: string, description: string): Promise<Expense>;
    createInvoice(siteId: string, purchaseOrderId: string | null, invoiceNumber: string, vendor: string, amount: number, taxAmount: number, totalAmount: number, dueDate: string): Promise<Invoice>;
    createIssue(projectId: string, title: string, description: string, imageKey: string, priority: Priority, location: string): Promise<Issue>;
    createMaterialRequest(materialId: string, projectId: string, quantityRequested: number, notes: string): Promise<MaterialRequest>;
    createProject(name: string, location: string, budget: number, startDate: string, endDate: string, description: string): Promise<Project>;
    createPublicComplaint(input: CreatePublicComplaintInput): Promise<bigint>;
    createPurchaseOrder(siteId: string, vendorId: string, vendorName: string, items: Array<PurchaseItem>, totalAmount: number, deliveryDate: string, attachmentKey: string | null): Promise<PurchaseOrder>;
    createRequirement(siteId: string, materialName: string, quantity: number, unit: string, urgency: Urgency, requiredDate: string, supplierName: string, supplierContact: string, notes: string | null): Promise<Requirement>;
    createSite(name: string, address: string, geoLat: number, geoLng: number, geoRadius: number): Promise<Site>;
    createTask(projectId: string, title: string, description: string, assignedTo: string, priority: Priority, dueDate: string): Promise<Task>;
    createTestReport(siteId: string, taskId: string | null, testName: string, materialType: string, testDate: string, complianceScore: number, notes: string | null, attachmentKey: string | null): Promise<TestReport>;
    createTransfer(fromSiteId: string, toSiteId: string, materialId: string, materialName: string, quantity: number, unit: string, transferDate: string, reason: string): Promise<Transfer>;
    createTrip(siteId: string, vehicleId: string, vehicleName: string, driverId: string, driverName: string, tripDate: string, startLocation: string, endLocation: string, distance: number, purpose: string, fuelConsumed: number, ratePerKm: number, totalCost: number): Promise<TripLog>;
    createVendor(name: string, contact: string, email: string, rating: number, address: string): Promise<Vendor>;
    createWeeklyProgress(projectId: string, weekLabel: string, progressNotes: string, pmProgressRef: string, photos: Array<string>): Promise<WeeklyProgress>;
    escalateIssue(id: string): Promise<Issue | null>;
    fulfillRequirement(id: string, linkedPurchaseId: string): Promise<boolean>;
    getAllIssues(): Promise<Array<Issue>>;
    getAllMaterials(): Promise<Array<Material>>;
    getAllPublicComplaints(): Promise<Array<PublicComplaint>>;
    getApprovals(): Promise<Array<Approval>>;
    getAttendanceByDate(date: string): Promise<Array<AttendanceRecord>>;
    getAttendanceByProject(projectId: string): Promise<Array<Attendance>>;
    getAttendanceBySite(siteId: string): Promise<Array<AttendanceRecord>>;
    getAttendanceByUser(userId: string): Promise<Array<AttendanceRecord>>;
    getAttendanceStats(siteId: string): Promise<AttendanceStats>;
    getAuditLogs(): Promise<Array<AuditLog>>;
    getBillingStats(siteId: string): Promise<BillingStats>;
    getCallerUserRole(): Promise<UserRole__1>;
    getComplianceStats(siteId: string): Promise<ComplianceStats>;
    getConsumptionByMaterial(materialId: string): Promise<Array<ConsumptionLog>>;
    getConsumptionBySite(siteId: string): Promise<Array<ConsumptionLog>>;
    getConsumptionByTask(taskId: string): Promise<Array<ConsumptionLog>>;
    getConsumptionSummary(siteId: string): Promise<Array<ConsumptionSummary>>;
    getDashboardStats(): Promise<DashboardStats>;
    getDocumentsByProject(projectId: string): Promise<Array<Document>>;
    getExpensesByProject(projectId: string): Promise<Array<Expense>>;
    getExpensesBySite(siteId: string): Promise<Array<BillingExpense>>;
    getIssuesByProject(projectId: string): Promise<Array<Issue>>;
    getMaterialRequests(): Promise<Array<MaterialRequest>>;
    getMaterialsBySite(siteId: string): Promise<Array<Material>>;
    getProject(id: string): Promise<Project | null>;
    getProjects(): Promise<Array<Project>>;
    getPublicComplaintsByProject(projectId: string): Promise<Array<PublicComplaint>>;
    getPurchaseOrder(id: string): Promise<PurchaseOrder | null>;
    getRequirement(id: string): Promise<Requirement | null>;
    getSite(id: string): Promise<Site | null>;
    getSitePicturesByProject(projectId: string): Promise<Array<SitePicture>>;
    getSitePicturesByWeek(projectId: string, weekLabel: string): Promise<Array<SitePicture>>;
    getSiteStats(): Promise<SiteStats>;
    getSitesByUser(userId: string): Promise<Array<Site>>;
    getTask(id: string): Promise<Task | null>;
    getTasksByProject(projectId: string): Promise<Array<Task>>;
    getTestReport(id: string): Promise<TestReport | null>;
    getTransfer(id: string): Promise<Transfer | null>;
    getTripStats(siteId: string): Promise<TripStats>;
    getTripsByVehicle(vehicleId: string): Promise<Array<TripLog>>;
    getUsers(): Promise<Array<User>>;
    getWeeklyProgressByProject(projectId: string): Promise<Array<WeeklyProgress>>;
    isCallerAdmin(): Promise<boolean>;
    listInvoicesBySite(siteId: string): Promise<Array<Invoice>>;
    listPurchaseOrders(siteId: string): Promise<Array<PurchaseOrder>>;
    listRequirements(siteId: string): Promise<Array<Requirement>>;
    listSites(): Promise<Array<Site>>;
    listTestReportsBySite(siteId: string): Promise<Array<TestReport>>;
    listTransfersBySite(siteId: string): Promise<Array<Transfer>>;
    listTripsBySite(siteId: string): Promise<Array<TripLog>>;
    listVendors(): Promise<Array<Vendor>>;
    logConsumption(siteId: string, taskId: string | null, materialId: string, materialName: string, quantityConsumed: number, unit: string, date: string, notes: string | null): Promise<ConsumptionLog>;
    markAttendance(workerId: string, projectId: string, location: string, method: AttendanceMethod): Promise<Attendance>;
    markDelivered(id: string): Promise<boolean>;
    markInvoicePaid(id: string, paidDate: string): Promise<boolean>;
    processApproval(id: string, approved: boolean, notes: string): Promise<Approval | null>;
    recordCheckIn(siteId: string, qrCodeData: string | null, gpsLat: number | null, gpsLng: number | null, locationVerified: boolean, photoKey: string | null, date: string): Promise<AttendanceRecord>;
    recordCheckOut(id: string): Promise<boolean>;
    rejectAttendance(id: string): Promise<boolean>;
    rejectInvoice(id: string): Promise<boolean>;
    rejectPurchaseOrder(id: string): Promise<boolean>;
    rejectRequirement(id: string): Promise<boolean>;
    rejectTestReport(id: string): Promise<boolean>;
    rejectTransfer(id: string): Promise<boolean>;
    rejectTrip(id: string): Promise<boolean>;
    reopenPublicComplaint(id: bigint): Promise<boolean>;
    resolvePublicComplaint(id: bigint): Promise<boolean>;
    seedSampleData(): Promise<string>;
    seedTasksAndMaterials(): Promise<string>;
    submitPurchaseOrder(id: string): Promise<boolean>;
    updateIssueStatus(id: string, status: IssueStatus): Promise<Issue | null>;
    updateMaterial(id: string, quantity: number): Promise<Material | null>;
    updateProjectProgress(id: string, progress: number): Promise<Project | null>;
    updateProjectStatus(id: string, status: ProjectStatus): Promise<Project | null>;
    updatePurchaseOrder(id: string, items: Array<PurchaseItem>, totalAmount: number, deliveryDate: string, attachmentKey: string | null): Promise<boolean>;
    updateRequirement(id: string, materialName: string, quantity: number, unit: string, urgency: Urgency, requiredDate: string, supplierName: string, supplierContact: string, notes: string | null): Promise<boolean>;
    updateSiteStatus(id: string, status: SiteStatus): Promise<boolean>;
    updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null>;
    uploadDocument(projectId: string, title: string, fileKey: string, fileType: string): Promise<Document>;
    uploadSitePicture(projectId: string, weekLabel: string, caption: string, fileKey: string, visibleToTenant: boolean): Promise<SitePicture>;
}
