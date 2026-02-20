import type { ReactNode } from "react";

export type OverviewInfoCardProps = {
  title: string;
  data?: number;
  footer?: string;
  unit?: string;
  prefix?: string;
  icon?: ReactNode;
  accent?: string;
};

export function OverviewInfoCard({
  title,
  data,
  footer,
  unit,
  prefix,
  icon,
  accent = "#000000",
}: OverviewInfoCardProps) {

  if (data === undefined || data === null) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-100">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Fetching {title}</span>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col rounded-2xl p-5
      bg-gray-50
      shadow-sm border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 tracking-wide">
          {title}
        </span>

        {icon && (
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: `${accent}15` }}
          >
            <span style={{ color: accent }}>
              {icon}
            </span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3 flex items-baseline gap-1">
        <span
          className="text-3xl font-semibold"
          style={{ color: accent }}
        >
          {prefix}{data.toFixed(2)}
        </span>
        {unit && (
          <span className="text-sm text-gray-400 font-medium">
            {unit}
          </span>
        )}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="mt-auto pt-3 text-xs text-gray-400 font-medium">
          {footer}
        </div>
      )}
    </div>
  );
}
