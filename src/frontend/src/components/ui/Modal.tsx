import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { type ReactNode, useCallback, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Prevent closing by clicking the backdrop */
  disableBackdropClose?: boolean;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
  disableBackdropClose = false,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <dialog
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-transparent w-full h-full max-w-full max-h-full"
      aria-modal="true"
      open={open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
        onClick={disableBackdropClose ? undefined : onClose}
        onKeyDown={(e) =>
          !disableBackdropClose && e.key === "Enter" && onClose()
        }
      />
      {/* Dialog */}
      <div
        className={cn(
          "relative w-full glass-elevated rounded-2xl border border-border/50 shadow-2xl",
          "animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200",
          sizeMap[size],
          className,
        )}
        data-ocid="modal.dialog"
      >
        {(title || description) && (
          <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/40">
            <div>
              {title && (
                <h2 className="font-display font-bold text-foreground text-lg">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-muted-foreground text-sm mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              className="ml-3 flex-shrink-0 text-muted-foreground hover:text-foreground transition-smooth rounded-lg p-1 hover:bg-muted/50"
              onClick={onClose}
              aria-label="Close"
              data-ocid="modal.close_button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
      </div>
    </dialog>
  );
}
