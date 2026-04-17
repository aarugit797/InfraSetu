import { cn } from "@/lib/utils";
import { getStatusColor } from "@/lib/utils";

type ColorClasses = { bg: string; text: string; border: string; dot?: string };

interface StatusBadgeProps {
  /** New API: pass a status string, auto-resolved to colors */
  status?: string;
  /** Legacy API: pass explicit colorClasses */
  colorClasses?: ColorClasses;
  label?: string;
  showDot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * StatusBadge — renders a colored badge for any status string.
 * Supports both new `status` prop (auto-resolved) and legacy `colorClasses` prop.
 */
export function StatusBadge({
  status,
  colorClasses: colorClassesProp,
  label,
  showDot = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const colorClasses: ColorClasses =
    colorClassesProp ?? getStatusColor(status ?? "");

  const displayLabel =
    label ??
    (status
      ? status
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase())
          .trim()
      : "");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        colorClasses.bg,
        colorClasses.text,
        colorClasses.border,
        className,
      )}
    >
      {showDot && colorClasses.dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            colorClasses.dot,
          )}
        />
      )}
      {displayLabel}
    </span>
  );
}
