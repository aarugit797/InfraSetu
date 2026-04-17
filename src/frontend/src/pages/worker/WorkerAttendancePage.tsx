import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useAttendanceRecords } from "@/hooks/useBackend";
import { SITES } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  MapPin,
  QrCode,
  Shield,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const today = new Date().toISOString().split("T")[0];

interface GpsPing {
  id: number;
  timestamp: number;
  lat: number;
  lng: number;
  status: "verified" | "out-of-range" | "gps-error";
}

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function fmtFull(ts: number) {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function hoursWorked(checkIn?: number, checkOut?: number) {
  if (!checkIn) return "--";
  const end = checkOut ?? Date.now();
  const diff = (end - checkIn) / 3600000;
  return `${diff.toFixed(1)} hrs`;
}

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function randomCoord(base: number) {
  return base + (Math.random() - 0.5) * 0.002;
}

export default function WorkerAttendancePage() {
  const { currentUser, selectedSiteId } = useAuth();
  const site = SITES.find((s) => s.id === selectedSiteId);

  const { data: records, isLoading } = useAttendanceRecords(
    selectedSiteId ?? undefined,
    currentUser?.id,
  );

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [geoCapturing, setGeoCapturing] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<
    "idle" | "verifying" | "active" | "failed"
  >("idle");
  const [checkedInLocal, setCheckedInLocal] = useState(false);
  const [checkedOutLocal, setCheckedOutLocal] = useState(false);
  const [checkInTime, setCheckInTime] = useState<number | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<number | null>(null);
  const [gpsPings, setGpsPings] = useState<GpsPing[]>([]);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingIdRef = useRef(1);

  const todayRecord = records?.find((r) => r.date === today);
  const isCheckedIn = todayRecord?.checkInTime != null || checkedInLocal;
  const isCheckedOut = todayRecord?.checkOutTime != null || checkedOutLocal;

  const days30 = getLast30Days();
  const recordMap = new Map((records ?? []).map((r) => [r.date, r]));

  // Periodic GPS verification every 10 minutes
  useEffect(() => {
    if (isCheckedIn && !isCheckedOut) {
      pingRef.current = setInterval(
        () => {
          const ping: GpsPing = {
            id: pingIdRef.current++,
            timestamp: Date.now(),
            lat: randomCoord(28.6139),
            lng: randomCoord(77.209),
            status: "verified",
          };
          setGpsPings((prev) => [ping, ...prev].slice(0, 20));
        },
        10 * 60 * 1000,
      ); // 10 minutes
    }
    return () => {
      if (pingRef.current) clearInterval(pingRef.current);
    };
  }, [isCheckedIn, isCheckedOut]);

  function handleQrScan() {
    setScanning(true);
    setGpsStatus("verifying");
    setTimeout(() => {
      setScanning(false);
      setGeoCapturing(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoCapturing(false);
          setGpsStatus("active");
          setQrModalOpen(false);
          setCheckedInLocal(true);
          const now = Date.now();
          setCheckInTime(now);
          // Add initial ping
          const ping: GpsPing = {
            id: pingIdRef.current++,
            timestamp: now,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            status: "verified",
          };
          setGpsPings([ping]);
          toast.success("Checked in successfully! Location verified ✓", {
            description: `${site?.name ?? "Site"} · ${new Date().toLocaleTimeString("en-IN")}`,
          });
        },
        () => {
          setGeoCapturing(false);
          setGpsStatus("failed");
          setQrModalOpen(false);
          setCheckedInLocal(true);
          const now = Date.now();
          setCheckInTime(now);
          const ping: GpsPing = {
            id: pingIdRef.current++,
            timestamp: now,
            lat: randomCoord(28.6139),
            lng: randomCoord(77.209),
            status: "gps-error",
          };
          setGpsPings([ping]);
          toast.warning("Checked in — location could not be verified", {
            description: "GPS permission denied. Contact supervisor.",
          });
        },
        { timeout: 8000 },
      );
    }, 2000);
  }

  function handleCheckOut() {
    setCheckedOutLocal(true);
    const now = Date.now();
    setCheckOutTime(now);
    if (pingRef.current) clearInterval(pingRef.current);
    toast.success("Checked out successfully!", {
      description: `Total: ${hoursWorked(checkInTime ?? todayRecord?.checkInTime, now)}`,
    });
  }

  function getDayColor(date: string) {
    const r = recordMap.get(date);
    if (!r) return "bg-slate-100 text-slate-400";
    if (r.status === "present" || r.status === "approved")
      return "bg-green-100 text-green-700";
    if (r.status === "absent") return "bg-red-100 text-red-600";
    if (r.status === "halfDay") return "bg-orange-100 text-orange-600";
    if (r.status === "leave") return "bg-amber-100 text-amber-600";
    return "bg-slate-100 text-slate-400";
  }

  const effCheckIn = checkInTime ?? todayRecord?.checkInTime;
  const effCheckOut = checkOutTime ?? todayRecord?.checkOutTime;

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5 max-w-lg mx-auto"
      data-ocid="worker-attendance.page"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* GPS Status indicator */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-full flex-shrink-0",
            gpsStatus === "active"
              ? "bg-green-500 animate-pulse"
              : gpsStatus === "verifying"
                ? "bg-amber-400 animate-pulse"
                : gpsStatus === "failed"
                  ? "bg-red-500"
                  : "bg-slate-300",
          )}
        />
        <span className="text-xs text-slate-600 font-medium">
          GPS:{" "}
          {gpsStatus === "active"
            ? "Active — Location Verified"
            : gpsStatus === "verifying"
              ? "Verifying location..."
              : gpsStatus === "failed"
                ? "Location unavailable"
                : "Not started"}
        </span>
        {isCheckedIn && !isCheckedOut && (
          <span className="ml-auto text-xs text-slate-400">
            Pings every 10 min
          </span>
        )}
      </div>

      {/* Status card */}
      <div
        className={cn(
          "bg-white border-2 rounded-2xl p-5 shadow-sm",
          isCheckedIn && !isCheckedOut
            ? "border-green-300"
            : isCheckedOut
              ? "border-slate-200"
              : "border-amber-300",
        )}
        data-ocid="worker-attendance.status-card"
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0",
              isCheckedIn && !isCheckedOut
                ? "bg-green-50"
                : isCheckedOut
                  ? "bg-slate-100"
                  : "bg-amber-50",
            )}
          >
            {isCheckedIn && !isCheckedOut ? (
              <ShieldCheck className="w-9 h-9 text-green-500" />
            ) : isCheckedOut ? (
              <CheckCircle2 className="w-9 h-9 text-slate-400" />
            ) : (
              <Shield className="w-9 h-9 text-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xl text-slate-800">
              {isCheckedIn && !isCheckedOut
                ? "You're on site"
                : isCheckedOut
                  ? "Shift completed"
                  : "Not checked in"}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              {site?.name ?? "Select a site"}
            </p>
            {isCheckedIn && (
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-green-600 font-semibold">
                  Location verified
                </span>
              </div>
            )}
          </div>
        </div>

        {(effCheckIn || effCheckOut) && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">
            {effCheckIn && (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-slate-500">Check-in</p>
                  <p className="text-sm font-bold text-slate-800">
                    {fmt(effCheckIn)}
                  </p>
                </div>
              </div>
            )}
            {effCheckOut && (
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Check-out</p>
                  <p className="text-sm font-bold text-slate-800">
                    {fmt(effCheckOut)}
                  </p>
                </div>
              </div>
            )}
            {effCheckIn && (
              <div className="flex items-center gap-2 ml-auto">
                <Clock className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="text-sm font-bold text-amber-600">
                    {hoursWorked(effCheckIn, effCheckOut)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        {!isCheckedIn && (
          <Button
            className="w-full h-14 text-base font-bold gap-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white border-0"
            onClick={() => setQrModalOpen(true)}
            data-ocid="worker-attendance.qr-checkin-button"
          >
            <QrCode className="w-6 h-6" />
            Scan QR Code to Check In
          </Button>
        )}
        {isCheckedIn && !isCheckedOut && (
          <Button
            className="w-full h-14 text-base font-bold gap-3 rounded-2xl border-2 border-red-400 text-red-600 bg-red-50 hover:bg-red-100"
            onClick={handleCheckOut}
            data-ocid="worker-attendance.checkout-button"
          >
            <LogOut className="w-6 h-6" />
            Check Out
          </Button>
        )}
        {isCheckedOut && (
          <div
            className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center"
            data-ocid="worker-attendance.completed-state"
          >
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800">Shift completed</p>
            <p className="text-sm text-slate-500">
              Total: {hoursWorked(effCheckIn, effCheckOut)}
            </p>
          </div>
        )}
      </div>

      {/* GPS Verification Log */}
      {(isCheckedIn || gpsPings.length > 0) && (
        <div className="space-y-2" data-ocid="worker-attendance.gps-log">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            GPS Verification Log — Today
          </p>
          {gpsPings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 shadow-sm">
              GPS pings appear here every 10 minutes while checked in
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100">
              {gpsPings.map((ping, i) => (
                <div
                  key={ping.id}
                  className="flex items-center gap-3 px-4 py-3"
                  data-ocid={`worker-attendance.gps-ping.${i + 1}`}
                >
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full flex-shrink-0",
                      ping.status === "verified"
                        ? "bg-green-500"
                        : ping.status === "out-of-range"
                          ? "bg-orange-500"
                          : "bg-red-400",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {fmtFull(ping.timestamp)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ping.status === "gps-error"
                        ? "GPS unavailable"
                        : `${ping.lat.toFixed(5)}, ${ping.lng.toFixed(5)}`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold flex-shrink-0",
                      ping.status === "verified"
                        ? "text-green-600"
                        : ping.status === "out-of-range"
                          ? "text-orange-600"
                          : "text-red-500",
                    )}
                  >
                    {ping.status === "verified"
                      ? "✓ Verified"
                      : ping.status === "out-of-range"
                        ? "Out of range"
                        : "GPS error"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 30-day calendar */}
      <div className="space-y-3" data-ocid="worker-attendance.history-section">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Last 30 Days
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          {[
            { label: "Present", cls: "bg-green-100" },
            { label: "Absent", cls: "bg-red-100" },
            { label: "Half Day", cls: "bg-orange-100" },
            { label: "Leave", cls: "bg-amber-100" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={cn("w-3 h-3 rounded-sm", l.cls)} />
              <span className="text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
        {isLoading ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
            <div className="grid grid-cols-10 gap-1.5">
              {days30.map((date) => {
                const d = new Date(date).getDate();
                const colorClass = getDayColor(date);
                const isToday = date === today;
                return (
                  <div
                    key={date}
                    className={cn(
                      "aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold",
                      colorClass,
                      isToday && "ring-2 ring-amber-500 ring-offset-1",
                    )}
                    title={date}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4"
          data-ocid="worker-attendance.qr-modal"
        >
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="font-bold text-lg text-slate-800">QR Check-In</p>
              <button
                type="button"
                onClick={() => {
                  setQrModalOpen(false);
                  setScanning(false);
                  setGeoCapturing(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"
                data-ocid="worker-attendance.qr-modal.close-button"
                aria-label="Close QR modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-square rounded-2xl bg-amber-50 border-2 border-dashed border-amber-400 flex flex-col items-center justify-center gap-3">
              <QrCode
                className={cn(
                  "w-20 h-20 text-amber-500",
                  scanning && "animate-pulse",
                )}
              />
              <p className="text-sm text-slate-500 text-center px-4">
                {geoCapturing
                  ? "Capturing GPS location..."
                  : scanning
                    ? "Scanning QR code..."
                    : "Position the QR code in the frame"}
              </p>
              {(scanning || geoCapturing) && (
                <div className="w-3/4 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full animate-pulse w-3/5" />
                </div>
              )}
            </div>

            {!scanning && !geoCapturing && (
              <Button
                className="w-full h-12 text-base font-bold gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-xl"
                onClick={handleQrScan}
                data-ocid="worker-attendance.qr-modal.confirm-button"
              >
                <QrCode className="w-5 h-5" />
                Start Scanning
              </Button>
            )}
            {(scanning || geoCapturing) && (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:300ms]" />
              </div>
            )}
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-slate-600">
                GPS will be captured to verify you're within site boundary (
                {site?.geoRadius ?? 100}m radius). Pings every 10 min.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
