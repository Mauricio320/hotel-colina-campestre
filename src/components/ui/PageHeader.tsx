import React from "react";
import { Button } from "primereact/button";
import { ProgressSpinner, ProgressSpinnerProps } from "primereact/progressspinner";

export type IconColor = "emerald" | "green" | "indigo" | "blue" | "amber" | "purple" | "red" | "teal" | "cyan" | "orange" | "yellow" | "gray";

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
      <div className={`flex flex-col gap-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className={`p-3 ${colors.light} rounded-2xl ${colors.text} shadow-sm`}
              >
                <i className={`pi ${icon} text-xl`}></i>
              </div>
            )}
            <h2 className="text-3xl font-black text-gray-800 tracking-tighter">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {rightContent}
            {loading && <ProgressSpinner {...spinnerProps} />}
          </div>
        </div>
      </div>
    );
  }

  // Default variant - used for detail/form pages (CheckInPage, CheckOutPage, etc.)
  return (
    <div className={`sticky top-[-38px] z-40 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 animate-fade-in overflow-hidden ${className}`}>
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-50 ${colors.bg}`}
      ></div>

      <div className="relative z-10 flex items-center gap-4 w-full">
        {onBack && (
          <Button
            icon="pi pi-arrow-left"
            onClick={onBack}
            className="p-button-rounded p-button-text p-button-secondary bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-300 shadow-sm border border-gray-100"
            tooltip={backTooltip}
            tooltipOptions={{ position: "bottom" }}
          />
        )}

        <div className="flex items-stretch gap-4 flex-1">
          <div
            className={`w-1.5 ${colors.bg} rounded-full shadow-sm self-stretch`}
          ></div>
          <div className="flex flex-col justify-center gap-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
              {title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
              {subtitle && (
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                  <i className={`pi ${icon} ${colors.text}`}></i>
                  <span className="text-sm">{subtitle}</span>
                </div>
              )}

              {tag && (
                <div className={`flex items-center gap-2 px-3 py-1 ${colors.light} rounded-full border ${colors.border}`}>
                  <span className={`${colors.text} text-xs font-black uppercase tracking-wider`}>
                    {tag}
                  </span>
                </div>
              )}

              {observation && (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                  <i className="pi pi-info-circle text-xs text-amber-600"></i>
                  <span className="text-amber-700 text-xs font-black uppercase tracking-wider">
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
