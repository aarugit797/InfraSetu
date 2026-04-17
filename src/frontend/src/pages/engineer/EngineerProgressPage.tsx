import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { PROJECTS, TASKS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Camera,
  CheckCircle2,
  FileImage,
  Image,
  Plus,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ProgressEntry {
  id: string;
  taskId: string;
  date: string;
  notes: string;
  photos: string[];
  createdAt: number;
}

const INITIAL_ENTRIES: ProgressEntry[] = [
  {
    id: "pe1",
    taskId: "t1",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    notes:
      "Completed foundation laying for Block A. Concrete mix ratio maintained at 1:2:4. No issues encountered during pour.",
    photos: [],
    createdAt: Date.now() - 86400000,
  },
  {
    id: "pe2",
    taskId: "t2",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    notes:
      "Reinforcement bar placement 60% complete. Material delivery pending for remaining work.",
    photos: [],
    createdAt: Date.now() - 2 * 86400000,
  },
];

export default function EngineerProgressPage() {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<ProgressEntry[]>(INITIAL_ENTRIES);
  const [showForm, setShowForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);
  const [filterDate, setFilterDate] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myTasks = TASKS.filter((t) => t.assignedTo === currentUser?.id);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setPendingPhotos((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }
    toast.success(`${files.length} photo(s) added`);
  }

  function handleSubmit() {
    if (!selectedTaskId || !notes.trim()) {
      toast.error("Please select a task and add notes");
      return;
    }
    const newEntry: ProgressEntry = {
      id: `pe_${Date.now()}`,
      taskId: selectedTaskId,
      date,
      notes,
      photos: pendingPhotos,
      createdAt: Date.now(),
    };
    setEntries((prev) => [newEntry, ...prev]);
    setShowForm(false);
    setSelectedTaskId("");
    setNotes("");
    setPendingPhotos([]);
    setDate(new Date().toISOString().split("T")[0]);
    toast.success("Progress update submitted");
  }

  function getTaskName(taskId: string) {
    return myTasks.find((t) => t.id === taskId)?.title ?? taskId;
  }

  function getProjectName(taskId: string) {
    const task = myTasks.find((t) => t.id === taskId);
    if (!task) return "";
    return PROJECTS.find((p) => p.id === task.projectId)?.name ?? "";
  }

  // Group entries by date
  const grouped = entries.reduce<Record<string, ProgressEntry[]>>(
    (acc, entry) => {
      if (!acc[entry.date]) acc[entry.date] = [];
      acc[entry.date].push(entry);
      return acc;
    },
    {},
  );

  const sortedDates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));
  const filteredDates =
    filterDate === "all"
      ? sortedDates
      : sortedDates.filter((d) => d === filterDate);

  return (
    <div
      className="p-4 space-y-4 bg-slate-50 min-h-screen"
      data-ocid="engineer-progress.page"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          <h1 className="font-display text-xl font-bold text-slate-800">
            Progress Updates
          </h1>
        </div>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 gap-1.5 border-0"
          onClick={() => setShowForm(true)}
          data-ocid="engineer-progress.add-button"
        >
          <Plus className="w-4 h-4" />
          Add Update
        </Button>
      </div>

      {/* Filter by date */}
      {sortedDates.length > 1 && (
        <Select value={filterDate} onValueChange={setFilterDate}>
          <SelectTrigger
            className="bg-white border-slate-200 h-9 rounded-xl text-sm text-slate-700"
            data-ocid="engineer-progress.date-filter.select"
          >
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {sortedDates.map((d) => (
              <SelectItem key={d} value={d}>
                {new Date(d).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Photo gallery grouped by date */}
      {filteredDates.length === 0 && (
        <div
          className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm"
          data-ocid="engineer-progress.empty_state"
        >
          <Image className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-700 font-medium">No progress updates yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Add your first update to track progress
          </p>
        </div>
      )}

      {filteredDates.map((dateKey, dIdx) => (
        <div key={dateKey}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {new Date(dateKey).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <div className="space-y-3">
            {grouped[dateKey].map((entry, eIdx) => (
              <Card
                key={entry.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3"
                data-ocid={`engineer-progress.entry.${dIdx * 10 + eIdx + 1}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {getTaskName(entry.taskId)}
                    </p>
                    {getProjectName(entry.taskId) && (
                      <p className="text-xs text-slate-500 truncate">
                        {getProjectName(entry.taskId)}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-amber-100 border-amber-300 text-amber-700 text-xs flex-shrink-0">
                    {entry.photos.length} photos
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {entry.notes}
                </p>
                {entry.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {entry.photos.map((photo, pIdx) => (
                      <div
                        key={photo}
                        className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                      >
                        <img
                          src={photo}
                          alt={`Site capture ${pIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {entry.photos.length === 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <FileImage className="w-3.5 h-3.5" />
                    <span>No photos attached</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Add Progress Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          data-ocid="engineer-progress.form.dialog"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800 text-lg">
                Add Progress Update
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-700"
                data-ocid="engineer-progress.form.close-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Task
                </Label>
                <Select
                  value={selectedTaskId}
                  onValueChange={setSelectedTaskId}
                >
                  <SelectTrigger
                    className="bg-slate-50 border-slate-200 rounded-xl text-sm"
                    data-ocid="engineer-progress.form.task.select"
                  >
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    {myTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-800"
                  data-ocid="engineer-progress.form.date.input"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Progress Notes
                </Label>
                <Textarea
                  placeholder="Describe work done, materials used, observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl text-sm resize-none text-slate-800"
                  rows={4}
                  data-ocid="engineer-progress.form.notes.textarea"
                />
              </div>

              {/* Photo upload */}
              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block font-medium">
                  Photos
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-amber-300 rounded-xl p-4 flex flex-col items-center gap-2 text-amber-600 hover:bg-amber-50 transition-colors"
                  data-ocid="engineer-progress.form.upload-button"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-medium">
                    Upload Photos / Videos
                  </span>
                  <span className="text-xs text-slate-400">
                    or tap to take photo
                  </span>
                </button>
                {pendingPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {pendingPhotos.map((photo, idx) => (
                      <div
                        key={`pending-${photo.slice(-20)}`}
                        className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                      >
                        <img
                          src={photo}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPendingPhotos((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Camera option for mobile */}
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.capture = "environment";
                  input.onchange = (e) => {
                    const files = Array.from(
                      (e.target as HTMLInputElement).files ?? [],
                    );
                    for (const file of files) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const result = ev.target?.result as string;
                        setPendingPhotos((prev) => [...prev, result]);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="w-full border border-slate-200 rounded-xl p-3 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                data-ocid="engineer-progress.form.camera-button"
              >
                <Camera className="w-4 h-4 text-amber-500" />
                Take Photo with Camera
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-600 rounded-xl"
                onClick={() => setShowForm(false)}
                data-ocid="engineer-progress.form.cancel-button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl border-0 gap-2"
                onClick={handleSubmit}
                data-ocid="engineer-progress.form.submit-button"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
