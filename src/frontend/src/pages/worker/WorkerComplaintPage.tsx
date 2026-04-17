import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MessageCircleWarning } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ComplaintCategory = "Safety" | "Wage" | "Treatment" | "Other";
type ComplaintStatus = "Open" | "Under Review" | "Resolved";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  date: string;
}

const CATEGORIES: ComplaintCategory[] = [
  "Safety",
  "Wage",
  "Treatment",
  "Other",
];

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "c1",
    title: "Insufficient safety equipment on level 3",
    description:
      "Workers on floor 3 are not being provided helmets and harnesses consistently.",
    category: "Safety",
    status: "Under Review",
    date: "2026-04-10",
  },
  {
    id: "c2",
    title: "Overtime wages not paid for week 12",
    description:
      "Worked 14 extra hours in week 12 but overtime was not reflected in payment.",
    category: "Wage",
    status: "Resolved",
    date: "2026-03-30",
  },
  {
    id: "c3",
    title: "Verbal abuse by foreman",
    description:
      "The site foreman used inappropriate language towards me and other workers on April 5.",
    category: "Treatment",
    status: "Open",
    date: "2026-04-05",
  },
];

function statusColor(s: ComplaintStatus) {
  if (s === "Resolved") return "bg-green-100 text-green-700 border-green-300";
  if (s === "Under Review")
    return "bg-amber-100 text-amber-700 border-amber-300";
  return "bg-red-100 text-red-700 border-red-300";
}

function categoryColor(c: ComplaintCategory) {
  if (c === "Safety") return "bg-red-50 text-red-600";
  if (c === "Wage") return "bg-amber-50 text-amber-600";
  if (c === "Treatment") return "bg-orange-50 text-orange-600";
  return "bg-slate-100 text-slate-500";
}

export default function WorkerComplaintPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("Safety");
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);

  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");

  function validate() {
    let valid = true;
    if (!title.trim()) {
      setTitleError("Title is required");
      valid = false;
    } else {
      setTitleError("");
    }
    if (!description.trim() || description.trim().length < 20) {
      setDescError("Please provide at least 20 characters of description");
      valid = false;
    } else {
      setDescError("");
    }
    return valid;
  }

  function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      const newComplaint: Complaint = {
        id: `c${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        category,
        status: "Open",
        date: new Date().toISOString().split("T")[0],
      };
      setComplaints((prev) => [newComplaint, ...prev]);
      setTitle("");
      setDescription("");
      setCategory("Safety");
      setSubmitting(false);
      toast.success("Complaint submitted successfully!", {
        description: "Your complaint has been logged and is under review.",
      });
    }, 1200);
  }

  return (
    <div
      className="bg-slate-50 min-h-screen p-4 space-y-5 max-w-lg mx-auto"
      data-ocid="worker-complaint.page"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Complaints</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Report safety, wage, or treatment issues
        </p>
      </div>

      {/* Submit form */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm"
        data-ocid="worker-complaint.form"
      >
        <p className="text-sm font-bold text-slate-800">Submit a Complaint</p>

        <div className="space-y-1">
          <Label
            htmlFor="complaint-title"
            className="text-sm text-slate-600 font-medium"
          >
            Title
          </Label>
          <Input
            id="complaint-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (!title.trim()) setTitleError("Title is required");
              else setTitleError("");
            }}
            placeholder="Brief summary of the issue"
            className="rounded-xl bg-slate-50 border-slate-300"
            data-ocid="worker-complaint.title-input"
          />
          {titleError && (
            <p
              className="text-xs text-red-500"
              data-ocid="worker-complaint.title-error"
            >
              {titleError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-slate-600 font-medium">Category</Label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                data-ocid={`worker-complaint.category-${cat.toLowerCase()}`}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                  category === cat
                    ? "bg-amber-100 border-amber-400 text-amber-700"
                    : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="complaint-desc"
            className="text-sm text-slate-600 font-medium"
          >
            Description
          </Label>
          <Textarea
            id="complaint-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
              if (!description.trim() || description.trim().length < 20)
                setDescError("Please provide at least 20 characters");
              else setDescError("");
            }}
            placeholder="Describe the issue in detail — include dates, names, locations if applicable"
            className="rounded-xl bg-slate-50 border-slate-300 min-h-[100px] resize-none"
            data-ocid="worker-complaint.description-textarea"
          />
          {descError && (
            <p
              className="text-xs text-red-500"
              data-ocid="worker-complaint.description-error"
            >
              {descError}
            </p>
          )}
          <p className="text-xs text-slate-400 text-right">
            {description.length} chars
          </p>
        </div>

        <Button
          className="w-full h-12 font-bold gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-xl"
          onClick={handleSubmit}
          disabled={submitting}
          data-ocid="worker-complaint.submit-button"
        >
          {submitting ? (
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
          ) : (
            <MessageCircleWarning className="w-4 h-4" />
          )}
          {submitting ? "Submitting..." : "Submit Complaint"}
        </Button>
      </div>

      {/* Complaint history */}
      <div className="space-y-2" data-ocid="worker-complaint.history-section">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          My Complaints ({complaints.length})
        </p>
        {complaints.length === 0 ? (
          <div
            className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm"
            data-ocid="worker-complaint.empty-state"
          >
            <MessageCircleWarning className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No complaints filed</p>
            <p className="text-sm text-slate-500 mt-1">
              Use the form above to report an issue
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint, i) => (
              <div
                key={complaint.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-sm"
                data-ocid={`worker-complaint.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm text-slate-800 leading-snug flex-1 min-w-0">
                    {complaint.title}
                  </p>
                  <Badge
                    className={cn(
                      "text-xs border flex-shrink-0",
                      statusColor(complaint.status),
                    )}
                  >
                    {complaint.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {complaint.description}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-lg",
                      categoryColor(complaint.category),
                    )}
                  >
                    {complaint.category}
                  </span>
                  <span className="text-xs text-slate-400 ml-auto">
                    {new Date(complaint.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
