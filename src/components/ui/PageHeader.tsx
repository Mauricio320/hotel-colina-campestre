import React from "react";
import { Button } from "primereact/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  tag?: string;
  color?: "emerald" | "yellow" | "blue" | "amber" | "red" | "gray";
  onBack?: () => void;
  backTooltip?: string;
  observation?: string;
}

const colorClasses: Record<string, { bg: string; text: string; light: string; border: string }> = {
  emerald: {
    bg: "bg-emerald-500",
    text: "text-emerald-600",
    light: "bg-emerald-50",
    border: "border-emerald-100",
  },
  yellow: {
    bg: "bg-yellow-500",
    text: "text-yellow-600",
    light: "bg-yellow-50",
    border: "border-yellow-100",
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
  red: {
    bg: "bg-red-500",
    text: "text-red-600",
    light: "bg-red-50",
    border: "border-red-100",
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
}) => {
  const colors = colorClasses[color];

  return (
    <div className="sticky top-[-38px] z-40 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 animate-fade-in overflow-hidden">
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
      </div>
    </div>
  );
};

export default PageHeader;
