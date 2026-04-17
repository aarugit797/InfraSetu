import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { SITES } from "@/lib/mockData";
import type { AttendanceStatus } from "@/types";
import {
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  Navigation,
  QrCode,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const WORKERS = [
  {
    id: "w1",
    name: "Ramesh Kumar",
    trade: "Mason",
    status: "present" as AttendanceStatus,
    checkIn: Date.now() - 7 * 3600000,
    workDone: "Column shuttering south side (12 units)",
    hoursWorked: 7,
  },
  {
    id: "w2",
    name: "Suresh Yadav",
    trade: "Welder",
    status: "present" as AttendanceStatus,
    checkIn: Date.now() - 6.5 * 3600000,
    workDone: "Steel rebar tying, floor 2 (8 spans)",
    hoursWorked: 6.5,
  },
  {
    id: "w3",
    name: "Mahesh Singh",
    trade: "Helper",
    status: "absent" as AttendanceStatus,
    checkIn: null,
    workDone: "—",
    hoursWorked: 0,
  },
  {
    id: "w4",
    name: "Ganesh Patel",
    trade: "Carpenter",
    status: "present" as AttendanceStatus,
    checkIn: Date.now() - 7.2 * 3600000,
    workDone: "Formwork setup block B",
    hoursWorked: 7.2,
  },
  {
    id: "w5",
    name: "Dinesh Verma",
    trade: "Electrician",
    status: "halfDay" as AttendanceStatus,
    checkIn: Date.now() - 4 * 3600000,
    workDone: "Conduit laying corridor 3",
    hoursWorked: 4,
  },
  {
    id: "w6",
    name: "Santosh Gupta",
    trade: "Plumber",
    status: "absent" as AttendanceStatus,
    checkIn: null,
    workDone: "—",
    hoursWorked: 0,
  },
  {
    id: "w7",
    name: "Ravi Sharma",
    trade: "Mason",
    status: "present" as AttendanceStatus,
    checkIn: Date.now() - 8 * 3600000,
    workDone: "Brick masonry floor 2 (west wing)",
    hoursWorked: 8,
  },
  {
    id: "w8",
    name: "Anil Tiwari",
    trade: "Helper",
    status: "present" as AttendanceStatus,
    checkIn: Date.now() - 7.5 * 3600000,
    workDone: "Material stacking and lifting",
    hoursWorked: 7.5,
  },
];

function QRScannerModal({
  onClose,
  onSuccess,
}: { onClose: () => void; onSuccess: () => void }) {
  const [scanning, setScanning] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setScanning(false);
      setDone(true);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        role="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div
        className="relative w-full max-w-sm bg-card rounded-2xl p-5 space-y-4 shadow-xl border border-border"
        data-ocid="contractor-attendance.dialog"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-foreground">QR Scanner</h3>
          <button
            type="button"
            onClick={onClose}
            data-ocid="contractor-attendance.close_button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
          {scanning && (
            <>
              <div className="w-48 h-48 border-2 border-primary rounded-xl" />
              <div className="absolute inset-0 flex items-start justify-center pt-12">
                <div
                  className="w-40 h-0.5 bg-primary rounded-full"
                  style={{
                    animation: "scanLine 1.5s ease-in-out infinite alternate",
                  }}
                />
              </div>
              <style>
                {
                  "@keyframes scanLine { from { transform: translateY(0); } to { transform: translateY(96px); } }"
                }
              </style>
            </>
          )}
          {done && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <p className="text-green-600 font-semibold text-sm">
                Scan Successful!
              </p>
              <p className="text-muted-foreground text-xs">Site QR verified</p>
            </div>
          )}
        </div>
        {scanning && (
          <p className="text-center text-sm text-muted-foreground">
            Point camera at the site QR code…
          </p>
        )}
        {done && (
          <div className="space-y-2">
            <div className="bg-muted border border-border rounded-xl p-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-foreground font-medium">
                  NH-48 Main Site
                </p>
                <p className="text-xs text-muted-foreground">
                  Within 15m of site center ✓
                </p>
              </div>
            </div>
            <button
              type="button"
              className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors duration-200"
              data-ocid="contractor-attendance.confirm_button"
              onClick={() => {
                onSuccess();
                onClose();
              }}
            >
              Confirm Check-In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContractorAttendancePage() {
  const { selectedSiteId } = useAuth();
  const [checkedIn, setCheckedIn] = useState(true);
  const [checkInTime] = useState(Date.now() - 7 * 3600000);
  const [showQr, setShowQr] = useState(false);
  const [teamStatus, setTeamStatus] = useState(WORKERS.map((w) => ({ ...w })));
  const [activeTab, setActiveTab] = useState<"roster" | "summary">("roster");
  const activeSite = SITES.find((s) => s.id === selectedSiteId);

  const presentCount = teamStatus.filter((m) => m.status === "present").length;
  const absentCount = teamStatus.filter((m) => m.status === "absent").length;
  const halfDayCount = teamStatus.filter((m) => m.status === "halfDay").length;

  function toggleMemberStatus(id: string) {
    setTeamStatus((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status:
                m.status === "present"
                  ? ("absent" as AttendanceStatus)
                  : ("present" as AttendanceStatus),
              checkIn: m.status === "present" ? null : Date.now(),
            }
          : m,
      ),
    );
  }

  return (
    <div
      className="bg-muted min-h-screen p-4 space-y-6"
      data-ocid="contractor-attendance.page"
    >
      <div>
        <h1 className="font-display font-bold text-xl text-foreground">
          Attendance
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Worker roster & work done summary
        </p>
      </div>

      {/* My status */}
      <div
        className={`bg-card rounded-2xl p-4 border-2 shadow-sm ${checkedIn ? "border-green-400" : "border-primary"}`}
        data-ocid="contractor-attendance.personal_status"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              My Status Today
            </p>
            <p className="font-display font-bold text-foreground text-lg mt-0.5">
              {checkedIn ? "Checked In" : "Not Checked In"}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${checkedIn ? "bg-green-100" : "bg-primary/10"}`}
          >
            {checkedIn ? (
              <Check className="w-6 h-6 text-green-600" />
            ) : (
              <Clock className="w-6 h-6 text-primary" />
            )}
          </div>
        </div>
        {checkedIn && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-muted border border-border rounded-xl p-2.5">
              <p className="text-xs text-muted-foreground">Check-in Time</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {new Date(checkInTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="bg-muted border border-border rounded-xl p-2.5">
              <p className="text-xs text-muted-foreground">GPS Status</p>
              <p className="text-sm font-semibold text-green-600 mt-0.5 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" /> Verified
              </p>
            </div>
          </div>
        )}
        {activeSite && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-primary font-medium">{activeSite.name}</span>
            <span>· Within 15m of site</span>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-muted border border-border text-foreground rounded-xl text-sm font-medium hover:border-primary/40 transition-colors duration-200"
            data-ocid="contractor-attendance.qr_scan_button"
            onClick={() => setShowQr(true)}
          >
            <QrCode className="w-4 h-4 text-primary" />
            Scan QR
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
              checkedIn
                ? "bg-muted text-foreground border border-border hover:bg-muted/80"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
            data-ocid={
              checkedIn
                ? "contractor-attendance.checkout_button"
                : "contractor-attendance.checkin_button"
            }
            onClick={() => setCheckedIn((p) => !p)}
          >
            {checkedIn ? "Check Out" : "Check In"}
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "Present",
            count: presentCount,
            color: "text-green-600 bg-green-100",
          },
          {
            label: "Absent",
            count: absentCount,
            color: "text-red-600 bg-red-100",
          },
          {
            label: "Half Day",
            count: halfDayCount,
            color: "text-amber-600 bg-amber-100",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-3 text-center shadow-sm"
          >
            <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>
              {s.count}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["roster", "summary"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            data-ocid={`contractor-attendance.${tab}_tab`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors duration-200 ${
              activeTab === tab
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            {tab === "roster" ? "Daily Roster" : "Work Summary"}
          </button>
        ))}
      </div>

      {/* Daily Roster */}
      {activeTab === "roster" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {teamStatus.length} Workers ·{" "}
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold transition-colors duration-200"
              data-ocid="contractor-attendance.team_qr_button"
              onClick={() => setShowQr(true)}
            >
              <QrCode className="w-3.5 h-3.5" />
              QR Check-In
            </button>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {teamStatus.map((member, i) => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0"
                data-ocid={`contractor-attendance.team_member.${i + 1}`}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {member.trade}
                    </p>
                    {member.checkIn && (
                      <span className="text-xs text-muted-foreground">
                        ·{" "}
                        {new Date(member.checkIn).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid={`contractor-attendance.toggle_member.${i + 1}`}
                  onClick={() => toggleMemberStatus(member.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200 ${
                    member.status === "present"
                      ? "bg-green-100 text-green-700 border-green-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200"
                      : "bg-red-100 text-red-700 border-red-200 hover:bg-green-100 hover:text-green-700 hover:border-green-200"
                  }`}
                >
                  {member.status === "present"
                    ? "Present"
                    : member.status === "halfDay"
                      ? "Half Day"
                      : "Absent"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Summary */}
      {activeTab === "summary" && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Work Done Per Worker Today
          </p>
          <div className="space-y-2">
            {teamStatus.map((member, i) => (
              <div
                key={member.id}
                className="bg-card border border-border rounded-xl p-4 shadow-sm"
                data-ocid={`contractor-attendance.work_summary.${i + 1}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-xs">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.trade}
                    </p>
                  </div>
                  <StatusBadge status={member.status} size="sm" />
                </div>
                <div className="flex items-center justify-between pl-11">
                  <div className="flex items-start gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-foreground leading-relaxed">
                      {member.workDone}
                    </p>
                  </div>
                  {member.hoursWorked > 0 && (
                    <span className="text-xs font-medium text-primary ml-2 flex-shrink-0">
                      {member.hoursWorked}h
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showQr && (
        <QRScannerModal
          onClose={() => setShowQr(false)}
          onSuccess={() => setCheckedIn(true)}
        />
      )}
    </div>
  );
}
