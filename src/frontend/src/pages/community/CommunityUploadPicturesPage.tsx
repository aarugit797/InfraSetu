import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  ImageOff,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

interface SitePicture {
  id: string;
  projectId: string;
  projectName: string;
  weekLabel: string;
  caption: string;
  uploadedAt: string;
  visibleToTenant: boolean;
  previewUrl: string;
}

const INITIAL_PICTURES: SitePicture[] = [
  {
    id: "sp1",
    projectId: "p1",
    projectName: "NH-48 Highway Expansion",
    weekLabel: "Week 14 (Apr 7–13)",
    caption: "Section C road base compaction — final layer",
    uploadedAt: "Apr 12, 2026",
    visibleToTenant: true,
    previewUrl: "",
  },
  {
    id: "sp2",
    projectId: "p1",
    projectName: "NH-48 Highway Expansion",
    weekLabel: "Week 14 (Apr 7–13)",
    caption: "Drainage culvert installation near KM 14.5",
    uploadedAt: "Apr 12, 2026",
    visibleToTenant: true,
    previewUrl: "",
  },
  {
    id: "sp3",
    projectId: "p2",
    projectName: "Government School Complex",
    weekLabel: "Week 14 (Apr 7–13)",
    caption: "Block B masonry — 3rd layer brick work",
    uploadedAt: "Apr 11, 2026",
    visibleToTenant: false,
    previewUrl: "",
  },
  {
    id: "sp4",
    projectId: "p2",
    projectName: "Government School Complex",
    weekLabel: "Week 13 (Mar 31–Apr 6)",
    caption: "Ground floor slab shuttering in progress",
    uploadedAt: "Apr 5, 2026",
    visibleToTenant: true,
    previewUrl: "",
  },
  {
    id: "sp5",
    projectId: "p3",
    projectName: "Water Treatment Plant",
    weekLabel: "Week 13 (Mar 31–Apr 6)",
    caption: "Excavation for foundation — Day 3",
    uploadedAt: "Apr 4, 2026",
    visibleToTenant: true,
    previewUrl: "",
  },
];

function groupByWeek(pictures: SitePicture[]): Record<string, SitePicture[]> {
  const groups: Record<string, SitePicture[]> = {};
  for (const pic of pictures) {
    const key = `${pic.weekLabel} — ${pic.projectName}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(pic);
  }
  return groups;
}

export default function CommunityUploadPicturesPage() {
  const [pictures, setPictures] = useState<SitePicture[]>(INITIAL_PICTURES);
  const [selectedProject, setSelectedProject] = useState("");
  const [weekLabel, setWeekLabel] = useState("");
  const [caption, setCaption] = useState("");
  const [visibleToTenant, setVisibleToTenant] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject || !weekLabel || !caption.trim()) return;
    const proj = PROJECTS.find((p) => p.id === selectedProject);
    const newPic: SitePicture = {
      id: `sp_${Date.now()}`,
      projectId: selectedProject,
      projectName: proj?.name ?? selectedProject,
      weekLabel,
      caption,
      uploadedAt: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      visibleToTenant,
      previewUrl,
    };
    setPictures([newPic, ...pictures]);
    setSelectedProject("");
    setWeekLabel("");
    setCaption("");
    setVisibleToTenant(true);
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploaded(true);
    setTimeout(() => setUploaded(false), 3000);
  }

  const grouped = groupByWeek(pictures);

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5"
      data-ocid="community-upload-pictures.page"
    >
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Upload Site Pictures
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Document onsite progress with weekly photos
        </p>
      </div>

      {/* Upload form */}
      <form
        onSubmit={handleUpload}
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4"
        data-ocid="community-upload-pictures.form"
      >
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800 text-sm">
            Upload New Photo
          </h2>
        </div>

        {/* Project */}
        <div className="space-y-1">
          <label
            htmlFor="up-project"
            className="text-xs font-medium text-slate-700"
          >
            Project *
          </label>
          <select
            id="up-project"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            required
            data-ocid="community-upload-pictures.project-select"
          >
            <option value="">Select a project…</option>
            {PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Week label */}
        <div className="space-y-1">
          <label
            htmlFor="up-week"
            className="text-xs font-medium text-slate-700"
          >
            Week Label *
          </label>
          <input
            id="up-week"
            type="text"
            placeholder="e.g. Week 15 (Apr 14–20)"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={weekLabel}
            onChange={(e) => setWeekLabel(e.target.value)}
            required
            data-ocid="community-upload-pictures.week-input"
          />
        </div>

        {/* Caption */}
        <div className="space-y-1">
          <label
            htmlFor="up-caption"
            className="text-xs font-medium text-slate-700"
          >
            Caption *
          </label>
          <input
            id="up-caption"
            type="text"
            placeholder="Describe what this photo shows…"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
            data-ocid="community-upload-pictures.caption-input"
          />
        </div>

        {/* File upload */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-700">Photo *</span>
          <div
            className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-amber-400 transition-all duration-200"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                fileInputRef.current?.click();
            }}
            data-ocid="community-upload-pictures.dropzone"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-40 mx-auto rounded-lg object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="text-sm text-slate-500">Tap to select an image</p>
                <p className="text-xs text-slate-400">
                  JPG, PNG, WEBP supported
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="community-upload-pictures.file-input"
            />
          </div>
          {selectedFile && (
            <p className="text-xs text-slate-500 truncate">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        {/* Visible to tenant */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="visibleToTenant"
            checked={visibleToTenant}
            onChange={(e) => setVisibleToTenant(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
            data-ocid="community-upload-pictures.visible-tenant-checkbox"
          />
          <label
            htmlFor="visibleToTenant"
            className="text-sm text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-amber-500" />
            Visible to Tenant
          </label>
        </div>

        {uploaded && (
          <div
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2"
            data-ocid="community-upload-pictures.success_state"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 text-sm font-medium">
              Photo uploaded successfully!
            </span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl gap-2"
          data-ocid="community-upload-pictures.upload_button"
        >
          <Upload className="w-4 h-4" />
          Upload Picture
        </Button>
      </form>

      {/* Gallery grouped by week */}
      <div className="space-y-5" data-ocid="community-upload-pictures.gallery">
        <h2 className="font-semibold text-slate-800 text-sm">
          Previously Uploaded ({pictures.length})
        </h2>
        {Object.entries(grouped).length === 0 ? (
          <div
            className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-3"
            data-ocid="community-upload-pictures.empty_state"
          >
            <ImageOff className="w-10 h-10 text-slate-300" />
            <p className="text-slate-500 text-sm">No pictures uploaded yet</p>
          </div>
        ) : (
          Object.entries(grouped).map(([groupKey, pics], gIdx) => (
            <div
              key={groupKey}
              className="space-y-2"
              data-ocid={`community-upload-pictures.group.${gIdx + 1}`}
            >
              <p className="text-xs font-semibold text-slate-600 px-1">
                {groupKey}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {pics.map((pic, pIdx) => (
                  <div
                    key={pic.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
                    data-ocid={`community-upload-pictures.picture-card.${gIdx + 1}.${pIdx + 1}`}
                  >
                    <div className="aspect-video bg-slate-100 flex items-center justify-center">
                      {pic.previewUrl ? (
                        <img
                          src={pic.previewUrl}
                          alt={pic.caption}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Camera className="w-6 h-6 text-slate-300" />
                          <span className="text-[10px] text-slate-400">
                            Photo
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 space-y-1">
                      <p className="text-xs text-slate-700 font-medium line-clamp-2">
                        {pic.caption}
                      </p>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] text-slate-400">
                          {pic.uploadedAt}
                        </span>
                        <Badge
                          className={cn(
                            "text-[9px] px-1.5 py-0 border flex items-center gap-0.5",
                            pic.visibleToTenant
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200",
                          )}
                        >
                          {pic.visibleToTenant ? (
                            <>
                              <Eye className="w-2.5 h-2.5" /> Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-2.5 h-2.5" /> Hidden
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
