import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { ComponentType } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label?: string };
  subtitle?: string;
  className?: string;
  "data-ocid"?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/15",
  trend,
  subtitle,
  className,
  "data-ocid": dataOcid,
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div
      className={cn(
        "glass rounded-2xl p-4 hover:glass-elevated transition-smooth group",
        className,
      )}
      data-ocid={dataOcid}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            iconBg,
          )}
        >
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium rounded-full px-2 py-0.5",
              isPositive
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400",
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}%
            {trend.label && (
              <span className="ml-0.5 text-[10px] opacity-75">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-foreground leading-none mb-1">
        {value}
      </p>
      <p className="text-muted-foreground text-xs font-medium truncate">
        {label}
      </p>
      {subtitle && (
        <p className="text-muted-foreground/70 text-xs mt-0.5 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
