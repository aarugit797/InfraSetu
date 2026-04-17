import "leaflet/dist/leaflet.css";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { ALL_PROJECTS as PROJECTS, PUBLIC_COMPLAINTS, SITES } from "@/lib/mockData";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Milestone, Project, PublicComplaint } from "@/types";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flag,
  HardHat,
  Info,
  Loader2,
  MapPin,
  Menu,
  MessageCircleWarning,
  Navigation,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ComponentType, useEffect, useRef, useState } from "react";

// Fix Leaflet default icon
(L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl =
  undefined;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveSection = "map" | "progress" | "complaints" | "about";

interface ProjectWithMeta extends Project {
  distanceKm: number | null;
  openComplaints: PublicComplaint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getStatusColors(status: Project["status"]) {
  if (status === "active")
    return {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    };
  if (status === "planning")
    return { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" };
  if (status === "completed")
    return { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" };
  return { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
}

function isDelayed(project: Project): boolean {
  const endDate = new Date(project.endDate).getTime();
  return endDate < Date.now() && project.progress < 100;
}

const SESSION_KEY = "public_location_prompt_done";

// ─── Location Permission Popup ────────────────────────────────────────────────

function LocationPermissionPopup({
  onEnable,
  onSkip,
}: {
  onEnable: () => void;
  onSkip: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      data-ocid="public.location_popup.dialog"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onSkip}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 24, stiffness: 300 }}
        className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden"
      >
        {/* Top amber accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4">
            <div className="relative">
              <MapPin className="w-8 h-8 text-amber-500" />
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="absolute inset-0 rounded-full bg-amber-400/30"
              />
            </div>
          </div>

          <h2 className="font-bold text-slate-800 text-lg mb-1.5">
            Enable Location
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-2">
            Allow InfraSetu to access your location to show{" "}
            <span className="font-semibold text-amber-700">
              nearby construction projects
            </span>{" "}
            and sort them by distance.
          </p>

          {/* Features list */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 mb-5 text-left space-y-2">
            {[
              { icon: MapPin, text: "See projects near your current location" },
              { icon: Navigation, text: "Know how far each site is from you" },
              { icon: Building2, text: "Map centered on your neighbourhood" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3 h-3 text-amber-600" />
                </div>
                <span className="text-xs text-slate-600">{text}</span>
              </div>
            ))}
          </div>

          <Button
            className="w-full h-11 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold border-0 text-sm mb-3"
            onClick={onEnable}
            data-ocid="public.location_popup.enable_button"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Enable Location
          </Button>

          <button
            type="button"
            onClick={onSkip}
            data-ocid="public.location_popup.skip_button"
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors w-full py-1"
          >
            Not now — browse without location
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Public Sidebar ───────────────────────────────────────────────────────────

const PUBLIC_NAV: {
  id: ActiveSection;
  icon: ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { id: "map", icon: MapPin, label: "Map" },
  { id: "progress", icon: BarChart2, label: "Progress" },
  { id: "complaints", icon: Flag, label: "Complaints" },
  { id: "about", icon: Info, label: "About" },
];

function PublicSidebar({
  activeSection,
  onSelect,
  open,
  onClose,
  totalOpenComplaints,
}: {
  activeSection: ActiveSection;
  onSelect: (s: ActiveSection) => void;
  open: boolean;
  onClose: () => void;
  totalOpenComplaints: number;
}) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            role="button"
            tabIndex={-1}
            aria-label="Close sidebar"
            onClick={onClose}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-amber-100/80 shadow-sm transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        data-ocid="public.sidebar"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-100">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-800 text-sm leading-tight">
              InfraSetu
            </p>
            <p className="text-slate-400 text-xs truncate">Public Portal</p>
          </div>
          <button
            type="button"
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav
          className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5"
          data-ocid="public.sidebar.nav"
        >
          {PUBLIC_NAV.map(({ id, icon: Icon, label }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onSelect(id);
                  onClose();
                }}
                data-ocid={`public.sidebar.nav_${id}`}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group",
                  active
                    ? "bg-amber-100 text-amber-800 border-l-2 border-amber-500 pl-[10px]"
                    : "text-slate-600 hover:bg-amber-50 hover:text-amber-700",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    active
                      ? "text-amber-600"
                      : "text-slate-400 group-hover:text-amber-600",
                  )}
                />
                <span className="truncate flex-1 text-left">{label}</span>
                {id === "complaints" && totalOpenComplaints > 0 && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0",
                      active
                        ? "bg-amber-500/20 text-amber-800"
                        : "bg-red-100 text-red-600",
                    )}
                  >
                    {totalOpenComplaints}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer note */}
        <div className="px-3 py-4 border-t border-amber-100">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Info className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-amber-800">
                Public Portal
              </span>
            </div>
            <p className="text-[11px] text-amber-700 leading-snug">
              No login required. View projects, track progress &amp; raise
              complaints.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Leaflet Map Component ────────────────────────────────────────────────────

function LeafletMap({
  projects,
  userLat,
  userLng,
  onSelectProject,
}: {
  projects: ProjectWithMeta[];
  userLat: number | null;
  userLng: number | null;
  onSelectProject: (p: ProjectWithMeta) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const centerLat = userLat ?? 28.6139;
    const centerLng = userLng ?? 77.209;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: userLat !== null ? 13 : 12,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // User location marker — blue pulsing dot
    if (userLat !== null && userLng !== null) {
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="position:relative;width:20px;height:20px">
          <div style="position:absolute;inset:0;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5)"></div>
          <div style="position:absolute;inset:-6px;border:2px solid rgba(59,130,246,0.35);border-radius:50%;animation:pulse 2s infinite"></div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;text-align:center;padding:4px 2px">
            <div style="font-size:16px;margin-bottom:2px">📍</div>
            <b style="font-size:12px;color:#1e40af">Your Location</b>
          </div>`,
        )
        .openPopup();
    }

    // Project markers using clustering
    const markerCluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
    });

    for (const proj of projects) {
      const site = SITES.find((s) => s.projectId === proj.id);
      if (!site) continue;
      const hasOpenComplaints = proj.openComplaints.length > 0;
      const colors = getStatusColors(proj.status);
      const colorMap: Record<string, string> = {
        "bg-emerald-500": "#10b981",
        "bg-amber-500": "#f59e0b",
        "bg-blue-500": "#3b82f6",
        "bg-slate-400": "#94a3b8",
      };
      const colorHex = colorMap[colors.dot] || "#f59e0b";

      const markerIcon = L.divIcon({
        className: "",
        html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
          <div style="width:34px;height:34px;background:${colorHex};border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M3 21h18V8l-9-6-9 6v13zm7-2v-4h4v4h-4zm4-6H10v-2h4v2z"/></svg>
          </div>
          ${hasOpenComplaints ? `<div style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;background:#ef4444;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;color:white">${proj.openComplaints.length}</div>` : ""}
        </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const distText =
        proj.distanceKm !== null
          ? proj.distanceKm < 1
            ? `${Math.round(proj.distanceKm * 1000)}m away`
            : `${proj.distanceKm.toFixed(1)}km away`
          : "";

      const marker = L.marker([site.geoLat, site.geoLng], { icon: markerIcon })
        .bindPopup(
          `<div style="min-width:190px;font-family:sans-serif">
            <b style="font-size:13px;color:#1e293b">${proj.name}</b>
            <div style="margin-top:3px;font-size:11px;color:#64748b">📍 ${proj.location}</div>
            ${distText ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px">🧭 ${distText}</div>` : ""}
            <div style="margin-top:6px;display:flex;align-items:center;gap:6px">
               <span style="background:${colorHex}22;color:${colorHex};border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600">${proj.status.charAt(0).toUpperCase() + proj.status.slice(1)}</span>
               <span style="font-size:11px;color:#64748b;font-weight:600">${proj.progress}% done</span>
            </div>
            ${hasOpenComplaints ? `<div style="margin-top:5px;font-size:11px;color:#ef4444;font-weight:600">⚠ ${proj.openComplaints.length} open complaint${proj.openComplaints.length > 1 ? "s" : ""}</div>` : ""}
            <button onclick="window.__publicSelectProject('${proj.id}')" style="margin-top:8px;width:100%;background:#f59e0b;color:white;border:none;border-radius:7px;padding:6px 0;font-size:12px;font-weight:600;cursor:pointer">View Details →</button>
          </div>`,
          { maxWidth: 250 },
        );
      markerCluster.addLayer(marker);
    }
    
    map.addLayer(markerCluster);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLat, userLng, projects]);

  // Expose callback for popup button
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__publicSelectProject = (
      id: string,
    ) => {
      const p = projects.find((proj) => proj.id === id);
      if (p) onSelectProject(p);
    };
    return () => {
      (window as unknown as Record<string, unknown>).__publicSelectProject =
        undefined;
    };
  }, [projects, onSelectProject]);

  return (
    <div style={{ isolation: "isolate" }}>
      <style>
        {
          ".leaflet-pane, .leaflet-top, .leaflet-bottom { z-index: 1 !important; } .leaflet-control-container .leaflet-top { z-index: 1 !important; }"
        }
      </style>
      <div
        ref={mapContainerRef}
        className="w-full rounded-2xl overflow-hidden border border-amber-200 shadow-sm"
        style={{ height: "420px" }}
        data-ocid="public.leaflet_map"
      />
    </div>
  );
}

// ─── Progress Tracker Section ────────────────────────────────────────────────

function ProgressSection({ projects }: { projects: ProjectWithMeta[] }) {
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id ?? "",
  );
  const project =
    projects.find((p) => p.id === selectedProjectId) ?? projects[0];

  if (!project) return null;

  const milestones: Milestone[] = project.milestones ?? [];
  const doneCount = milestones.filter((m) => m.status === "done").length;
  const delayed = isDelayed(project);

  return (
    <div className="space-y-5" data-ocid="public.progress_section">
      {/* Project selector */}
      <div>
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
          Select Project
        </Label>
        <div className="relative">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            data-ocid="public.progress.project_select"
            className="w-full h-11 pl-4 pr-10 rounded-xl border border-amber-200 bg-white text-slate-800 font-medium text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Project overview card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 text-base truncate">
              {project.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span className="text-xs text-slate-500 truncate">
                {project.location}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {delayed && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                ⚠ Delayed
              </span>
            )}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-white">
              {project.progress}% Complete
            </span>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Overall Progress</span>
            <span>
              {doneCount} of {milestones.length} milestones complete
            </span>
          </div>
          <div className="h-2.5 bg-amber-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-[10px] text-slate-500">
          <span>
            Start:{" "}
            <span className="font-semibold text-slate-700">
              {formatDate(project.startDate)}
            </span>
          </span>
          <span>
            Deadline:{" "}
            <span
              className={`font-semibold ${delayed ? "text-red-600" : "text-slate-700"}`}
            >
              {formatDate(project.endDate)}
            </span>
          </span>
          <span>
            Budget:{" "}
            <span className="font-semibold text-slate-700">
              {formatCurrency(project.budget)}
            </span>
          </span>
        </div>
      </div>

      {/* Milestone list */}
      {milestones.length > 0 ? (
        <div className="space-y-2" data-ocid="public.milestone_list">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            Milestone Breakdown
          </h3>
          {milestones.map((ms, i) => (
            <motion.div
              key={ms.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`public.milestone.item.${i + 1}`}
              className={`flex items-start gap-3 p-3 rounded-xl border ${
                ms.status === "done"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  ms.status === "done"
                    ? "bg-emerald-500"
                    : "bg-amber-100 border-2 border-amber-300"
                }`}
              >
                {ms.status === "done" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {ms.name}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      ms.status === "done"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {ms.status === "done" ? "✓ Done" : "○ Planned"}
                  </span>
                </div>
                {ms.description && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {ms.description}
                  </p>
                )}
                {ms.completionPercent > 0 && ms.completionPercent < 100 && (
                  <div className="mt-1.5">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${ms.completionPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {ms.completionPercent}% in progress
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-8 text-slate-400 text-sm"
          data-ocid="public.milestone.empty_state"
        >
          No milestone data available for this project.
        </div>
      )}

      {/* Raise complaint CTA */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Flag className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-slate-700">
            Spotted a discrepancy?{" "}
            <span className="font-semibold text-red-600">
              Raise a complaint
            </span>
          </p>
        </div>
        <Button
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-lg text-xs flex-shrink-0"
          data-ocid="public.progress.raise_complaint_button"
          onClick={() => {
            const event = new CustomEvent("public:open-complaint", {
              detail: { projectId: project.id },
            });
            window.dispatchEvent(event);
          }}
        >
          Raise Complaint
        </Button>
      </div>
    </div>
  );
}

// ─── Complaints Section ──────────────────────────────────────────────────────

function ComplaintsSection({
  complaints,
  projects,
  onNewComplaint,
}: {
  complaints: PublicComplaint[];
  projects: ProjectWithMeta[];
  onNewComplaint: (projectId: string) => void;
}) {
  const openComplaints = complaints.filter((c) => c.status === "open");
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved");

  function getProjectName(projectId: string) {
    return projects.find((p) => p.id === projectId)?.name ?? "Unknown Project";
  }

  return (
    <div className="space-y-5" data-ocid="public.complaints_section">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 text-base flex items-center gap-2">
          <MessageCircleWarning className="w-4 h-4 text-amber-500" />
          Public Complaints
        </h2>
        {openComplaints.length > 0 && (
          <Badge className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 gap-1">
            <Flag className="w-2.5 h-2.5" fill="currentColor" />
            {openComplaints.length} open
          </Badge>
        )}
      </div>

      {openComplaints.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wide flex items-center gap-1.5">
            <Flag className="w-3 h-3" fill="currentColor" />
            Open Complaints ({openComplaints.length})
          </h3>
          {openComplaints.map((c, i) => (
            <div
              key={c.id}
              data-ocid={`public.complaint.item.${i + 1}`}
              className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {c.title}
                  </p>
                  <div className="flex items-center gap-1 bg-red-100 border border-red-200 rounded-full px-1.5 py-0.5 flex-shrink-0">
                    <Flag
                      className="w-2.5 h-2.5 text-red-500"
                      fill="currentColor"
                    />
                    <span className="text-[9px] font-bold text-red-600">
                      Open
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {getProjectName(c.projectId)}
                </p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {c.description}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  By {c.reporterName} · {formatDate(c.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolvedComplaints.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Resolved Complaints ({resolvedComplaints.length})
          </h3>
          {resolvedComplaints.map((c, i) => (
            <div
              key={c.id}
              data-ocid={`public.resolved_complaint.item.${i + 1}`}
              className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex gap-3 opacity-80"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 line-through opacity-70">
                  {c.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {getProjectName(c.projectId)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Resolved · By {c.reporterName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {openComplaints.length === 0 && resolvedComplaints.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-2xl border border-slate-200"
          data-ocid="public.complaints.empty_state"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3 opacity-60" />
          <p className="font-medium text-slate-700">No complaints yet</p>
          <p className="text-sm text-slate-400 mt-1">
            All projects are looking good!
          </p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-medium text-slate-700 mb-3">
          Raise a new complaint for a project:
        </p>
        <div className="flex flex-wrap gap-2">
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onNewComplaint(p.id)}
              data-ocid="public.new_complaint_button"
              className="text-xs bg-white border border-amber-300 text-amber-700 font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 hover:border-amber-400 transition-colors"
            >
              <Flag className="w-3 h-3 inline-block mr-1" />
              {p.name.split(" ").slice(0, 3).join(" ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── About Section ──────────────────────────────────────────────────────────

function AboutSection() {
  const stats = [
    {
      label: "Active Projects",
      value: "2",
      icon: Building2,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      label: "Planning Phase",
      value: "1",
      icon: Clock,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: "Open Complaints",
      value: "3",
      icon: Flag,
      color: "text-red-600 bg-red-100",
    },
    {
      label: "Resolved",
      value: "2",
      icon: CheckCircle2,
      color: "text-blue-600 bg-blue-100",
    },
  ];

  return (
    <div className="space-y-5" data-ocid="public.about_section">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base">
              InfraSetu – Public Portal
            </h2>
            <p className="text-xs text-slate-500">
              Transparency in Government Construction
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          InfraSetu's Public Portal gives every citizen direct visibility into
          ongoing government construction projects in their area. Track
          progress, verify promises, and raise complaints if you spot
          discrepancies.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}
            >
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-500" />
          How This Portal Works
        </h3>
        {[
          {
            step: "1",
            title: "View the Map",
            desc: "See all construction projects near you with real-time status markers.",
          },
          {
            step: "2",
            title: "Track Progress",
            desc: "Check milestone-by-milestone progress for each project and verify deadlines.",
          },
          {
            step: "3",
            title: "Raise Complaints",
            desc: "Spot something wrong? Submit a complaint with photo evidence. It's sent directly to Government Authority.",
          },
          {
            step: "4",
            title: "See Resolution",
            desc: "Your complaint stays flagged until the Authority resolves it. Full transparency.",
          },
        ].map((item) => (
          <div key={item.step} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {item.step}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {item.title}
              </p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onClick,
}: { project: ProjectWithMeta; onClick: () => void }) {
  const colors = getStatusColors(project.status);
  const hasOpenComplaints = project.openComplaints.length > 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-ocid="public.project.card"
      className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm leading-snug truncate">
            {project.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-500 truncate">
              {project.location}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          {project.distanceKm !== null && (
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <Navigation className="w-2.5 h-2.5" />
              {project.distanceKm < 1
                ? `${Math.round(project.distanceKm * 1000)}m`
                : `${project.distanceKm.toFixed(1)}km`}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
        {project.description}
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-3">
          <div>
            <p className="text-[10px] text-slate-400">Budget</p>
            <p className="text-xs font-semibold text-slate-800">
              {formatCurrency(project.budget)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Deadline</p>
            <p className="text-xs font-semibold text-slate-800">
              {formatDate(project.endDate)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Progress</p>
            <p className="text-xs font-semibold text-slate-800">
              {project.progress}%
            </p>
          </div>
        </div>
        {hasOpenComplaints && (
          <div
            className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-full px-2 py-0.5"
            data-ocid="public.complaint_flag"
          >
            <Flag className="w-3 h-3 text-red-500" fill="currentColor" />
            <span className="text-[10px] font-bold text-red-600">
              {project.openComplaints.length}
            </span>
          </div>
        )}
      </div>
      <div className="mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all"
          style={{ width: `${project.progress}%` }}
        />
      </div>
    </motion.div>
  );
}

// ─── Project Detail Modal ────────────────────────────────────────────────────

function ProjectDetailModal({
  project,
  complaints,
  onClose,
  onRaiseComplaint,
}: {
  project: ProjectWithMeta;
  complaints: PublicComplaint[];
  onClose: () => void;
  onRaiseComplaint: () => void;
}) {
  const colors = getStatusColors(project.status);
  const openComplaints = complaints.filter(
    (c) => c.projectId === project.id && c.status === "open",
  );
  const resolvedComplaints = complaints.filter(
    (c) => c.projectId === project.id && c.status === "resolved",
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      data-ocid="public.project_detail.dialog"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
              >
                {project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)}
              </span>
              {openComplaints.length > 0 && (
                <span className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 text-[10px] font-bold text-red-600">
                  <Flag className="w-2.5 h-2.5" fill="currentColor" />{" "}
                  {openComplaints.length} open
                </span>
              )}
              {isDelayed(project) && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  ⚠ Delayed
                </span>
              )}
            </div>
            <h2 className="font-bold text-slate-800 text-lg leading-tight">
              {project.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {project.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="public.project_detail.close_button"
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            {project.description}
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Promised Budget",
                value: formatCurrency(project.budget),
              },
              { label: "Deadline", value: formatDate(project.endDate) },
              { label: "Progress", value: `${project.progress}%` },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-amber-50 rounded-xl p-2.5 text-center"
              >
                <p className="text-[10px] text-slate-500 mb-0.5">{s.label}</p>
                <p className="text-xs font-bold text-slate-800">{s.value}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Overall Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {project.milestones && project.milestones.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Milestones
              </h3>
              <div className="space-y-1.5">
                {project.milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      ms.status === "done"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {ms.status === "done" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <span className="w-3 h-3 rounded-full border-2 border-amber-400 flex-shrink-0" />
                    )}
                    <span className="font-medium">{ms.name}</span>
                    {ms.completionPercent > 0 && ms.completionPercent < 100 && (
                      <span className="ml-auto text-amber-600 font-semibold">
                        {ms.completionPercent}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {openComplaints.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Flag className="w-3 h-3" fill="currentColor" />
                Open Complaints ({openComplaints.length})
              </h3>
              <div className="space-y-2">
                {openComplaints.map((c, i) => (
                  <div
                    key={c.id}
                    data-ocid={`public.complaint.item.${i + 1}`}
                    className="flex gap-3 bg-red-50 border border-red-100 rounded-xl p-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        {c.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                        {c.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        By {c.reporterName} · {formatDate(c.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolvedComplaints.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                Resolved ({resolvedComplaints.length})
              </h3>
              {resolvedComplaints.map((c, i) => (
                <div
                  key={c.id}
                  data-ocid={`public.resolved_complaint.item.${i + 1}`}
                  className="flex gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3 opacity-75 mb-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700 line-through opacity-70">
                      {c.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Resolved · By {c.reporterName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button
            className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm border-0"
            onClick={onRaiseComplaint}
            data-ocid="public.raise_complaint.open_modal_button"
          >
            <Flag className="w-4 h-4 mr-2" />
            Raise a Complaint
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Complaint Form Modal ────────────────────────────────────────────────────

function ComplaintFormModal({
  project,
  onClose,
  onSubmit,
}: {
  project: ProjectWithMeta;
  onClose: () => void;
  onSubmit: (
    complaint: Omit<PublicComplaint, "id" | "status" | "createdAt">,
  ) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !title || !description) return;
    setLoading(true);
    try {
      const imageKey = photo
        ? `complaint_photo_${Date.now()}_${photo.name}`
        : "";
      await onSubmit({
        projectId: project.id,
        projectName: project.name,
        title,
        description,
        imageKey,
        geoLat: 0,
        geoLng: 0,
        reporterName: name,
      });
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      data-ocid="public.complaint_form.dialog"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-base">
              Raise a Complaint
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[240px]">
              {project.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="public.complaint_form.close_button"
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="public.complaint_form.success_state"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">
                  Complaint Submitted!
                </h3>
                <p className="text-slate-500 text-sm">
                  Your complaint has been recorded and flagged for Government
                  Authority review.
                </p>
                <Button
                  className="mt-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-0"
                  onClick={onClose}
                  data-ocid="public.complaint_form.confirm_button"
                >
                  Done
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <Label
                    htmlFor="cn"
                    className="text-sm font-medium text-slate-700 mb-1.5 block"
                  >
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cn"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-ocid="public.complaint_form.name_input"
                    className="h-10 rounded-xl border-amber-200 focus:border-amber-400"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="ct"
                    className="text-sm font-medium text-slate-700 mb-1.5 block"
                  >
                    Complaint Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ct"
                    type="text"
                    placeholder="Brief summary of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    data-ocid="public.complaint_form.title_input"
                    className="h-10 rounded-xl border-amber-200 focus:border-amber-400"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="cd"
                    className="text-sm font-medium text-slate-700 mb-1.5 block"
                  >
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="cd"
                    placeholder="Describe the discrepancy in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    data-ocid="public.complaint_form.description_textarea"
                    className="rounded-xl border-amber-200 focus:border-amber-400 resize-none"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Attach Photo{" "}
                    <span className="text-slate-400 font-normal">
                      (optional)
                    </span>
                  </Label>
                  <button
                    type="button"
                    className="w-full border-2 border-dashed border-amber-200 rounded-xl p-4 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/40 transition-colors"
                    onClick={() => fileRef.current?.click()}
                    data-ocid="public.complaint_form.dropzone"
                  >
                    {photo ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                          {photo.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhoto(null);
                          }}
                          className="text-slate-400 hover:text-red-500"
                          aria-label="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                          <Send className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-xs text-slate-500">
                          Click to upload a photo as evidence
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          JPG, PNG up to 10MB
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                      data-ocid="public.complaint_form.upload_button"
                    />
                  </button>
                </div>
                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-10 rounded-xl border-slate-300"
                    onClick={onClose}
                    disabled={loading}
                    data-ocid="public.complaint_form.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-0 font-semibold"
                    disabled={loading || !name || !title || !description}
                    data-ocid="public.complaint_form.submit_button"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Submit
                      </span>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PublicPage() {
  useAuth(); // keep auth context alive (not used directly here)

  const [activeSection, setActiveSection] = useState<ActiveSection>("map");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Location state
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");

  // Location popup — show once per session
  const [showLocationPopup, setShowLocationPopup] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SESSION_KEY) !== "1";
  });

  // Modals
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithMeta | null>(null);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintProjectId, setComplaintProjectId] = useState<string | null>(
    null,
  );
  const [allComplaints, setAllComplaints] =
    useState<PublicComplaint[]>(PUBLIC_COMPLAINTS);

  // Request geolocation
  function requestLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      sessionStorage.setItem(SESSION_KEY, "1");
      setShowLocationPopup(false);
      return;
    }
    setGeoStatus("requesting");
    setShowLocationPopup(false);
    sessionStorage.setItem(SESSION_KEY, "1");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  function dismissLocationPopup() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setShowLocationPopup(false);
    setGeoStatus("denied");
  }

  // Listen for complaint events from ProgressSection
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ projectId: string }>;
      setComplaintProjectId(customEvent.detail.projectId);
      setShowComplaintForm(true);
    };
    window.addEventListener("public:open-complaint", handler);
    return () => window.removeEventListener("public:open-complaint", handler);
  }, []);

  const projectsWithMeta: ProjectWithMeta[] = PROJECTS.map((p) => {
    const site = SITES.find((s) => s.projectId === p.id);
    let distanceKm: number | null = null;
    if (userLat !== null && userLng !== null && site) {
      distanceKm = haversineKm(userLat, userLng, site.geoLat, site.geoLng);
    }
    const openComplaints = allComplaints.filter(
      (c) => c.projectId === p.id && c.status === "open",
    );
    return { ...p, distanceKm, openComplaints };
  });

  const displayProjects =
    geoStatus === "granted" && userLat !== null
      ? [...projectsWithMeta].sort(
          (a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999),
        )
      : projectsWithMeta;

  const totalOpenComplaints = allComplaints.filter(
    (c) => c.status === "open",
  ).length;

  async function handleComplaintSubmit(
    data: Omit<PublicComplaint, "id" | "status" | "createdAt">,
  ) {
    await new Promise((r) => setTimeout(r, 1000));
    const newComplaint: PublicComplaint = {
      ...data,
      id: Date.now(),
      status: "open",
      createdAt: Date.now(),
    };
    setAllComplaints((prev) => [...prev, newComplaint]);
    if (selectedProject) {
      setSelectedProject((prev) =>
        prev
          ? { ...prev, openComplaints: [...prev.openComplaints, newComplaint] }
          : prev,
      );
    }
  }

  function openComplaintForProject(projectId: string) {
    const proj = projectsWithMeta.find((p) => p.id === projectId);
    if (proj) {
      setSelectedProject(proj);
      setComplaintProjectId(projectId);
      setShowComplaintForm(true);
    }
  }

  const complaintProject = complaintProjectId
    ? (projectsWithMeta.find((p) => p.id === complaintProjectId) ??
      selectedProject ??
      projectsWithMeta[0])
    : (selectedProject ?? projectsWithMeta[0]);

  return (
    <div className="min-h-screen bg-slate-50 flex" data-ocid="public.page">
      {/* ── Self-contained Public Sidebar ── */}
      <PublicSidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        totalOpenComplaints={totalOpenComplaints}
      />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:min-h-screen lg:ml-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden text-slate-500 hover:text-slate-700 p-1 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            data-ocid="public.mobile_menu_button"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand (mobile) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-800">InfraSetu</span>
          </div>

          {/* Breadcrumb (desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className="text-slate-400">InfraSetu</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-medium capitalize">
              {activeSection === "map"
                ? "Nearby Projects Map"
                : activeSection === "progress"
                  ? "Project Progress"
                  : activeSection === "complaints"
                    ? "Public Complaints"
                    : "About Portal"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="mr-1 h-8 rounded-xl text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => { window.location.href = "/login"; }}
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Back to Login</span>
              <span className="sm:hidden">Login</span>
            </Button>
            {/* Geo status chip */}
            <div
              className={cn(
                "hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border",
                geoStatus === "granted"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : geoStatus === "requesting"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : geoStatus === "denied"
                      ? "bg-slate-100 text-slate-500 border-slate-200"
                      : "bg-amber-50 text-amber-600 border-amber-200",
              )}
              data-ocid="public.geo_status"
            >
              <Navigation className="w-3 h-3" />
              <span>
                {geoStatus === "granted"
                  ? "Location on"
                  : geoStatus === "requesting"
                    ? "Locating..."
                    : geoStatus === "denied"
                      ? "No location"
                      : "Enable location"}
              </span>
            </div>

            {/* Enable location button (if not yet enabled) */}
            {(geoStatus === "idle" || geoStatus === "denied") &&
              !showLocationPopup && (
                <Button
                  size="sm"
                  variant="outline"
                  className="hidden sm:flex h-8 rounded-xl text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={() => setShowLocationPopup(true)}
                  data-ocid="public.enable_location_button"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  Enable Location
                </Button>
              )}

            {/* Public badge */}
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-2">
              Public Portal
            </Badge>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          {/* Sub-nav tabs (visible on mobile too) */}
          <div className="bg-white border-b border-slate-200 lg:hidden">
            <div className="px-4">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
                {PUBLIC_NAV.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    data-ocid={`public.nav_tab.${id}`}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                      activeSection === id
                        ? "bg-amber-500 text-white"
                        : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {id === "complaints" && totalOpenComplaints > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          activeSection === id
                            ? "bg-white/30 text-white"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {totalOpenComplaints}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
            {/* Location denied banner */}
            {geoStatus === "denied" && activeSection === "map" && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-4">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <p className="flex-1">
                  Location access not available — showing all projects.{" "}
                </p>
                <button
                  type="button"
                  className="text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800 flex-shrink-0"
                  onClick={() => setShowLocationPopup(true)}
                >
                  Try again
                </button>
              </div>
            )}

            {/* Requesting location indicator */}
            {geoStatus === "requesting" && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 mb-4">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                <p>Detecting your location, please wait…</p>
              </div>
            )}

            {/* Map Section */}
            {activeSection === "map" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                <section data-ocid="public.map_section">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-slate-800 text-base">
                      Nearby Construction Sites
                    </h2>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
                        geoStatus === "granted"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : geoStatus === "requesting"
                            ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                            : "bg-slate-100 text-slate-500 border-slate-200",
                      )}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>
                        {geoStatus === "requesting"
                          ? "Detecting..."
                          : geoStatus === "granted"
                            ? "Location on"
                            : "All projects"}
                      </span>
                    </div>
                  </div>
                  <LeafletMap
                    projects={displayProjects}
                    userLat={userLat}
                    userLng={userLng}
                    onSelectProject={setSelectedProject}
                  />
                </section>

                <section data-ocid="public.projects_section">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-slate-800 text-base">
                      {geoStatus === "granted"
                        ? "Nearby Projects"
                        : "All Projects"}
                    </h2>
                    <span className="text-xs text-slate-400">
                      {displayProjects.length} found
                    </span>
                  </div>
                  {displayProjects.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-2xl border border-slate-200"
                      data-ocid="public.projects.empty_state"
                    >
                      <Building2 className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="font-medium text-slate-700">
                        No projects found nearby
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Try expanding the search radius or check back later.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="grid gap-3 sm:grid-cols-2"
                      data-ocid="public.projects_list"
                    >
                      {displayProjects.map((p, i) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          data-ocid={`public.project.item.${i + 1}`}
                        >
                          <ProjectCard
                            project={p}
                            onClick={() => setSelectedProject(p)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {/* Progress Section */}
            {activeSection === "progress" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ProgressSection projects={displayProjects} />
              </motion.div>
            )}

            {/* Complaints Section */}
            {activeSection === "complaints" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ComplaintsSection
                  complaints={allComplaints}
                  projects={displayProjects}
                  onNewComplaint={openComplaintForProject}
                />
              </motion.div>
            )}

            {/* About Section */}
            {activeSection === "about" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AboutSection />
              </motion.div>
            )}

            <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200 mt-6">
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                className="text-amber-600 hover:text-amber-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                caffeine.ai
              </a>
            </footer>
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {/* Location permission popup */}
        {showLocationPopup && (
          <LocationPermissionPopup
            key="location-popup"
            onEnable={requestLocation}
            onSkip={dismissLocationPopup}
          />
        )}

        {/* Project detail */}
        {selectedProject && !showComplaintForm && (
          <ProjectDetailModal
            key="detail"
            project={selectedProject}
            complaints={allComplaints}
            onClose={() => setSelectedProject(null)}
            onRaiseComplaint={() => {
              setComplaintProjectId(selectedProject.id);
              setShowComplaintForm(true);
            }}
          />
        )}

        {/* Complaint form */}
        {showComplaintForm && complaintProject && (
          <ComplaintFormModal
            key="complaint"
            project={complaintProject}
            onClose={() => {
              setShowComplaintForm(false);
              setComplaintProjectId(null);
              setSelectedProject(null);
            }}
            onSubmit={handleComplaintSubmit}
          />
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white border-t border-slate-200 flex"
        data-ocid="public.bottom_nav"
      >
        {PUBLIC_NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveSection(id)}
            data-ocid={`public.bottom_nav.${id}`}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors",
              activeSection === id
                ? "text-amber-600"
                : "text-slate-400 hover:text-slate-600",
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
