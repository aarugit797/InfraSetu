import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastIcons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
  error: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />,
};

const toastStyles: Record<ToastType, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10",
  error: "border-red-500/30 bg-red-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
  info: "border-blue-500/30 bg-blue-500/10",
};

function ToastNotification({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(
      () => onRemove(item.id),
      item.duration ?? 4000,
    );
    return () => clearTimeout(timerRef.current);
  }, [item.id, item.duration, onRemove]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl border glass-elevated shadow-2xl",
        "animate-in slide-in-from-right duration-300",
        "max-w-sm w-full",
        toastStyles[item.type],
      )}
      data-ocid="toast"
      role="alert"
    >
      {toastIcons[item.type]}
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-sm font-semibold truncate">
          {item.title}
        </p>
        {item.message && (
          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
            {item.message}
          </p>
        )}
      </div>
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground transition-smooth ml-1 flex-shrink-0"
        onClick={() => onRemove(item.id)}
        aria-label="Dismiss"
        data-ocid="toast.close_button"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((item: Omit<ToastItem, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-4), { ...item, id }]); // max 5
  }, []);

  const success = useCallback(
    (title: string, message?: string) =>
      add({ type: "success", title, message }),
    [add],
  );
  const error = useCallback(
    (title: string, message?: string) => add({ type: "error", title, message }),
    [add],
  );
  const warning = useCallback(
    (title: string, message?: string) =>
      add({ type: "warning", title, message }),
    [add],
  );
  const info = useCallback(
    (title: string, message?: string) => add({ type: "info", title, message }),
    [add],
  );

  return (
    <ToastContext.Provider
      value={{ toast: add, success, error, warning, info }}
    >
      {children}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastNotification item={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
