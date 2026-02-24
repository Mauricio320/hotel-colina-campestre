import React from "react";
import { Button } from "primereact/button";
import { ProgressSpinner, ProgressSpinnerProps } from "primereact/progressspinner";

export type IconColor =
  | "emerald"
  | "green"
  | "indigo"
  | "blue"
  | "amber"
  | "purple"
  | "red"
  | "teal"
  | "cyan"
  | "orange"
  | "yellow"
  | "gray";

type Variant = "default" | "simple";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  tag?: string;
  color?: IconColor;
  onBack?: () => void;
  backTooltip?: string;
  observation?: string;
  variant?: Variant;
  loading?: boolean;
  spinnerProps?: ProgressSpinnerProps;
  rightContent?: React.ReactNode;
  className?: string;
}

const colorClasses: Record<string, { bg: string; text: string; light: string; border: string }> = {
  emerald: {
    bg: "bg-emerald-500",
    text: "text-emerald-600",
    light: "bg-emerald-50",
    border: "border-emerald-100",
  },
  green: {
    bg: "bg-green-500",
    text: "text-green-600",
    light: "bg-green-50",
    border: "border-green-100",
  },
  indigo: {
    bg: "bg-indigo-500",
    text: "text-indigo-600",
    light: "bg-indigo-50",
    border: "border-indigo-100",
  },
  blue: {
    bg: "bg-blue-500",
    text: "text-blue-600",
    light: "bg-blue-50",
    border: "border-blue-100",
  },
  amber: {
    bg: "bg-amber-500",
    text: "text-amber-600",
    light: "bg-amber-50",
    border: "border-amber-100",
  },
  purple: {
    bg: "bg-purple-500",
    text: "text-purple-600",
    light: "bg-purple-50",
    border: "border-purple-100",
  },
  red: {
    bg: "bg-red-500",
    text: "text-red-600",
    light: "bg-red-50",
    border: "border-red-100",
  },
  teal: {
    bg: "bg-teal-500",
    text: "text-teal-600",
    light: "bg-teal-50",
    border: "border-teal-100",
  },
  cyan: {
    bg: "bg-cyan-500",
    text: "text-cyan-600",
    light: "bg-cyan-50",
    border: "border-cyan-100",
  },
  orange: {
    bg: "bg-orange-500",
    text: "text-orange-600",
    light: "bg-orange-50",
    border: "border-orange-100",
  },
  yellow: {
    bg: "bg-yellow-500",
    text: "text-yellow-600",
    light: "bg-yellow-50",
    border: "border-yellow-100",
  },
  gray: {
    bg: "bg-gray-500",
    text: "text-gray-600",
    light: "bg-gray-50",
    border: "border-gray-100",
  },
};

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon = "pi-home",
  tag,
  color = "emerald",
  onBack,
  backTooltip = "Volver",
  observation,
  variant = "default",
  loading = false,
  spinnerProps = { style: { width: "30px", height: "30px" } },
  rightContent,
  className = "",
}) => {
  const colors = colorClasses[color];

  // Simple variant - used for list/module pages (Reports, RoomManagement, etc.)
  if (variant === "simple") {
    return (
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`p-3 ${colors.light} rounded-2xl ${colors.text} shadow-sm`}>
              <i className={`pi ${icon} text-xl`}></i>
            </div>
          )}
          <h2 className="text-xl font-black tracking-tighter text-gray-800 sm:text-3xl">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {rightContent}
          {loading && <ProgressSpinner {...spinnerProps} />}
        </div>
      </div>
    );
  }

  // Default variant - used for detail/form pages (CheckInPage, CheckOutPage, etc.)
  return (
    <div
      className={`animate-fade-in sticky -top-9.5 z-40 mb-8 flex flex-col items-start gap-6 overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center ${className}`}
    >
      <div
        className={`absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full opacity-50 ${colors.bg}`}
      ></div>

      <div className="relative z-10 flex w-full items-center gap-4">
        {onBack && (
          <Button
            unstyled
            icon="pi pi-arrow-left"
            onClick={onBack}
            className="p-button-rounded h-10 w-10 rounded-2xl p-button-text p-button-secondary border border-gray-100 bg-gray-50 text-gray-600 shadow-sm transition-all duration-300 hover:bg-blue-50 hover:text-blue-600"
            tooltip={backTooltip}
            tooltipOptions={{ position: "bottom" }}
          />
        )}

        <div className="flex flex-1 items-stretch gap-4">
          <div className={`w-1.5 ${colors.bg} self-stretch rounded-full shadow-sm`}></div>
          <div className="flex flex-col justify-center gap-1">
            <h1 className="text-xl leading-none font-black tracking-tighter text-gray-900 sm:text-3xl">
              {title}
            </h1>

            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              {subtitle && (
                <div className="flex items-center gap-2 font-bold text-gray-500">
                  <i className={`pi ${icon} ${colors.text}`}></i>
                  <span className="text-sm">{subtitle}</span>
                </div>
              )}

              {tag && (
                <div
                  className={`flex items-center gap-2 px-3 py-1 ${colors.light} rounded-full border ${colors.border}`}
                >
                  <span className={`${colors.text} text-xs font-black tracking-wider uppercase`}>
                    {tag}
                  </span>
                </div>
              )}

              {observation && (
                <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1">
                  <i className="pi pi-info-circle text-xs text-amber-600"></i>
                  <span className="text-xs font-black tracking-wider text-amber-700 uppercase">
                    {observation}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {(rightContent || loading) && (
          <div className="flex items-center gap-3">
            {rightContent}
            {loading && <ProgressSpinner {...spinnerProps} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
